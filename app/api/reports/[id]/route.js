// app/api/reports/[id]/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  const { id } = params
  const updates = await req.json()

  const { data, error } = await supabaseAdmin
    .from('reports')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

export async function DELETE(req, { params }) {
  const { id } = params

  const { error } = await supabaseAdmin.from('reports').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Raport usunięty' })
}
