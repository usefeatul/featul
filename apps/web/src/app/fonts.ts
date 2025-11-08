import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";

// Self-hosted via next/font: Plus Jakarta Sans for body text
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

// Playfair Display for headings
export const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

// Expose CSS variables only to avoid overriding Tailwind font-sans
export const fontsClassName = `${jakarta.variable} ${playfair.variable}`;