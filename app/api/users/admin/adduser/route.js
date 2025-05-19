import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req) {
  const { email, name, surname, phone, role, branch, status, licenseCategory } = await req.json()
  console.log(licenseCategory)
  // Generowanie bezpiecznego tymczasowego hasła
  const tempPassword = crypto.randomBytes(12).toString("base64") // 12-13 znaków

  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      password: passwordHash,
      name,
      surname,
      phone,
      role,
      branch,
      status,
    })
    .select("id, email, name, role")
    .single()

  if (error || !user) {
    return Response.json({ error: "Registration failed" }, { status: 400 })
  }

  // Jeżeli użytkownik jest instruktorem – dodaj wpis do tabeli instructors
  console.log("user", user.role)
  if (user.role === "instruktor") {
    const { error: instructorError } = await supabaseAdmin
      .from("instructors")
      .insert({
        user_id: user.id,
        category: licenseCategory, // <- tymczasowe dane, do późniejszej edycji
        additional_info: "Tymczasowe dane – uzupełnij później"
      })

    if (instructorError) {
      return Response.json({ error: "User created, but failed to insert instructor data" }, { status: 500 })
    }
  }

  return Response.json({ success: true, user, tempPassword })
}
