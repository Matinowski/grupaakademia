import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req) {
  try {
    const { data, error } = await supabaseAdmin
      .from("course_dates")
        .select("*")
    console.log(data)
    if (error) {
     
      console.error("Błąd podczas POBIERANIA daty:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data, { status: 201 })
  } catch (err) {
    console.error("Nieoczekiwany błąd:", err)
    return Response.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { date } = await req.json()

    if (!date) {
      return Response.json({ error: "Brak daty w żądaniu" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("course_dates")
      .insert([{ data: date }])
      .select()

    if (error) {
      // Obsłuż unikalność daty (jeśli istnieje już taka data)
      if (error.code === "23505") {
        return Response.json({ error: "Taka data już istnieje" }, { status: 409 })
      }

      console.error("Błąd podczas dodawania daty:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data[0], { status: 201 })
  } catch (err) {
    console.error("Nieoczekiwany błąd:", err)
    return Response.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 })
  }
}
