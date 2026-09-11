"use client";

import { MarketingContainer } from "@/components/layout/container";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { motion, useReducedMotion } from "framer-motion";

const CONTACT_EMAIL = "contact@featul.com";
const BOOK_A_DEMO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Book a demo")}`;

const productMoments = [
  "merged two requests.",
  "moved it to planned.",
  "published a changelog.",
  "notified everyone who voted.",
  "linked the Linear issue.",
  "closed the loop.",
  "tagged it as shipped.",
  "replied to a voter.",
];

function MomentTicker() {
  const reduceMotion = useReducedMotion();
  const loop = [...productMoments, ...productMoments];

  return (
    <div
      aria-hidden
      className="relative hidden h-[19rem] w-[18rem] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] lg:block xl:w-[22rem]"
    >
      <motion.ul
        className="select-none text-right font-heading text-2xl font-medium leading-10 tracking-tight text-accent"
        animate={reduceMotion ? undefined : { y: ["0%", "-50%"] }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 22,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }
        }
      >
        {loop.map((moment, index) => (
          <li key={`${moment}-${index}`} className="py-0.5">
            {moment}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export function ConversionHero() {
  return (
    <section
      className="relative z-10 bg-stone-900 py-16 text-white sm:py-20 md:py-24"
      data-component="ConversionHero"
    >
      <MarketingContainer>
        <div className="mx-auto w-full px-1 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-center lg:gap-20">
            <div className="min-w-0 max-w-2xl flex-1">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                From upvote to shipped
              </p>
              <h2 className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.08]">
                Build better products
                <span className="mt-1 block text-primary">
                  from customer feedback.
                </span>
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-300 sm:text-lg">
                Collect, prioritize, and ship, then{" "}
                <span className="text-primary">close the loop</span>. Set up in
                minutes. Keep users in the loop as you ship.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  variant="card"
                  size="lg"
                  className="h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto"
                >
                  <Link
                    href={BOOK_A_DEMO_HREF}
                    aria-label="Book a demo"
                    data-sln-event="cta: book a demo clicked"
                  >
                    Book a demo
                  </Link>
                </Button>
              </div>
            </div>

            <MomentTicker />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
