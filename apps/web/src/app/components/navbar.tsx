import Link from "next/link"
import Image from "next/image"
import { navigationConfig } from "@/config/navigation"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-12 sm:px-16 lg:px-20 xl:px-24">
        <div className="flex items-center justify-between h-16">
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
                width={32} 
                height={32} 
                priority 
              />
              <span className="sr-only">Feedgot</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationConfig.main.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center">
            {navigationConfig.auth.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}