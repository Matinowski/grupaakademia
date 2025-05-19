import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("session-token")?.value

  if (sessionToken) {
    await supabaseAdmin.from("sessions").delete().eq("session_token", sessionToken)
    cookieStore.delete("session-token")
  }

  return Response.json({ success: true })
}
