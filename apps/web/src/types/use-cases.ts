export type UseCaseItem = {
  slug: string;
  name: string;
  description: string;
  badge: string;
  isNew?: boolean;
};

export const USE_CASES: UseCaseItem[] = [
  {
    slug: "product-feedback-platform",
    name: "Centralize product feedback and roadmap in one place",
    description:
      "Turn scattered requests into a single source of truth, prioritize with a public roadmap, and close the loop with changelogs.",
    badge: "Product feedback",
  },
  {
    slug: "enterprise-customer-success",
    name: "Scale enterprise customer success with structured feedback programs",
    description:
      "Implement systematic feedback collection, stakeholder alignment, and executive reporting to drive strategic account growth and retention.",
    badge: "Customer success",
    isNew: true,
  },
  {
    slug: "product-led-growth",
    name: "Accelerate product-led growth through systematic user feedback loops",
    description:
      "Leverage continuous user feedback to optimize onboarding experiences, drive feature adoption, and convert free users into paying customers.",
    badge: "Growth strategy",
    isNew: true,
  },
];

export const getUseCaseBySlug = (slug: string) =>
  USE_CASES.find((u) => u.slug === slug);

export const getAllUseCaseSlugs = () => USE_CASES.map((u) => u.slug);
