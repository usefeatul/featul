import { Container } from "@/components/global/container"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "GDPR Compliance",
  description: "feedgot’s approach to GDPR and data protection obligations.",
  path: "/gdpr",
})

export default function GdprPage() {
  return (
    <main>
      <Container withNavbarOffset maxWidth="6xl" className="pt-24 sm:pt-28 pb-12 px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <article className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert  text-left prose-headings:text-left mx-auto">
           <h1>GDPR Compliance</h1>
          <p><strong>Last updated:</strong> 31 October 2025</p>
          <p>
            <strong>feedgot</strong> is committed to protecting Personal Data and complying with the EU General Data Protection
            Regulation (GDPR). This page summarizes our practices as controller and processor, our lawful bases, your rights,
            and key safeguards.
          </p>

          <h2>Roles</h2>
          <ul>
            <li>
              <strong>Controller</strong>: feedgot acts as controller for Personal Data related to your account, billing, support,
              and product analytics.
            </li>
            <li>
              <strong>Processor</strong>: feedgot acts as processor of Customer Data submitted to the Service by customers.
              Our Data Processing Addendum (DPA) governs such processing.
            </li>
          </ul>

          <h2>Lawful Bases for Processing</h2>
          <ul>
            <li><strong>Contract</strong>: to provide and operate the Service you request.</li>
            <li><strong>Legitimate Interests</strong>: to secure, maintain, and improve the Service; prevent abuse; and understand usage.</li>
            <li><strong>Consent</strong>: for certain analytics/marketing or optional features where required.</li>
            <li><strong>Legal Obligation</strong>: to comply with tax, accounting, and regulatory requirements.</li>
          </ul>

          <h2>Data Subject Rights</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li>Access your Personal Data and obtain a copy.</li>
            <li>Rectify inaccurate or incomplete data.</li>
            <li>Erase data in certain circumstances.</li>
            <li>Restrict processing in certain circumstances.</li>
            <li>Data portability.</li>
            <li>Object to processing based on legitimate interests.</li>
            <li>Withdraw consent where processing relies on consent.</li>
          </ul>
          <p>
            To exercise your rights, email
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
            We will respond within one month or as required by law.
          </p>

          <h2>Sub-processors</h2>
          <p>
            We engage carefully selected sub-processors to provide hosting, storage, analytics, email delivery, and related
            services. Examples may include infrastructure and hosting providers, email delivery platforms, analytics services,
            and managed databases. We maintain appropriate agreements and conduct due diligence. A current list is available on
            request via
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>

          <h2>International Transfers</h2>
          <p>
            Where Personal Data is transferred outside the EEA/UK, we implement appropriate safeguards such as the EU Standard
            Contractual Clauses (SCCs), adequacy decisions, and supplementary measures.
          </p>

          <h2>Security</h2>
          <p>
            We implement technical and organizational measures including encryption in transit, access controls, vulnerability
            management, and secure development practices. We monitor for threats and aim to minimize risks to confidentiality,
            integrity, and availability.
          </p>

          <h2>Data Retention</h2>
          <p>
            Personal Data is retained only as long as necessary to provide the Service and meet legal obligations. Upon account
            closure, we delete or anonymize data after a reasonable retention period unless law requires longer retention.
          </p>

          <h2>Personal Data Breaches</h2>
          <p>
            In the event of a Personal Data breach, we will notify the competent supervisory authority within 72 hours when
            required by law, and we will notify affected users without undue delay where the breach is likely to result in a high
            risk to rights and freedoms.
          </p>

          <h2>Data Processing Addendum (DPA)</h2>
          <p>
            For customers who require a signed DPA, contact
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>

          <h2>Contact</h2>
          <p>
            For GDPR-related inquiries, email
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>
          </article>
        </div>
      </Container>
    </main>
  )
}