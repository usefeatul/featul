import React from "react";
import BrandingSection from "../branding/Branding";
import TeamSection from "../team/Team";
import FeedbackSection from "../feedback/Feedback";
import ChangelogSection from "../changelog/Changelog";
import BillingSection from "../billing/Billing";
import DomainSection from "../domain/Domain";
import IntegrationsSection from "../integrations/Integrations";

import DataSection from "../data/Data";
import BoardSettings from "../board/Board";
import type { Member, Invite } from "../../../types/team";
import type { BrandingConfig } from "../../../types/branding";
import type { FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle";
import type { FeedbackTag } from "../feedback/ManageTags";
import type { ChangelogTag } from "../changelog/ChangelogTags";
import { SECTIONS } from "../../../config/sections";
import SettingsTabsHeader from "./SettingsTabsHeader";

type Props = {
  slug: string;
  initialWorkspaceId?: string;
  selectedSection?: string;
  initialTeam?: { members: Member[]; invites: Invite[]; meId: string | null };
  initialChangelogVisible?: boolean;
  initialChangelogTags?: ChangelogTag[];
  initialHidePoweredBy?: boolean;
  initialPlan?: string;
  initialBrandingConfig?: BrandingConfig | null;
  initialWorkspaceName?: string;
  initialDomainInfo?: any;
  initialDefaultDomain?: string;
  initialFeedbackBoards?: FeedbackBoardSettings[];
  initialFeedbackTags?: FeedbackTag[];
};

export default function SettingsServer({
  slug,
  initialWorkspaceId,
  selectedSection,
  initialTeam,
  initialChangelogVisible,
  initialChangelogTags,
  initialHidePoweredBy,
  initialPlan,
  initialBrandingConfig,
  initialWorkspaceName,
  initialDomainInfo,
  initialDefaultDomain,
  initialFeedbackBoards,
  initialFeedbackTags,
}: Props) {
  const sections = SECTIONS;
  const selected: string =
    typeof selectedSection === "string" && selectedSection
      ? selectedSection
      : sections[0]?.value || "branding";
  return (
    <section className="space-y-4 mt-6.5">
      <SettingsTabsHeader slug={slug} selected={selected} />
      <div className="mt-2">
        <SectionRenderer
          slug={slug}
          initialWorkspaceId={initialWorkspaceId}
          section={selected}
          initialTeam={initialTeam}
          initialChangelogVisible={initialChangelogVisible}
          initialChangelogTags={initialChangelogTags}
          initialHidePoweredBy={initialHidePoweredBy}
          initialPlan={initialPlan}
          initialBrandingConfig={initialBrandingConfig}
          initialWorkspaceName={initialWorkspaceName}
          initialDomainInfo={initialDomainInfo}
          initialDefaultDomain={initialDefaultDomain}
          initialFeedbackBoards={initialFeedbackBoards}
          initialFeedbackTags={initialFeedbackTags}
        />
      </div>
    </section>
  );
}

function SectionRenderer({
  slug,
  initialWorkspaceId,
  section,
  initialTeam,
  initialChangelogVisible,
  initialChangelogTags,
  initialHidePoweredBy,
  initialPlan,
  initialBrandingConfig,
  initialWorkspaceName,
  initialDomainInfo,
  initialDefaultDomain,
  initialFeedbackBoards,
  initialFeedbackTags,
}: {
  slug: string;
  initialWorkspaceId?: string;
  section: string;
  initialTeam?: { members: Member[]; invites: Invite[]; meId: string | null };
  initialChangelogVisible?: boolean;
  initialChangelogTags?: ChangelogTag[];
  initialHidePoweredBy?: boolean;
  initialPlan?: string;
  initialBrandingConfig?: BrandingConfig | null;
  initialWorkspaceName?: string;
  initialDomainInfo?: any;
  initialDefaultDomain?: string;
  initialFeedbackBoards?: FeedbackBoardSettings[];
  initialFeedbackTags?: FeedbackTag[];
}) {

  switch (section) {
    case "branding":
      return (
        <BrandingSection
          slug={slug}
          initialHidePoweredBy={initialHidePoweredBy}
          initialPlan={initialPlan}
          initialConfig={initialBrandingConfig}
          initialWorkspaceName={initialWorkspaceName}
        />
      );
    case "team":
      return (
        <TeamSection
          slug={slug}
          initialMembers={initialTeam?.members}
          initialInvites={initialTeam?.invites}
          initialMeId={initialTeam?.meId}
          initialPlan={initialPlan}
        />
      );
    case "feedback":
      return (
        <FeedbackSection
          slug={slug}
          plan={initialPlan}
          initialBoards={initialFeedbackBoards}
          initialTags={initialFeedbackTags}
        />
      );
    case "board":
      return (
        <BoardSettings
          slug={slug}
          plan={initialPlan}
          initialBoards={initialFeedbackBoards}
        />
      );
    case "changelog":
      return (
        <ChangelogSection
          slug={slug}
          initialIsVisible={initialChangelogVisible}
          initialPlan={initialPlan}
          initialTags={initialChangelogTags}
        />
      );
    case "billing":
      return <BillingSection />;
    case "domain":
      return (
        <DomainSection
          slug={slug}
          initialPlan={initialPlan}
          initialInfo={initialDomainInfo}
          initialDefaultDomain={initialDefaultDomain}
        />
      );
    case "integrations":
      return <IntegrationsSection />;

    case "data":
      return (
        <DataSection
          slug={slug}
          workspaceId={initialWorkspaceId}
          workspaceName={initialWorkspaceName}
        />
      );
    default:
      return (
        <div className="bg-card rounded-md  border p-4">Unknown section</div>
      );
  }
}
