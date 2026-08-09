"use client"

import React from "react"
import { useSyncExternalStore } from "react"

type Listener = () => void
const listeners = new Set<Listener>()
const opens = new Map<string, boolean>()

function subscribe(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function emit() {
  for (const fn of listeners) fn()
}

export function setPopoverOpen(key: string, open: boolean) {
  opens.set(key, open)
  emit()
}

export function useFilterPopover(key: string): [boolean, (v: boolean) => void] {
  const getSnapshot = React.useCallback(() => opens.get(key) ?? false, [key])
  const open = useSyncExternalStore(subscribe, getSnapshot, () => false)
  const setOpen = React.useCallback((v: boolean) => setPopoverOpen(key, v), [key])
  return [open, setOpen]
}