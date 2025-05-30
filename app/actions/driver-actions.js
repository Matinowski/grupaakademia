"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin, uploadFile, deleteFile } from "@/lib/supabase"

export async function getDrivers() {
  try {
    const { data: drivers, error } = await supabaseAdmin.from("drivers").select("*").order("name")

    if (error) throw error

    const driversWithRelations = await Promise.all(
      drivers.map(async (driver) => {
        // Pobierz raty płatności
        const { data: paymentInstallments, error: installmentsError } = await supabaseAdmin
          .from("payment_installments")
          .select("*")
          .eq("driver_id", driver.id)
          .order("hours")

        if (installmentsError) throw installmentsError

        // Pobierz pliki płatności
        const { data: paymentFiles, error: filesError } = await supabaseAdmin
          .from("payment_files")
          .select("*")
          .eq("driver_id", driver.id)

        if (filesError) throw filesError

        // Pobierz płatności
        const { data: payments, error: paymentsError } = await supabaseAdmin
          .from("payments")
          .select("*, created_by_user:created_by (id, name, surname)")
          .eq("driver_id", driver.id)
          .order("payment_date", { ascending: false })

        if (paymentsError) throw paymentsError

        // Pobierz nadchodzące lekcje + dane instruktora
        const { data: events, error: eventsError } = await supabaseAdmin
          .from("events")
          .select("*, instructor:users (id, name, surname, email, phone)")
          .eq("driver_id", driver.id)
          .order("date", { ascending: false })
        if (eventsError) throw paymentsError
        // Pobierz dane przypisanego instruktora
        let instructorData = null


        return {
          ...driver,
          instructor: instructorData ? `${instructorData.name} ${instructorData.surname}` : null,
          instructorData,
          paymentInstallments: paymentInstallments || [],
          payments: payments || [],
          events,
          paymentFiles: paymentFiles
            ? paymentFiles.map((file) => ({
                name: file.file_name,
                path: file.file_path,
                type: file.file_type,
                size: file.file_size,
                lastModified: file.upload_date,
              }))
            : [],
        }
      }),
    )

    return driversWithRelations
  } catch (error) {
    console.error("Błąd podczas pobierania kierowców:", error)
    return []
  }
}

// Pobieranie wszystkich instruktorów
export async function getInstructors() {
  try {
    // Pobierz użytkowników, którzy są instruktorami (mają wpis w tabeli instructors)
    const { data, error } = await supabaseAdmin
      .from("users")
      .select(`
        id, 
        name, 
        surname, 
        phone, 
        email, 
        instructors!inner(category, additional_info)
      `)
      .order("name")

    if (error) throw error

    // Przekształć dane do formatu oczekiwanego przez frontend
    return data.map((user) => ({
      id: user.id,
      name: `${user.name} ${user.surname}`,
      fullName: `${user.name} ${user.surname}`,
      phone: user.phone,
      email: user.email,
      category: user.instructors.category,
      additionalInfo: user.instructors.additional_info,
    }))
  } catch (error) {
    console.error("Błąd podczas pobierania instruktorów:", error)
    return []
  }
}

// Dodawanie nowego kierowcy
export async function addDriver(driverData) {
  try {
    // Przygotuj dane kierowcy do zapisu
    const driverToInsert = {
      name: driverData.name,
      phone: driverData.phone,
      email: driverData.email,
      license_type: driverData.license_type,
      course_type: driverData.course_type,
      start_date: driverData.start_date,
      contract_date: driverData.contract_date || null,
      completed_hours: driverData.completed_hours || 0,
      remaining_hours: driverData.remaining_hours || 30,
      notes: driverData.notes || null,
      payment_type: driverData.payment_type,
      total_paid: driverData.total_paid || 0,
    }

    // Dodaj kierowcę do bazy danych
    const { data: newDriver, error } = await supabaseAdmin.from("drivers").insert(driverToInsert).select().single()

    if (error) throw error

    // Dodaj raty płatności, jeśli istnieją
    if (driverData.paymentInstallments && driverData.paymentInstallments.length > 0) {
      const installmentsToInsert = driverData.paymentInstallments.map((installment) => ({
        driver_id: newDriver.id,
        hours: installment.hours,
        amount: installment.amount,
      }))

      const { error: installmentsError } = await supabaseAdmin.from("payment_installments").insert(installmentsToInsert)

      if (installmentsError) throw installmentsError
    }

    // Prześlij pliki płatności, jeśli istnieją
    if (driverData.paymentFiles && driverData.paymentFiles.length > 0) {
      const filePromises = driverData.paymentFiles.map(async (file) => {
        const fileData = await uploadFile(file, "payment-files", `drivers/${newDriver.id}`)

        return {
          driver_id: newDriver.id,
          file_name: fileData.fileName,
          file_path: fileData.publicUrl,
          file_type: fileData.fileType,
          file_size: fileData.fileSize,
          upload_date: new Date().toISOString(),
        }
      })

      const filesToInsert = await Promise.all(filePromises)

      const { error: filesError } = await supabaseAdmin.from("payment_files").insert(filesToInsert)

      if (filesError) throw filesError
    }

    revalidatePath("/")
    return { success: true, driver: newDriver }
  } catch (error) {
    console.error("Błąd podczas dodawania kierowcy:", error)
    return { success: false, error: error.message }
  }
}

