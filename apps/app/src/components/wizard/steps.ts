export const WIZARD_STEPS = [
  {
    id: "domain",
    title: "First things first.",
    description: "Which website do you want to collect feedback for?",
  },
  {
    id: "name",
    title: "Name your workspace.",
    description: "A clear name helps your team recognize it.",
  },
  {
    id: "slug",
    title: "Choose your workspace URL.",
    description: "Used for sharing and navigation; must be unique.",
  },
  {
    id: "timezone",
    title: "Pick a timezone.",
    description: "All timestamps and charts will align to this timezone.",
  },
] as const

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"]

export const WIZARD_PREVIEW_BACKGROUND = "/image/sky.PNG"
export const WIZARD_PREVIEW_IMAGE = "/image/dashboard.png"
