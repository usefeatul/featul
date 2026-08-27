export type DefinitionFaq = { q: string; a: string };

export type DefinitionUseCase = { title: string; body: string };

export type Definition = {
  slug: string;
  name: string;
  synonyms?: string[];
  short: string;
  content?: string;
  /** Optional SERP title. Should land near 50–60 characters with the Featul suffix. */
  metaTitle?: string;
  eli5: string;
  practical: string;
  expert: string;
  overview?: string;
  why?: string;
  pitfalls?: string[];
  benchmarks?: string;
  notes?: string[];
  formula?: { title: string; body: string; code?: string };
  example?: { title: string; body: string };
  faqs?: DefinitionFaq[];
  related?: string[];
  useCases?: DefinitionUseCase[];
  author?: string;
  publishedAt?: string;
  essay?: {
    intro?: string;
    analysis?: string;
    formulaContext?: string;
    exampleContext?: string;
    pitfallsContext?: string;
    benchmarksContext?: string;
    notesContext?: string;
    relatedContext?: string;
    faqsContext?: string;
  };
};
