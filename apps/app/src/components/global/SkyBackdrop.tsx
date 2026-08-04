type SkyBackdropProps = {
  className?: string;
};

export function SkyBackdrop({ className }: SkyBackdropProps) {
  return (
    <div
      aria-hidden
      className={className ?? "absolute inset-0 bg-cover bg-[position:center_top]"}
      style={{ backgroundImage: "url(/image/sky.PNG)" }}
    />
  );
}
