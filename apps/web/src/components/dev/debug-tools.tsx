"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@feedgot/ui/components/button";

type Severity = "info" | "warn" | "error";
type Diagnostic = {
  id: string;
  message: string;
  severity: Severity;
  rect?: DOMRect;
  component?: string;
};

function usePersistentBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(defaultValue);

  // Read persisted value after mount to avoid SSR/CSR mismatch
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(raw === "true");
    } catch {}
    // only re-run if key changes
  }, [key]);

  // Persist changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {}
  }, [key, value]);

  return [value, setValue] as const;
}

function nearestGridDelta(px: number, grid = 8) {
  const mod = px % grid;
  return Math.min(mod, grid - mod);
}

function parseRGB(color: string | null): [number, number, number] | null {
  if (!color) return null;
  const m = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-1]?(?:\.\d+)?))?\)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function luminance([r, g, b]: [number, number, number]) {
  const srgb = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return (srgb[0] ?? 0) * 0.2126 + (srgb[1] ?? 0) * 0.7152 + (srgb[2] ?? 0) * 0.0722;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]) {
  const L1 = luminance(fg) + 0.05;
  const L2 = luminance(bg) + 0.05;
  const ratio = L1 > L2 ? L1 / L2 : L2 / L1;
  return ratio;
}

