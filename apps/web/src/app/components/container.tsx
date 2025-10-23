import React from 'react'

type ContainerProps = {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
  withNavbarOffset?: boolean
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl'
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
      : 'max-w-7xl'

  const base = `mx-auto ${widthClass} px-12 sm:px-16 lg:px-20 xl:px-24`
  const offset = withNavbarOffset ? ' pt-16' : ''

  return (
    <Component className={`${base}${offset} ${className}`}>{children}</Component>
  )
}