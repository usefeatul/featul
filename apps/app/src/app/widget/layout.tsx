export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="widget-shell min-h-screen bg-[#171717] text-white antialiased">
      <style>{`
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
