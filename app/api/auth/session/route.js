import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken =  cookieStore.get("session-token")?.value

  if (!sessionToken) {
    return Response.json({ user: null }, { status: 401 })
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from("sessions")
    .select("user_id, expires_at")
    .eq("session_token", sessionToken)
    .single()

  if (sessionError || !session || new Date(session.expires_at) < new Date()) {
    return Response.json({ user: null }, { status: 401 })
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, email, name, role, branches")
    .eq("id", session.user_id)
    .single()

  if (userError || !user) {
    return Response.json({ user: null }, { status: 401 })
  }

  return Response.json({ user })
}
