import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"

// Event update schema validation
const eventUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" })
    .optional(),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .optional(),
  end_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .optional(),
  calendar_id: z.string().uuid().optional().nullable(),

  driver_id: z.string().uuid().optional().nullable(),
  instructor_id: z.string().uuid().optional().nullable(),
})

function isTooLate(eventDateString, now = new Date()) {
  // dzisiejszy dzień o godzinie 10:00 rano
  const todayAtTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0)

  const eventDate = new Date(eventDateString)

  // Zwraca true, jeśli eventDate jest wcześniejszy niż dziś o 10:00 (czyli w przeszłości)
  return eventDate < todayAtTen
}



export async function GET(request, context) {
  try {
   const params = await context.params
   const eventId = params.id
    // No authorization check - return event details regardless of user

    const { data, error } = await supabaseAdmin
      .from("events")
      .select(`
        *,
        driver:drivers (
          id,
          name,
          email,
          phone
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
      .eq("id", eventId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const params = await context.params
    const eventId = params.id

    console.log("Updating event with ID:", eventId)

    const body = await request.json()
    const eventData = eventUpdateSchema.parse(body)

    const now = new Date()

    const { data: currentEvent } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single()

    if (!currentEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    eventData.updated_at = now.toISOString()
    const effectiveEventDate = eventData.date || currentEvent.date
    eventData.is_too_late = isTooLate(effectiveEventDate, now)

    const { data, error } = await supabaseAdmin
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}


export async function DELETE(request, context) {
  try {
     const params = await context.params
  const eventId = params.id


    // No authorization check - allow anyone to delete events

    // Delete event
 const { count } = await supabaseAdmin
  .from("events")
  .delete({ count: "exact" })
  .eq("id", eventId)

   
if (count === 0) {
  return NextResponse.json({ error: "Event not deleted" }, { status: 400 })
}

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
