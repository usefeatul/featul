import type { ReactNode } from "react";
import { HeroCta } from "@/components/shared/cta";
import {
  marketingDisplayHeadingClass,
  marketingLeadClass,
} from "@/components/shared/heading-highlight";
import { cn } from "@featul/ui/lib/utils";
import { homeHero } from "@/data/home";

export function HeroContent({
  title = (
    <>
      {homeHero.title}
      <br className="hidden sm:block" />{" "}
      <span className="text-accent">{homeHero.highlight}</span>
    </>
  ),
  description = homeHero.description,
  dataComponent = "HeroContent",
}: {
  title?: ReactNode;
  description?: ReactNode;
  dataComponent?: string;
}) {
  return (
    <div
      className="relative mx-auto max-w-5xl text-center"
      data-component={dataComponent}
    >
      <h1
        className={cn(
          marketingDisplayHeadingClass,
          "text-3xl leading-[1.08] min-[375px]:text-4xl sm:text-4xl sm:leading-[1.08] md:text-5xl lg:text-[3.5rem] xl:text-6xl",
        )}
      >
        {title}
      </h1>
      <p className={cn(marketingLeadClass, "mx-auto")}>{description}</p>
      <HeroCta centered />
    </div>
  );
}
