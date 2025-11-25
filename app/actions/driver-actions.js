"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin, uploadFile, deleteFile, getFileUrl } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"

// Pobieranie wszystkich kierowców
export async function getDrivers() {
  try {
    const user = await requireAuth()

    const { data: drivers, error } = await supabaseAdmin.from("drivers").select("*").order("name")
    if (error) throw error

    const driversWithRelations = await Promise.all(
      drivers.map(async (driver) => {
        const { data: paymentInstallments, error: installmentsError } = await supabaseAdmin
          .from("payment_installments")
          .select("*")
          .eq("driver_id", driver.id)
          .order("hours")
        if (installmentsError) throw installmentsError

        const { data: paymentFiles, error: filesError } = await supabaseAdmin
          .from("payment_files")
          .select("*")
          .eq("driver_id", driver.id)
        if (filesError) throw filesError

        const { data: payments, error: paymentsError } = await supabaseAdmin
          .from("payments")
          .select("*, created_by_user:created_by (id, name, surname)")
          .eq("driver_id", driver.id)
          .order("payment_date", { ascending: false })
        if (paymentsError) throw paymentsError

        const { data: events, error: eventsError } = await supabaseAdmin
          .from("events")
          .select("*, instructor:users (id, name, surname, email, phone)")
          .eq("driver_id", driver.id)
          .order("date", { ascending: false })
        if (eventsError) throw eventsError

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
      })
    )

    return driversWithRelations
  } catch (error) {
    console.error("Błąd podczas pobierania kierowców:", error)
    return { error: "UNAUTHORIZED" }
  }
}

// Pobieranie wszystkich instruktorów
export async function getInstructors() {
  try {
    const user = await requireAuth()

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
    return { error: "UNAUTHORIZED" }
  }
}

// Dodawanie nowego kierowcy
export async function addDriver(driverData) {
  try {
    const user = await requireAuth()
    console.log("Dodawanie kierowcy:", driverData.price)

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
      branch: driverData.branch || null,
      price: driverData.price || null,
    }

    const { data: newDriver, error } = await supabaseAdmin.from("drivers").insert(driverToInsert).select().single()
    if (error) throw error

    // Payment installments
    if (driverData.paymentInstallments?.length > 0) {
      const installmentsToInsert = driverData.paymentInstallments.map((installment) => ({
        driver_id: newDriver.id,
        hours: installment.hours,
        amount: installment.amount,
      }))
      const { error: installmentsError } = await supabaseAdmin.from("payment_installments").insert(installmentsToInsert)
      if (installmentsError) throw installmentsError
    }

    // Payment files
    if (driverData.paymentFiles?.length > 0) {
      const filePromises = driverData.paymentFiles.map(async (file) => {
        const fileData = await uploadFile(file, "payment-files", `drivers/${newDriver.id}`, newDriver.id)
        return {
          driver_id: newDriver.id,
          file_name: fileData.fileName,
          file_path: fileData.filePath,
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
    const user = await requireAuth()

    const driverToUpdate = {
      id: driverData.id,
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
      branch: driverData.branch || null,
      price: driverData.price || null,
    }

    const { error } = await supabaseAdmin.from("drivers").update(driverToUpdate).eq("id", driverData.id)
    if (error) throw error

    // Payment installments
    if (driverData.payment_type === "installments" && driverData.paymentInstallments) {
      await supabaseAdmin.from("payment_installments").delete().eq("driver_id", driverData.id)

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

    // New payment files
    if (driverData.newPaymentFiles?.length > 0) {
      const filePromises = driverData.newPaymentFiles.map(async (file) => {
        const fileData = await uploadFile(file, "payment-files", `drivers/${driverData.id}`, driverData.id)
        return {
          driver_id: driverData.id,
          file_name: fileData.fileName,
          file_path: fileData.filePath,
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

    // Delete files
  // Delete files
console.log("Driver data for deletion", driverData)

if (driverData.filesToDelete?.length > 0) {
  const paths = driverData.filesToDelete.map((file) => file.path)

  // Usuń z bazy po path
  const { error: deleteDbError } = await supabaseAdmin
    .from("payment_files")
    .delete()
    .in("file_path", paths) // <-- upewnij się, że kolumna nazywa się file_path
  if (deleteDbError) throw deleteDbError

  // Usuń z storage
  for (const file of driverData.filesToDelete) {
    await deleteFile("payment-files", file.path, driverData.id)
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
    const user = await requireAuth()

    const { data: driverFiles, error: filesError } = await supabaseAdmin
      .from("payment_files")
      .select("file_path")
      .eq("driver_id", driver_id)
    if (filesError) throw filesError

    const { error } = await supabaseAdmin.from("drivers").delete().eq("id", driver_id)
    if (error) throw error

    if (driverFiles?.length > 0) {
      for (const file of driverFiles) {
        const filePathMatch = file.file_path.match(/\/storage\/v1\/object\/public\/payment-files\/(.+)$/)
        if (filePathMatch?.[1]) await deleteFile("payment-files", filePathMatch[1], driver_id)
      }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Błąd podczas usuwania kierowcy:", error)
    return { success: false, error: error.message }
  }
}
