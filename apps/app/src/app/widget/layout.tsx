import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="widget-shell h-full min-h-full bg-transparent antialiased">
      <style>{`
        html,
        body {
          height: 100%;
          width: 100%;
          overflow: hidden;
          overscroll-behavior: none;
          background: transparent !important;
          touch-action: manipulation;
        }
        html {
          font-size: 16px;
        }
        /* Shared content design (editor.css) in the widget's own palette. */
        .widget-shell .ProseMirror,
        .dark .widget-shell .ProseMirror {
          --content-fg: rgb(var(--widget-fg));
          --content-body: rgb(var(--widget-fg) / 0.72);
          --content-muted: rgb(var(--widget-fg) / 0.55);
          --content-accent: rgb(var(--widget-fg));
          --content-rule: rgb(var(--widget-fg) / 0.12);
          --content-tint: rgb(var(--widget-fg) / 0.04);
          --content-surface: rgb(var(--widget-fg) / 0.02);
        }
        .widget-shell .ProseMirror :is(.tableScroll, .tableWrapper) table {
          font-size: 12px;
          line-height: 1.5;
        }
        .widget-shell .ProseMirror :is(.tableScroll, .tableWrapper) :is(td, th) {
          padding: 0.625rem 0.75rem;
          overflow-wrap: anywhere;
        }
        .widget-shell .ProseMirror :is(.tableScroll, .tableWrapper) p {
          font-size: inherit;
          line-height: inherit;
        }
        .widget-shell button,
        .widget-shell a,
        .widget-shell select,
        .widget-shell label,
        .widget-shell [role="button"],
        .widget-shell summary {
          cursor: pointer;
        }
        .widget-shell button:disabled,
        .widget-shell a[aria-disabled="true"] {
          cursor: not-allowed;
        }
      `}</style>
      {children}
    </div>
  );
}
