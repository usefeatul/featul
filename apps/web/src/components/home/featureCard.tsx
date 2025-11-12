import { Card } from "@feedgot/ui/components/card";
import { Container } from "../global/container";
import LoveIcon from "@feedgot/ui/icons/love";
import FaceIcon from "@feedgot/ui/icons/face";
import FoundedIcon from "@feedgot/ui/icons/founded";

export default function FeatureCard() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section>
        <div>
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mt-10 sm:mt-16 grid grid-cols-1 gap-3 sm:gap-4">
              <Card className="overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
                <LoveIcon className="text-primary size-5" />
                <h3 className="text-foreground text-base sm:text-lg font-semibold">
                  Human-coded
                </h3>
                <p className="text-accent text-balance text-sm sm:text-base">
                  Hand-built and maintained by seasoned engineers. Secure, reliable,
                  and fast—crafted with care, not vibes.
                </p>
              </Card>

              <Card className="group overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
                <FaceIcon className="text-primary size-5" />
                <h3 className="text-foreground text-base sm:text-lg font-semibold">
                  Advanced bot detection
                </h3>
                <p className="text-accent text-balance text-sm sm:text-base">
                  In an AI-heavy web, keeping bots out matters. We aim for
                  top-tier detection to keep your analytics trustworthy.
                </p>
              </Card>
              <Card className="group overflow-hidden p-4 sm:p-6 flex flex-col items-start gap-2">
                <FoundedIcon className="text-primary size-5" />
                <h3 className="text-foreground text-base sm:text-lg font-semibold">
                  Founded in 2024
                </h3>
                <p className="text-accent text-balance text-sm sm:text-base">
                  Since 2024, Feedgot has grown into a customer feedback platform,
                  processing hundreds of feedback submissions.
                </p>
                <div className="mask-b-from-50 -mx-2 -mt-2 px-2 pt-2"></div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
