import { Container } from "@/components/global/container"
import {
  ALTERNATIVES_UPDATED_LABEL,
  type Alternative,
} from "@/config/alternatives"
import { SquareIcon } from "@featul/ui/icons/square"
import type { FeatureSupport } from "@/config/alternatives"
import { StatusIcon } from "./icon"
import {
  ComparisonStatusHeader,
  ComparisonTable,
  ComparisonTd,
  ComparisonTh,
  ComparisonThead,
  ComparisonTr,
} from "./table"

const VALUE_COLUMN_CLASS = "w-[34%] min-w-[10rem] align-top"

function leadingStatus(text: string): FeatureSupport | null {
  const value = text.trim()
  if (/^yes\b/i.test(value)) return true
  if (/^partial\b/i.test(value)) return "partial"
  if (/^no\b/i.test(value)) return false
  return null
}

function SnapshotValue({ text }: { text: string }) {
  const status = leadingStatus(text)
  if (status == null) return text

  return (
    <span className="inline-flex items-start gap-2">
      <span className="mt-0.5 shrink-0">
        <StatusIcon value={status} />
      </span>
      <span>{text}</span>
    </span>
  )
}

export default function Snapshot({ alt }: { alt: Alternative }) {
  if (!alt.snapshot?.length) return null

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="AlternativeSnapshot">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <SquareIcon aria-hidden className="size-5 text-primary" />
          <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
            How do Featul and {alt.name} compare at a glance?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-accent sm:text-base">
            {alt.snapshotLead ??
              `${alt.name} and Featul both collect product feedback. Pricing, hosting, and whether roadmap and changelog live in the same product.`}
          </p>

          <div className="mt-10">
            <ComparisonTable
              caption={`${alt.name} vs Featul comparison as of ${ALTERNATIVES_UPDATED_LABEL}`}
            >
              <ComparisonThead>
                <ComparisonTr>
                  <ComparisonTh>Criteria</ComparisonTh>
                  <ComparisonTh className={VALUE_COLUMN_CLASS}>
                    <ComparisonStatusHeader
                      name={alt.name}
                      href={alt.website}
                      slug={alt.slug}
                      layout="inline"
                    />
                  </ComparisonTh>
                  <ComparisonTh className={VALUE_COLUMN_CLASS}>
                    <ComparisonStatusHeader
                      name="Featul"
                      href="/"
                      featured
                      layout="inline"
                    />
                  </ComparisonTh>
                </ComparisonTr>
              </ComparisonThead>
              <tbody>
                {alt.snapshot.map((row) => (
                  <ComparisonTr key={row.label}>
                    <ComparisonTh
                      scope="row"
                      className="align-top font-medium text-foreground"
                    >
                      {row.label}
                    </ComparisonTh>
                    <ComparisonTd className={VALUE_COLUMN_CLASS}>
                      <SnapshotValue text={row.competitor} />
                    </ComparisonTd>
                    <ComparisonTd className={`${VALUE_COLUMN_CLASS} text-foreground`}>
                      <SnapshotValue text={row.featul} />
                    </ComparisonTd>
                  </ComparisonTr>
                ))}
              </tbody>
            </ComparisonTable>
          </div>
        </div>
      </section>
    </Container>
  )
}
