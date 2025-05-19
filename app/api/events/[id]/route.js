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

export async function GET(request, { params }) {
  try {
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

export async function PATCH(request, { params }) {
  try {
    const eventId = await params.id
    const body = await request.json()
    console.log(body)
    const eventData = eventUpdateSchema.parse(body)

    console.log("Event data to update:", eventData)

    const { data: currentEvent } = await supabaseAdmin.from("events").select("*").eq("id", eventId).single()

    if (!currentEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check for scheduling conflicts if date, time, or instructor changed
    if (
      (eventData.date || eventData.start_time || eventData.end_time || eventData.instructor_id) &&
      (eventData.instructor_id || currentEvent.instructor_id)
    ) {
      const instructor_id = eventData.instructor_id || currentEvent.instructor_id
      const date = eventData.date || currentEvent.date
      const start_time = eventData.start_time || currentEvent.start_time
      const end_time = eventData.end_time || currentEvent.end_time

      

    //   const { data: conflictingEvents } = await supabaseAdmin
    //     .from("events")
    //     .select("id, title, start_time, end_time")
    //     .eq("instructor_id", instructor_id)
    //     .eq("date", date)
    //     .neq("id", eventId) // Exclude current event
    //     .or(`start_time.lte.${end_time},end_time.gte.${start_time}`)

    //   if (conflictingEvents && conflictingEvents.length > 0) {
    //     return NextResponse.json(
    //       {
    //         error: "Scheduling conflict",
    //         conflicts: conflictingEvents,
    //       },
    //       { status: 409 },
    //     )
    //   }
     }

 

    // Update event
    const { data, error } = await supabaseAdmin.from("events").update(eventData).eq("id", eventId).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error) {
    console.error("Error updating event:", error)
    if (error instanceof z.ZodError) {
      console.log("ZodError:", error.errors)  
      console.error("ZodError:", error.errors)
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const eventId = params.id


    // No authorization check - allow anyone to delete events

    // Delete event
    const { error } = await supabaseAdmin.from("events").delete().eq("id", eventId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
