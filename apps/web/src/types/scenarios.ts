import { USE_CASES as PROGRAMMATIC_USE_CASES } from "@/lib/data/programmatic/matrix";

export type UseCaseItem = {
  slug: string;
  name: string;
  description: string;
  cardTitle?: string;
  cardDescription?: string;
  badge: string;
  isNew?: boolean;
};

export const USE_CASES: UseCaseItem[] = [
  {
    slug: "product-feedback-platform",
    name: "Centralize product feedback and roadmap in one place",
    description:
      "Turn scattered requests into a single source of truth, prioritize with a public roadmap, and close the loop with changelogs.",
    cardTitle: "Centralize feedback and roadmap",
    cardDescription:
      "Collect requests in one place, prioritize faster, and close the loop.",
    badge: "Product feedback",
  },
  {
    slug: "enterprise-customer-success",
    name: "Scale enterprise customer success with structured feedback programs",
    description:
      "Implement systematic feedback collection, stakeholder alignment, and executive reporting to drive strategic account growth and retention.",
    cardTitle: "Scale enterprise customer success",
    cardDescription:
      "Run structured feedback programs to improve retention and account growth.",
    badge: "Customer success",
    isNew: true,
  },
  {
    slug: "product-led-growth",
    name: "Accelerate product-led growth through systematic user feedback loops",
    description:
      "Leverage continuous user feedback to optimize onboarding experiences, drive feature adoption, and convert free users into paying customers.",
    cardTitle: "Accelerate product-led growth",
    cardDescription:
      "Use user feedback to improve onboarding, adoption, and conversion.",
    badge: "Growth strategy",
    isNew: true,
  },
];

export const getUseCaseBySlug = (slug: string) =>
  USE_CASES.find((u) => u.slug === slug);

export const getAllUseCaseSlugs = () => USE_CASES.map((u) => u.slug);

/** Merges hand-crafted and programmatic use cases for hub/index pages. */
export function getAllUseCasesForIndex(): UseCaseItem[] {
  const originalSlugs = new Set(USE_CASES.map((u) => u.slug));
  const programmaticItems: UseCaseItem[] = PROGRAMMATIC_USE_CASES.filter(
    (uc) => !originalSlugs.has(uc.slug),
  ).map((uc) => ({
    slug: uc.slug,
    name: uc.title,
    description: uc.solutions[0] ?? uc.title,
    cardTitle: uc.title,
    cardDescription: uc.painPoints[0] ?? uc.title,
    badge: uc.industry ?? uc.persona ?? "Use case",
    isNew: true,
  }));

  return [...USE_CASES, ...programmaticItems];
}
