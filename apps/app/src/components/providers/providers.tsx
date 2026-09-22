"use client"

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { HTTPException } from "hono/http-exception"
import { type PropsWithChildren, useState } from "react"
import { usePathname } from "next/navigation"
import { Toaster } from "@featul/ui/components/sonner"
import { PostHogIdentifier } from "./PostHogIdentifier"

function WidgetAwareChrome({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const isWidget = pathname?.startsWith("/widget")
  return (
    <>
      {isWidget ? null : <PostHogIdentifier />}
      {children}
      {isWidget ? null : <Toaster position="bottom-right" />}
    </>
  )
}

export const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            if (err instanceof HTTPException) {
              // global error handling, e.g. toast notification ...
            }
          },
        }),
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <WidgetAwareChrome>{children}</WidgetAwareChrome>
    </QueryClientProvider>
  )
}
