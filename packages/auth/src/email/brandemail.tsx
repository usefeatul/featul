import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Img, Hr, Link, Row, Column } from "@react-email/components"

export type Brand = {
  name?: string
  logoUrl?: string
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
}

export type EmailDetail = {
  label: string
  value: string
}

type Props = {
  eyebrow?: string
  title?: string
  intro?: string
  highlight?: string
  highlightHint?: string
  body?: string
  paragraphs?: string[]
  details?: EmailDetail[]
  outro?: string
  ctaText?: string
  ctaUrl?: string
  psText?: string
  signatureName?: string
  brand?: Brand
  addressLines?: string[]
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const PRODUCTION_APP_ORIGIN = "https://app.featul.com"

export function getEmailAppOrigin() {
  const fromEnv = String(process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "")
  if (!fromEnv || /localhost|127\.0\.0\.1/i.test(fromEnv)) return PRODUCTION_APP_ORIGIN
  return fromEnv
}

export function emailAppUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${getEmailAppOrigin()}${normalized}`
}

function resolveBrand(brand?: Brand): Required<Brand> {
  return {
    name: brand?.name || "featul",
    logoUrl: brand?.logoUrl || emailAppUrl("/email-logo.png"),
    primaryColor: brand?.primaryColor || "#111111",
    backgroundColor: brand?.backgroundColor || "#ffffff",
    textColor: brand?.textColor || "#111111",
  }
}

function contrastOn(hex: string) {
  const raw = hex.replace("#", "")
  if (raw.length !== 6) return "#ffffff"
  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.65 ? "#111111" : "#ffffff"
}

export function BrandedEmail(props: Props) {
  const customLogo = Boolean(props.brand?.logoUrl)
  const b = resolveBrand(props.brand)
  const headerName = customLogo ? b.name : "featul"
  const muted = "#737373"
  const preview = props.title || b.name

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: b.backgroundColor,
          fontFamily: FONT,
        }}
      >
        <Container style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px 48px" }}>
          <Section style={{ marginBottom: 32 }}>
            <Row>
              <Column style={{ width: 28, verticalAlign: "middle" }}>
                <Img
                  src={b.logoUrl}
                  alt={headerName}
                  width={24}
                  height={24}
                  style={{ display: "block", border: "none" }}
                />
              </Column>
              <Column style={{ verticalAlign: "middle", paddingLeft: 10 }}>
                <Text style={{ margin: 0, color: b.textColor, fontSize: 13, fontWeight: 500 }}>
                  {headerName}
                </Text>
              </Column>
            </Row>
          </Section>

          {props.eyebrow ? (
            <Text style={{ color: muted, fontSize: 12, margin: "0 0 8px 0" }}>
              {props.eyebrow}
            </Text>
          ) : null}

          {props.title ? (
            <Heading
              as="h1"
              style={{
                fontSize: 20,
                fontWeight: 500,
                lineHeight: "28px",
                letterSpacing: "-0.02em",
                margin: "0 0 20px 0",
                color: b.textColor,
              }}
            >
              {props.title}
            </Heading>
          ) : null}

          {props.intro ? (
            <Text style={{ color: b.textColor, fontSize: 15, lineHeight: "24px", margin: "0 0 12px 0" }}>
              {props.intro}
            </Text>
          ) : null}

          {props.body ? (
            <Text style={{ color: "#404040", fontSize: 15, lineHeight: "24px", margin: "0 0 12px 0" }}>
              {props.body}
            </Text>
          ) : null}

          {props.paragraphs?.map((paragraph, index) => (
            <Text
              key={index}
              style={{ color: "#404040", fontSize: 15, lineHeight: "24px", margin: "0 0 12px 0" }}
            >
              {paragraph}
            </Text>
          ))}

          {props.highlight ? (
            <Section style={{ margin: "20px 0 8px" }}>
              <Text
                style={{
                  margin: 0,
                  color: b.textColor,
                  fontSize: 28,
                  fontWeight: 500,
                  letterSpacing: "0.22em",
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              >
                {props.highlight}
              </Text>
              {props.highlightHint ? (
                <Text style={{ margin: "8px 0 0 0", color: muted, fontSize: 13, lineHeight: "20px" }}>
                  {props.highlightHint}
                </Text>
              ) : null}
            </Section>
          ) : null}

          {props.details && props.details.length > 0 ? (
            <Section style={{ margin: "16px 0 4px" }}>
              {props.details.map((detail, index) => (
                <Text
                  key={`${detail.label}-${index}`}
                  style={{ color: "#404040", fontSize: 15, lineHeight: "24px", margin: "0 0 4px 0" }}
                >
                  {detail.label}: {detail.value}
                </Text>
              ))}
            </Section>
          ) : null}

          {props.ctaText && props.ctaUrl ? (
            <Section style={{ marginTop: 24 }}>
              <Button
                href={props.ctaUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: b.primaryColor,
                  color: contrastOn(b.primaryColor),
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: 14,
                  padding: "10px 16px",
                  borderRadius: 4,
                  lineHeight: "20px",
                }}
              >
                {props.ctaText}
              </Button>
            </Section>
          ) : null}

          {props.outro ? (
            <Text style={{ color: muted, fontSize: 13, lineHeight: "20px", margin: "20px 0 0 0" }}>
              {props.outro}
            </Text>
          ) : null}

          {props.psText ? (
            <Text style={{ color: muted, fontSize: 13, lineHeight: "20px", margin: "20px 0 0 0" }}>
              {props.psText}
            </Text>
          ) : null}

          {props.signatureName ? (
            <Text style={{ color: muted, fontSize: 13, lineHeight: "20px", margin: "24px 0 0 0" }}>
              {props.signatureName}
            </Text>
          ) : null}

          <Hr style={{ borderColor: "#e5e5e5", borderWidth: "1px 0 0 0", margin: "32px 0 16px 0" }} />

          <Text style={{ color: muted, fontSize: 12, lineHeight: "18px", margin: 0 }}>
            {b.name}
            {" · "}
            <Link href={getEmailAppOrigin()} style={{ color: muted, textDecoration: "none" }}>
              app.featul.com
            </Link>
          </Text>
          {props.addressLines?.map((line, index) => (
            <Text key={index} style={{ color: muted, fontSize: 12, lineHeight: "18px", margin: "4px 0 0 0" }}>
              {line}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  )
}
