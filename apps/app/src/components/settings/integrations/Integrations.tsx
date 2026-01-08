import React from "react"
import SectionCard from "../global/SectionCard"
import { CardFooter } from "@featul/ui/components/card"
import { ShieldIcon } from "@featul/ui/icons/shield"
import SlackCard from "./SlackCard"
import DiscordCard from "./DiscordCard"
import SuggestIntegrationCard from "./SuggestIntegrationCard"

export default function IntegrationsSection() {
  return (
    <SectionCard title="Available Integrations" description="Connect your integrations here.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SlackCard />
        <DiscordCard />
        <div className="md:col-span-1">
          <SuggestIntegrationCard />
        </div>
      </div>

      <CardFooter className="mt-2">
        <div className="w-full rounded-md  border bg-green-50 text-green-700 text-sm px-3 py-2 flex items-center gap-2">
          <ShieldIcon className="size-4 text-green-600" />
          <span>Integrations are only available on our paid plans.</span>
        </div>
      </CardFooter>
    </SectionCard>
  )
}
