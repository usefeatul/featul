import { Manrope, Sora } from "next/font/google";

// Body: Manrope
export const jakarta = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

// Headings: Sora
export const playfair = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

// Expose CSS variables only to avoid overriding Tailwind font-sans
export const fontsClassName = `${jakarta.variable} ${playfair.variable}`;