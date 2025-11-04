import { Container } from "@/components/global/container";
import { Card } from "@feedgot/ui/components/card";
import type { Alternative, FeatureSupport } from "@/config/alternatives";
import { PlugZap, Layers3, ShieldCheck } from "lucide-react";

function SupportTag({ value, label }: { value: FeatureSupport; label: string }) {
  const bg = value === true ? "bg-green-100 text-green-700 border-green-200"
    : value === "partial" ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-red-100 text-red-700 border-red-200";
  const text = value === true ? "Yes" : value === "partial" ? "Partial" : "No";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${bg}`}>
      {label}: {text}
    </span>
  );
}

function getFeature(alt: Alternative, key: string): FeatureSupport {
  return alt.features.find((f) => f.key === key)?.competitor ?? "partial";
}

export default function ComparisonFeature({ alt }: { alt: Alternative }) {
  const widget = getFeature(alt, "embeddable_widget");
  const api = getFeature(alt, "api");
  const sso = getFeature(alt, "sso");

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section>
        <div className="py-24">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <h2 className="text-foreground text-balance text-3xl sm:text-4xl font-semibold">
              Why teams choose Feedgot over {alt.name}
            </h2>

            <div className="mt-12 grid gap-12 sm:grid-cols-2">
              <div className="col-span-full space-y-4">
                <Card className="overflow-hidden px-6 sm:col-span-2">
                  <div className="flex items-start gap-4 py-6">
                    <Layers3 className="text-primary size-5" />
                    <div>
                      <h3 className="text-foreground text-lg font-semibold">End‑to‑end workflow</h3>
                      <p className="text-muted-foreground mt-3 text-balance">
                        Feedback, public roadmap, and changelog in one place. No stitching tools.
                      </p>
                    </div>
                  </div>
                </Card>
                <div className="max-w-md sm:col-span-3">
                  <div className="flex flex-wrap gap-2">
                    <SupportTag value={true} label="Feedgot roadmap" />
                    <SupportTag value={true} label="Feedgot changelog" />
                  </div>
                </div>
              </div>

              <div className="grid grid-rows-[1fr_auto] space-y-4">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <PlugZap className="text-primary size-5" />
                    <div>
                      <h3 className="text-foreground text-lg font-semibold">Embed & integrate fast</h3>
                      <p className="text-muted-foreground mt-3 text-balance">
                        Drop‑in widget, robust API, and SSO support to fit your stack.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <SupportTag value={true} label="Feedgot widget" />
                        <SupportTag value={widget} label={`${alt.name} widget`} />
                        <SupportTag value={true} label="Feedgot API" />
                        <SupportTag value={api} label={`${alt.name} API`} />
                        <SupportTag value={true} label="Feedgot SSO" />
                        <SupportTag value={sso} label={`${alt.name} SSO`} />
                      </div>
                    </div>
                  </div>
                </Card>
                <div>
                  <p className="text-muted-foreground mt-1 text-balance">
                    Build your feedback loop without complex wiring.
                  </p>
                </div>
              </div>

              <div className="grid grid-rows-[1fr_auto] space-y-4">
                <Card className="overflow-hidden p-6">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="text-primary size-5" />
                    <div>
                      <h3 className="text-foreground text-lg font-semibold">Privacy‑first by design</h3>
                      <p className="text-muted-foreground mt-3 text-balance">
                        EU hosting and GDPR‑aligned controls to keep data where it belongs.
                      </p>
                    </div>
                  </div>
                </Card>
                <div>
                  <p className="text-muted-foreground mt-1 text-balance">
                    Transparent data handling with fewer compliance surprises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}