import Image from "next/image";

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-[100vh] bottom-0 overflow-hidden">
      <Image
        src="/image/herosky.png"
        alt=""
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-[center_15%]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--hero-sky-banner)_0%,transparent_18%)] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,oklch(0.975_0.001_100)_100%)]" />

      <div
        className="absolute -bottom-8 -left-16 h-56 w-72 rounded-full opacity-30 blur-3xl sm:h-72 sm:w-96"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.12 350 / 0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-10 -right-12 h-64 w-80 rounded-full opacity-25 blur-3xl sm:h-80 sm:w-96"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.14 145 / 0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
