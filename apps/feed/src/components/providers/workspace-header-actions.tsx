"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Ctx = {
  show: boolean
  set: (opts: { show: boolean }) => void
}

const WorkspaceHeaderActionsContext = createContext<Ctx>({ show: false, set: () => {} })

export function WorkspaceHeaderActionsProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const set = ({ show }: { show: boolean }) => {
    setShow(show)
  }
  return (
    <WorkspaceHeaderActionsContext.Provider value={{ show, set }}>
      {children}
    </WorkspaceHeaderActionsContext.Provider>
  )
}

export function useWorkspaceHeaderActions() {
  return useContext(WorkspaceHeaderActionsContext)
}

export function WorkspaceHeaderActionsToggle({ enabled }: { enabled: boolean }) {
  const { set } = useWorkspaceHeaderActions()
  useEffect(() => {
    set({ show: enabled })
    return () => set({ show: false })
  }, [enabled])
  return null
}
