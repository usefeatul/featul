"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-zinc-300 dark:group-[.toaster]:border-zinc-700 group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-md group-[.toaster]:backdrop-saturate-150 group-[.toaster]:border group-[.toaster]:ring-1 group-[.toaster]:ring-border/60 group-[.toaster]:ring-offset-1 group-[.toaster]:ring-offset-white dark:group-[.toaster]:ring-offset-black group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:min-w-[300px] group-[.toaster]:max-w-[420px] group-[.toaster]:overflow-hidden group-[.toaster]:relative group-[.toaster]:before:absolute group-[.toaster]:before:inset-0 group-[.toaster]:before:bg-gradient-to-br group-[.toaster]:before:from-white/10 group-[.toaster]:before:to-transparent group-[.toaster]:before:pointer-events-none group-[.toaster]:animate-in group-[.toaster]:slide-in-from-bottom-full",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-all group-[.toast]:hover:bg-primary/90 group-[.toast]:hover:scale-105 group-[.toast]:active:scale-95",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-all group-[.toast]:hover:bg-muted/80 group-[.toast]:hover:scale-105 group-[.toast]:active:scale-95",
          closeButton: "group-[.toast]:bg-background/80 group-[.toast]:text-foreground/60 group-[.toast]:border-0 group-[.toast]:hover:bg-background group-[.toast]:hover:text-foreground group-[.toast]:rounded-md group-[.toast]:transition-all group-[.toast]:hover:rotate-90",
          error: "group toast group-[.toaster]:bg-red-500/10 group-[.toaster]:text-red-600 dark:group-[.toaster]:text-red-400 group-[.toaster]:border-zinc-300 dark:group-[.toaster]:border-zinc-700 group-[.toaster]:ring-red-500/60 group-[.toaster]:before:from-red-500/10",
          success: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-zinc-300 dark:group-[.toaster]:border-zinc-700 group-[.toaster]:ring-border/60",
          warning: "group toast group-[.toaster]:bg-amber-500/10 group-[.toaster]:text-amber-600 dark:group-[.toaster]:text-amber-400 group-[.toaster]:border-zinc-300 dark:group-[.toaster]:border-zinc-700 group-[.toaster]:ring-amber-500/60 group-[.toaster]:before:from-amber-500/10",
          info: "group toast group-[.toaster]:bg-blue-500/10 group-[.toaster]:text-blue-600 dark:group-[.toaster]:text-blue-400 group-[.toaster]:border-zinc-300 dark:group-[.toaster]:border-zinc-700 group-[.toaster]:ring-blue-500/60 group-[.toaster]:before:from-blue-500/10",
          loading: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-zinc-300 dark:group-[.toaster]:border-zinc-700 group-[.toaster]:ring-border/60",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-tight",
          icon: "group-[.toast]:flex-shrink-0",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
