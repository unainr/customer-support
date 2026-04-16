import { cosineDistance, desc, gt, sql, eq, and } from "drizzle-orm"
import { knowledgeChunks } from "@/drizzle/schema"
import { db } from "@/drizzle/db"
import { generateEmbeddig } from "./embedding"

interface SearchProps {
  query: string
  chatbotId: string // required
  limit?: number
  threshold?: number
}

export const SearchDocuments = async ({
  query,
  chatbotId,
  limit = 5,
  threshold = 0.5,
}: SearchProps) => {
  const embedding = await generateEmbeddig(query)

  const similarity = sql<number>`1 - (${cosineDistance(
    knowledgeChunks.embedding,
    embedding
  )})`

  const results = await db
    .select({
      id: knowledgeChunks.id,
      content: knowledgeChunks.content,
      similarity,
    })
    .from(knowledgeChunks)
    .where(
      and(
        eq(knowledgeChunks.chatbotId, chatbotId), // only this chatbot
        gt(similarity, threshold)
      )
    )
    .orderBy(desc(similarity))
    .limit(limit)

  return results
}