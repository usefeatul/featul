import React from "react"
import SectionCard from "../global/SectionCard"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@feedgot/ui/components/card"
import { Button } from "@feedgot/ui/components/button"
import { SlackIcon } from "@feedgot/ui/icons/slack"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import { ShieldIcon } from "@feedgot/ui/icons/shield"

export default function IntegrationsSection() {
  return (
    <SectionCard title="Available Integrations" description="Connect your integrations here.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1">
                <SlackIcon className="size-5" />
              </span>
              <CardTitle className="text-left">Slack</CardTitle>
            </div>
            <CardDescription className="text-left">Connect your Slack workspace to get notified when a new request is submitted.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto justify-start">
            <Button variant="outline" size="sm" disabled>Connect</Button>
          </CardFooter>
        </Card>

        <Card >
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1">
                <CommentsIcon className="size-5" />
              </span>
              <CardTitle className="text-left">Discord</CardTitle>
            </div>
            <CardDescription className="text-left">Connect your Discord server to get notified when a new request is submitted.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto justify-start">
            <Button variant="outline" size="sm" disabled>Connect</Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1">
                <ShieldIcon className="size-5" />
              </span>
              <CardTitle className="text-left">Integrations?</CardTitle>
            </div>
            <CardDescription className="text-left">Tell us what integrations would help improve your workflow.</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto justify-start">
            <Button variant="outline" size="sm">Suggest Integration</Button>
          </CardFooter>
        </Card>
      </div>

      <CardFooter className="mt-2">
        <div className="w-full rounded-md border bg-green-50 text-green-700 text-sm px-3 py-2 flex items-center gap-2">
          <ShieldIcon className="size-4 text-green-600" />
          <span>Integrations are only available on our paid plans.</span>
        </div>
      </CardFooter>
    </SectionCard>
  )
}
