import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"

// Calendar update schema validation
const calendarUpdateSchema = z.object({
  name: z.string().optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format")
    .optional(),
  visible: z.boolean().optional(),
})

export async function GET(request, { params }) {
  try {
    const calendarId = Number.parseInt(params.id)
    if (isNaN(calendarId)) {
      return NextResponse.json({ error: "Invalid calendar ID" }, { status: 400 })
    }

 

    // No authorization check - return calendar details regardless of user

    const { data, error } = await supabaseAdmin.from("calendars").select("*").eq("id", calendarId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Calendar not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ calendar: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const calendarId = Number.parseInt(params.id)
    if (isNaN(calendarId)) {
      return NextResponse.json({ error: "Invalid calendar ID" }, { status: 400 })
    }

    const body = await request.json()
    const calendarData = calendarUpdateSchema.parse(body)

  

    // No authorization check - allow anyone to update calendars

    // Update calendar
    const { data, error } = await supabaseAdmin.from("calendars").update(calendarData).eq("id", calendarId).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ calendar: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update calendar" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const calendarId = Number.parseInt(params.id)
    if (isNaN(calendarId)) {
      return NextResponse.json({ error: "Invalid calendar ID" }, { status: 400 })
    }



    // No authorization check - allow anyone to delete calendars

    // Check if there are events using this calendar
    const { data: linkedEvents } = await supabaseAdmin.from("events").select("id").eq("calendar_id", calendarId)

    if (linkedEvents && linkedEvents.length > 0) {
      return NextResponse.json({ error: "Cannot delete calendar with linked events" }, { status: 409 })
    }

    // Delete calendar
    const { error } = await supabaseAdmin.from("calendars").delete().eq("id", calendarId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete calendar" }, { status: 500 })
  }
}
