import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Brak ID użytkownika." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Błąd podczas usuwania użytkownika." }, { status: 500 });
    }

    return NextResponse.json({ message: "Użytkownik został usunięty." });
  } catch (error) {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
