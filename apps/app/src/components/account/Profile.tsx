"use client";

import OAuthConnections from "./OAuthConnections";
import DeleteAccount from "./DeleteAccount";
import AvatarUpload from "./AvatarUpload";
import AccountDetails from "./AccountDetails";
import Passkeys, { type PasskeyItem } from "./Passkeys";
import SectionCard from "@/components/settings/global/SectionCard";

type ProfileProps = {
  initialUser?: { name?: string; email?: string; image?: string | null } | null;
  initialAccounts?: { id: string; accountId: string; providerId: string }[];
  initialPasskeys?: PasskeyItem[];
};

export default function Profile({
  initialUser,
  initialAccounts,
  initialPasskeys,
}: ProfileProps) {
  return (
    <div className="flex flex-col gap-8">
      <SectionCard title="Personal details" contentClassName="py-0">
        <div className="-mx-5 divide-y divide-border/50 [&>*]:px-5">
          <AvatarUpload initialUser={initialUser} />
          <AccountDetails initialUser={initialUser} />
        </div>
      </SectionCard>
      <SectionCard title="Sign-in methods" contentClassName="py-0">
        <div className="-mx-5 divide-y divide-border/50 [&>*]:px-5">
          <Passkeys initialPasskeys={initialPasskeys} />
          <OAuthConnections initialAccounts={initialAccounts} />
        </div>
      </SectionCard>
      <DeleteAccount />
    </div>
  );
}
