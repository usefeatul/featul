import type { ComponentType } from 'react'
import MrrTool from '../components/tools/revenue/mrr'
import ArrTool from '../components/tools/revenue/arr'
import GrowthRateTool from '../components/tools/revenue/growth-rate'
import ArpuTool from '../components/tools/revenue/arpu'
import LtvTool from '../components/tools/revenue/ltv'
import ChurnTool from '../components/tools/customer/churn'
import NpsTool from '../components/tools/customer/nps'
import CacTool from '../components/tools/customer/cac'
import CltvCacRatioTool from '../components/tools/customer/cltv-cac-ratio'
import ActivationRateTool from '../components/tools/customer/activation-rate'
import RetentionRateTool from '../components/tools/customer/retention-rate'
import CustomerCohortsTool from '../components/tools/customer/customer-cohorts'
import FeatureAdoptionTool from '../components/tools/product/feature-adoption'
import CohortAnalysisTool from '../components/tools/product/cohort-analysis'
import RunwayTool from '../components/tools/finance/runway'
import GrossMarginTool from '../components/tools/finance/gross-margin'
import BurnRateTool from '../components/tools/finance/burn-rate'
import NetMarginTool from '../components/tools/finance/net-margin'
import CashFlowTool from '../components/tools/finance/cashflow'
import PaybackPeriodTool from '../components/tools/finance/payback-period'
import BreakEvenTool from '../components/tools/finance/break-even'
import OpexRatioTool from '../components/tools/finance/opex-ratio'
import RevenuePerEmployeeTool from '../components/tools/finance/revenue-per-employee'
import PriceElasticityTool from '../components/tools/pricing-valuation/price-elasticity'
import ValueBasedPricingTool from '../components/tools/pricing-valuation/value-based-pricing'
import SaasValuationTool from '../components/tools/pricing-valuation/saas-valuation'
import FreemiumConversionTool from '../components/tools/pricing-valuation/freemium-conversion'
import DiscountImpactTool from '../components/tools/pricing-valuation/discount-impact'
import TierPricingOptimizerTool from '../components/tools/pricing-valuation/tier-pricing-optimizer'
import WtpSurveyTool from '../components/tools/pricing-valuation/wtp-survey'

export const TOOL_COMPONENTS: Record<string, Record<string, ComponentType>> = {
  'product-feature-analytics': {
    'feature-adoption-calculator': FeatureAdoptionTool,
    'cohort-analysis': CohortAnalysisTool,
  },
  'revenue-growth': {
    'mrr-calculator': MrrTool,
    'arr-calculator': ArrTool,
    'growth-rate-calculator': GrowthRateTool,
    'arpu-calculator': ArpuTool,
    'ltv-calculator': LtvTool,
  },
  'customer-metrics': {
    'churn-calculator': ChurnTool,
    'nps-calculator': NpsTool,
    'cac-calculator': CacTool,
    'cltv-cac-ratio': CltvCacRatioTool,
    'activation-rate': ActivationRateTool,
    'retention-rate': RetentionRateTool,
    'customer-cohort-analysis': CustomerCohortsTool,
  },
  'financial-health': {
    'runway-calculator': RunwayTool,
    'gross-margin-calculator': GrossMarginTool,
    'burn-rate-calculator': BurnRateTool,
    'net-margin-calculator': NetMarginTool,
    'cashflow-analyzer': CashFlowTool,
    'payback-period': PaybackPeriodTool,
    'break-even-analysis': BreakEvenTool,
    'operating-expense-ratio': OpexRatioTool,
    'revenue-per-employee': RevenuePerEmployeeTool,
  },
  'pricing-valuation': {
    'price-elasticity': PriceElasticityTool,
    'value-based-pricing': ValueBasedPricingTool,
    'saas-valuation': SaasValuationTool,
    'freemium-conversion-rate': FreemiumConversionTool,
    'discount-impact': DiscountImpactTool,
    'tier-pricing-optimizer': TierPricingOptimizerTool,
    'willingness-to-pay': WtpSurveyTool,
  },
}