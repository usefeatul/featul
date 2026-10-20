import { Button } from "@featul/ui/components/button";
import { IntegrationIcon } from "@/components/global/icons";
import SectionCard from "../global/SectionCard";
import SettingsEntry from "../global/entry";

export default function SuggestIntegrationCard() {
  return (
    <SectionCard title="Make it work for you" contentClassName="py-0">
      <SettingsEntry
        icon={<IntegrationIcon className="size-5 text-primary" />}
        title="Missing a connection?"
        description="Tell us which tool would make your feedback workflow better."
      >
        <Button asChild variant="outline" size="sm">
          <a
            href="https://feedback.featul.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Suggest integration
          </a>
        </Button>
      </SettingsEntry>
    </SectionCard>
  );
}
