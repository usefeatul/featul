import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { ThumbsUp, AlertCircle, ExternalLink, DollarSign, Zap, Shield, Users, Link2, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@feedgot/ui/components/card";
import { StatusIcon } from "./status-icon";

const categoryIcons = {
  pricing: DollarSign,
  features: Star,
  performance: Zap,
  security: Shield,
  support: Users,
  integration: Link2,
};

export default function ProsCons({ alt }: { alt: Alternative }) {
  const hasPros = Array.isArray(alt.pros) && alt.pros.length > 0;
  const hasCons = Array.isArray(alt.cons) && alt.cons.length > 0;
  const hasDetailedPros = Array.isArray(alt.detailedPros) && alt.detailedPros.length > 0;
  const hasDetailedCons = Array.isArray(alt.detailedCons) && alt.detailedCons.length > 0;
  
  if (!hasPros && !hasCons && !hasDetailedPros && !hasDetailedCons) return null;

  const hasTags = Array.isArray(alt.tags) && alt.tags.length > 0;
  const hasSummary = typeof alt.summary === "string" && alt.summary.length > 0;
  const hasPricing = alt.pricing && alt.pricing.startingPrice;
  const hasTargetAudience = Array.isArray(alt.targetAudience) && alt.targetAudience.length > 0;
  const hasDifferentiators = Array.isArray(alt.keyDifferentiators) && alt.keyDifferentiators.length > 0;

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <h2 className="mt-2 text-foreground text-balance text-3xl sm:text-4xl font-semibold">
            Pros and cons at a glance
          </h2>
          <p className="text-accent mt-3">
            Quick highlights to understand {alt.name} compared to Feedgot.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            {hasDetailedPros ? (
              <Card className="relative p-4 sm:p-6 transition-shadow hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                      <ThumbsUp aria-hidden className="size-4" />
                    </span>
                    Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 space-y-3">
                    {alt.detailedPros!.map((item, idx) => {
                      const Icon = categoryIcons[item.category];
                      return (
                        <div key={`detailed-pro-${idx}`} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-primary" />
                            <h4 className="text-foreground text-sm font-medium">{item.title}</h4>
                          </div>
                          <p className="text-accent text-sm leading-6 pl-6">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : hasPros ? (
              <Card className="relative p-4 sm:p-6 transition-shadow hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                      <ThumbsUp aria-hidden className="size-4" />
                    </span>
                    Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="mt-2 space-y-2">
                    {alt.pros!.map((item, idx) => (
                      <li key={`pros-${idx}`} className="text-accent text-sm sm:text-base leading-7">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {hasDetailedCons ? (
              <Card className="relative p-4 sm:p-6 transition-shadow hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                      <AlertCircle aria-hidden className="size-4" />
                    </span>
                    Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 space-y-3">
                    {alt.detailedCons!.map((item, idx) => {
                      const Icon = categoryIcons[item.category];
                      return (
                        <div key={`detailed-con-${idx}`} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-destructive" />
                            <h4 className="text-foreground text-sm font-medium">{item.title}</h4>
                          </div>
                          <p className="text-accent text-sm leading-6 pl-6">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : hasCons ? (
              <Card className="relative p-4 sm:p-6 transition-shadow hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                      <AlertCircle aria-hidden className="size-4" />
                    </span>
                    Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="mt-2 space-y-2">
                    {alt.cons!.map((item, idx) => (
                      <li key={`cons-${idx}`} className="text-accent text-sm sm:text-base leading-7">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            <Card className="relative p-4 sm:p-6 transition-shadow hover:shadow-sm sm:col-span-2">
              <CardHeader className="pb-0">
                <CardTitle className="text-foreground text-lg">{alt.name} overview</CardTitle>
                {hasSummary ? (
                  <CardDescription className="mt-2">{alt.summary}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {alt.website ? (
                    <a
                      href={alt.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-foreground/5 ring-1 ring-foreground/10 px-2 py-1 text-xs sm:text-sm text-primary"
                    >
                      <ExternalLink className="size-3" />
                      Visit website
                    </a>
                  ) : null}
                  {hasTags
                    ? alt.tags!.map((tag, idx) => (
                        <span
                          key={`tag-${idx}`}
                          className="inline-flex items-center rounded-md bg-foreground/5 ring-1 ring-foreground/10 px-2 py-1 text-xs sm:text-sm text-accent"
                        >
                          {tag}
                        </span>
                      ))
                    : null}
                </div>

                {hasPricing && (
                  <div>
                    <h3 className="text-foreground text-base sm:text-lg font-medium">Pricing</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-2xl font-semibold text-foreground">{alt.pricing?.startingPrice}</span>
                      {alt.pricing?.enterprisePrice && (
                        <span className="text-sm text-muted-foreground">up to {alt.pricing?.enterprisePrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-accent mt-1">
                      {alt.pricing?.pricingModel === 'per-user' && 'Per user pricing'}
                      {alt.pricing?.pricingModel === 'flat-rate' && 'Flat rate pricing'}
                      {alt.pricing?.pricingModel === 'usage-based' && 'Usage-based pricing'}
                      {alt.pricing?.pricingModel === 'tiered' && 'Tiered pricing structure'}
                      {alt.pricing?.freeTier && ' • Free tier available'}
                    </p>
                  </div>
                )}

                {hasTargetAudience && (
                  <div>
                    <h3 className="text-foreground text-base sm:text-lg font-medium">Best for</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {alt.targetAudience!.map((audience, idx) => (
                        <span
                          key={`audience-${idx}`}
                          className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs sm:text-sm text-primary"
                        >
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasDifferentiators && (
                  <div>
                    <h3 className="text-foreground text-base sm:text-lg font-medium">Key differentiators</h3>
                    <ul className="mt-2 space-y-1">
                      {alt.keyDifferentiators!.map((diff, idx) => (
                        <li key={`differentiator-${idx}`} className="text-accent text-sm flex items-center gap-2">
                          <Star className="size-3 text-primary" />
                          {diff}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Feature comparison highlights</h3>
                  <ul className="mt-2 space-y-2">
                    {alt.features
                      .filter((f) => ["eu_hosting", "gdpr", "embeddable_widget"].includes(f.key))
                      .map((f) => (
                        <li key={f.key} className="flex items-center justify-between gap-3">
                          <span className="text-accent text-sm sm:text-base">{f.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{alt.name}</span>
                            <StatusIcon value={f.competitor} />
                            <span className="text-xs text-muted-foreground">Feedgot</span>
                            <StatusIcon value={f.feedgot} />
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-accent text-xs sm:text-sm">
                  Compare privacy, roadmap, and changelog in the sections below.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </Container>
  );
}