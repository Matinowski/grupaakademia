import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const SESSION_EXPIRY_DAYS = 7

export async function POST(req) {
  const { email, password } = await req.json()

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, password, email, name, needPasswordReset, role")
    .eq("email", email)
    .single()


  if (userError || !user) {
    console.log("User not found or error:", userError)
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }

  // Delete all existing sessions for this user (ROTATION)
  await supabaseAdmin.from("sessions").delete().eq("user_id", user.id)

  // Create new session
  const sessionToken = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await supabaseAdmin.from("sessions").insert({
    user_id: user.id,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  })

  const cookieStore = await cookies()
  cookieStore.set("session-token", sessionToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })
  console.log(user)

  const { error } = await supabaseAdmin
  .from('users')
  .update({ last_login: new Date() })
  .eq('id', user.id)

  return Response.json({ success: true, needPasswordReset: user.needPasswordReset,  user: { id: user.id, email: user.email, name: user.name } })
}
