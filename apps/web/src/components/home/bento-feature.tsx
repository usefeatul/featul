import { Card } from "@feedgot/ui/components/card";
import { Container } from "../container";
import { CalendarCheck, Sparkles, Target } from "lucide-react";

export default function BentoFeature() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section>
        <div className="py-24">
          <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
            <div>
              <h2 className="text-foreground max-w-2xl text-balance text-3xl sm:text-4xl font-semibold">
                Empowering developers with AI-driven solutions
              </h2>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden p-6">
                <Target className="text-primary size-5" />
                <h3 className="text-foreground mt-5 text-lg font-semibold">
                  AI Code Generation
                </h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Our advanced AI models transform natural language into
                  production-ready code.
                </p>
              </Card>

              <Card className="group overflow-hidden px-6 pt-6">
                <CalendarCheck className="text-primary size-5" />
                <h3 className="text-foreground mt-5 text-lg font-semibold">
                  Intelligent Code Review
                </h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  Our AI analyzes your code for bugs, security issues, and
                  optimization opportunities.
                </p>
              </Card>
              <Card className="group overflow-hidden px-6 pt-6">
                <Sparkles className="text-primary size-5" />
                <h3 className="text-foreground mt-5 text-lg font-semibold">
                  Contextual AI Assistant
                </h3>
                <p className="text-muted-foreground mt-3 text-balance">
                  A personalized AI companion that understands your codebase and
                  helps solve complex...
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
