import React from "react"
import SectionCard from "../global/SectionCard"
import PlanNotice from "../global/PlanNotice"

import SlackCard from "./SlackCard"
import DiscordCard from "./DiscordCard"
import SuggestIntegrationCard from "./SuggestIntegrationCard"

type Props = {
  slug: string
  plan?: string
}

export default function IntegrationsSection({ slug, plan }: Props) {
  return (
    <SectionCard title="Available Integrations" description="Connect your integrations here.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SlackCard />
        <DiscordCard />
        <div className="md:col-span-1">
          <SuggestIntegrationCard />
        </div>
      </div>

      <div className="mt-4">
        <PlanNotice 
          slug={slug} 
          plan={plan} 
          feature="integrations" 
        />
      </div>
    </SectionCard>
  )
}
