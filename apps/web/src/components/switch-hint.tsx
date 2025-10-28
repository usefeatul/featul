"use client";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
  value: "dashboard" | "roadmap" | "changelog";
  initialValue: "dashboard" | "roadmap" | "changelog";
};

// A minimal coach mark that briefly hints users can click to switch views.
export function SwitchHint({ className, value, initialValue }: Props) {
  const [show, setShow] = useState(false);

  // Show only if not previously dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("fg_switch_hint_dismissed") === "true";
      setShow(!dismissed);
    } catch {
      setShow(true);
    }
  }, []);

  // Auto-hide after a short timeout
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(t);
  }, [show]);

  // Hide permanently after the first view change
  useEffect(() => {
    if (value !== initialValue) {
      setShow(false);
      try {
        localStorage.setItem("fg_switch_hint_dismissed", "true");
      } catch {}
    }
  }, [value, initialValue]);

  if (!show) return null;

  return (
    <div className={["flex items-center justify-center", className].filter(Boolean).join(" ")}>
      <p className="text-xs text-muted-foreground italic font-mono animate-pulse">
        Click a view to preview core features
      </p>
    </div>
  );
}