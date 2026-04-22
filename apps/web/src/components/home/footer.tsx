import Link from "next/link";
import { Container } from "../global/container";
import { footerNavigationConfig } from "@/config/footerNav";
import { StatusButton } from "@/components/home/status";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { GitHubIcon } from "@featul/ui/icons/github";
import { TwitterIcon } from "@featul/ui/icons/twitter";

export default function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background">
      <Container maxWidth="6xl" className="px-4 py-12 sm:px-10 md:py-16 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
            <div className="max-w-sm">
              <Link
                href="/"
                aria-label="Go home"
                className="inline-flex items-center gap-2 text-foreground hover:text-primary"
              >
                <FeatulLogoIcon />
                <span className="text-sm font-medium">featul</span>
              </Link>
              <p className="text-accent mt-4 text-sm leading-6">
                Customer feedback, roadmaps, and changelogs in one simple
                workspace. Built and hosted in the EU.
              </p>
            </div>

            <nav aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10">
                {footerNavigationConfig.groups.map((group, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-foreground block font-medium">
                      {group.title}
                    </span>
                    <div className="mt-3 space-y-2.5">
                      {group.items.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="text-accent block leading-5 transition-colors hover:text-primary"
                        >
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <p className="text-accent text-sm">© {year} featul</p>
              <StatusButton
                label="Operational"
                className="h-auto rounded-none border-0 bg-transparent px-0 py-0 text-sm text-accent hover:bg-transparent hover:text-foreground"
              />
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-accent transition-colors hover:text-primary"
              >
                <GitHubIcon size={18} />
              </Link>
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-accent transition-colors hover:text-primary"
              >
                <TwitterIcon size={14} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
