import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req) {
  const { email } = await req.json()

  // Generowanie nowego tymczasowego hasła
  const tempPassword = crypto.randomBytes(12).toString("base64")

  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const { error } = await supabaseAdmin
    .from("users")
    .update({ password: passwordHash })
    .eq("email", email)

  if (error) {
    return Response.json({ error: "Password reset failed" }, { status: 400 })
  }

  return Response.json({ success: true, tempPassword })
}
