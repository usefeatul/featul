import Link from 'next/link'
import type { ToolItem } from '@/config/tools'
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@feedgot/ui/components/card'
import { PieChart, TrendingDown, Smile, FileText, CornerUpRight } from 'lucide-react'

function getToolIcon(slug: string) {
  switch (slug) {
    case 'mrr-calculator':
      return PieChart
    case 'churn-calculator':
      return TrendingDown
    case 'nps-calculator':
      return Smile
    case 'feedback-templates':
      return FileText
    default:
      return FileText
  }
}

export default function ToolList({ categorySlug, tools }: { categorySlug: string; tools: ToolItem[] }) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <Link key={tool.slug} href={`/tools/categories/${categorySlug}/${tool.slug}`} className="group block">
          <Card className="h-full overflow-hidden transition group hover:shadow-sm hover:ring-border bg-gray-100">
            <CardHeader className="p-6 sm:p-8">
              {(() => {
                const Icon = getToolIcon(tool.slug)
                return <Icon className="size-5 text-black mb-3" />
              })()}
              <CardTitle className="font-medium text-lg">{tool.name}</CardTitle>
              <CardDescription className="mt-1">{tool.description}</CardDescription>
            </CardHeader>
            <div className="px-6 sm:px-8 pb-6">
              {/* spacer to balance content height if needed */}
            </div>
            <div className="px-6 sm:px-8 pt-0 flex items-center">
              <span className="inline-flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                Explore
                <CornerUpRight className="ml-1 h-4 w-4" />
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}