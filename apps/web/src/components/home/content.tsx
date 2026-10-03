import { HeroCta } from "@/components/shared/cta";
import {
  marketingDisplayHeadingClass,
  marketingLeadClass,
} from "@/components/shared/heading-highlight";
import { cn } from "@featul/ui/lib/utils";

export function HeroContent() {
  return (
    <div
      className="relative mx-auto max-w-5xl text-center"
      data-component="HeroContent"
    >
      <h1
        className={cn(
          marketingDisplayHeadingClass,
          "text-4xl leading-[1.08] min-[375px]:text-[2.625rem] sm:text-5xl sm:leading-[1.08] md:text-6xl lg:text-[4rem] xl:text-7xl",
        )}
      >
        Build what your customers
        <br className="hidden sm:block" />{" "}
        <span className="text-primary">actually want.</span>
      </h1>
      <p className={cn(marketingLeadClass, "mx-auto")}>
        Turn customer feedback into your next great feature. Gather ideas,
        decide what’s next, and bring your customers along as you ship.
      </p>
      <HeroCta centered />
    </div>
  );
}
