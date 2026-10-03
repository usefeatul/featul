"use client";

import {
  BoardIcon,
  RoadmapIcon,
  ChangelogIcon,
} from "@/components/global/icons";

import Image from "next/image";
import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs } from "radix-ui";
import { DASHBOARD_BLUR_DATA_URL } from "@/components/layout/sky-banner";
import { DitherBackdrop } from "./backdrop";

const previews = [
  {
    id: "feedback",
    label: "Feedback",
    icon: BoardIcon,
    image: "/image/dashboard.png",
    width: 1762,
    height: 1124,
    alt: "Featul feedback workspace with customer requests, votes, comments, and statuses",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: RoadmapIcon,
    image: "/image/roadmap.png",
    width: 1762,
    height: 1124,
    alt: "Featul roadmap showing customer requests organized into planned, progress, and review columns",
  },
  {
    id: "changelog",
    label: "Changelog",
    icon: ChangelogIcon,
    image: "/image/changelog.png",
    width: 1762,
    height: 1124,
    alt: "Featul changelog workspace for writing and publishing product updates",
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
        className="mx-auto flex h-14 w-fit max-w-full items-center justify-center gap-2 sm:gap-3 lg:gap-4"
        onPointerLeave={() => setHovered(null)}
        onKeyDown={() => setHovered(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocused(null);
          }
        }}
      >
        {previews.map(({ id, label, icon: Icon }) => (
          <Tabs.Trigger
            key={id}
            value={id}
            aria-label={label}
            className="relative isolate inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs text-accent transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary data-[state=active]:text-foreground sm:px-3 sm:text-sm"
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
            <Icon aria-hidden className="size-4" />
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {previews.map((preview, index) => (
        <Tabs.Content
          key={preview.id}
          value={preview.id}
          className="px-3 pb-12 pt-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-10 sm:py-16 lg:px-16 lg:pb-24 lg:pt-20"
        >
          <div className="mx-auto max-w-[1080px] overflow-hidden rounded-xl bg-card p-1 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/40 sm:rounded-2xl sm:p-2">
            <div className="overflow-hidden rounded-lg">
              <Image
                src={preview.image}
                alt={preview.alt}
                width={preview.width}
                height={preview.height}
                quality={100}
                priority={index === 0}
                sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 96px), (max-width: 1207px) calc(100vw - 144px), 1064px"
                placeholder="blur"
                blurDataURL={DASHBOARD_BLUR_DATA_URL}
                className="block h-auto w-full"
              />
            </div>
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
