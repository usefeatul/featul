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
          font-size: 14px;
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
