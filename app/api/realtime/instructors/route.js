import { supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() { 
  try {
    // Pobieranie danych użytkowników (instruktorów)
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(
        `id,
        email,
        name,
        surname,
        role,
        phone,
        status,
        created_at,
        last_login,
        branches,
        instructors (
          category,
          additional_info
        )`
      )
      .order("created_at", { ascending: false })

    if (error || !users) {
      console.log(error)
      return NextResponse.json({ users: null, message: "Błąd pobierania danych" }, { status: 500 })
    }

    // Filtrujemy instruktorów (czyli tych, gdzie pole instructors !== null)
    const instructors = users.filter((user) => user.instructors !== null)

    // Pobieramy kierowców przypisanych do instruktorów
    const instructor_ids = instructors.map(instructor => instructor.id)

    const { data: drivers, error: driverError } = await supabaseAdmin
      .from("drivers")
      .select(
        `id,
        name,
        phone
        `
      )

    if (driverError || !drivers) {
      console.log(driverError)
      return NextResponse.json({ drivers: null, message: "Błąd pobierania kierowców" }, { status: 500 })
    }

    // Dodajemy kierowców do instruktorów
    instructors.forEach((instructor) => {
      // Filtrujemy kierowców, którzy są przypisani do tego instruktora
      instructor.drivers = drivers.filter((driver) => driver.instructor_id === instructor.id)
    })

    // Zwracamy dane: użytkowników, instruktorów z przypisanymi kierowcami
    return NextResponse.json({ users, instructors })
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
