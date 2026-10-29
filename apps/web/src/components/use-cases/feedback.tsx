import { USE_CASE_ARTICLES } from "@/content/use-cases"
import { UseCaseArticleView } from "@/components/use-cases/article"

export function ProductFeedbackUseCase() {
  return <UseCaseArticleView article={USE_CASE_ARTICLES["product-feedback-platform"]!} />
}
