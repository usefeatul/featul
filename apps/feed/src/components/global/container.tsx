import React from 'react'
import { cn } from "@feedgot/ui/lib/utils"

type ContainerProps = {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  withNavbarOffset?: boolean
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl' | '8xl'
}

export function Container({
  children,
  className = '',
  as: Component = 'div',
  withNavbarOffset = false,
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

  const paddingX = 'px-12 sm:px-16 lg:px-20 xl:px-24'
  const base = cn('mx-auto', widthClass, paddingX, withNavbarOffset && 'pt-16', className)

  return (
    <Component className={base}>{children}</Component>
  )
}
