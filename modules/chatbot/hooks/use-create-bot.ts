// hooks/use-create-chatbot.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from "zod"
import { createChatBot, getChatbot } from "../server/create-chatbot"
import { formSchema } from "../server/schema"

export function useCreateChatbot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await createChatBot(values)
      if (!res.success) throw new Error(res.error as string)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] })
      toast.success("Chatbot created!")
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong")
    },
  })
}


// get bots
export function useChatbot(chatbotId: string | null) {
  return useQuery({
    queryKey: ["chatbot", chatbotId],
    queryFn: () => getChatbot(chatbotId!),
    enabled: !!chatbotId, // only fetch when id exists
  })
}