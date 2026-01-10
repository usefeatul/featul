import Link from "next/link"

export function EnterpriseCustomerSuccessUseCase() {
  return (
    <article className="mx-auto w-full max-w-3xl py-16 md:py-24">
      <header className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Use case</p>
        <h1 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
          Scale enterprise customer success with structured feedback programs
        </h1>
        <p className="text-accent mt-4">
          Discover how enterprise customer success teams implement systematic feedback collection,
          stakeholder alignment, and executive reporting to drive strategic account growth and retention.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">The enterprise feedback challenge</h2>
        <p className="text-accent">
          Enterprise customer success teams face unique challenges: multiple stakeholders per account,
          complex organizational hierarchies, and the need to demonstrate ROI to both customers and
          internal executives. Traditional feedback methods quarterly business reviews, ad-hoc surveys,
          and scattered email threads fail to capture the nuanced needs of enterprise accounts.
        </p>
        <p className="text-accent">
          Without systematic feedback collection, CSMs struggle to identify expansion opportunities,
          predict churn risk, and build compelling business cases for renewals. The absence of
          structured data makes it difficult to correlate customer satisfaction with revenue outcomes
          or justify strategic product investments.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">1. Implement multi-stakeholder feedback architecture</h2>
        <p className="text-accent">
          Establish comprehensive feedback channels that capture input from all organizational levels
          within enterprise accounts. Deploy role-specific surveys for end users, department heads,
          and executive sponsors to understand diverse perspectives on product value and strategic alignment.
        </p>
        <p className="text-accent">
          Configure automated feedback workflows that trigger based on customer lifecycle stages,
          usage patterns, and engagement metrics. This systematic approach ensures consistent data
          collection while respecting the time constraints of senior stakeholders.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">2. Correlate feedback with business outcomes</h2>
        <p className="text-accent">
          Transform qualitative feedback into quantitative insights by establishing clear correlation
          frameworks between customer sentiment and key business metrics. Track how feedback themes
          align with product adoption rates, feature utilization, and ultimately, renewal probability.
        </p>
        <p className="text-accent">
          Develop predictive models that identify early warning indicators for churn risk and expansion
          opportunities. By systematically analyzing feedback patterns alongside usage data and contract
          timelines, CSMs can proactively address concerns and capitalize on growth potential.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">3. Create executive-ready reporting frameworks</h2>
        <p className="text-accent">
          Generate comprehensive executive dashboards that translate customer feedback into strategic
          insights for both internal leadership and customer executives. Present data in formats that
          facilitate data-driven decision making and demonstrate clear ROI from customer success investments.
        </p>
        <p className="text-accent">
          Establish quarterly business review templates that incorporate feedback trends, product
          roadmap alignment, and strategic recommendations. These structured presentations enable
          CSMs to position themselves as strategic advisors rather than reactive support providers.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">4. Build systematic escalation and resolution processes</h2>
        <p className="text-accent">
          Implement formal escalation pathways that ensure critical feedback reaches appropriate
          internal stakeholders within defined timeframes. Create cross-functional collaboration
          protocols that involve product management, engineering, and executive leadership in
          addressing enterprise customer concerns.
        </p>
        <p className="text-accent">
          Develop resolution tracking systems that monitor feedback implementation progress and
          communicate updates back to customers. This closed-loop approach demonstrates commitment
          to customer success and builds trust through transparent communication.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Strategic implementation scenario</h2>
        <p className="text-accent">
          A SaaS company serving Fortune 500 clients implements a comprehensive feedback program
          across their top 50 enterprise accounts. The CSM team deploys quarterly executive surveys,
          monthly user feedback collection, and continuous product usage monitoring.
        </p>
        <p className="text-accent">
          Through systematic analysis, they identify that accounts with regular feedback participation
          show 40% higher renewal rates and 60% greater expansion revenue. The data reveals specific
          feature gaps that, when addressed, correlate with significant increases in user adoption
          and customer satisfaction scores.
        </p>
        <p className="text-accent">
          Executive reporting demonstrates that customers participating in structured feedback
          programs generate 3.2x higher lifetime value compared to those without systematic
          engagement. This data justifies additional investments in customer success resources
          and influences product roadmap prioritization.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Target organizational profile</h2>
        <p className="text-accent">
          This comprehensive approach is specifically designed for B2B SaaS organizations serving
          enterprise customers with annual contract values exceeding $50,000. Ideal implementations
          include companies with:
        </p>
        <ul className="text-accent ml-5 list-disc space-y-1">
          <li>Complex, multi-stakeholder sales cycles requiring extended onboarding periods</li>
          <li>Annual recurring revenue models dependent on high retention rates</li>
          <li>Product portfolios requiring strategic alignment with customer business objectives</li>
          <li>Executive teams demanding quantifiable ROI from customer success investments</li>
          <li>Regulatory or compliance requirements necessitating detailed documentation</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Implementation methodology</h2>
        <p className="text-accent">
          Begin with a pilot program encompassing your highest-value accounts to establish
          baseline metrics and refine processes. Develop standardized feedback collection
          instruments tailored to different stakeholder roles and organizational levels.
        </p>
        <p className="text-accent">
          Establish clear success criteria including feedback response rates, issue resolution
          timelines, and correlation with renewal outcomes. Create internal training programs
          that equip CSMs with skills necessary for strategic customer engagement and
          data-driven advisory services.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">
            View enterprise pricing
          </Link>
          <Link href="/docs" className="text-accent underline-offset-4 hover:underline">
            Review implementation guides
          </Link>
          <Link href="/contact" className="text-accent underline-offset-4 hover:underline">
            Schedule consultation
          </Link>
        </div>
      </section>
    </article>
  )
}