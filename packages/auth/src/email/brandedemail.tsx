import React from "react"
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button } from "@react-email/components"

export type Brand = {
  name?: string
  logoUrl?: string
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
}

type Props = {
  eyebrow?: string
  title?: string
  intro?: string
  highlight?: string
  body?: string
  outro?: string
  ctaText?: string
  ctaUrl?: string
  footerText?: string
  signatureName?: string
  brand?: Brand
}

function resolveBrand(brand?: Brand): Required<Brand> {
  return {
    name: brand?.name || "Feedgot",
    logoUrl: brand?.logoUrl || "",
    primaryColor: brand?.primaryColor || "#111111",
    backgroundColor: brand?.backgroundColor || "#ffffff",
    textColor: brand?.textColor || "#0a0a0a",
  }
}

export function BrandedEmail(props: Props) {
  const b = resolveBrand(props.brand)
  return (
    <Html>
      <Head />
      <Preview>{props.title || b.name}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: b.backgroundColor }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: 12 }}>
            <Section style={{ padding: "24px 24px 8px 24px" }}>
              {props.eyebrow && (
                <Text style={{ color: "#6b7280", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>{props.eyebrow}</Text>
              )}
              <Heading style={{ fontSize: 28, lineHeight: "36px", margin: "8px 0 0 0", color: b.textColor }}>{b.name}</Heading>
            </Section>
            <Section style={{ padding: "8px 24px 24px 24px" }}>
              {props.intro && <Text style={{ color: "#111827", fontSize: 16, lineHeight: "26px" }}>{props.intro}</Text>}
              {props.title && <Heading as="h2" style={{ fontSize: 18, margin: "16px 0", color: b.textColor }}>{props.title}</Heading>}
              {props.highlight && <Text style={{ fontSize: 20, fontWeight: 700, letterSpacing: 4, color: b.textColor }}>{props.highlight}</Text>}
              {props.body && <Text style={{ color: "#111827", fontSize: 16, lineHeight: "26px" }}>{props.body}</Text>}
              {props.outro && <Text style={{ color: "#111827", fontSize: 16, lineHeight: "26px" }}>{props.outro}</Text>}
              {props.ctaText && props.ctaUrl && (
                <Button href={props.ctaUrl} style={{ display: "inline-block", backgroundColor: b.primaryColor, color: "#ffffff", textDecoration: "none", fontWeight: 600, padding: "12px 18px", borderRadius: 9999, marginTop: 16 }}>
                  {props.ctaText}
                </Button>
              )}
              {props.footerText && <Text style={{ color: "#6b7280", fontSize: 14, lineHeight: "24px", marginTop: 20 }}>{props.footerText}</Text>}
              {props.signatureName && (
                <>
                  <Text style={{ color: b.textColor, fontSize: 16, lineHeight: "26px", marginTop: 16 }}>Best regards,</Text>
                  <Text style={{ color: b.textColor, fontSize: 16, lineHeight: "26px" }}>{props.signatureName}</Text>
                </>
              )}
            </Section>
            <Section style={{ padding: 16 }}>
              <Text style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>© {new Date().getFullYear()} {b.name}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
