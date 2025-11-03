import { Manrope, Roboto } from "next/font/google";

// Primary font for body text
export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

// Secondary font available for targeted usage
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

// Apply Manrope globally; expose Roboto via CSS variable
export const fontsClassName = `${manrope.className} ${manrope.variable} ${roboto.variable}`;