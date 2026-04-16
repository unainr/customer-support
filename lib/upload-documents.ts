"use server"
import pdf from "pdf-parse"
import { generateEmbeddings } from "./embedding"
import { db } from "@/drizzle/db"
import { knowledgeChunks, knowledgeSources } from "@/drizzle/schema"
import { sanitizeString } from "./utils"
import { chunkContent } from "./chunking"

export const processPdfFile = async (
  formData: FormData,
  chatbotId: string,
  sourceId: string
) => {


  try {
    const file = formData.get("pdf") as File
    if (!file) return { success: false, error: "No file provided" }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const data = await pdf(buffer)

    if (!data.text || data.text.length === 0) {
      return { success: false, error: "No text found in PDF" }
    }

    const cleanText = sanitizeString(data.text)
    const chunks = await chunkContent(cleanText)
    const embeddings = await generateEmbeddings(chunks)

    const records = chunks.map((chunk, index) => ({
      chatbotId,   // which chatbot
      sourceId,    // which source
      content: chunk,
      embedding: embeddings[index],
      chunkIndex: index, // required by schema
    }))

    await db.insert(knowledgeChunks).values(records)

    return {
      success: true,
      message: `Created ${records.length} searchable chunks`,
    }
  } catch (error) {
    console.error("PDF processing error:", error)
    return { success: false, error: "PDF processing failed" }
  }
}