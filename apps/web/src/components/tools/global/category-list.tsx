import Link from 'next/link'
import { TOOL_CATEGORIES } from '@/types/tools'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from '@feedgot/ui/components/card'
import { BarChart3, TrendingUp, User, CircleDollarSign, Tag, LineChart, MessageSquare, CornerUpRight } from 'lucide-react'

function getCategoryIcon(slug: string) {
  switch (slug) {
    case 'product-feature-analytics':
      return BarChart3
    case 'revenue-growth':
      return TrendingUp
    case 'customer-metrics':
      return User
    case 'financial-health':
      return CircleDollarSign
    case 'pricing-valuation':
      return Tag
    case 'performance-roi':
      return LineChart
    default:
      return MessageSquare
  }
}

export default function CategoryList() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOOL_CATEGORIES.map((cat) => (
        <Link key={cat.slug} href={`/tools/categories/${cat.slug}`} className="group block">
          <Card className="h-full overflow-hidden transition group hover:shadow-sm hover:ring-border bg-background">
            <CardHeader className="p-6 sm:p-8">
              {(() => {
                const Icon = getCategoryIcon(cat.slug)
                return <Icon className="size-5 text-black mb-3" />
              })()}
              <CardTitle className="font-medium text-lg">{cat.name}</CardTitle>
              <CardDescription className="mt-1 text-zinc-500">{cat.description}</CardDescription>
            </CardHeader>
            <CardFooter className="px-6 sm:px-8 pt-0 justify-between">
              <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
              <span className="inline-flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Explore
                <CornerUpRight className="ml-1 h-4 w-4" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}