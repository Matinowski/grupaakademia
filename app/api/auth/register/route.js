import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { cookies } from "next/headers"

const SESSION_EXPIRY_DAYS = 7

export async function POST(req) {
  const { email, password, name } = await req.json()

  const passwordHash = await bcrypt.hash(password, 10)

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .insert({ email, password_hash: passwordHash, name })
    .select("id, email, name")
    .single()

  if (error || !user) {
    return Response.json({ error: "Registration failed" }, { status: 400 })
  }

  // Create session immediately
  const sessionToken = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  await supabaseAdmin.from("sessions").insert({
    user_id: user.id,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  })

  const cookieStore = cookies()
  cookieStore.set("session-token", sessionToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })

  return Response.json({ success: true, user })
}
