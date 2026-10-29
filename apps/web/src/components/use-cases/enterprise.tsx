import { USE_CASE_ARTICLES } from "@/content/use-cases"
import { UseCaseArticleView } from "@/components/use-cases/article"

export function EnterpriseCustomerSuccessUseCase() {
  return <UseCaseArticleView article={USE_CASE_ARTICLES["enterprise-customer-success"]!} />
}
