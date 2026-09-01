import { Container } from "@/components/global/container"
import type { Alternative } from "@/config/alternatives"
import { SquareIcon } from "@featul/ui/icons/square"
import {
  ComparisonStatusCell,
  ComparisonStatusHeader,
  ComparisonTable,
  ComparisonTd,
  ComparisonTh,
  ComparisonThead,
  ComparisonTr,
  STATUS_COLUMN_CLASS,
} from "./table"
import { StatusIcon } from "./icon"

export default function Compare({ alt }: { alt: Alternative }) {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="Compare">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <SquareIcon aria-hidden className="size-5 text-primary" />
          <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl lg:text-3xl">
            How do Featul and {alt.name} compare on features?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-accent sm:text-base">
            Where {alt.name} and Featul match, and where they do not.
          </p>

          <div className="mt-10 sm:mt-12">
            <ComparisonTable caption={`${alt.name} vs Featul feature comparison`}>
              <ComparisonThead>
                <ComparisonTr>
                  <ComparisonTh>Feature</ComparisonTh>
                  <ComparisonTh align="center" className={STATUS_COLUMN_CLASS}>
                    <ComparisonStatusHeader
                      name={alt.name}
                      href={alt.website}
                      slug={alt.slug}
                    />
                  </ComparisonTh>
                  <ComparisonTh align="center" className={STATUS_COLUMN_CLASS}>
                    <ComparisonStatusHeader
                      name="Featul"
                      href="/"
                      featured
                    />
                  </ComparisonTh>
                </ComparisonTr>
              </ComparisonThead>
              <tbody>
                {alt.features.map((f) => (
                  <ComparisonTr key={f.key}>
                    <ComparisonTd className="align-middle">
                      <div className="text-sm font-semibold text-foreground">
                        {f.label}
                      </div>
                      {f.description ? (
                        <p className="mt-1 max-w-xl text-xs leading-5 text-accent sm:text-sm sm:leading-6">
                          {f.description}
                        </p>
                      ) : null}
                    </ComparisonTd>
                    <ComparisonTd align="center" className={`${STATUS_COLUMN_CLASS} align-middle`}>
                      <ComparisonStatusCell value={f.competitor} />
                    </ComparisonTd>
                    <ComparisonTd align="center" className={`${STATUS_COLUMN_CLASS} align-middle`}>
                      <ComparisonStatusCell value={f.Featul} />
                    </ComparisonTd>
                  </ComparisonTr>
                ))}
              </tbody>
            </ComparisonTable>
          </div>

          <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-accent">
            <li className="inline-flex items-center gap-1.5">
              <StatusIcon value={true} />
              Included
            </li>
            <li className="inline-flex items-center gap-1.5">
              <StatusIcon value="partial" />
              Limited or extra setup
            </li>
            <li className="inline-flex items-center gap-1.5">
              <StatusIcon value={false} />
              Not available
            </li>
          </ul>
        </div>
      </section>
    </Container>
  )
}
