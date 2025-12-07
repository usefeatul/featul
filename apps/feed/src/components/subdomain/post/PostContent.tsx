"use client"

import React from "react"
import { Input } from "@feedgot/ui/components/input"
import { Textarea } from "@feedgot/ui/components/textarea"

export interface PostContentProps {
  title: string
  setTitle: (value: string) => void
  content: string
  setContent: (value: string) => void
}

export function PostContent({
  title,
  setTitle,
  content,
  setContent,
}: PostContentProps) {
  return (
    <div className="px-3 md:px-4 flex flex-col">
      <Input
        variant="plain"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={128}
        className="text-lg md:text-xl font-semibold h-auto py-2 placeholder:text-accent "
      />
      <Textarea
        variant="plain"
        placeholder="Add post content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="resize-none min-h-[80px] py-2 text-base placeholder:text-accent "
        required
      />
    </div>
  )
}
