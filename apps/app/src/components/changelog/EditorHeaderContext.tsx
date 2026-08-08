"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
  type RefObject,
} from "react"
import type { ChangelogAiBridge } from "./changelog-ai-bridge"

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
    changelogAiBridgeRef: RefObject<ChangelogAiBridge | null>
    setChangelogAiActive: (active: boolean) => void
    changelogAiActive: boolean
}

const EditorHeaderContext = createContext<EditorHeaderContextValue | null>(null)

export function EditorHeaderProvider({ children }: { children: ReactNode }) {
    const [actions, setActionsState] = useState<EditorAction[]>([])
    const [changelogAiActive, setChangelogAiActiveState] = useState(false)
    const changelogAiBridgeRef = useRef<ChangelogAiBridge | null>(null)

    const setActions = useCallback((newActions: EditorAction[]) => {
        setActionsState(newActions)
    }, [])

    const clearActions = useCallback(() => {
        setActionsState([])
    }, [])

    const setChangelogAiActive = useCallback((active: boolean) => {
        setChangelogAiActiveState(active)
        if (!active) {
            changelogAiBridgeRef.current = null
        }
    }, [])

    return (
        <EditorHeaderContext.Provider
            value={{
                actions,
                setActions,
                clearActions,
                changelogAiBridgeRef,
                setChangelogAiActive,
                changelogAiActive,
            }}
        >
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
