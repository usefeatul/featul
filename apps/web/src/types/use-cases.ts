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
