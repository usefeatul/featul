import type { ComponentType } from "react"
import { ProductFeedbackUseCase } from "../components/use-cases/product-feedback-platform"
import { EnterpriseCustomerSuccessUseCase } from "../components/use-cases/enterprise-customer-success"
import { ProductLedGrowthUseCase } from "../components/use-cases/product-led-growth"

export const USE_CASE_COMPONENTS: Record<string, ComponentType> = {
  "product-feedback-platform": ProductFeedbackUseCase,
  "enterprise-customer-success": EnterpriseCustomerSuccessUseCase,
  "product-led-growth": ProductLedGrowthUseCase,
}
