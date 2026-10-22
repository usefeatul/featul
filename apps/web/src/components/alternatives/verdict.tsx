import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { Promotion } from "@/components/shared/promotion";
import Link from "next/link";
import type { Alternative } from "@/config/alternatives";

type VerdictProps = {
  alt: Alternative;
};

export default function Verdict({ alt }: VerdictProps) {
  const topWin =
    alt.victoryPoints?.[0]?.toLowerCase() || "privacy-first EU hosting";

  return (
    <MarketingContainer>
      <section className="py-10 sm:py-14" data-component="AlternativeVerdict">
        <div className={marketingRailClass}>
          <Promotion
            eyebrow={`The clear ${alt.name} alternative`}
            title={`Switch from ${alt.name} to Featul. Keep the workflow, gain ${topWin}.`}
            description="Boards, roadmaps, and changelogs in one place. Set up in minutes."
            label="Try Featul free"
            action={
              alt.website ? (
                <>
                  Still evaluating?{" "}
                  <Link
                    href={alt.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-2 hover:text-primary"
                  >
                    Visit {alt.name}
                  </Link>
                </>
              ) : undefined
            }
          />
        </div>
      </section>
    </MarketingContainer>
  );
}
