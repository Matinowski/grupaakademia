import { supabaseAdmin } from "@/lib/supabase"   
import { NextResponse } from "next/server"


export async function GET() { 
    try {
        const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, email, name, surname, role, phone, status, created_at, last_login, branch")
    .order("created_at", { ascending: false })

  if (userError || !user) {
    return NextResponse.json({ user: null, test:"asd" }, { status: 401 })
  }

  return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
    }
    

}