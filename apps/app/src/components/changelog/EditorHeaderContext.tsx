"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface EditorAction {
    key: string
    label: string
    icon?: ReactNode
    onClick: () => void
    disabled?: boolean
    destructive?: boolean
    type?: "button" | "switch" | "menu"
    checked?: boolean
    variant?: "card"
}

interface EditorHeaderContextValue {
    actions: EditorAction[]
    setActions: (actions: EditorAction[]) => void
    clearActions: () => void
    toolbarSlot: ReactNode | null
    setToolbarSlot: (node: ReactNode | null) => void
}

const EditorHeaderContext = createContext<EditorHeaderContextValue | null>(null)

export function EditorHeaderProvider({ children }: { children: ReactNode }) {
    const [actions, setActionsState] = useState<EditorAction[]>([])
    const [toolbarSlot, setToolbarSlotState] = useState<ReactNode | null>(null)

    const setActions = useCallback((newActions: EditorAction[]) => {
        setActionsState(newActions)
    }, [])

    const clearActions = useCallback(() => {
        setActionsState([])
    }, [])

    const setToolbarSlot = useCallback((node: ReactNode | null) => {
        setToolbarSlotState(node)
    }, [])

    return (
        <EditorHeaderContext.Provider value={{ actions, setActions, clearActions, toolbarSlot, setToolbarSlot }}>
            {children}
        </EditorHeaderContext.Provider>
    )
}

export function useEditorHeaderActions() {
    const context = useContext(EditorHeaderContext)
    if (!context) {
        throw new Error("useEditorHeaderActions must be used within EditorHeaderProvider")
    }
    return context
}

export function useEditorHeaderActionsOptional() {
    return useContext(EditorHeaderContext)
}
