import { createClient } from "@supabase/supabase-js"
import { requireAuth } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Upload pliku i zapis w bazie (bez signedUrl!)
export async function uploadFile(file, bucket, folder) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `${folder ? `${folder}/` : ""}${fileName}`

  const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })
  if (uploadError) throw uploadError

  return {
    fileName: file.name,
    filePath,
    fileType: file.type,
    fileSize: file.size,
  }
}


// Pobranie signed URL (sprawdza dostęp)
export async function getFileUrl(bucket, filePath, driverId) {
  await requireAuth()
  console.log("File path:", filePath)

  const { data: fileMeta } = await supabaseAdmin
    .from("payment_files")
    .select("driver_id")
    .eq("file_path", filePath)
    .single()
  console.log("File meta:", fileMeta)
  if (!fileMeta || fileMeta.driver_id !== driverId) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(filePath, 60)
  if (error) throw error

  return data.signedUrl
}

// Usuwanie pliku
export async function deleteFile(bucket, filePath, driverId) {
  await requireAuth()

  const { data: fileMeta } = await supabaseAdmin
    .from("payment_files")
    .select("driver_id")
    .eq("file_path", filePath)
    .single()

  if (!fileMeta || fileMeta.driver_id !== driverId) {
    throw new Error("Unauthorized")
  }

  const { error: storageError } = await supabaseAdmin.storage.from(bucket).remove([filePath])
  if (storageError) throw storageError

  const { error: dbError } = await supabaseAdmin.from("payment_files").delete().eq("file_path", filePath)
  if (dbError) throw dbError

  return true
}
