import { buildSignature } from "@/lib/share";
import CopyButton from "./copy";
import ShareCard from "./card";

export default function Signature({
  name,
  userName,
  boardUrl,
}: {
  name: string;
  userName: string;
  boardUrl: string;
}) {
  const signature = buildSignature(userName, name, boardUrl);
  return (
    <ShareCard
      title="In your email signature"
      description="A small invitation at the end of every conversation."
      footer={
        <>
          <CopyButton text={signature.html} label="Copy HTML" />
          <CopyButton
            text={signature.text}
            html={signature.html}
            label="Copy signature"
          />
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-[11px] text-accent">Signature preview</p>
        <div className="break-words font-[Arial,sans-serif] text-sm leading-[1.6]">
          <strong>
            {userName} · {name}
          </strong>
          <br />
          Help shape what we build next.
          <br />
          <a
            href={boardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Share an idea →
          </a>
        </div>
      </div>
    </ShareCard>
  );
}
