import { Card } from "@feedgot/ui/components/card";
import { Container } from "@/components/global/container";
import { Globe, ShieldCheck, GitBranch, Megaphone } from "lucide-react";
import type { Alternative, FeatureSupport } from "@/config/alternatives";

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

export default function ComparisonBento({ alt }: { alt: Alternative }) {
  const eu = getFeature(alt, "eu_hosting");
  const gdpr = getFeature(alt, "gdpr");
  const roadmap = getFeature(alt, "public_roadmap");
  const changelog = getFeature(alt, "changelog");
  const boards = getFeature(alt, "feedback_boards");

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section>
        <div className="py-24">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <div>
              <h2 className="text-foreground max-w-3xl text-balance text-3xl sm:text-4xl font-semibold">
                Feedgot vs {alt.name}: key differences at a glance
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                Compare privacy, hosting, and the end‑to‑end product feedback workflow.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              <Card className="overflow-hidden p-6 h-full flex flex-col">
                <Globe className="text-primary size-5" />
                <h3 className="text-foreground mt-5 text-lg font-semibold">EU Hosting</h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Feedgot is EU‑hosted by default. Stay compliant and reduce data transfer risk.
                </p>
                <div className="mt-4 flex gap-2">
                  <SupportTag value={true} label="Feedgot" />
                  <SupportTag value={eu} label={alt.name} />
                </div>
              </Card>

              <Card className="overflow-hidden p-6 h-full flex flex-col">
                <ShieldCheck className="text-primary size-5" />
                <h3 className="text-foreground mt-5 text-lg font-semibold">GDPR Compliance</h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Privacy‑first controls and transparent data handling designed for EU standards.
                </p>
                <div className="mt-4 flex gap-2">
                  <SupportTag value={true} label="Feedgot" />
                  <SupportTag value={gdpr} label={alt.name} />
                </div>
              </Card>

              <Card className="overflow-hidden p-6 h-full flex flex-col">
                <GitBranch className="text-primary size-5" />
                <h3 className="text-foreground mt-5 text-lg font-semibold">Roadmap & Changelog</h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Plan publicly and announce updates in one connected workflow.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SupportTag value={true} label="Feedgot roadmap" />
                  <SupportTag value={roadmap} label={`${alt.name} roadmap`} />
                  <SupportTag value={true} label="Feedgot changelog" />
                  <SupportTag value={changelog} label={`${alt.name} changelog`} />
                </div>
              </Card>

              <Card className="overflow-hidden p-6 h-full flex flex-col">
                <Megaphone className="text-primary size-5" />
                <h3 className="text-foreground mt-5 text-lg font-semibold">Feedback Boards</h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Collect ideas, vote on features, and prioritize with your users.
                </p>
                <div className="mt-4 flex gap-2">
                  <SupportTag value={true} label="Feedgot" />
                  <SupportTag value={boards} label={alt.name} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}