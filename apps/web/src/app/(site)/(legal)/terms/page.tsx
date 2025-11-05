import { Container } from "@/components/global/container"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: "feedgot terms and conditions for using our services.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <main>
      <Container withNavbarOffset maxWidth="6xl" className="pt-24 sm:pt-28 pb-12 px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <article className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert text-left prose-headings:text-left mx-auto">
           <h1>Terms of Service</h1>
          <p><strong>Last updated:</strong> 31 October 2025</p>
          <p>
            These Terms of Service ("Terms") govern your access to and use of the websites,
            products, and services provided by <strong>feedgot</strong> ("feedgot", "we", "us", "our").
            By creating an account, purchasing a subscription, or otherwise using the Service,
            you agree to these Terms.
          </p>
          <p>
            If you have any questions, contact us at
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>

          <h2>Definitions</h2>
          <ul>
            <li>
              <strong>Service</strong>: The software, websites, APIs, and related services operated by feedgot.
            </li>
            <li>
              <strong>Customer</strong>/<strong>User</strong>: The individual or entity accessing or using the Service.
            </li>
            <li>
              <strong>Account</strong>: The profile created to access the Service.
            </li>
            <li>
              <strong>Subscription</strong>: A paid plan that grants access to certain features.
            </li>
            <li>
              <strong>Customer Data</strong>: Content and data submitted to or generated within the Service by you.
            </li>
            <li>
              <strong>Personal Data</strong>: Any information relating to an identified or identifiable natural person.
            </li>
          </ul>

          <h2>Eligibility</h2>
          <p>
            You must be at least 18 years old and have the legal capacity to enter into contracts.
            If you use the Service on behalf of an organization, you represent that you are authorized to bind that organization.
          </p>

          <h2>Account Registration and Security</h2>
          <ul>
            <li>Provide accurate, complete information and keep it up to date.</li>
            <li>Maintain the confidentiality of your credentials and restrict access to your Account.</li>
            <li>You are responsible for all activities under your Account.</li>
            <li>Notify feedgot promptly of any suspected unauthorized access or security incident.</li>
          </ul>

          <h2>Subscriptions, Fees, and Billing</h2>
          <ul>
            <li>
              Paid plans are billed in advance on a recurring basis unless otherwise stated. Your Subscription auto-renews unless
              you cancel before the renewal date.
            </li>
            <li>
              Trials, promotions, and discounts may be offered at feedgot’s discretion and are subject to change.
            </li>
            <li>
              You authorize us (and our payment processors) to charge applicable fees, taxes, and currency conversion costs.
            </li>
            <li>
              Price changes will be communicated in advance and take effect on the next billing cycle.
            </li>
            <li>
              Refunds are generally not provided except where required by law. Certain EEA consumer rights may apply.
            </li>
            <li>
              You can cancel at any time; access continues until the end of the current billing period.
            </li>
          </ul>

          <h2>Acceptable Use</h2>
          <p>You agree not to, and not to allow others to:</p>
          <ul>
            <li>Violate any applicable law or regulation.</li>
            <li>Infringe intellectual property or privacy rights.</li>
            <li>Upload or transmit malicious code, spam, or unlawful content.</li>
            <li>Attempt to bypass, probe, or compromise security or rate limits.</li>
            <li>Reverse engineer or copy the Service except as permitted by law.</li>
            <li>Use the Service to build a competing product without written consent.</li>
          </ul>

          <h2>Customer Data and Content</h2>
          <ul>
            <li>You retain ownership of Customer Data.</li>
            <li>
              You grant feedgot a limited, non-exclusive license to host, process, and display Customer Data solely to provide and
              improve the Service.
            </li>
            <li>You are responsible for the legality, accuracy, and permissions related to Customer Data.</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The Service, including all software, interfaces, and content, is owned by or licensed to feedgot and protected by law.
            Subject to these Terms and any applicable plan limits, we grant you a limited, non-transferable, revocable license to
            use the Service for your business purposes. No other rights are granted.
          </p>

          <h2>Confidentiality</h2>
          <p>
            Each party agrees to protect the other’s Confidential Information and use it only as necessary to perform under these
            Terms. Confidential Information does not include information that is public, independently developed, or lawfully
            obtained from a third party.
          </p>

          <h2>Privacy and Data Protection (GDPR)</h2>
          <p>
            When we process Personal Data as a controller, our processing is described in our
            {" "}
            <a href="/privacy">Privacy Policy</a>.
            Where feedgot acts as a processor for your data, our Data Processing Addendum (DPA) applies and incorporates the
            EU Standard Contractual Clauses where relevant. To request a signed DPA, email
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            The Service may integrate with third-party services. Your use of those services is subject to their terms. feedgot is
            not responsible for third-party services.
          </p>

          <h2>Beta Features</h2>
          <p>
            We may offer pre-release features labeled as beta. Beta features are provided "as is" and may change or be withdrawn
            at any time.
          </p>

          <h2>Termination</h2>
          <ul>
            <li>You may terminate at any time via your Account settings or by contacting support.</li>
            <li>
              We may suspend or terminate your access for breach of these Terms, legal reasons, or risk to the Service or users.
            </li>
            <li>
              Upon termination, your right to use the Service ceases and we may delete or anonymize Customer Data after a
              reasonable retention period, subject to legal obligations.
            </li>
          </ul>

          <h2>Warranties and Disclaimers</h2>
          <p>
            The Service is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we disclaim all
            warranties, express or implied, including fitness for a particular purpose, non-infringement, and merchantability.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, feedgot is not liable for indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits, data, or goodwill. Our aggregate liability under these Terms is limited to the
            amounts paid by you to feedgot for the Service in the twelve (12) months preceding the event giving rise to the claim.
            Nothing in these Terms limits liability for fraud, willful misconduct, or where liability cannot be limited under
            applicable law.
          </p>

          <h2>Indemnity</h2>
          <p>
            You agree to indemnify and hold harmless feedgot, its affiliates, and personnel from any claims, liabilities, damages,
            and expenses arising from your misuse of the Service or violation of these Terms.
          </p>

          <h2>Export and Sanctions</h2>
          <p>
            You must comply with applicable export control and sanctions laws. You may not use the Service if you are subject to
            EU, U.K., or U.S. sanctions.
          </p>

          <h2>Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the Republic of Ireland, without regard to conflict-of-law principles. The
            courts of Dublin, Ireland have exclusive jurisdiction, except that consumers resident in the EEA may bring claims in
            their local courts where required by law.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will post the updated Terms with an updated date. If a material change
            affects your rights, we will provide reasonable notice.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these Terms or the Service, contact
            {" "}
            <a href="mailto:contact@feedgot.com" className="text-primary">contact@feedgot.com</a>.
          </p>
          </article>
        </div>
      </Container>
    </main>
  )
}