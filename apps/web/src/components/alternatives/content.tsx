import { HeroContent } from "@/components/home/content";

export function AlternativeHeroContent({
  name,
  description,
  heroTitle,
  heroKicker,
}: {
  name: string;
  description?: string;
  heroTitle?: string;
  heroKicker?: string;
}) {
  return (
    <HeroContent
      dataComponent="AlternativeHeroContent"
      title={
        <>
          {heroTitle ?? `Best ${name} alternative`}
          <span className="block text-accent">
            {heroKicker ?? `Featul vs ${name}`}
          </span>
        </>
      }
      description={
        description ??
        `Compare ${name} and Featul: customer feedback, roadmaps, and changelogs in one workspace.`
      }
    />
  );
}