// Aktualizacja istniejącego kierowcy
export async function updateDriver(driverData) {
  try {
    // Przygotuj dane kierowcy do aktualizacji
    const driverToUpdate = {
      name: driverData.name,
      phone: driverData.phone,
      email: driverData.email,
      license_type: driverData.license_type,
      course_type: driverData.course_type,
      start_date: driverData.start_date,
      contract_date: driverData.contract_date || null,
      completed_hours: driverData.completed_hours || 0,
      remaining_hours: driverData.remaining_hours || 0,
      notes: driverData.notes || null,
      payment_type: driverData.payment_type,
      total_paid: driverData.totalPaid || 0,
    }

    // Aktualizuj kierowcę w bazie danych
    const { error } = await supabaseAdmin.from("drivers").update(driverToUpdate).eq("id", driverData.id)

    if (error) throw error

    // Usuń istniejące raty płatności i dodaj nowe
    if (driverData.payment_type === "installments" && driverData.paymentInstallments) {
      // Usuń istniejące raty
      const { error: deleteError } = await supabaseAdmin
        .from("payment_installments")
        .delete()
        .eq("driver_id", driverData.id)

      if (deleteError) throw deleteError

      // Dodaj nowe raty
      const installmentsToInsert = driverData.paymentInstallments.map((installment) => ({
        driver_id: driverData.id,
        hours: installment.hours,
        amount: installment.amount,
      }))

      if (installmentsToInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin.from("payment_installments").insert(installmentsToInsert)

        if (insertError) throw insertError
      }
    }

    // Prześlij nowe pliki płatności, jeśli istnieją
    if (driverData.newPaymentFiles && driverData.newPaymentFiles.length > 0) {
      const filePromises = driverData.newPaymentFiles.map(async (file) => {
        const fileData = await uploadFile(file, "payment-files", `drivers/${driverData.id}`)

        return {
          driver_id: driverData.id,
          file_name: fileData.fileName,
          file_path: fileData.publicUrl,
          file_type: fileData.fileType,
          file_size: fileData.fileSize,
          upload_date: new Date().toISOString(),
        }
      })

      const filesToInsert = await Promise.all(filePromises)

      if (filesToInsert.length > 0) {
        const { error: filesError } = await supabaseAdmin.from("payment_files").insert(filesToInsert)

        if (filesError) throw filesError
      }
    }

    // Obsługa usuwania plików
    if (driverData.filesToDelete && driverData.filesToDelete.length > 0) {
      // Usuń pliki z bazy danych
      const fileIds = driverData.filesToDelete.map((file) => file.id)

      const { error: deleteDbError } = await supabaseAdmin.from("payment_files").delete().in("id", fileIds)

      if (deleteDbError) throw deleteDbError

      // Usuń pliki z Supabase Storage
      for (const file of driverData.filesToDelete) {
        // Wyodrębnij ścieżkę pliku z publicUrl
        const filePathMatch = file.path.match(/\/storage\/v1\/object\/public\/payment-files\/(.+)$/)
        if (filePathMatch && filePathMatch[1]) {
          await deleteFile("payment-files", filePathMatch[1])
        }
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Błąd podczas aktualizacji kierowcy:", error)
    return { success: false, error: error.message }
  }
}

// Usuwanie kierowcy
export async function deleteDriver(driver_id) {
  try {
    // Pobierz pliki kierowcy przed usunięciem
    const { data: driverFiles, error: filesError } = await supabaseAdmin
      .from("payment_files")
      .select("file_path")
      .eq("driver_id", driver_id)

    if (filesError) throw filesError

    // Usuń kierowcę (kaskadowe usuwanie powiązanych danych jest obsługiwane przez ograniczenia ON DELETE CASCADE)
    const { error } = await supabaseAdmin.from("drivers").delete().eq("id", driver_id)

    if (error) throw error

    // Usuń pliki z Supabase Storage
    if (driverFiles && driverFiles.length > 0) {
      for (const file of driverFiles) {
        // Wyodrębnij ścieżkę pliku z publicUrl
        const filePathMatch = file.file_path.match(/\/storage\/v1\/object\/public\/payment-files\/(.+)$/)
        if (filePathMatch && filePathMatch[1]) {
          await deleteFile("payment-files", filePathMatch[1])
        }
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Błąd podczas usuwania kierowcy:", error)
    return { success: false, error: error.message }
  }
}
