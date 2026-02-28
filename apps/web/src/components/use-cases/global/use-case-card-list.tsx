import Link from "next/link"
import { USE_CASES } from "@/types/use-cases"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@featul/ui/components/card"
import { CornerUpRight, Lightbulb } from "lucide-react"

export default function UseCaseCardList() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {USE_CASES.map((useCase) => (
        <Link
          key={useCase.slug}
          href={`/use-cases/${useCase.slug}`}
          className="group block"
        >
          <Card className="h-full overflow-hidden py-4 transition group hover:shadow-sm hover:ring-border flex flex-col">
            <CardHeader className="p-5 sm:p-6">
              <Lightbulb className="size-5 text-black group-hover:text-primary mb-3" />
              <CardTitle className="font-medium text-lg">{useCase.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-3 text-accent">
                {useCase.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="px-5 sm:px-6 pt-0 items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {useCase.badge}
              </span>
              <span className="inline-flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Read guide
                <CornerUpRight className="ml-1 h-4 w-4" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
