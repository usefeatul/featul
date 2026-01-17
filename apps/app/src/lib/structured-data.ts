export function buildSoftwareApplicationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "featul",
    url: siteUrl,
    applicationCategory: "Project planning and delivery",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    image: `${siteUrl}/og.png`,
  }
}