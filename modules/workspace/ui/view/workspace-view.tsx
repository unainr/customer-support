'use client'
import { useChatbot } from "@/modules/chatbot/hooks/use-create-bot"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatPreview } from "@/modules/chatbot/ui/components/chat-preview"
export const WorkSpaceView = ({id}:{id:string}) => {
  const { data: bot, isLoading } = useChatbot(id)

  if (isLoading) return <div>Loading...</div>
  if (!bot) return <div>Not found</div>
    return (
        <div className="flex h-screen my-20">

      {/* LEFT — tabs */}
      <div className="w-105 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="font-semibold text-base">{bot.botName}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage your chatbot</p>
        </div>

        <Tabs defaultValue="customize" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          {/* customize tab */}
          <TabsContent value="customize" className="flex-1 overflow-y-auto p-4">
            {/* <UpdateChatbotForm bot={bot} /> */}
            UpdateChatbotForm
          </TabsContent>

          {/* knowledge tab */}
          <TabsContent value="knowledge" className="flex-1 overflow-y-auto p-4">
            {/* <KnowledgeBase chatbotId={bot.id} /> */}
            KnowledgeBase
          </TabsContent>

          {/* test tab */}
          <TabsContent value="test" className="flex-1 p-4">
            {/* <TestChat bot={bot} /> */}
            TestChat
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT — live preview */}
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/30">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-zinc-400">Live Preview</p>
          <ChatPreview bot={bot} />
        </div>
      </div>

    </div>
  )
}
