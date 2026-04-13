import {
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
  index,
  boolean,
  integer,
  varchar,
  pgEnum
} from "drizzle-orm/pg-core"

export const sourceTypeEnum = pgEnum("source_type", ["text", "pdf", "website"])
// ─── Chatbots ──────────────────────────────────────────────────────
export const chatBots = pgTable("chatbots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  botName: text("bot_name").notNull(),
  botAvatarUrl: text("bot_avatar_url"),
  primaryColor: text("primary_color").notNull().default("#6366f1"),
  voiceEnabled: boolean("voice_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Knowledge Sources ─────────────────────────────────────────────
export const knowledgeSources = pgTable("knowledge_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatbotId: uuid("chatbot_id")
    .notNull()
    .references(() => chatBots.id, { onDelete: "cascade" }),
    type: sourceTypeEnum("type").notNull(), // "text" | "pdf" | "website"
  title: text("title").notNull(),
  rawContent: text("raw_content"),
  websiteUrl: text("website_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Knowledge Chunks ──────────────────────────────────────────────
export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chatbotId: uuid("chatbot_id")
      .notNull()
      .references(() => chatBots.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    chunkIndex: integer("chunk_index").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("chunks_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
    index("chunks_chatbot_id_index").on(table.chatbotId),
  ]
)

// ─── Types ─────────────────────────────────────────────────────────
export type InsertChatbot = typeof chatBots.$inferInsert
export type SelectChatbot = typeof chatBots.$inferSelect

export type InsertKnowledgeSource = typeof knowledgeSources.$inferInsert
export type SelectKnowledgeSource = typeof knowledgeSources.$inferSelect

export type InsertKnowledgeChunk = typeof knowledgeChunks.$inferInsert
export type SelectKnowledgeChunk = typeof knowledgeChunks.$inferSelect