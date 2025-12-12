import Link from 'next/link'
import { TOOL_CATEGORIES } from '@/types/tools'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@oreilla/ui/components/card'
import { CornerUpRight } from 'lucide-react'
import { getCategoryIcon } from './category-icons'


export default function CategoryList() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOOL_CATEGORIES.map((cat) => {
        const Icon = getCategoryIcon(cat.slug)
        return (
          <Link key={cat.slug} href={`/tools/categories/${cat.slug}`} className="group block">
            <Card className="h-full overflow-hidden transition group hover:shadow-sm hover:ring-border bg-background flex flex-col">
              <CardHeader className="p-6 sm:p-8 flex-1">
                <Icon className="size-5 text-black group-hover:text-primary mb-3" />
                <CardTitle className="font-medium text-lg">{cat.name}</CardTitle>
                <CardDescription className="mt-1 text-accent">{cat.description}</CardDescription>
              </CardHeader>
              <CardFooter className="px-6 sm:px-8 pt-0 justify-between mt-auto items-center">
                <span className="text-xs text-muted-foreground font-mono tabular-nums">{cat.tools.length} tools</span>
                <span className="inline-flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore
                  <CornerUpRight className="ml-1 h-4 w-4" />
                </span>
              </CardFooter>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}