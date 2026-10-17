"use client";

import type { ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@featul/ui/components/tabs";

export default function ShareTabs({
  share,
  messages,
  embed,
}: {
  share: ReactNode;
  messages: ReactNode;
  embed: ReactNode;
}) {
  const sections = [
    { value: "share", label: "Share", content: share },
    {
      value: "messages",
      label: "Messages",
      content: messages,
    },
    { value: "embed", label: "Embed", content: embed },
  ];

  return (
    <Tabs defaultValue="share" className="gap-6">
      <TabsList aria-label="Sharing tools" className="gap-5">
        {sections.map(({ value, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="gap-2 px-1 text-accent data-[active]:text-foreground"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map(({ value, content }) => (
        <TabsContent
          key={value}
          value={value}
          keepMounted
          className="data-[hidden]:hidden"
        >
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
