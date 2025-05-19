import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(req) {
  const { id, email, name, surname, phone, role, branch, status } = await req.json()

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .update({
      email,
      name,
      surname,
      phone,
      role,
      branch,
      status,
    })
    .eq("id", id)
    .select("id, email, name")
    .single()

  if (error || !user) {
    return Response.json({ error: "Update failed" }, { status: 400 })
  }

  return Response.json({ success: true, user })
}
