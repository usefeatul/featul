import Image from 'next/image'

export function Logo({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo1.png"
      alt="oreilla"
      width={size}
      height={size}
      priority
      className={className}
    />
  )
}