import React from 'react'
import { cn } from "@featul/ui/lib/utils"

type ContainerProps = {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  withNavbarOffset?: boolean
  noPadding?: boolean
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | '8xl'
}

export function Container({
  children,
  className = '',
  as: Component = 'div',
  withNavbarOffset = false,
  noPadding = false,
  maxWidth = '7xl',
}: ContainerProps) {
  const widthClass =
    maxWidth === '4xl'
      ? 'max-w-4xl'
      : maxWidth === '5xl'
        ? 'max-w-5xl'
        : maxWidth === '6xl'
          ? 'max-w-6xl'
          : maxWidth === '7xl'
            ? 'max-w-7xl'
            : 'max-w-[88rem]'

  const paddingX = noPadding ? '' : 'px-4 sm:px-8 lg:px-16 xl:px-20'
  const base = cn('mx-auto', widthClass, paddingX, withNavbarOffset && 'pt-2', className)

  return (
    <Component className={base}>{children}</Component>
  )
}
