"use client";

import {
  BoardIcon,
  RoadmapIcon,
  ChangelogIcon,
  BookIcon,
  WidgetIcon,
} from "@/components/global/icons";

import Image from "next/image";
import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs } from "radix-ui";
import {
  MarketingContainer,
  MarketingRail,
} from "@/components/layout/container";
import feedback from "../../../public/image/feedback.png";
import roadmap from "../../../public/image/roadmap.png";
import changelog from "../../../public/image/changelog.png";
import helpCenter from "../../../public/image/help-center.png";
import widget from "../../../public/image/widget.png";
import { selectorSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { DitherBackdrop } from "./backdrop";

const previews = [
  {
    id: "feedback",
    label: "Feedback",
    icon: BoardIcon,
    iconColor: "#4189e2",
    image: feedback,
    alt: "Featul feedback workspace with customer requests, votes, comments, and statuses",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: RoadmapIcon,
    iconColor: "#3b95af",
    image: roadmap,
    alt: "Featul roadmap showing customer requests organized into planned, progress, and review columns",
  },
  {
    id: "changelog",
    label: "Changelog",
    icon: ChangelogIcon,
    iconColor: "#837ec8",
    image: changelog,
    alt: "Featul changelog workspace for writing and publishing product updates",
  },
  {
    id: "help-center",
    label: "Help Center",
    icon: BookIcon,
    iconColor: "#d9822b",
    image: helpCenter,
    alt: "Featul public help center article with collections, a table of contents, and step-by-step content",
  },
  {
    id: "widget",
    label: "Widget",
    icon: WidgetIcon,
    iconColor: "#3fa66b",
    image: widget,
    alt: "Featul feedback widget open on a site, showing the latest update, a feedback box, and roadmap items",
  },
];

export function Showcase() {
  const [selected, setSelected] = useState("feedback");
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const highlightId = useId();
  const reduceMotion = useReducedMotion();
  const highlighted = hovered ?? focused ?? selected;

  return (
    <Tabs.Root
      value={selected}
      onValueChange={setSelected}
      className="relative isolate mt-3 sm:mt-4"
      data-component="Showcase"
    >
      <DitherBackdrop multicolor className="top-16 sm:top-0" />
      <svg
        aria-hidden
        viewBox="0 0 720 56"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 hidden h-14 w-full max-w-[720px] -translate-x-1/2 fill-background sm:block"
      >
        <path d="M0 0C40 0 40 56 96 56H624C680 56 680 0 720 0Z" />
      </svg>
      <Tabs.List
        aria-label="Explore Featul"
        className="mx-auto flex h-14 w-fit max-w-full items-center justify-center gap-1 sm:gap-3 lg:gap-4"
        onPointerLeave={() => setHovered(null)}
        onKeyDown={() => setHovered(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocused(null);
          }
        }}
      >
        {previews.map(({ id, label, icon: Icon, iconColor }) => (
          <Tabs.Trigger
            key={id}
            value={id}
            aria-label={label}
            className="relative isolate inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md px-2 py-2 text-xs text-accent transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary data-[state=active]:text-foreground sm:px-3 sm:text-sm"
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") setHovered(id);
            }}
            onFocus={() => setFocused(id)}
          >
            {highlighted === id ? (
              <motion.span
                aria-hidden
                layoutId={reduceMotion ? undefined : highlightId}
                initial={false}
                className="pointer-events-none absolute inset-0 -z-10 bg-muted"
                style={{ borderRadius: 6 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 36 }
                }
              />
            ) : null}
            <Icon aria-hidden className="hidden size-4 sm:block" style={{ color: iconColor }} />
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {previews.map((preview, index) => (
        <Tabs.Content
          key={preview.id}
          value={preview.id}
          className="pb-12 pt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:pb-16 sm:pt-12 lg:pb-20"
        >
          <MarketingContainer>
            <MarketingRail>
              <div
                className={cn(
                  selectorSurfaceClass,
                  "overflow-hidden rounded-xl to-[color-mix(in_oklab,var(--card),var(--foreground)_3%)] p-1 supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*3.5)] sm:rounded-2xl sm:supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*4)]",
                )}
              >
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0.85 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                  className="aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={preview.image}
                    alt={preview.alt}
                    quality={100}
                    priority={index === 0}
                    sizes="(max-width: 639px) calc(90vw - 32px), (max-width: 1023px) calc(100vw - 144px), (max-width: 1151px) calc(100vw - 160px), (max-width: 1279px) 992px, 976px"
                    placeholder="blur"
                    className="block h-full w-full object-contain"
                  />
                </motion.div>
              </div>
            </MarketingRail>
          </MarketingContainer>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
