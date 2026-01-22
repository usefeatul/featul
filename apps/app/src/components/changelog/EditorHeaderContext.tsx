"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface EditorAction {
    key: string
    label: string
    icon?: ReactNode
    onClick: () => void
    disabled?: boolean
    destructive?: boolean
}

interface EditorHeaderContextValue {
    actions: EditorAction[]
    setActions: (actions: EditorAction[]) => void
    clearActions: () => void
}

const EditorHeaderContext = createContext<EditorHeaderContextValue | null>(null)

export function EditorHeaderProvider({ children }: { children: ReactNode }) {
    const [actions, setActionsState] = useState<EditorAction[]>([])

    const setActions = useCallback((newActions: EditorAction[]) => {
        setActionsState(newActions)
    }, [])

    const clearActions = useCallback(() => {
        setActionsState([])
    }, [])

    return (
        <EditorHeaderContext.Provider value={{ actions, setActions, clearActions }}>
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
