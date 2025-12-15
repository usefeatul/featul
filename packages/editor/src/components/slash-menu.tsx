"use client"

import * as React from "react"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { SlashCommandItem } from "../extensions/slash-commands"
import { cn } from "../lib/utils"

export interface SlashMenuProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
  selectedIndex?: number
}

export interface SlashMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  ({ items, command, selectedIndex: initialIndex = 0 }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(initialIndex)

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) {
        command(item)
      }
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          upHandler()
          return true
        }

        if (event.key === "ArrowDown") {
          downHandler()
          return true
        }

        if (event.key === "Enter") {
          enterHandler()
          return true
        }

        return false
      },
    }))

    if (items.length === 0) {
      return (
        <div className="slash-menu">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No results found
          </div>
        </div>
      )
    }

    return (
      <div className="slash-menu">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={cn(
              "slash-menu-item w-full text-left",
              index === selectedIndex && "is-selected"
            )}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="slash-menu-item-icon">
              <span className="text-base">{item.icon}</span>
            </div>
            <div className="slash-menu-item-content">
              <span className="slash-menu-item-title">{item.title}</span>
              <span className="slash-menu-item-description">
                {item.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    )
  }
)

SlashMenu.displayName = "SlashMenu"