function collectDiagnostics(): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const main = document.querySelector("main") ?? document.body;
  const sections = Array.from(main.querySelectorAll("section"));

  // 1) Baseline grid and spacing checks (measure content area, not full section box)
  let prevContentBottom: number | null = null;
  const nodesForGrid = sections.length ? sections : Array.from(main.children) as HTMLElement[];
  const getComponentName = (el: Element | null): string | undefined => {
    if (!el) return undefined;
    const tagged = el.closest('[data-component]') as HTMLElement | null;
    return tagged?.getAttribute('data-component') ?? undefined;
  };

  nodesForGrid.forEach((el, idx) => {
    const target = (el.firstElementChild as HTMLElement) ?? (el as HTMLElement);
    const rect = target.getBoundingClientRect();
    const styles = getComputedStyle(target);
    const padL = parseFloat(styles.paddingLeft || "0");
    const padR = parseFloat(styles.paddingRight || "0");
    const padT = parseFloat(styles.paddingTop || "0");
    const padB = parseFloat(styles.paddingBottom || "0");
    const borderL = parseFloat(styles.borderLeftWidth || "0");
    const borderR = parseFloat(styles.borderRightWidth || "0");
    const borderT = parseFloat(styles.borderTopWidth || "0");
    const borderB = parseFloat(styles.borderBottomWidth || "0");

    const contentLeft = rect.left + padL + borderL;
    const contentRight = rect.right - padR - borderR;
    const contentTop = rect.top + padT + borderT;
    const contentBottom = rect.bottom - padB - borderB;

    const leftDelta = nearestGridDelta(contentLeft);
    const rightDelta = nearestGridDelta(contentRight);
    const component = getComponentName(target);
    if (leftDelta > 3.5) {
      diags.push({ id: `grid-left-${idx}`, message: `Left content edge off 8px grid by ~${leftDelta.toFixed(1)}px`, severity: "warn", rect, component });
    }
    if (rightDelta > 3.5) {
      diags.push({ id: `grid-right-${idx}`, message: `Right content edge off 8px grid by ~${rightDelta.toFixed(1)}px`, severity: "warn", rect, component });
    }
    if (prevContentBottom !== null) {
      const visualGap = contentTop - prevContentBottom; // accounts for inner paddings/borders
      const gapDelta = nearestGridDelta(visualGap);
      if (visualGap < 24) {
        diags.push({ id: `spacing-small-${idx}`, message: `Section spacing likely tight: ~${Math.round(visualGap)}px (target ≥24px)`, severity: "warn", rect, component });
      } else if (gapDelta > 3.5) {
        diags.push({ id: `spacing-grid-${idx}`, message: `Section spacing not on 8px rhythm: offset ~${gapDelta.toFixed(1)}px`, severity: "info", rect, component });
      }
    }
    prevContentBottom = contentBottom;
  });

  // 2) Safe area margins (content too close to viewport edges)
  nodesForGrid.forEach((el, idx) => {
    const target = (el.firstElementChild as HTMLElement) ?? (el as HTMLElement);
    const rect = target.getBoundingClientRect();
    const styles = getComputedStyle(target);
    const padL = parseFloat(styles.paddingLeft || "0");
    const padR = parseFloat(styles.paddingRight || "0");
    const borderL = parseFloat(styles.borderLeftWidth || "0");
    const borderR = parseFloat(styles.borderRightWidth || "0");
    const contentLeft = rect.left + padL + borderL;
    const contentRight = rect.right - padR - borderR;
    const component = getComponentName(target);
    if (contentLeft < 12) {
      diags.push({ id: `safe-left-${idx}`, message: `Content left within 12px of viewport`, severity: "error", rect, component });
    }
    if (window.innerWidth - contentRight < 12) {
      diags.push({ id: `safe-right-${idx}`, message: `Content right within 12px of viewport`, severity: "error", rect, component });
    }
  });

  // 3) Tap target sizes
  const buttons = Array.from(main.querySelectorAll<HTMLElement>("button, [role='button'], a[href]"));
  buttons.forEach((btn, i) => {
    // Skip elements that are not rendered (display:none or collapsed)
    if (btn.getClientRects().length === 0) return;
    const r = btn.getBoundingClientRect();
    if (r.width < 32 || r.height < 32) {
      diags.push({ id: `tap-${i}`, message: `Tap target small (${Math.round(r.width)}×${Math.round(r.height)}px). Aim ≥32×32px`, severity: "warn", rect: r, component: getComponentName(btn) });
    }
  });

  // 4) Horizontal overflow
  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth + 2) {
    diags.push({ id: "overflow-x", message: "Horizontal overflow detected. Some element exceeds viewport width.", severity: "error" });
  }

  // 5) Body text size
  const paragraphs = Array.from(main.querySelectorAll<HTMLElement>("p"));
  paragraphs.slice(0, 40).forEach((p, i) => {
    const size = parseFloat(getComputedStyle(p).fontSize || "0");
    if (size > 0 && size < 14) {
      diags.push({ id: `font-${i}`, message: `Paragraph font-size is ${size}px; consider ≥14px for readability`, severity: "info", rect: p.getBoundingClientRect() });
    }
  });

  // 6) Contrast for buttons/links
  const bodyBg = parseRGB(getComputedStyle(document.body).backgroundColor) || [255, 255, 255];
  buttons.slice(0, 80).forEach((el, i) => {
    const styles = getComputedStyle(el);
    const fg = parseRGB(styles.color);
    const bg = parseRGB(styles.backgroundColor) || bodyBg;
    if (fg && bg) {
      const ratio = contrastRatio(fg, bg);
      if (ratio < 4.5) {
        diags.push({ id: `contrast-${i}`, message: `Low contrast (~${ratio.toFixed(2)}:1). Target ≥4.5:1 for text`, severity: "warn", rect: el.getBoundingClientRect(), component: getComponentName(el) });
      }
    }
  });

  return diags;
}

