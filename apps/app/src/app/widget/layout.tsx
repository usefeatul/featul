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
        .widget-shell .ProseMirror .tableScroll table {
          font-size: 12px;
          line-height: 1.5;
        }
        .widget-shell .ProseMirror .tableScroll td,
        .widget-shell .ProseMirror .tableScroll th {
          min-width: 9rem;
          padding: 0.625rem 0.75rem;
          border-color: rgb(var(--widget-fg) / 0.14);
          overflow-wrap: anywhere;
        }
        .widget-shell .ProseMirror .tableScroll th {
          background: rgb(var(--widget-fg) / 0.04);
        }
        .widget-shell .ProseMirror .tableScroll p {
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
