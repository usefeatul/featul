import type { ComponentType } from "react"
import { ProductFeedbackUseCase } from "../components/use-cases/feedback"
import { EnterpriseCustomerSuccessUseCase } from "../components/use-cases/enterprise"
import { ProductLedGrowthUseCase } from "../components/use-cases/plg"

export const USE_CASE_COMPONENTS: Record<string, ComponentType> = {
  "product-feedback-platform": ProductFeedbackUseCase,
  "enterprise-customer-success": EnterpriseCustomerSuccessUseCase,
  "product-led-growth": ProductLedGrowthUseCase,
}
