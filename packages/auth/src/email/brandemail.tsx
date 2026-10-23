import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Link, Img, Hr } from "@react-email/components"

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
  /** Footer opt-out link for subscription emails. */
  unsubscribeUrl?: string
  unsubscribeText?: string
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
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

// Light values from packages/ui/src/styles/globals.css. Inline styles stay the
// fallback for clients that strip head CSS.
const color = {
  page: "#f4f4f5",
  text: "#202020",
  body: "#404040",
  muted: "#666666",
  card: "#ffffff",
  panel: "#fafafa",
  border: "#e8e8e8",
}

// The app's default button: a darkened primary gradient with a lit top edge.
// Clients without gradient or shadow support fall back to the flat primary.
const buttonStyle = {
  backgroundColor: "#2875c5",
  backgroundImage: "linear-gradient(180deg, #256cb5 0%, #205e9e 100%)",
  border: "1px solid #2471bf",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), 0 1px 2px rgba(0,0,0,0.18)",
  borderRadius: 10,
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: "20px",
  padding: "10px 18px",
  textDecoration: "none",
}

const themeCss = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    .email-body, .email-body > table > tbody > tr > td { background-color: #111111 !important; }
    .email-card { background-color: #1c1c1c !important; border-color: #2a2a2a !important; box-shadow: none !important; }
    .email-panel { background-color: #161616 !important; border-color: #2a2a2a !important; }
    .email-text { color: #ededed !important; }
    .email-subtle { color: #c4c4c4 !important; }
    .email-muted { color: #a3a3a3 !important; }
    .email-rule { border-color: #2a2a2a !important; }
    .email-button { background-color: #5aa2f0 !important; background-image: linear-gradient(180deg, #5395dd 0%, #4882c0 100%) !important; border-color: #5aa2f0 !important; color: #ffffff !important; }
  }
  [data-ogsc] .email-text { color: #ededed !important; }
  [data-ogsc] .email-subtle { color: #c4c4c4 !important; }
  [data-ogsc] .email-muted { color: #a3a3a3 !important; }
  [data-ogsc] .email-button { background-color: #5aa2f0 !important; color: #ffffff !important; }
  [data-ogsc] .email-body, [data-ogsc] .email-body > table > tbody > tr > td,
  [data-ogsb] .email-body, [data-ogsb] .email-body > table > tbody > tr > td { background-color: #111111 !important; }
  [data-ogsb] .email-card { background-color: #1c1c1c !important; }
  [data-ogsb] .email-panel { background-color: #161616 !important; }
  @media only screen and (max-width: 480px) {
    .email-container { padding: 24px 12px !important; }
    .email-card { padding: 28px 22px !important; }
    .email-title { font-size: 20px !important; line-height: 28px !important; }
  }
`

export function BrandedEmail(props: Props) {
  const name = props.brand?.name || "featul"
  const logoUrl = props.brand?.logoUrl || `${getEmailAppOrigin()}/email-mark.png`
  const preview = props.title || name
  const paragraph = { color: color.body, fontSize: 15, lineHeight: "24px", margin: "0 0 12px 0" }
  const small = { color: color.muted, fontSize: 13, lineHeight: "20px" }
  const footer = { ...small, fontSize: 12, lineHeight: "18px", textAlign: "center" as const }
  const footerLink = { color: color.muted, textDecoration: "underline", textUnderlineOffset: "3px" }
  const panel = { backgroundColor: color.panel, border: `1px solid ${color.border}`, borderRadius: 12 }

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{themeCss}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body className="email-body" style={{ margin: 0, padding: 0, backgroundColor: color.page, fontFamily: FONT }}>
        <Container className="email-container" style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px", wordBreak: "break-word" }}>
          <Section
            className="email-card"
            style={{
              backgroundColor: color.card,
              border: `1px solid ${color.border}`,
              borderRadius: 16,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
              padding: "36px 40px",
            }}
          >
            <Img src={logoUrl} width={36} height={36} alt={name} style={{ display: "block", borderRadius: 8, margin: "0 0 28px 0" }} />

            {props.eyebrow ? (
              <Text className="email-muted" style={{ ...small, fontWeight: 500, margin: "0 0 8px 0" }}>
                {props.eyebrow}
              </Text>
            ) : null}

            {props.title ? (
              <Heading
                className="email-text email-title"
                as="h1"
                style={{ fontSize: 22, fontWeight: 600, lineHeight: "30px", letterSpacing: "-0.01em", margin: "0 0 20px 0", color: color.text }}
              >
                {props.title}
              </Heading>
            ) : null}

            {props.intro ? (
              <Text className="email-text" style={{ ...paragraph, color: color.text }}>
                {props.intro}
              </Text>
            ) : null}

            {props.body ? (
              <Text className="email-subtle" style={paragraph}>
                {props.body}
              </Text>
            ) : null}

            {props.paragraphs?.map((text, index) => (
              <Text className="email-subtle" key={index} style={paragraph}>
                {text}
              </Text>
            ))}

            {props.highlight ? (
              <Section className="email-panel" style={{ ...panel, margin: "24px 0 4px", padding: "20px 16px", textAlign: "center" }}>
                <Text
                  className="email-text"
                  style={{
                    margin: 0,
                    color: color.text,
                    fontFamily: MONO,
                    fontSize: 30,
                    fontWeight: 600,
                    lineHeight: "38px",
                    letterSpacing: "0.3em",
                    paddingLeft: "0.3em",
                  }}
                >
                  {props.highlight}
                </Text>
                {props.highlightHint ? (
                  <Text className="email-muted" style={{ ...small, margin: "6px 0 0 0" }}>
                    {props.highlightHint}
                  </Text>
                ) : null}
              </Section>
            ) : null}

            {props.details && props.details.length > 0 ? (
              <Section className="email-panel" style={{ ...panel, margin: "20px 0 4px" }}>
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                  <tbody>
                    {props.details.map((detail, index) => {
                      const cell = {
                        padding: "10px 16px",
                        fontSize: 14,
                        lineHeight: "20px",
                        verticalAlign: "top" as const,
                        borderTop: index === 0 ? "none" : `1px solid ${color.border}`,
                      }
                      return (
                        <tr key={`${detail.label}-${index}`}>
                          <td className="email-muted email-rule" style={{ ...cell, color: color.muted, width: 112, paddingRight: 0 }}>
                            {detail.label}
                          </td>
                          <td className="email-text email-rule" style={{ ...cell, color: color.text, fontWeight: 500 }}>
                            {detail.value}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Section>
            ) : null}

            {props.ctaText && props.ctaUrl ? (
              <Section style={{ margin: "28px 0 4px" }}>
                <Button className="email-button" href={props.ctaUrl} style={buttonStyle}>
                  {props.ctaText}
                </Button>
              </Section>
            ) : null}

            {props.outro || props.psText || props.signatureName ? (
              <Hr className="email-rule" style={{ border: "none", borderTop: `1px solid ${color.border}`, margin: "28px 0 0" }} />
            ) : null}

            {props.outro ? (
              <Text className="email-muted" style={{ ...small, margin: "16px 0 0 0" }}>
                {props.outro}
              </Text>
            ) : null}

            {props.psText ? (
              <Text className="email-muted" style={{ ...small, margin: "16px 0 0 0" }}>
                {props.psText}
              </Text>
            ) : null}

            {props.signatureName ? (
              <Text className="email-muted" style={{ ...small, margin: "16px 0 0 0" }}>
                {props.signatureName}
              </Text>
            ) : null}
          </Section>

          <Text className="email-muted" style={{ ...footer, margin: "24px 0 0" }}>
            {name}
            {" · "}
            <Link className="email-muted" href={getEmailAppOrigin()} style={footerLink}>
              app.featul.com
            </Link>
          </Text>
          {props.unsubscribeUrl ? (
            <Text className="email-muted" style={{ ...footer, margin: "6px 0 0 0" }}>
              {props.unsubscribeText || "Don't want these emails?"}{" "}
              <Link className="email-muted" href={props.unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
          ) : null}
          {props.addressLines?.map((line, index) => (
            <Text key={index} className="email-muted" style={{ ...footer, margin: "4px 0 0 0" }}>
              {line}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  )
}
