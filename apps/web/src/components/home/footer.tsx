import Link from "next/link";
import { Container } from "../global/container";
import { Logo } from "@/components/global/logo";
import { footerNavigationConfig } from "@/config/footerNav";
import { GitHubIcon } from "@feedgot/ui/icons/github";
import { TwitterIcon } from "@feedgot/ui/icons/twitter";
import { StatusButton } from "@/components/home/status";

export default function FooterSection() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24 py-10 md:py-14">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <div className="grid items-start gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <Link
                href="/"
                aria-label="Go home"
                className="inline-flex items-center gap-2"
              >
                <Logo />
                <span className="text-sm font-medium">Feedgot</span>
              </Link>
              <p className="text-zinc-500 mt-1 text-sm">Made and hosted in EU.</p>
              <p className="text-zinc-500 mt-1 text-sm">
                Customer feedback platform • © {year}
              </p>
              <div className="mt-2">
                <StatusButton />
              </div>
              <div className="mt-4 flex items-center gap-3 text-zinc-500 ">
                <Link
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="hover:text-foreground"
                >
                  <GitHubIcon
                    className="text-current hover:text-primary"
                    size={19}
                  />
                </Link>
                <Link
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="hover:text-foreground"
                >
                  <TwitterIcon
                    className="text-current hover:text-primary"
                    size={14}
                  />
                </Link>
              </div>
            </div>

            {/* Navigation groups */}
            <nav aria-label="Footer" className="md:col-span-3">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {footerNavigationConfig.groups.map((group, index) => (
                  <div key={index} className="space-y-3 text-sm">
                    <span className="text-foreground block text-sm font-semibold">
                      {group.title}
                    </span>
                    {group.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        className="text-zinc-500 hover:text-primary block transition-colors"
                      >
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}
