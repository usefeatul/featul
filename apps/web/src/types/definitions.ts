export type DefinitionFaq = { q: string; a: string };

export type Definition = {
  slug: string;
  name: string;
  synonyms?: string[];
  short: string;
  content?: string;
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
