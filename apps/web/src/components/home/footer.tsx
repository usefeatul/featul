import Link from "next/link";
import { Container } from "../global/container";
import { footerNavigationConfig } from "@/config/footerNav";
import { StatusButton } from "@/components/home/status";

export default function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background">
      <Container maxWidth="6xl" className="px-4 py-12 sm:px-10 md:py-16 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <Link
                href="/"
                aria-label="Go home"
                className="text-foreground text-sm font-medium hover:text-primary"
              >
                featul
              </Link>
              <p className="text-accent mt-4 max-w-[28ch] text-sm leading-6">
                Made and hosted in EU. A simple customer feedback platform for
                boards, roadmaps, and changelogs.
              </p>
              <StatusButton
                label="Operational"
                className="mt-5 h-auto rounded-none border-0 bg-transparent px-0 py-0 text-sm text-accent hover:bg-transparent hover:text-foreground"
              />
              <p className="text-accent mt-6 text-sm">© {year}</p>
            </div>

            <nav aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">
                {footerNavigationConfig.groups.map((group, index) => (
                  <div key={index} className="space-y-3 text-sm">
                    <span className="text-foreground block text-sm font-medium">
                      {group.title}
                    </span>
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
                ))}
              </div>
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}
