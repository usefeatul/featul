import { Card } from "@oreilla/ui/components/card";
import { Container } from "../global/container";
import { LoveIcon } from "@oreilla/ui/icons/love";
import FaceIcon from "@oreilla/ui/icons/face";
import FoundedIcon from "@oreilla/ui/icons/founded";

export default function FeatureCard({ withinContainer = true }: { withinContainer?: boolean }) {
  const content = (
    <section>
      <div>
        <div className="mt-2 sm:mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          <Card className="overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
            <LoveIcon className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md  bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5" />
            <h3 className="text-foreground text-base sm:text-lg font-semibold">Human-coded</h3>
            <p className="text-accent text-balance text-sm sm:text-base sm:max-w-[40ch]">
              Hand-built and maintained by seasoned engineers. Secure, reliable,
              and fast—crafted with care, not vibes.
            </p>
          </Card>

          <Card className="group overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
            <FaceIcon className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md  bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5" />
            <h3 className="text-foreground text-base sm:text-lg font-semibold">Advanced bot detection</h3>
            <p className="text-accent text-balance text-sm sm:text-base sm:max-w-[40ch]">
              In an AI-heavy web, keeping bots out matters. We aim for
              top-tier detection to keep your analytics trustworthy.
            </p>
          </Card>

          <Card className="group overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
            <FoundedIcon className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md  bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5" />
            <h3 className="text-foreground text-base sm:text-lg font-semibold">Founded in 2024</h3>
            <p className="text-accent text-balance text-sm sm:text-base sm:max-w-[40ch]">
              Since 2024, Feedgot has grown into a customer feedback platform,
              processing hundreds of feedback submissions.
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
