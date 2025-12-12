export function buildSoftwareApplicationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "oreilla",
    url: siteUrl,
    applicationCategory: "Project planning and delivery",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    image: `${siteUrl}/logo.png`,
  }
}