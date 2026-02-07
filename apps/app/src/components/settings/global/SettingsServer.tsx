import React from "react";
import BrandingSection from "../branding/Branding";
import TeamSection from "../team/Team";
import FeedbackSection from "../feedback/Feedback";
import ChangelogSection from "../changelog/Changelog";
import BillingSection from "../billing/Billing";
import DomainSection from "../domain/Domain";
import IntegrationsSection from "../integrations/Integrations";

import DataSection from "../data/Data";
import WorkspaceSection from "../workspace/Workspace";
import type { DomainInfo } from "../../../types/domain";
import type { Integration } from "@/hooks/useIntegrations";
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
  initialTimezone?: string;
  initialTeam?: { members: Member[]; invites: Invite[]; meId: string | null };
  initialChangelogVisible?: boolean;
  initialChangelogTags?: ChangelogTag[];
  initialHidePoweredBy?: boolean;
  initialPlan?: string;
  initialBrandingConfig?: BrandingConfig | null;
  initialWorkspaceName?: string;
  initialDomainInfo?: DomainInfo;
  initialDefaultDomain?: string;
  initialFeedbackBoards?: FeedbackBoardSettings[];
  initialFeedbackTags?: FeedbackTag[];
  initialIntegrations?: Integration[];
};

export default function SettingsServer({
  slug,
  initialWorkspaceId,
  selectedSection,
  initialTimezone,
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
  initialIntegrations,
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
          initialTimezone={initialTimezone}
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
          initialIntegrations={initialIntegrations}
        />
      </div>
    </section>
  );
}

function SectionRenderer({
  slug,
  initialWorkspaceId,
  section,
  initialTimezone,
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
  initialIntegrations,
}: {
  slug: string;
  initialWorkspaceId?: string;
  section: string;
  initialTimezone?: string;
  initialTeam?: { members: Member[]; invites: Invite[]; meId: string | null };
  initialChangelogVisible?: boolean;
  initialChangelogTags?: ChangelogTag[];
  initialHidePoweredBy?: boolean;
  initialPlan?: string;
  initialBrandingConfig?: BrandingConfig | null;
  initialWorkspaceName?: string;
  initialDomainInfo?: DomainInfo;
  initialDefaultDomain?: string;
  initialFeedbackBoards?: FeedbackBoardSettings[];
  initialFeedbackTags?: FeedbackTag[];
  initialIntegrations?: Integration[];
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
      return <BillingSection currentPlan={initialPlan} workspaceId={initialWorkspaceId} />;
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
      return <IntegrationsSection slug={slug} plan={initialPlan} initialIntegrations={initialIntegrations} />;

    case "workspace":
      return (
        <WorkspaceSection
          slug={slug}
          workspaceId={initialWorkspaceId}
          workspaceName={initialWorkspaceName}
          timezone={initialTimezone}
        />
      );
    case "data":
      return (
        <DataSection
          slug={slug}
        />
      );
    default:
      return (
        <div className="bg-card rounded-md  border p-4">Unknown section</div>
      );
  }
}
