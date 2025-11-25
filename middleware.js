// /app/api/users/admin/middleware.js

import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

// Middleware do ochrony endpointów admina
export async function middleware(req) {
  try {
    
  if(req.nextUrl.pathname.startsWith('/api/users/admin')) { 
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session-token")
      if (!sessionToken) {
        return NextResponse.json({ user: null }, { status: 401 })
      }
    
      const { data: session, error: sessionError } = await supabaseAdmin
        .from("sessions")
        .select("user_id, expires_at")
        .eq("session_token", sessionToken.value)
        .single()
    
      if (sessionError || !session || new Date(session.expires_at) < new Date()) {
        return NextResponse.json({ user: null }, { status: 401 })
      }
    
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", session.user_id)
        .single()
    
      if (userError || !user) {
        return NextResponse.json({ user: null, test:"asd" }, { status: 401 })
      }

      if (user.role !== 'admin') {
        return NextResponse.json({ user: null }, { status: 401 })
      }
      return NextResponse.next()

  }

  if(req.nextUrl.pathname.startsWith('/api') && !req.nextUrl.pathname.startsWith('/api/auth/')) { 
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session-token")
      if (!sessionToken) {
        return NextResponse.json({ user: null }, { status: 401 })
      }
    
      const { data: session, error: sessionError } = await supabaseAdmin
        .from("sessions")
        .select("user_id, expires_at")
        .eq("session_token", sessionToken.value)
        .single()
    
      if (sessionError || !session || new Date(session.expires_at) < new Date()) {
        return NextResponse.json({ user: null }, { status: 401 })
      }
    
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", session.user_id)
        .single()
    
      if (userError || !user) {
        return NextResponse.json({ user: null, test:"asd" }, { status: 401 })
      }

      return NextResponse.next()

  }


  if(req.nextUrl.pathname.startsWith('/dashboard')) { 
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session-token")

      if (!sessionToken) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      const { data: session, error: sessionError } = await supabaseAdmin
        .from("sessions")
        .select("user_id, expires_at")
        .eq("session_token", sessionToken.value)
        .single()
      if (sessionError || !session || new Date(session.expires_at) < new Date()) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", session.user_id)
        .single()
      if (userError || !user) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
  }

 



  } catch (error) {
    return NextResponse.json({ error: 'Błąd weryfikacji tokenu' }, { status: 401 })
  }
}

