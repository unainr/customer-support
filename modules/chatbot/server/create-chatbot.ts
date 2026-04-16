"use server"

import { db } from "@/drizzle/db"
import { chatBots } from "@/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { formSchema } from "./schema"
import { z } from "zod";
import { and, eq } from "drizzle-orm"

export const createChatBot = async (values:z.infer<typeof formSchema>) => { 
const {userId} = await auth()
if(!userId){
    return {success:false , error:'Unauthorized'}
}
const validatedFields = formSchema.safeParse(values)
if(!validatedFields.success) return {error:'Invalid fields'}
const {botname,botAvatarUrl,primaryColor}=validatedFields.data
try {
 const [data] = await db.insert(chatBots).values({
    userId,
    botName:botname,
    botAvatarUrl,
    primaryColor
 }).returning()

 return {success:true || 'Chatbot created' , data:data}
} catch (error) {
    return{success:false , error:error||'Chatbot creation failed'}
}


}

// actions/chatbot.ts
export async function getChatbot(id: string) {
  const { userId } = await auth()

  const [bot] = await db
    .select()
    .from(chatBots)
    .where(
      and(
        eq(chatBots.id, id),
        eq(chatBots.userId, userId!)
      )
    )

  return bot
}