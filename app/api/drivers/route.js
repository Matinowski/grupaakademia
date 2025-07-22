import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase")

    const { data: drivers, error } = await supabaseAdmin
      .from("drivers")
      .select(`
        id,
        name,
        phone,
        license_type,
        remaining_hours,
        completed_hours,
        branch,
        course_dates:start_date(data)
      `)
      .eq("course_type", "basic");

    if (error || !drivers) {
      console.log(error);
      return NextResponse.json(
        { drivers: null, message: "Błąd pobierania danych kierowców" },
        { status: 500 }
      );
    }

    const mappedDrivers = drivers
      .map(driver => ({
        ...driver,
        start_date: driver.course_dates?.data || null
      }))


    return NextResponse.json({ drivers: mappedDrivers });
  } catch (error) {
    console.error("Błąd serwera:", error)
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 })
  }
}
