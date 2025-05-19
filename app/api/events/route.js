import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

import { z } from "zod"

// Event schema validation
const eventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  calendar_id: z.string().uuid().optional().nullable(),
  driver_id: z.string().uuid().optional().nullable(),
  instructor_id: z.string().uuid().optional().nullable(),
})

// Add a query parameter handler for date range filtering
export async function GET(request) {
  try {
    let query = supabaseAdmin.from("events").select(`
      *,
      driver:drivers (
        id,
        name,
        email,
        phone,
        completed_hours,
        total_paid
      ),
      instructor:users (
        id,
        name,
        surname,
        email,
        phone
      ),
      calendar:calendars (
        id,
        name,
        color
      )
    `)

    const url = new URL(request.url)
    const startDate = url.searchParams.get("start_date")
    const endDate = url.searchParams.get("end_date")
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate)
    } else if (month && year) {
      const monthNum = Number.parseInt(month)
      const yearNum = Number.parseInt(year)
      const startOfMonth = new Date(yearNum, monthNum - 1, 1).toISOString()
      const endOfMonth = new Date(yearNum, monthNum, 0).toISOString()
      query = query.gte("date", startOfMonth).lte("date", endOfMonth)
    }

    const { data: events, error } = await query

    if (error) {
      console.error("Error fetching events:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Unikalne ID kierowców
    const driverIds = [...new Set(events.map((e) => e.driver?.id).filter(Boolean))]

    // Pobierz raty płatności dla kierowców
    const { data: installments, error: installmentError } = await supabaseAdmin
      .from("payment_installments")
      .select("driver_id, hours, amount")
      .in("driver_id", driverIds)

    if (installmentError) {
      console.error("Error fetching payment_installments:", installmentError)
      return NextResponse.json({ error: "Failed to fetch installments" }, { status: 500 })
    }

    // Mapowanie rat na kierowców
    const installmentsMap = installments.reduce((acc, inst) => {
      if (!acc[inst.driver_id]) acc[inst.driver_id] = []
      acc[inst.driver_id].push(inst)
      return acc
    }, {})

    // Oblicz payment_due
    const enrichedEvents = events.map((event) => {
      const driver = event.driver
      if (!driver || !driver.id) return { ...event, payment_due: false }

      const { completed_hours = 0, total_paid = 0 } = driver
      const driverInstallments = installmentsMap[driver.id] || []

      // Sumujemy kwoty za raty, których próg godzinowy został przekroczony
      const requiredPayment = driverInstallments
        .filter(inst => completed_hours >= inst.hours)
        .reduce((sum, inst) => sum + inst.amount, 0)

      const paymentDue = total_paid < requiredPayment

      return {
        ...event,
        payment_due: paymentDue,
        required_payment: requiredPayment, // opcjonalnie: ile powinien był zapłacić
        paid: total_paid // opcjonalnie: ile faktycznie zapłacone
      }
    })

    return NextResponse.json({ events: enrichedEvents })
  } catch (error) {
    console.error("Error in GET events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}



export async function POST(request) {
  try {
    const body = await request.json()
    const eventData = eventSchema.parse(body)

    console.log("Event data:", eventData)



    // Check for scheduling conflicts
    // if (eventData.instructor_id) {
    //   const { data: conflictingEvents } = await supabaseAdmin
    //     .from("events")
    //     .select("id, title, start_time, end_time")
    //     .eq("instructor_id", eventData.instructor_id)
    //     .eq("date", eventData.date)
    //     .or(`start_time.lte.${eventData.end_time},end_time.gte.${eventData.start_time}`)

    //   if (conflictingEvents && conflictingEvents.length > 0) {
    //     return NextResponse.json(
    //       {
    //         error: "Scheduling conflict",
    //         conflicts: conflictingEvents,
    //       },
    //       { status: 409 },
    //     )
    //   }
    // }



    // Create event
    const { data, error } = await supabaseAdmin.from("events").insert(eventData).select().single()

    if (error) {
      console.error("Error creating event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: driverData, error: errorDriver } = await supabaseAdmin
    .from("drivers")
    .select("completed_hours")
    .eq("id", eventData.driver_id)
    .single();
  
  if (errorDriver) {
    console.log("Get driver error:", errorDriver);
    return;
  }

  const startHour = parseInt(eventData.start_time.split(":")[0], 10);
const endHour = parseInt(eventData.end_time.split(":")[0], 10);
const hoursToAdd = Math.max(0, endHour - startHour);
  
  const currentHours = driverData?.completed_hours || 0;
  const newHours = currentHours + hoursToAdd;
  
  // Zaktualizuj completed_hours
  const { error: updateError } = await supabaseAdmin
    .from("drivers")
    .update({ completed_hours: newHours })
    .eq("id", eventData.driver_id);
  
  if (updateError) {
    console.log("Update driver hours error:", updateError);
  }

    return NextResponse.json({ event: data }, { status: 201 })

    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("ZodError:", error.errors)
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.log(error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
