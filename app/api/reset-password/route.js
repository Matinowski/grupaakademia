import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    const { tempPassword, newPassword, email } = await req.json()
    console.log(email)
    if (!tempPassword || !newPassword || !email) {
      return Response.json(
        { error: "Brakujące dane: wymagane jest tymczasowe hasło, nowe hasło i email" },
        { status: 400 }
      )
    }

    // Pobierz użytkownika na podstawie emaila
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, password")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return Response.json(
        { error: "Nie znaleziono użytkownika z podanym adresem email" },
        { status: 404 }
      )
    }

    // Sprawdź czy tymczasowe hasło jest poprawne
    const isValidPassword = await bcrypt.compare(tempPassword, user.password)

    if (!isValidPassword) {
      return Response.json(
        { error: "Nieprawidłowe hasło tymczasowe" },
        { status: 401 }
      )
    }

    // Zahaszuj nowe hasło
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Zaktualizuj hasło użytkownika i oznacz, że nie jest to już pierwsze logowanie
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        password: newPasswordHash,
        needPasswordReset: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (updateError) {
      return Response.json(
        { error: "Nie udało się zaktualizować hasła" },
        { status: 500 }
      )
    }

    // Zapisz informację o zmianie hasła w logach (opcjonalnie)
    // await supabaseAdmin
    //   .from("password_change_logs")
    //   .insert({
    //     user_id: user.id,
    //     changed_at: new Date().toISOString(),
    //     reason: "first_login"
    //   })
    //   .catch(error => console.error("Nie udało się zapisać logu zmiany hasła:", error))

    return Response.json({
      success: true,
      message: "Hasło zostało pomyślnie zmienione"
    })
  } catch (error) {
    console.error("Błąd podczas resetowania hasła:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas przetwarzania żądania" },
      { status: 500 }
    )
  }
}