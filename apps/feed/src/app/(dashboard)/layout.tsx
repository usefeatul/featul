import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-red-500 dark:bg-neutral-950">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}