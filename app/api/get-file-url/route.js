import { getFileUrl } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get("filePath")
  const driverId = searchParams.get("driverId")

  if (!filePath || !driverId) return NextResponse.json({ message: "Bad Request" }, { status: 400 })

  try {
    const signedUrl = await getFileUrl("payment-files", filePath, driverId)
    console.log("Signed URL:", signedUrl)
    return NextResponse.json({ signedUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }
}