export function DebugTools() {
  const [showGrid, setShowGrid] = usePersistentBoolean("__debug_grid", false);
  const [showOutline, setShowOutline] = usePersistentBoolean("__debug_outline", false);
  const [showAnalysis, setShowAnalysis] = usePersistentBoolean("__debug_analysis", false);
  const [results, setResults] = useState<Diagnostic[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Toggle global outline via data attribute so scoped CSS can handle it
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (showOutline) {
      root.setAttribute("data-debug-outline", "true");
    } else {
      root.removeAttribute("data-debug-outline");
    }
    return () => {
      root.removeAttribute("data-debug-outline");
    };
  }, [showOutline, mounted]);

  const counts = useMemo(() => {
    return {
      error: results.filter((r) => r.severity === "error").length,
      warn: results.filter((r) => r.severity === "warn").length,
      info: results.filter((r) => r.severity === "info").length,
    };
  }, [results]);

  function analyze() {
    const diags = collectDiagnostics();
    setResults(diags);
    setShowAnalysis(true);
  }

  // Auto re-run analysis when navigating if analysis mode is on
  useEffect(() => {
    if (!mounted) return;
    if (showAnalysis) {
      const diags = collectDiagnostics();
      setResults(diags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, showAnalysis, mounted]);

  function copyReport() {
    const text = results
      .map((r) => `${r.severity.toUpperCase()}: ${r.message}`)
      .join("\n");
    try {
      navigator.clipboard.writeText(text);
    } catch {}
  }

  function resetAll() {
    setShowGrid(false);
    setShowOutline(false);
    setShowAnalysis(false);
    setResults([]);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex gap-2 items-end">
      {mounted && showGrid && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[9999]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 112, 244, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(240, 68, 56, 0.08) 1px, transparent 1px)",
            backgroundSize: "8px 100%, 100% 8px",
          }}
        />
      )}

      {mounted && showAnalysis && results.map((r) =>
        r.rect ? (
          <Fragment key={r.id}>
            <div
              aria-hidden
              className="pointer-events-none fixed z-[9998]"
              style={{
                left: `${Math.max(0, r.rect.left)}px`,
                top: `${Math.max(0, r.rect.top)}px`,
                width: `${Math.max(0, r.rect.width)}px`,
                height: `${Math.max(0, r.rect.height)}px`,
                border: `2px solid ${r.severity === "error" ? "rgba(255,0,0,0.8)" : r.severity === "warn" ? "rgba(255,140,0,0.8)" : "rgba(0,112,244,0.7)"}`,
                boxShadow: "0 0 0 2px rgba(0,0,0,0.05)",
                background: r.severity === "error" ? "rgba(255,0,0,0.06)" : r.severity === "warn" ? "rgba(255,140,0,0.06)" : "rgba(0,112,244,0.06)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none fixed z-[9999] text-[11px]"
              style={{
                left: `${Math.max(0, r.rect.left)}px`,
                top: `${Math.max(0, r.rect.top - 18)}px`,
                padding: "2px 6px",
                borderRadius: "6px",
                color: r.severity === "error" ? "#7f1d1d" : r.severity === "warn" ? "#7c2d12" : "#1e40af",
                background: r.severity === "error" ? "rgba(255,0,0,0.12)" : r.severity === "warn" ? "rgba(255,140,0,0.12)" : "rgba(0,112,244,0.12)",
                border: `1px solid ${r.severity === "error" ? "rgba(255,0,0,0.5)" : r.severity === "warn" ? "rgba(255,140,0,0.5)" : "rgba(0,112,244,0.5)"}`,
                maxWidth: "56ch",
                backdropFilter: "blur(2px)",
              }}
            >
              {r.component ? `[${r.component}] ` : ""}{r.severity.toUpperCase()}: {r.message}
            </div>
          </Fragment>
        ) : null
      )}

      <div className="rounded-md border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-2 shadow-sm min-w-[260px]">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={showGrid ? "default" : "outline"}
            onClick={() => setShowGrid((v) => !v)}
            aria-pressed={showGrid}
            aria-label="Toggle baseline grid overlay"
          >
            {showGrid ? "Grid On" : "Grid Off"}
          </Button>
          <Button
            size="sm"
            variant={showOutline ? "default" : "outline"}
            onClick={() => setShowOutline((v) => !v)}
            aria-pressed={showOutline}
            aria-label="Toggle element outlines"
          >
            {showOutline ? "Outline On" : "Outline Off"}
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={analyze}
            aria-label="Analyze layout for UX issues"
          >
            Analyze Layout
          </Button>
        </div>

        {showAnalysis && (
          <div className="mt-2 text-xs text-accent">
            <div className="flex gap-2 mb-2">
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" />{counts.error} errors</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-orange-400" />{counts.warn} warnings</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" />{counts.info} infos</span>
            </div>
            <ul className="max-h-40 overflow-auto space-y-1 pr-1">
              {results.slice(0, 12).map((r) => (
                <li key={r.id}>
                  <span className={r.severity === "error" ? "text-red-600" : r.severity === "warn" ? "text-orange-600" : "text-blue-600"}>
                    {r.component ? `[${r.component}] ` : ""}{r.severity.toUpperCase()}: {r.message}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={copyReport} aria-label="Copy analysis report">Copy Report</Button>
              <Button size="sm" variant="outline" onClick={resetAll} aria-label="Reset debug toggles">Reset</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebugTools;