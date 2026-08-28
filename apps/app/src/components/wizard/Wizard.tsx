"use client";

import { useWizardLogic } from "../../hooks/useWizardLogic";
import StepWizardForm from "./StepWizardForm";

export default function WorkspaceWizard({
  className = "",
  isFirstWorkspace = false,
}: {
  className?: string;
  isFirstWorkspace?: boolean;
}) {
  const {
    name,
    handleNameChange,
    domain,
    setDomain,
    slug,
    handleSlugChange,
    slugChecking,
    slugAvailable,
    slugLocked,
    timezone,
    setTimezone,
    now,
    isCreating,
    domainValid,
    create,
    isAppCreator,
  } = useWizardLogic({ isFirstWorkspace });

  return (
    <div className={`h-full min-h-0 w-full ${className}`}>
      <StepWizardForm
        name={name}
        setName={handleNameChange}
        domain={domain}
        setDomain={setDomain}
        slug={slug}
        handleSlugChange={handleSlugChange}
        slugChecking={slugChecking}
        slugAvailable={slugAvailable}
        slugLocked={slugLocked}
        timezone={timezone}
        setTimezone={setTimezone}
        now={now}
        isCreating={isCreating}
        domainValid={domainValid}
        create={create}
        isAppCreator={isAppCreator}
      />
    </div>
  );
}
