import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Tutaj używamy supabaseAdmin z twojego istniejącego kodu
    const { supabaseAdmin } = await import("@/lib/supabase")

    // Pobieramy wszystkich kierowców z ich datami rozpoczęcia, placówkami i typami prawa jazdy
    const { data: drivers, error } = await supabaseAdmin
      .from("drivers")
      .select(`
        id,
        name,
        phone,
        license_type,
        remaining_hours,
        completed_hours,
        start_date,
        branch
      `)
      .order("start_date", { ascending: false })

    if (error || !drivers) {
      console.log(error)
      return NextResponse.json({ drivers: null, message: "Błąd pobierania danych kierowców" }, { status: 500 })
    }

    return NextResponse.json({ drivers })
  } catch (error) {
    console.error("Błąd serwera:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
