import { Check, Sparkles } from "lucide-react";

import { AccentBar } from "@featul/ui/components/cardElements";
import { Container } from "../global/container";

const requestTags = [
  { text: "import CSV", tone: "remove" },
  { text: "merge duplicate requests", tone: "add" },
  { text: "custom status", tone: "add" },
  { text: "dark mode", tone: "remove" },
  { text: "Slack alerts", tone: "add" },
  { text: "public roadmap", tone: "add" },
] as const;

export default function FeaturesSection() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="my-10 sm:my-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <h2 className="font-heading text-foreground text-2xl font-semibold sm:text-3xl lg:text-3xl">
              Decide what feedback becomes product work.
            </h2>
            <div className="mt-3 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
                Review customer ideas before they move forward, then let Featul
                surface the patterns worth acting on.
              </p>
            </div>
          </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-md border border-foreground/10 bg-white p-4 sm:p-5">
            <div className="flex min-h-[380px] items-center justify-center rounded-md bg-[#4f9df6] p-6 sm:p-8">
              <div className="flex min-h-[168px] w-full max-w-[430px] flex-col items-center justify-center rounded-md border border-black/10 bg-white px-6 text-center shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="size-4" strokeWidth={2.4} />
                </span>
                <p className="text-foreground mt-4 text-sm font-semibold">
                  You are all caught up
                </p>
              </div>
            </div>

            <div className="px-1 pb-1 pt-5 sm:px-0">
              <h3 className="text-foreground text-left text-base font-medium">
                You control what gets prioritized.
              </h3>
              <p className="text-accent mt-1 max-w-xl text-left text-sm leading-6">
                Customers can submit, vote, and explain what matters. Nothing
                changes on your roadmap until you review it.
              </p>
            </div>
          </article>

          <article className="rounded-md border border-foreground/10 bg-white p-4 sm:p-5">
            <div className="flex min-h-[380px] items-center justify-center rounded-md bg-[#ff955d] p-6 sm:p-8">
              <div className="w-full max-w-[430px] space-y-3">
                <div className="flex items-center justify-between gap-5 rounded-md border border-black/10 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-semibold">
                      Require review before roadmap changes
                    </p>
                    <p className="text-accent mt-1 text-xs">
                      Approve suggested updates first.
                    </p>
                  </div>
                  <span className="relative h-6 w-11 shrink-0 rounded-full bg-emerald-600">
                    <span className="absolute right-1 top-1 size-4 rounded-full bg-white shadow-sm" />
                  </span>
                </div>

                <div className="rounded-md border border-black/10 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.12)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-foreground text-sm font-semibold">
                        Feature requests
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <Sparkles className="size-3.5 text-blue-600" />
                        <span className="text-accent">Featul</span>
                        <span className="font-medium text-emerald-600">+24</span>
                        <span className="font-medium text-red-600">-8</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                        Pending
                      </span>
                      <p className="text-accent mt-2 text-xs">needs review</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-foreground/10 pt-4">
                    <p className="text-foreground break-words text-sm leading-7">
                      Customers keep asking for{" "}
                      {requestTags.map((tag) => (
                        <span
                          key={tag.text}
                          className={
                            tag.tone === "add"
                              ? "mx-0.5 inline whitespace-normal rounded-sm bg-emerald-100 px-1 text-emerald-800"
                              : "mx-0.5 inline whitespace-normal rounded-sm bg-red-100 px-1 text-red-700 line-through decoration-red-600"
                          }
                        >
                          {tag.text}
                        </span>
                      ))}{" "}
                      so the most requested work rises to the top.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-1 pb-1 pt-5 sm:px-0">
              <h3 className="text-foreground text-left text-base font-medium">
                Let Featul surface what matters.
              </h3>
              <p className="text-accent mt-1 max-w-xl text-left text-sm leading-6">
                Automatically group similar feedback, spot patterns, and keep
                your team focused on the requests with real momentum.
              </p>
            </div>
          </article>
        </div>
        </div>
      </section>
    </Container>
  );
}
