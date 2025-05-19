import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"

// Calendar schema validation
const calendarSchema = z.object({
  name: z.string(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  visible: z.boolean().default(true),
})

export async function GET(request) {
  try {

    console.log("Fetching calendars...")
    // No authorization check - return all calendars regardless of user

    const { data, error } = await supabaseAdmin.from("calendars").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ calendars: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendars" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const calendarData = calendarSchema.parse(body)


    // No authorization check - allow anyone to create calendars

    // Create calendar
    const { data, error } = await supabaseAdmin.from("calendars").insert(calendarData).select().single()

    if (error) {
      console.log("Error creating calendar:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ calendar: data }, { status: 201 })
  } catch (error) {
    console.log("Error creating calendar:", error)
    if (error instanceof z.ZodError) {
      console.log("Error creating calendar:", error)
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create calendar" }, { status: 500 })
  }
}
