"use client"

import * as React from "react"
import { useSyncExternalStore } from "react"

type Listener = () => void
type SelectionState = { isSelecting: boolean; selected: Set<string> }
type SelectionSnapshot = { isSelecting: boolean; selectedIds: string[] }

const selections = new Map<string, SelectionState>()
const listeners = new Set<Listener>()
const snapshots = new Map<string, SelectionSnapshot>()

function ensure(key: string): SelectionState {
  const s = selections.get(key)
  if (s) return s
  const next: SelectionState = { isSelecting: false, selected: new Set() }
  selections.set(key, next)
  return next
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  for (const l of listeners) l()
}

function arraysEq(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function computeSnapshot(key: string): SelectionSnapshot {
  const s = ensure(key)
  return { isSelecting: s.isSelecting, selectedIds: Array.from(s.selected) }
}

function getSnapshotCached(key: string): SelectionSnapshot {
  const current = snapshots.get(key)
  const next = computeSnapshot(key)
  if (!current || current.isSelecting !== next.isSelecting || !arraysEq(current.selectedIds, next.selectedIds)) {
    snapshots.set(key, next)
    return next
  }
  return current
}

export function setSelecting(key: string, selecting: boolean) {
  const s = ensure(key)
  s.isSelecting = selecting
  notify()
}

export function toggleSelectionId(key: string, id: string, checked?: boolean) {
  const s = ensure(key)
  const isChecked = typeof checked === "boolean" ? checked : !s.selected.has(id)
  if (isChecked) s.selected.add(id)
  else s.selected.delete(id)
  notify()
}

export function selectAllForKey(key: string, ids: string[]) {
  const s = ensure(key)
  ids.forEach((id) => s.selected.add(id))
  notify()
}

export function clearSelection(key: string) {
  const s = ensure(key)
  s.selected.clear()
  notify()
}

export function removeSelectedIds(key: string, ids: string[]) {
  const s = ensure(key)
  ids.forEach((id) => s.selected.delete(id))
  notify()
}

export function getSelectedIds(key: string): string[] {
  return Array.from(ensure(key).selected)
}

export function useSelection(key: string): SelectionSnapshot {
  const get = React.useCallback(() => getSnapshotCached(key), [key])
  const getServer = React.useCallback(() => getSnapshotCached(key), [key])
  return useSyncExternalStore(subscribe, get, getServer)
}
