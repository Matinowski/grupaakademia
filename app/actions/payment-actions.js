"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase"

// Add a new payment
export async function addPayment(paymentData) {
  console.log("Adding payment:", paymentData)
  try {
    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .insert({
        driver_id: paymentData.driver_id,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date || new Date().toISOString().split("T")[0],
        payment_method: paymentData.payment_method,
        description: paymentData.description || null,
        receipt_number: paymentData.receipt_number || null,
        created_by: paymentData.created_by || null,
        installment_id: paymentData.installment_id || null,
      })
      .select()
      .single()

    if (error) throw error

    // Update the driver's total_paid amount
    const { data: driver, error: driverError } = await supabaseAdmin
      .from("drivers")
      .select("total_paid")
      .eq("id", paymentData.driver_id)
      .single()

    if (driverError) throw driverError

    const newTotalPaid = (Number.parseFloat(driver.total_paid) || 0) + Number.parseFloat(paymentData.amount)

    const { error: updateError } = await supabaseAdmin
      .from("drivers")
      .update({ total_paid: newTotalPaid })
      .eq("id", paymentData.driver_id)

    if (updateError) throw updateError

    revalidatePath("/")
    return { success: true, payment }
  } catch (error) {
    console.error("Error adding payment:", error)
    return { success: false, error: error.message }
  }
}

// Get payments for a driver
export async function getDriverPayments(driver_id) {
  try {
    const { data: payments, error } = await supabaseAdmin
      .from("payments")
      .select(`
        *,
        users:created_by (name, surname)
      `)
      .eq("driver_id", driver_id)
      .order("payment_date", { ascending: false })

    if (error) throw error

    return payments
  } catch (error) {
    console.error("Error fetching driver payments:", error)
    return []
  }
}

// Delete a payment
export async function deletePayment(paymentId) {
    try {
      // Najpierw pobierz dane płatności, aby znać kwotę i driver_id
      const { data: payment, error: fetchError } = await supabaseAdmin
        .from("payments")
        .select("id, amount, driver_id")
        .eq("id", paymentId)
        .single()
  
      if (fetchError) throw fetchError
  
      // Następnie odejmij tę kwotę od total_paid kierowcy
      const { data: driver, error: driverError } = await supabaseAdmin
        .from("drivers")
        .select("total_paid")
        .eq("id", payment.driver_id)
        .single()
  
      if (driverError) throw driverError
  
      const newTotalPaid = Math.max(
        0,
        (Number.parseFloat(driver.total_paid) || 0) - Number.parseFloat(payment.amount)
      )
  
      const { error: updateError } = await supabaseAdmin
        .from("drivers")
        .update({ total_paid: newTotalPaid })
        .eq("id", payment.driver_id)
  
      if (updateError) throw updateError
  
      // Teraz usuń płatność
      const { error: deleteError } = await supabaseAdmin
        .from("payments")
        .delete()
        .eq("id", paymentId)
  
      if (deleteError) throw deleteError
  
      revalidatePath("/")
      return { success: true }
    } catch (error) {
      console.error("Error deleting payment:", error)
      return { success: false, error: error.message }
    }
  }

// Check payment status against installment schedule
export async function checkPaymentStatus(driver_id) {
  try {
    // Get driver details with payment installments
    const { data: driver, error: driverError } = await supabaseAdmin
      .from("drivers")
      .select(`
        id,
        completed_hours,
        total_paid,
        payment_type,
        payment_installments(id, hours, amount)
      `)
      .eq("id", driver_id)
      .single()

    if (driverError) throw driverError

    // If driver doesn't use installments, return empty result
    if (
      driver.payment_type !== "installments" ||
      !driver.payment_installments ||
      driver.payment_installments.length === 0
    ) {
      return { installments: [], currentThreshold: null, nextThreshold: null, hasMissedPayment: false }
    }

    // Sort installments by hours
    const sortedInstallments = [...driver.payment_installments].sort((a, b) => a.hours - b.hours)

    // Calculate payment status for each installment
    const installmentsWithStatus = sortedInstallments.map((installment) => {
      return {
        ...installment,
        isReached: driver.completed_hours >= installment.hours,
        isPaid: driver.total_paid >= installment.amount,
        status:
          driver.completed_hours >= installment.hours
            ? driver.total_paid >= installment.amount
              ? "paid"
              : "overdue"
            : "pending",
      }
    })

    // Find current threshold (the highest reached installment)
    const currentThreshold =
      [...installmentsWithStatus].filter((i) => i.isReached).sort((a, b) => b.hours - a.hours)[0] || null

    // Find next threshold (the lowest unreached installment)
    const nextThreshold =
      [...installmentsWithStatus].filter((i) => !i.isReached).sort((a, b) => a.hours - b.hours)[0] || null

    // Check if there's any missed payment
    const hasMissedPayment = installmentsWithStatus.some((i) => i.isReached && !i.isPaid)

    return {
      installments: installmentsWithStatus,
      currentThreshold,
      nextThreshold,
      hasMissedPayment,
      completedHours: driver.completed_hours,
      totalPaid: driver.total_paid,
    }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return {
      installments: [],
      currentThreshold: null,
      nextThreshold: null,
      hasMissedPayment: false,
      error: error.message,
    }
  }
}

// Get payment installments for a driver
export async function getPaymentInstallments(driver_id) {
  try {
    const { data: installments, error } = await supabaseAdmin
      .from("payment_installments")
      .select("*")
      .eq("driver_id", driver_id)
      .order("hours")

    if (error) throw error

    return installments
  } catch (error) {
    console.error("Error fetching payment installments:", error)
    return []
  }
}
