"use client"

import * as React from "react"

type DomainBrandingContextType = { hidePoweredBy?: boolean; sidebarPosition?: "left" | "right"; subdomain?: string }

const DomainBrandingContext = React.createContext<DomainBrandingContextType>({})

export function DomainBrandingProvider({ hidePoweredBy, sidebarPosition, children, subdomain }: { hidePoweredBy?: boolean; sidebarPosition?: "left" | "right"; children: React.ReactNode; subdomain?: string }) {
  const value = React.useMemo(() => ({ hidePoweredBy, sidebarPosition, subdomain }), [hidePoweredBy, sidebarPosition, subdomain])
  return <DomainBrandingContext.Provider value={value}>{children}</DomainBrandingContext.Provider>
}

export function useDomainBranding() {
  return React.useContext(DomainBrandingContext)
}
