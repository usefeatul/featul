import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Link } from "@react-email/components"

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

// Inline light styles remain the fallback for clients that strip head CSS.
// Brand options stay compatible with callers; use plain text and the app's
// primary button colors from packages/ui/src/styles/globals.css.
const themeCss = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    .email-body, .email-body > table > tbody > tr > td { background-color: #171717 !important; }
    .email-text { color: #ededed !important; }
    .email-muted { color: #a3a3a3 !important; }
    .email-button { background-color: #5aa2f0 !important; color: #101820 !important; }
  }
  [data-ogsc] .email-text { color: #ededed !important; }
  [data-ogsc] .email-muted { color: #a3a3a3 !important; }
  [data-ogsc] .email-button { background-color: #5aa2f0 !important; color: #101820 !important; }
  [data-ogsc] .email-body, [data-ogsc] .email-body > table > tbody > tr > td,
  [data-ogsb] .email-body, [data-ogsb] .email-body > table > tbody > tr > td { background-color: #171717 !important; }
  @media only screen and (max-width: 480px) {
    .email-container { padding: 20px 16px !important; }
  }
`

export function BrandedEmail(props: Props) {
  const name = props.brand?.name || "featul"
  const muted = "#666666"
  const preview = props.title || name

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{themeCss}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="email-body"
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#ffffff",
          fontFamily: FONT,
        }}
      >
        <Container align="left" className="email-container" style={{ maxWidth: 640, margin: 0, padding: "24px", wordBreak: "break-word" }}>
          {props.eyebrow ? (
            <Text className="email-muted" style={{ color: muted, fontSize: 12, margin: "0 0 8px 0" }}>
              {props.eyebrow}
            </Text>
          ) : null}

          {props.title ? (
            <Heading
              className="email-text"
              as="h1"
              style={{
                fontSize: 16,
                fontWeight: 600,
                lineHeight: "24px",
                margin: "0 0 20px 0",
                color: "#171717",
              }}
            >
              {props.title}
            </Heading>
          ) : null}

          {props.intro ? (
            <Text className="email-text" style={{ color: "#171717", fontSize: 15, lineHeight: "24px", margin: "0 0 12px 0" }}>
              {props.intro}
            </Text>
          ) : null}

          {props.body ? (
            <Text className="email-text" style={{ color: "#404040", fontSize: 15, lineHeight: "24px", margin: "0 0 12px 0" }}>
              {props.body}
            </Text>
          ) : null}

          {props.paragraphs?.map((paragraph, index) => (
            <Text
              className="email-text"
              key={index}
              style={{ color: "#404040", fontSize: 15, lineHeight: "24px", margin: "0 0 12px 0" }}
            >
              {paragraph}
            </Text>
          ))}

          {props.highlight ? (
            <Section style={{ margin: "20px 0 8px" }}>
              <Text
                className="email-text"
                style={{
                  margin: 0,
                  color: "#171717",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              >
                {props.highlight}
              </Text>
              {props.highlightHint ? (
                <Text className="email-muted" style={{ margin: "8px 0 0 0", color: muted, fontSize: 13, lineHeight: "20px" }}>
                  {props.highlightHint}
                </Text>
              ) : null}
            </Section>
          ) : null}

          {props.details && props.details.length > 0 ? (
            <Section style={{ margin: "16px 0 4px" }}>
              {props.details.map((detail, index) => (
                <Text
                  className="email-text"
                  key={`${detail.label}-${index}`}
                  style={{ color: "#404040", fontSize: 15, lineHeight: "24px", margin: "0 0 4px 0" }}
                >
                  <span className="email-muted" style={{ color: muted }}>{detail.label}:</span>{" "}{detail.value}
                </Text>
              ))}
            </Section>
          ) : null}

          {props.ctaText && props.ctaUrl ? (
            <Section style={{ margin: "20px 0" }}>
              <Button
                className="email-button"
                href={props.ctaUrl}
                style={{ backgroundColor: "#4d96e8", color: "#ffffff", fontSize: 14, fontWeight: 600, lineHeight: "20px", padding: "12px 18px", borderRadius: 4, textDecoration: "none" }}
              >
                {props.ctaText}
              </Button>
            </Section>
          ) : null}

          {props.outro ? (
            <Text className="email-muted" style={{ color: muted, fontSize: 13, lineHeight: "20px", margin: "20px 0 0 0" }}>
              {props.outro}
            </Text>
          ) : null}

          {props.psText ? (
            <Text className="email-muted" style={{ color: muted, fontSize: 13, lineHeight: "20px", margin: "20px 0 0 0" }}>
              {props.psText}
            </Text>
          ) : null}

          {props.signatureName ? (
            <Text className="email-muted" style={{ color: muted, fontSize: 13, lineHeight: "20px", margin: "24px 0 0 0" }}>
              {props.signatureName}
            </Text>
          ) : null}


          <Text className="email-muted" style={{ color: muted, fontSize: 13, lineHeight: "20px", margin: "24px 0 0" }}>
            {name}
            {" · "}
            <Link className="email-muted" href={getEmailAppOrigin()} style={{ color: muted, textDecoration: "underline", textUnderlineOffset: "3px" }}>
              app.featul.com
            </Link>
          </Text>
          {props.addressLines?.map((line, index) => (
            <Text key={index} className="email-muted" style={{ color: muted, fontSize: 12, lineHeight: "18px", margin: "4px 0 0 0" }}>
              {line}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  )
}
