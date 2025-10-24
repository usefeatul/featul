import Link from "next/link"
import Image from "next/image"
import { navigationConfig } from "@/config/homeNav"
import { Container } from "./container"
import { LinkIcon } from "@feedgot/ui/icons/link"
import { cn } from "@feedgot/ui/lib/utils"

export default function Navbar() {
  const main = navigationConfig.main
  const before = main.slice(0, 2)
  const after = main.slice(2)



  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background"
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
                src="/logo.svg" 
                alt="Feedgot" 
                width={24} 
                height={24} 
                priority 
              />
              <span className="sr-only">Feedgot</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 md:ml-auto">
            {before.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-secondary"
              >
                {item.name}
              </Link>
            ))}
            {after.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-secondary"
              >
                {item.name}
                {item.name === "Docs" && (
                  <LinkIcon aria-hidden className="ml-1 h-4 w-4 align-middle" />
                )}
              </Link>
            ))}
          </nav>
          <span className="hidden md:inline-block mx-2 text-muted-foreground">|</span>

          {/* Auth + CTA */}
          <div className="flex items-center gap-4">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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