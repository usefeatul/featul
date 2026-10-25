import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { DitherClouds } from "@featul/ui/components/clouds";
import { buildSignature } from "@/lib/share";
import CopyButton from "./copy";
import ShareSection from "./section";

export default function Signature({
  name,
  userName,
  logo,
  boardUrl,
}: {
  name: string;
  userName: string;
  logo?: string | null;
  boardUrl: string;
}) {
  const signature = buildSignature({
    name: userName,
    workspaceName: name,
    url: boardUrl,
    image: logo,
  });
  return (
    <ShareSection
      title="Email signature"
      description="A quiet invite at the bottom of every email you send."
      flush
    >
      <div
        className="grid gap-2 p-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]"
      >
        <div className="flex flex-col p-4 sm:p-5">
          <p className="text-base font-medium">Every email becomes an invite</p>
          <p className="mt-1 text-sm leading-6 text-accent">
            Copy it once and paste it into your email app’s signature
            settings. Works in Gmail, Outlook, and Apple Mail.
          </p>
          <div className="mt-auto pt-5">
            <CopyButton
              text={signature.text}
              html={signature.html}
              label="Copy signature"
              primary
            />
          </div>
        </div>
        <div className="relative isolate flex min-h-44 items-center justify-center overflow-hidden rounded-xl bg-primary p-5 ring-1 ring-inset ring-black/5 sm:p-8 dark:ring-white/10">
          <div aria-hidden className="absolute inset-0 -z-10">
            <DitherClouds primary fit="cover" />
          </div>
          <div className="w-full max-w-sm rounded-xl border border-black/10 bg-card px-5 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_24px_48px_-16px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#151515]">
            <p className="text-sm text-accent">Thanks, talk soon.</p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="size-10 rounded-lg">
                {logo ? <AvatarImage src={logo} alt="" /> : null}
                <AvatarFallback className="rounded-lg text-xs font-medium">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 border-l border-border/60 pl-3 text-sm leading-6">
                <p className="truncate font-medium">
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
        </div>
      </div>
    </ShareSection>
  );
}
