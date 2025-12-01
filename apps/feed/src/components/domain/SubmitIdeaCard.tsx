import Link from "next/link"
import { Button } from "@feedgot/ui/components/button"

export function SubmitIdeaCard({ subdomain, slug }: { subdomain: string; slug: string }) {
  const redirect = `/${subdomain}/${slug}`
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-3 text-sm font-medium">Got an idea?</div>
      <Button asChild className="h-9 w-full bg-primary hover:bg-primary/90 ring-ring/60 hover:ring-ring">
        <Link href={`/auth/sign-in?redirect=${encodeURIComponent(redirect)}`}>Submit a Post</Link>
      </Button>
    </div>
  )
}

