import { Card } from "@featul/ui/components/card";
import { Container } from "../global/container";
import { DomainIcon } from "@featul/ui/icons/domain";
import { CsvIcon } from "@featul/ui/icons/csv";
import { MemberIcon } from "@featul/ui/icons/member";

export default function FeatureCard({ withinContainer = true }: { withinContainer?: boolean }) {
  const content = (
    <section>
      <div>
        <div className="mt-2 sm:mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          <Card className="overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
            <DomainIcon className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md  bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5" />
            <h3 className="text-foreground text-base sm:text-lg font-semibold">Custom domain and branding</h3>
            <p className="text-accent text-balance text-sm sm:text-base sm:max-w-[40ch]">
              Launch with your domain, logo, colors, and theme.
            </p>
          </Card>

          <Card className="group overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
            <MemberIcon className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md  bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5" opacity={1} />
            <h3 className="text-foreground text-base sm:text-lg font-semibold">Team roles and invites</h3>
            <p className="text-accent text-balance text-sm sm:text-base sm:max-w-[40ch]">
              Invite teammates, set roles, and collaborate in one workspace.
            </p>
          </Card>

          <Card className="group overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
            <CsvIcon className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md  bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5" />
            <h3 className="text-foreground text-base sm:text-lg font-semibold">CSV import and export</h3>
            <p className="text-accent text-balance text-sm sm:text-base sm:max-w-[40ch]">
              Import and export feedback data whenever you need.
            </p>
            <div className="mask-b-from-50 -mx-2 -mt-2 px-2 pt-2"></div>
          </Card>
        </div>
      </div>
    </section>
  );

  if (withinContainer) {
    return (
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">{content}</Container>
    );
  }
  return content;
}
