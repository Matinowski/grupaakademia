// app/api/reports/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get('branchId')

  let query = supabaseAdmin.from('reports').select('*').order('created_at', { ascending: false })

  if (branchId && branchId !== 'general') {
    query = query.eq('branch', branchId)
  } else if (branchId === 'general') {
    query = query.is('branch', null)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()

  console.log('Received body:', body)

  const { data, error } = await supabaseAdmin.from('reports').insert([body]).select()

  if (error) {
    console.error('Error inserting report:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
