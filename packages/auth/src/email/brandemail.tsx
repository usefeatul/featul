import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Img } from "@react-email/components"

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
  paragraphs?: string[]
  outro?: string
  ctaText?: string
  ctaUrl?: string
  psText?: string
  signatureName?: string
  brand?: Brand
  addressLines?: string[]
}

function resolveBrand(brand?: Brand): Required<Brand> {
  return {
    name: brand?.name || "oreilla",
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
      <Body style={{ margin: 0, padding: 0, backgroundColor: b.backgroundColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
          <Section>
            {props.eyebrow && (
              <Text style={{ color: "#8898aa", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 16px 0" }}>
                {props.eyebrow}
              </Text>
            )}
            
            {props.title && (
              <Heading style={{ fontSize: 24, fontWeight: 600, margin: "0 0 24px 0", color: b.textColor }}>
                {props.title}
              </Heading>
            )}
            
            {props.intro && (
              <Text style={{ color: b.textColor, fontSize: 16, lineHeight: "26px", margin: "0 0 16px 0" }}>
                {props.intro}
              </Text>
            )}
            
            {props.paragraphs?.map((p, i) => (
              <Text key={i} style={{ color: b.textColor, fontSize: 16, lineHeight: "26px", margin: "0 0 16px 0" }}>
                {p}
              </Text>
            ))}
            
            {!props.paragraphs && props.body && (
              <Text style={{ color: b.textColor, fontSize: 16, lineHeight: "26px", margin: "0 0 16px 0" }}>
                {props.body}
              </Text>
            )}
            
            {props.highlight && (
              <Section style={{ padding: "16px", backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 8, margin: "24px 0" }}>
                 <Text style={{ fontSize: 18, fontWeight: 500, margin: 0, color: b.textColor }}>{props.highlight}</Text>
              </Section>
            )}
            
            {props.ctaText && props.ctaUrl && (
              <Button 
                href={props.ctaUrl} 
                style={{ 
                  display: "inline-block", 
                  backgroundColor: b.primaryColor, 
                  color: "#ffffff", 
                  textDecoration: "none", 
                  fontWeight: 600, 
                  fontSize: 16,
                  padding: "12px 24px", 
                  borderRadius: 6, 
                  marginTop: 24,
                  textAlign: "center" 
                }}
              >
                {props.ctaText}
              </Button>
            )}
            
            {props.outro && (
              <Text style={{ color: b.textColor, fontSize: 16, lineHeight: "26px", marginTop: 32 }}>
                {props.outro}
              </Text>
            )}
            
            {props.psText && (
              <Text style={{ color: "#6b7280", fontSize: 14, lineHeight: "24px", marginTop: 24, fontStyle: "italic" }}>
                {props.psText}
              </Text>
            )}
            
            {props.signatureName && (
              <Text style={{ color: b.textColor, fontSize: 16, lineHeight: "26px", marginTop: 32 }}>
                Best regards,<br />
                {props.signatureName}
              </Text>
            )}
          </Section>

          {/* Minimal Footer */}
          <Section style={{ marginTop: 48, borderTop: "1px solid #eaeaea", paddingTop: 24 }}>
             <Text style={{ color: "#8898aa", fontSize: 12, margin: 0, textAlign: "center" }}>
               © {new Date().getFullYear()} {"Oreilla"}
             </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
