import Link from "next/link";
import { Container } from "../global/container";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { footerNavigationConfig } from "@/config/footerNav";
import { GitHubIcon } from "@featul/ui/icons/github";
import { TwitterIcon } from "@featul/ui/icons/twitter";
import { StatusButton } from "@/components/home/status";

import { LinearSeparator } from "@/components/linear-separator";

export default function FooterSection() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-6xl">
        <LinearSeparator />
      </div>
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18 py-10 md:py-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="grid items-start gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <Link
                href="/"
                aria-label="Go home"
                className="inline-flex items-center gap-2 hover:text-primary"
              >
                <FeatulLogoIcon />
                <span className="text-sm font-medium">featul</span>
              </Link>
              <p className="text-accent mt-1 text-sm">Made and hosted in EU.</p>
              <p className="text-accent mt-1 text-sm">
                Customer feedback platform • © {year}
              </p>
              <div className="mt-2">
                <StatusButton />
              </div>
              <div className="mt-4 flex items-center gap-3 text-accent ">
                <Link
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="hover:text-primary"
                >
                  <GitHubIcon className="text-accent hover:text-primary" size={19} />
                </Link>
                <Link
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="hover:text-primary"
                >
                  <TwitterIcon className="text-accent hover:text-primary" size={14} />
                </Link>
              </div>
            </div>

            {/* Navigation groups */}
            <nav aria-label="Footer" className="md:col-span-3">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {footerNavigationConfig.groups.map((group, index) => (
                  <div key={index} className="space-y-3 text-sm">
                    <span className="text-foreground/90 block text-sm font-medium">
                      {group.title}
                    </span>
                    {group.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        className="text-accent hover:text-primary block transition-colors"
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
