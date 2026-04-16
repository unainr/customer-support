// components/chat-preview.tsx
"use client"
import { SelectChatbot } from "@/drizzle/schema"
import Image from "next/image"
export function ChatPreview({ bot }: { bot: SelectChatbot }) {
  const initial = bot.botName?.charAt(0).toUpperCase() ?? "B"

  return (
    <div className="flex flex-col h-120 w-[320px] rounded-[20px] overflow-hidden border border-zinc-200 dark:border-zinc-800">

      {/* header */}
      <div
        className="px-4 py-3.5 flex items-center gap-3"
        style={{ backgroundColor: bot.primaryColor }}
      >
        {bot.botAvatarUrl ? (
          <Image
          width={900}
          height={900}
            src={bot.botAvatarUrl}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
            alt={bot.botName}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">
            {initial}
          </div>
        )}
        <div>
          <p className="text-white text-sm font-medium leading-none">{bot.botName}</p>
          <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Online
          </p>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-zinc-50 dark:bg-zinc-900/50">

        {/* welcome */}
        <div className="flex items-end gap-2 max-w-[85%]">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0"
            style={{ backgroundColor: bot.primaryColor }}
          >
            {initial}
          </div>
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm text-zinc-700 dark:text-zinc-300">
            Hi! I'm <span className="font-medium">{bot.botName}</span>. How can I help you?
          </div>
        </div>

        {/* user message */}
        <div className="flex justify-end">
          <div
            className="rounded-2xl rounded-br-sm px-3.5 py-2 text-sm text-white max-w-[75%]"
            style={{ backgroundColor: bot.primaryColor }}
          >
            What are your working hours?
          </div>
        </div>

        {/* bot reply */}
        <div className="flex items-end gap-2 max-w-[85%]">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0"
            style={{ backgroundColor: bot.primaryColor }}
          >
            {initial}
          </div>
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm text-zinc-700 dark:text-zinc-300">
            We're available <span className="font-medium">Mon–Fri, 9am–6pm</span>. Feel free to leave a message anytime!
          </div>
        </div>

        {/* typing indicator */}
        <div className="flex items-end gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium shrink-0"
            style={{ backgroundColor: bot.primaryColor }}
          />
          <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-bl-sm px-3.5 py-3">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>

      </div>

      {/* input */}
      <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 bg-white dark:bg-zinc-900">
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-400">
          Type a message...
        </div>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: bot.primaryColor }}
        >
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

    </div>
  )
}