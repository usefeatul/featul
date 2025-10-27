'use client'
import Link from "next/link"
import Image from "next/image"
import { navigationConfig } from "@/config/homeNav"
import { Container } from "./container"
import { ArrowIcon } from "@feedgot/ui/icons/arrow"
import { cn } from "@feedgot/ui/lib/utils"
import { useEffect, useState } from 'react'

export default function Navbar() {
  const main = navigationConfig.main
  const before = main.slice(0, 2)
  const after = main.slice(2)

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])



  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background",
        scrolled && "border-b border-border"
      )}
    >
      <Container maxWidth="6xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              aria-label="Home" 
              className="inline-flex items-center gap-3"
            >
              <Image 
                src="/logo1.png" 
                alt="Feedgot" 
                width={30} 
                height={30} 
                priority 
              />
              <span className="sr-only">Feedgot</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center font-medium text-sm gap-6 md:ml-auto">
            {before.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="inline-flex items-center  text-gray-500 hover:text-foreground transition-colors rounded-md px-2 py-2 hover:bg-accent"
              >
                {item.name}
              </Link>
            ))}
            {after.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="inline-flex items-center  text-gray-500  hover:text-foreground transition-colors rounded-md px-2 py-2 hover:bg-accent"
              >
                {item.name}
                {item.name === "Docs" && (
                  <ArrowIcon aria-hidden className="ml-1 h-4 w-4 align-middle" />
                )}
              </Link>
            ))}
          </nav>
          <span className="hidden md:inline-block mx-2 text-accent">|</span>

          {/* Auth + CTA */}
          <div className="flex items-center gap-4 ml-2">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="text-sm font-medium text-zinc-500 hover:text-foreground transition-colors hover:bg-accent rounded-md px-2 py-2"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Start for free
            </Link>
          </div>
        </div>
      </Container>
    </header>
  )
}