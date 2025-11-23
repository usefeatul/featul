import React from "react"

export default function ComingSoon({ children }: { children?: React.ReactNode }) {
  return <div className="text-sm text-accent">{children || "Coming soon"}</div>
}

