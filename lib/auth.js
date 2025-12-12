import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function requireAuth() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session-token")

  if (!sessionToken) {
    throw new Error("UNAUTHORIZED")
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("sessions")
    .select("user_id, expires_at")
    .eq("session_token", sessionToken.value)
    .single()

  if (sessionError || !session || new Date(session.expires_at) < new Date()) {
    throw new Error("UNAUTHORIZED")
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, role, name, surname")
    .eq("id", session.user_id)
    .single()

  if (userError || !user) {
    throw new Error("UNAUTHORIZED")
  }

  return user
}
