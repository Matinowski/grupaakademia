import { supabaseAdmin } from "@/lib/supabase"   
import { NextResponse } from "next/server"

export async function GET() { 
  try {
    // Pobieramy wszystkich użytkowników (instruktorów i innych)
    const { data: users, error } = await supabaseAdmin
    .from("users")
    .select(`
      id,
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
      ),
      events (
        id,
        title,
        description,
        date,
        start_time,
        end_time,
        driver_id,
        driver:driver_id (
          id,
          name,
          completed_hours,
          payment_installments:payment_installments (
            id,
            hours
          )
        )
      )
    `)
    .order("created_at", { ascending: false })
    

    if (error || !users) {
      console.log(error)
      return NextResponse.json({ users: null, message: "Błąd pobierania danych" }, { status: 401 })
    }

    // Filtrujemy instruktorów (tych, którzy mają dane w polu 'instructors')
    const instructors = users.filter((user) => user.instructors !== null)

    // Pobieramy kierowców przypisanych do instruktorów
    const instructor_ids = instructors.map((instructor) => instructor.id)

    const { data: drivers, error: driverError } = await supabaseAdmin
    .from("drivers")
    .select(`
      id,
      name,
      phone,
      license_type,
      remaining_hours,
      completed_hours
    `)

    if (driverError || !drivers) {
      console.log(driverError)
      return NextResponse.json({ drivers: null, message: "Błąd pobierania kierowców" }, { status: 500 })
    }

    // Dodajemy kierowców do instruktorów
    instructors.forEach((instructor) => {
      // Filtrujemy kierowców, którzy są przypisani do tego instruktora
      instructor.drivers = drivers.filter((driver) => driver.instructor_id === instructor.id)
    })

    // Uzupełniamy eventy o informacje czy wymagane są płatności
users.forEach((user) => {
  if (!user.events) return;

  user.events.forEach((event) => {
    const driver = event.driver;
    if (!driver || !driver.payment_installments) {
      event.payment_due = false;
      return;
    }

    const completedHours = driver.completed_hours || 0;

    // Znajdź najwyższy próg z installments, który nie został jeszcze opłacony
    const maxInstallmentHours = Math.max(...driver.payment_installments.map(p => p.hours));

    // Jeśli completed_hours > max hours z raty, to płatność powinna być już dokonana
    event.payment_due = completedHours >= maxInstallmentHours;
  });
});




    const { data: calendars, error: calendarsError } = await supabaseAdmin
    .from("calendars")
    .select(`
      id,
      name,
      color,
      visible
    `)

  if (calendarsError || !calendars) {
    console.log(calendarsError)
    return NextResponse.json({ calendars: null, message: "Błąd pobierania kierowców" }, { status: 500 })
  }


    // Zwracamy dane: użytkowników, instruktorów z przypisanymi kierowcami
    return NextResponse.json({ users, instructors, calendars })
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
