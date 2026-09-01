import Link from "next/link"
import { Container } from "@/components/global/container"
import { AUTH_SIGN_IN_URL } from "@/config/auth"
import {
  ROUNDUP_CRITERIA,
  ROUNDUP_PICKS,
  ROUNDUP_TOOLS,
  ROUNDUP_UPDATED_LABEL,
  ROUNDUP_YEAR,
} from "@/config/alternatives-roundup"
import { BookmarkIcon } from "@featul/ui/icons/bookmark"
import { SquareIcon } from "@featul/ui/icons/square"
import { OverlayCard, OverlayCardPanel } from "@/components/shared/overlay-card"
import {
  ComparisonTable,
  ComparisonTd,
  ComparisonTh,
  ComparisonThead,
  ComparisonTr,
} from "./table"

export function AlternativesRoundup() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-10 sm:py-14" data-component="AlternativesRoundup">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <SquareIcon aria-hidden className="size-5 text-primary" />
          <h2 className="mt-6 max-w-3xl text-balance text-2xl font-semibold text-foreground sm:text-3xl">
            What are the best Featurebase alternatives in {ROUNDUP_YEAR}?
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-accent sm:text-base">
            Featul, Canny, Frill, and UserJot. Featul if you want open source and EU
            hosting. Canny if you need the biggest integration catalog. Featurebase
            if the help center is already your system of record.
          </p>

          <div className="mt-10">
            <ComparisonTable
              caption={`Best Featurebase and Canny alternatives compared, ${ROUNDUP_UPDATED_LABEL}`}
              minWidthClassName="min-w-[64rem]"
            >
              <ComparisonThead>
                <ComparisonTr>
                  <ComparisonTh>Tool</ComparisonTh>
                  <ComparisonTh>Best for</ComparisonTh>
                  <ComparisonTh>Pricing</ComparisonTh>
                  <ComparisonTh align="center">Open source</ComparisonTh>
                  <ComparisonTh align="center">Self-host</ComparisonTh>
                  <ComparisonTh align="center">EU hosting</ComparisonTh>
                  <ComparisonTh align="center">Roadmap + changelog</ComparisonTh>
                </ComparisonTr>
              </ComparisonThead>
              <tbody>
                {ROUNDUP_TOOLS.map((tool) => (
                  <ComparisonTr key={tool.name}>
                    <ComparisonTh scope="row" className="align-middle whitespace-nowrap">
                      <Link
                        href={tool.href}
                        className={
                          tool.highlight
                            ? "font-semibold text-primary hover:underline underline-offset-4"
                            : "font-semibold text-foreground hover:underline underline-offset-4"
                        }
                      >
                        {tool.name}
                      </Link>
                    </ComparisonTh>
                    <ComparisonTd className="align-middle min-w-[16rem]">
                      {tool.bestFor}
                    </ComparisonTd>
                    <ComparisonTd className="align-middle">{tool.pricing}</ComparisonTd>
                    <ComparisonTd align="center" className="align-middle whitespace-nowrap">
                      {tool.openSource}
                    </ComparisonTd>
                    <ComparisonTd align="center" className="align-middle whitespace-nowrap">
                      {tool.selfHost}
                    </ComparisonTd>
                    <ComparisonTd align="center" className="align-middle whitespace-nowrap">
                      {tool.euHosting}
                    </ComparisonTd>
                    <ComparisonTd align="center" className="align-middle whitespace-nowrap">
                      {tool.roadmapChangelog}
                    </ComparisonTd>
                  </ComparisonTr>
                ))}
              </tbody>
            </ComparisonTable>
          </div>

          <p className="mt-4 text-xs leading-6 text-accent/80">
            As of {ROUNDUP_UPDATED_LABEL}. Featul Starter is $24 per workspace per
            month. Check live vendor pages before you buy.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ROUNDUP_CRITERIA.map((item) => (
              <OverlayCard key={item.title} className="h-auto">
                <OverlayCardPanel className="flex h-full flex-col p-4 sm:p-5">
                  <h3 className="text-base font-medium text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-accent">{item.body}</p>
                </OverlayCardPanel>
              </OverlayCard>
            ))}
          </div>

          <div className="mt-16">
            <BookmarkIcon aria-hidden className="size-5 text-primary" opacity={1} />
            <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
              Which tool is the best X for Y?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-accent sm:text-base">
              Pick by job, not by brand. Featul is in this list when it actually fits.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ROUNDUP_PICKS.map((pick, index) => (
                <article key={pick.title}>
                  <OverlayCard className="h-auto">
                    <OverlayCardPanel className="flex h-full flex-col p-5 sm:p-6">
                      <span className="flex size-8 items-center justify-center rounded-md bg-primary/20 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
                        {pick.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-accent">{pick.body}</p>
                    </OverlayCardPanel>
                  </OverlayCard>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-10 text-sm leading-7 text-accent">
            Ready to try the open source option?{" "}
            <Link
              href={AUTH_SIGN_IN_URL}
              className="font-medium text-primary hover:underline underline-offset-4"
              data-sln-event="cta: alternatives roundup try featul clicked"
            >
              Start a Featul workspace free
            </Link>
            , or open the{" "}
            <Link
              href="/alternatives/featurebase"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Featurebase
            </Link>{" "}
            and{" "}
            <Link
              href="/alternatives/canny"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Canny
            </Link>{" "}
            pages.
          </p>
        </div>
      </section>
    </Container>
  )
}
