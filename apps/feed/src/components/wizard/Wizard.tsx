"use client";

import { useWizardLogic } from "../../hooks/useWizardLogic";
import { motion } from "framer-motion";
import LeftSideImage from "./LeftSideImage";
import WizardForm from "./WizardForm";

export default function WorkspaceWizard({
  className = "",
}: {
  className?: string;
}) {
  const {
    name,
    setName,
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
  } = useWizardLogic();

  return (
    <div className={`w-full max-w-[1080px] mx-auto md:grid md:grid-cols-2 items-center ${className}`}>
      <LeftSideImage />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        <WizardForm
          name={name}
          setName={setName}
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
        />
      </motion.div>
    </div>
  );
}
