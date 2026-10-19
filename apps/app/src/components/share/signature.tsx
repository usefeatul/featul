import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { buildSignature } from "@/lib/share";
import CopyButton from "./copy";
import ShareSection from "./section";
import { shareCardClass } from "./styles";

export default function Signature({
  name,
  userName,
  userImage,
  boardUrl,
}: {
  name: string;
  userName: string;
  userImage?: string | null;
  boardUrl: string;
}) {
  const signature = buildSignature(userName, name, boardUrl, userImage);
  return (
    <ShareSection
      title="Email signature"
      description="A quiet invite at the bottom of every email you send."
    >
      <div className={shareCardClass}>
        <div className="px-5 py-6">
          <p className="text-sm text-accent">Thanks, talk soon.</p>
          <div className="mt-5 flex items-center gap-3">
            <Avatar className="size-10">
              {userImage ? <AvatarImage src={userImage} alt="" /> : null}
              <AvatarFallback className="text-xs font-medium">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 border-l border-border/60 pl-3 text-sm leading-6">
              <p className="font-medium">
                {userName} · {name}
              </p>
              <a
                href={boardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Help shape what we build next →
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-5 py-3">
          <p className="text-xs text-accent">
            Paste into your Gmail, Outlook, or Apple Mail signature settings.
          </p>
          <CopyButton
            text={signature.text}
            html={signature.html}
            label="Copy signature"
            primary
          />
        </div>
      </div>
    </ShareSection>
  );
}
