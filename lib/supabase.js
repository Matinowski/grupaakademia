import { createClient } from "@supabase/supabase-js"



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY



// Create a Supabase client with service role for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - The bucket name
 * @param {string} folder - The folder path within the bucket
 * @returns {Promise<Object>} - The uploaded file data
 */
export async function uploadFile(file, bucket, folder) {
  try {
    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${folder ? `${folder}/` : ""}${fileName}`

    // Upload the file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Get the public URL for the file
    const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

    return {
      fileName: file.name,
      filePath: filePath,
      publicUrl: publicUrlData.publicUrl,
      fileType: file.type,
      fileSize: file.size,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

/**
 * Get a file from Supabase Storage
 * @param {string} bucket - The bucket name
 * @param {string} filePath - The file path within the bucket
 * @returns {Promise<Object>} - The file data
 */
export async function getFileUrl(bucket, filePath) {
  try {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error getting file URL:", error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - The bucket name
 * @param {string} filePath - The file path within the bucket
 * @returns {Promise<void>}
 */
export async function deleteFile(bucket, filePath) {
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}
