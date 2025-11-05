import { Container } from "@/components/global/container"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How feedgot collects, uses, and protects personal data in line with GDPR.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <main>
      <Container withNavbarOffset maxWidth="6xl" className="pt-24 sm:pt-28 pb-12 px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <article className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert text-left prose-headings:text-left mx-auto">
           <h1>Privacy Policy</h1>
          <p><strong>Last updated:</strong> 31 October 2025</p>
          <p>
            This Privacy Policy explains how <strong>feedgot</strong> ("feedgot", "we", "us", "our") collects, uses,
            discloses, and protects Personal Data when you visit our websites or use our services (the "Service").
            We process Personal Data in accordance with applicable data protection laws, including the EU General
            Data Protection Regulation (GDPR).
          </p>
          <p>
            For questions or to exercise your rights, contact us at
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>

          <h2>Data Controller</h2>
          <p>
            When we determine the purposes and means of processing, feedgot acts as the data controller. When we process
            Customer Data on behalf of our customers, we act as a data processor under the terms of our DPA.
          </p>

          <h2>Personal Data We Collect</h2>
          <ul>
            <li>
              <strong>Account and Profile Data</strong>: name, email address, password (hashed), organization details, preferences.
            </li>
            <li>
              <strong>Usage and Device Data</strong>: pages viewed, features used, IP address, browser type, operating system,
              identifiers, and diagnostic logs.
            </li>
            <li>
              <strong>Content and Customer Data</strong>: information you upload or generate within the Service.
            </li>
            <li>
              <strong>Transaction Data</strong>: subscription plan, billing details, payment method (processed by our payment
              processor), VAT or tax identifiers where applicable.
            </li>
            <li>
              <strong>Communications</strong>: messages sent to support, feedback, and queries.
            </li>
            <li>
              <strong>Cookies and Similar Technologies</strong>: see “Cookies” below.
            </li>
          </ul>

          <h2>Sources of Personal Data</h2>
          <ul>
            <li>Directly from you when you register, configure your account, or communicate with us.</li>
            <li>Automatically through the Service via cookies, logs, and analytics.</li>
            <li>From third parties (e.g., authentication providers, payment processors) where permitted.</li>
          </ul>

          <h2>Purposes and Legal Bases</h2>
          <p>We process Personal Data for the following purposes under GDPR Article 6:</p>
          <ul>
            <li><strong>To provide and operate the Service</strong> (contract).</li>
            <li><strong>To secure, maintain, and improve the Service</strong> (legitimate interests and contract).</li>
            <li><strong>To communicate with you</strong> about updates, billing, and support (contract and legitimate interests).</li>
            <li><strong>To comply with legal obligations</strong> (legal obligation).</li>
            <li><strong>To personalize and analyze usage</strong> (legitimate interests; consent where required).</li>
            <li><strong>Marketing communications</strong> (consent where required; you may opt out at any time).
            </li>
          </ul>

          <h2>Data Sharing and Recipients</h2>
          <ul>
            <li>
              <strong>Service Providers/Processors</strong>: hosting, storage, analytics, email delivery, customer support, and
              payment processing.
            </li>
            <li>
              <strong>Affiliates</strong>: entities under common control, subject to appropriate safeguards.
            </li>
            <li>
              <strong>Legal and Compliance</strong>: where required to comply with law or to protect our rights.
            </li>
            <li>
              <strong>Business Transfers</strong>: in connection with mergers, acquisitions, or asset sales, subject to safeguards.
            </li>
          </ul>

          <h2>International Transfers</h2>
          <p>
            If Personal Data is transferred outside the EEA/UK, we rely on appropriate safeguards such as adequacy decisions,
            Standard Contractual Clauses (SCCs), and supplementary measures.
          </p>

          <h2>Retention</h2>
          <p>
            We retain Personal Data for as long as necessary to provide the Service, comply with legal obligations, resolve
            disputes, and enforce agreements. Retention periods vary depending on the type of data and applicable laws.
          </p>

          <h2>Security</h2>
          <p>
            We implement technical and organizational measures to protect Personal Data, including access controls, encryption,
            secure development practices, and regular monitoring.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies and similar technologies to operate and improve the Service. Categories include strictly necessary,
            preferences, analytics, and marketing. You can control cookies via your browser settings and, where provided, in-product
            preferences.
          </p>

          <h2>Your Rights</h2>
          <p>You have the following rights under GDPR, subject to conditions and exceptions:</p>
          <ul>
            <li>Access your Personal Data.</li>
            <li>Rectify inaccurate or incomplete data.</li>
            <li>Erase data (right to be forgotten).</li>
            <li>Restrict processing.</li>
            <li>Data portability.</li>
            <li>Object to processing based on legitimate interests.</li>
            <li>Withdraw consent at any time (where processing is based on consent).</li>
            <li>Lodge a complaint with a supervisory authority in your country of residence or work.</li>
          </ul>
          <p>
            To exercise your rights, contact
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>. We will respond within one month
            or as otherwise required by law.
          </p>

          <h2>Children</h2>
          <p>
            The Service is not directed to children under 16. If you believe a child has provided Personal Data, contact us to
            request deletion.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post changes with an updated date and, if changes are
            material, provide additional notice.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy inquiries, contact
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>
          </article>
        </div>
      </Container>
    </main>
  )
}