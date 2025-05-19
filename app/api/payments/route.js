import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(req) {
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from("payments")
    .insert([
      {
        driver_id: body.driver_id,
        amount: body.amount,
        payment_date: body.payment_date,
        payment_method: body.payment_method,
        description: body.description,
        receipt_number: body.receipt_number,
        created_by: body.created_by,
        installment_id: body.installment_id,
        type: body.type,
        category: body.category,
      },
    ])
    .select()

  if (error) {
    console.error("Error inserting payment:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data[0], { status: 201 })
}

export async function DELETE(req) {
  const { id } = await req.json()

  const { error } = await supabaseAdmin
    .from("payments")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting payment:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ message: "Payment deleted successfully" }, { status: 200 })
}
