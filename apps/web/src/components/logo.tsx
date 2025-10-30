import Image from 'next/image'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/logo1.png"
      alt="Feedgot"
      width={24}
      height={24}
      priority
      className={className}
    />
  )
}