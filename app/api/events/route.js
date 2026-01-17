import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"
import { z } from "zod"

// Event schema validation
const eventSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  calendar_id: z.string().uuid().optional().nullable(),
  driver_id: z.string().uuid().optional().nullable(),
  instructor_id: z.string().uuid().optional().nullable(),
})

function isTooLate(eventDateString, now = new Date()) {
  const todayAtTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0)
  const eventDate = new Date(eventDateString)
  return eventDate < todayAtTen
}

// Funkcja pomocnicza do obliczania czasu trwania w godzinach
function getDurationInHours(startTime, endTime) {
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)
  const startTotal = startH + startM / 60
  const endTotal = endH + endM / 60
  return Math.max(0, endTotal - startTotal)
}

export async function GET(request) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session-token")

  if (!sessionToken) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("sessions")
    .select("user_id, expires_at")
    .eq("session_token", sessionToken.value)
    .single()

  if (sessionError || !session || new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", session.user_id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    let query = supabaseAdmin.from("events").select(`
      *,
      driver:drivers (
        id,
        name,
        email,
        phone,
        completed_hours,
        license_type
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

    if (user.role === "instruktor") {
      query = query.eq("instructor_id", session.user_id)
    }

    const url = new URL(request.url)
    const startDate = url.searchParams.get("start_date")
    const endDate = url.searchParams.get("end_date")
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    let effectiveStartDate = startDate;

    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate)
    } else if (month && year) {
      const monthNum = Number.parseInt(month)
      const yearNum = Number.parseInt(year)
      const startOfMonth = new Date(yearNum, monthNum - 1, 1).toISOString()
      const endOfMonth = new Date(yearNum, monthNum, 0).toISOString()
      effectiveStartDate = startOfMonth;
      query = query.gte("date", startOfMonth).lte("date", endOfMonth)
    }

    const { data: events, error } = await query

    if (error) {
      console.error("Error fetching events:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ===== DRIVER IDS =====
    const driverIds = [...new Set(events.map((e) => e.driver?.id).filter(Boolean))]

    if (driverIds.length === 0) {
        return NextResponse.json({ events })
    }

    // ===== POBIERANIE RAT I WPŁAT =====
    const { data: installments } = await supabaseAdmin
      .from("payment_installments")
      .select("driver_id, hours, amount")
      .in("driver_id", driverIds)
      .order("hours", { ascending: true }) // Ważne: sortowanie po godzinach

    const { data: payments } = await supabaseAdmin
      .from("payments")
      .select("driver_id, amount")
      .in("driver_id", driverIds)

    // Mapy pomocnicze
    const installmentsMap = (installments || []).reduce((acc, inst) => {
      if (!acc[inst.driver_id]) acc[inst.driver_id] = []
      acc[inst.driver_id].push(inst)
      return acc
    }, {})

    const paymentsMap = (payments || []).reduce((acc, payment) => {
      if (!acc[payment.driver_id]) acc[payment.driver_id] = 0
      acc[payment.driver_id] += payment.amount
      return acc
    }, {})

    // ===== OBLICZANIE "BAZOWYCH" GODZIN Z PRZESZŁOŚCI =====
    // Musimy wiedzieć ile godzin kierowca wyjeździł PRZED widokiem kalendarza, 
    // aby poprawnie liczyć sumę chronologiczną.
    let pastEventsMap = {}
    
    if (effectiveStartDate) {
        const { data: pastEvents } = await supabaseAdmin
            .from("events")
            .select("driver_id, start_time, end_time")
            .in("driver_id", driverIds)
            .lt("date", effectiveStartDate) // Tylko wydarzenia sprzed zakresu

        pastEventsMap = (pastEvents || []).reduce((acc, ev) => {
            if (!acc[ev.driver_id]) acc[ev.driver_id] = 0
            acc[ev.driver_id] += getDurationInHours(ev.start_time, ev.end_time)
            return acc
        }, {})
    }

    // ===== PRZETWARZANIE EVENTÓW =====
    // 1. Grupujemy eventy po kierowcy, żeby posortować je chronologicznie
    const eventsByDriver = events.reduce((acc, event) => {
        const dId = event.driver?.id || 'unknown'
        if(!acc[dId]) acc[dId] = []
        acc[dId].push(event)
        return acc
    }, {})

    let enrichedEvents = []

    // 2. Iterujemy po każdym kierowcy
    for (const dId of Object.keys(eventsByDriver)) {
        let driverEvents = eventsByDriver[dId]

        // Jeśli brak kierowcy (np. event bez przypisanego kursanta), zwracamy bez zmian
        if (dId === 'unknown') {
            enrichedEvents.push(...driverEvents.map(e => ({...e, payment_due: false})))
            continue
        }

        // Sortujemy eventy chronologicznie: data rosnąco, potem godzina rosnąco
        driverEvents.sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            if (dateA !== dateB) return dateA - dateB
            return a.start_time.localeCompare(b.start_time)
        })

        // Pobieramy dane finansowe kierowcy
        const totalPaid = paymentsMap[dId] || 0
        const driverInstallments = installmentsMap[dId] || []
        
        // Obliczamy LIMIT BEZPIECZNYCH GODZIN (opłaconych)
        let safeHoursLimit = 99999 // Domyślnie dużo, jeśli wszystko opłacone
        let cumulativeRequired = 0
        
        // Sprawdzamy raty po kolei
        for (const inst of driverInstallments) {
            cumulativeRequired += inst.amount
            if (totalPaid < cumulativeRequired) {
                // Jeśli wpłaty są mniejsze niż wymagana suma na tym etapie,
                // to limit to godzina tej raty.
                safeHoursLimit = inst.hours
                break 
            }
        }

        // Startujemy licznik godzin od tego, co było wcześniej (przed tym widokiem)
        let runningHours = pastEventsMap[dId] || 0

        // Przetwarzamy posortowane eventy i oznaczamy te, które przekraczają limit
        for (const event of driverEvents) {
            const duration = getDurationInHours(event.start_time, event.end_time)
            
            // Dodajemy czas tego eventu do licznika
            // Uwaga: Można dyskutować czy sprawdzamy `runningHours` (przed jazdą) czy `runningHours + duration` (po jeździe).
            // Zazwyczaj, jeśli zaczynasz jazdę mając dług, powinna być czerwona.
            // Lub jeśli w trakcie tej jazdy przekraczasz limit.
            // Przyjmijmy: jeśli PO zakończeniu tej jazdy przekroczysz limit (lub już przekroczyłeś), to jest unpaid.
            
            runningHours += duration

            // Logika: Jeśli aktualny licznik godzin jest większy niż limit opłaconych godzin
            const isPaymentDue = runningHours > safeHoursLimit

            enrichedEvents.push({
                ...event,
                payment_due: isPaymentDue,
                // Debug info (opcjonalnie)
                _debug_running: runningHours,
                _debug_limit: safeHoursLimit
            })
        }
    }

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

    // Create event
    const now = new Date()
    const is_too_late = isTooLate(eventData.date, now)

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({
        ...eventData,
        is_too_late,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: driverData, error: errorDriver } = await supabaseAdmin
      .from("drivers")
      .select("completed_hours")
      .eq("id", eventData.driver_id)
      .single()

    if (errorDriver) {
      console.log("Get driver error:", errorDriver)
      return
    }

    const startHour = parseInt(eventData.start_time.split(":")[0], 10)
    const endHour = parseInt(eventData.end_time.split(":")[0], 10)
    const hoursToAdd = Math.max(0, endHour - startHour)

    const currentHours = driverData?.completed_hours || 0
    const newHours = currentHours + hoursToAdd

    // Zaktualizuj completed_hours
    const { error: updateError } = await supabaseAdmin
      .from("drivers")
      .update({ completed_hours: newHours })
      .eq("id", eventData.driver_id)

    if (updateError) {
      console.log("Update driver hours error:", updateError)
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