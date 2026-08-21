import type { ComponentType } from 'react'
import MrrTool from '../components/tools/revenue/mrr'
import ArrTool from '../components/tools/revenue/arr'
import GrowthRateTool from '../components/tools/revenue/growth'
import ArpuTool from '../components/tools/revenue/arpu'
import LtvTool from '../components/tools/revenue/ltv'
import QuickRatioTool from '../components/tools/revenue/quickratio'
import NetRevenueRetentionTool from '../components/tools/revenue/nrr'
import ChurnTool from '../components/tools/customer/churn'
import NpsTool from '../components/tools/customer/nps'
import CacTool from '../components/tools/customer/cac'
import CltvCacRatioTool from '../components/tools/customer/cltv'
import ActivationRateTool from '../components/tools/customer/activation'
import RetentionRateTool from '../components/tools/customer/retention'
import CustomerCohortsTool from '../components/tools/customer/cohorts'
import FeatureAdoptionTool from '../components/tools/product/adoption'
import CohortAnalysisTool from '../components/tools/product/cohort'
import StickinessCalculator from '../components/tools/product/stickiness'
import TtfvCalculator from '../components/tools/product/ttfv'
import FeatureUsageFrequency from '../components/tools/product/usage'
import RunwayTool from '../components/tools/finance/runway'
import GrossMarginTool from '../components/tools/finance/gross'
import BurnRateTool from '../components/tools/finance/burn'
import NetMarginTool from '../components/tools/finance/net'
import CashFlowTool from '../components/tools/finance/cashflow'
import PaybackPeriodTool from '../components/tools/finance/payback'
import BreakEvenTool from '../components/tools/finance/breakeven'
import OpexRatioTool from '../components/tools/finance/opex'
import RevenuePerEmployeeTool from '../components/tools/finance/rpe'
import PriceElasticityTool from '../components/tools/pricing/elasticity'
import ValueBasedPricingTool from '../components/tools/pricing/value'
import SaasValuationTool from '../components/tools/pricing/valuation'
import FreemiumConversionTool from '../components/tools/pricing/freemium'
import DiscountImpactTool from '../components/tools/pricing/discount'
import TierPricingOptimizerTool from '../components/tools/pricing/tiers'
import WtpSurveyTool from '../components/tools/pricing/wtp'
import RoiTool from '../components/tools/performance/roi'
import RomiTool from '../components/tools/performance/romi'
import ConversionRateTool from '../components/tools/performance/conversion'
import AbTestSignificanceTool from '../components/tools/performance/abtest'
import CpaTool from '../components/tools/performance/cpa'
import EngagementRateTool from '../components/tools/performance/engagement'
import FunnelConversionTool from '../components/tools/performance/funnel'
// Content & Marketing tools
import WordCounterTool from '../components/tools/content/words'
import ReadabilityScoreTool from '../components/tools/content/readability'
import HeadlineAnalyzerTool from '../components/tools/content/headline'
// Feedback & Survey tools
import CsatCalculatorTool from '../components/tools/feedback/csat'
import CesCalculatorTool from '../components/tools/feedback/ces'
import SampleSizeCalculatorTool from '../components/tools/feedback/sample'
// Team & Productivity tools
import MeetingCostCalculatorTool from '../components/tools/team/meeting'
import SprintVelocityCalculatorTool from '../components/tools/team/velocity'
import SalaryCalculatorTool from '../components/tools/team/salary'
import ProjectTimelineEstimatorTool from '../components/tools/team/timeline'
// Additional Content tools
import ReadingTimeCalculatorTool from '../components/tools/content/reading'
import CtaGeneratorTool from '../components/tools/content/generator'
// Additional Feedback tools
import ResponseRateCalculatorTool from '../components/tools/feedback/response'
import MarginOfErrorCalculatorTool from '../components/tools/feedback/margin'
import RicePrioritizationTool from '../components/tools/feedback-roadmaps/rice'
import ChangelogGeneratorTool from '../components/tools/feedback-roadmaps/changelog'
import VotingBiasTool from '../components/tools/feedback-roadmaps/voting-bias'
import PublicBoardChecklistTool from '../components/tools/feedback-roadmaps/checklist'
import RoadmapTemplateTool from '../components/tools/feedback-roadmaps/roadmap'
import VoteConfidenceTool from '../components/tools/feedback-roadmaps/vote-confidence'
import NpsFollowUpTool from '../components/tools/feedback-roadmaps/nps-follow-up'
import DuplicateFeedbackTool from '../components/tools/feedback-roadmaps/duplicates'

export const TOOL_COMPONENTS: Record<string, Record<string, ComponentType>> = {
  'feedback-roadmaps': {
    'rice-prioritization-calculator': RicePrioritizationTool,
    'changelog-generator': ChangelogGeneratorTool,
    'feature-voting-bias-calculator': VotingBiasTool,
    'public-feedback-board-checklist': PublicBoardChecklistTool,
    'roadmap-status-template': RoadmapTemplateTool,
    'feedback-vote-confidence-calculator': VoteConfidenceTool,
    'nps-follow-up-planner': NpsFollowUpTool,
    'duplicate-feedback-estimator': DuplicateFeedbackTool,
  },
  'product-feature-analytics': {
    'feature-adoption-calculator': FeatureAdoptionTool,
    'cohort-analysis': CohortAnalysisTool,
    'stickiness-calculator': StickinessCalculator,
    'ttfv-calculator': TtfvCalculator,
    'feature-usage-frequency': FeatureUsageFrequency,
  },
  'revenue-growth': {
    'mrr-calculator': MrrTool,
    'arr-calculator': ArrTool,
    'growth-rate-calculator': GrowthRateTool,
    'arpu-calculator': ArpuTool,
    'ltv-calculator': LtvTool,
    'quick-ratio': QuickRatioTool,
    'net-revenue-retention': NetRevenueRetentionTool,
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
  'performance-roi': {
    'roi-calculator': RoiTool,
    'romi-calculator': RomiTool,
    'conversion-rate-calculator': ConversionRateTool,
    'ab-test-significance': AbTestSignificanceTool,
    'cpa-calculator': CpaTool,
    'engagement-rate': EngagementRateTool,
    'funnel-conversion': FunnelConversionTool,
  },
  'content-marketing': {
    'word-counter': WordCounterTool,
    'readability-score': ReadabilityScoreTool,
    'headline-analyzer': HeadlineAnalyzerTool,
    'reading-time-calculator': ReadingTimeCalculatorTool,
    'cta-generator': CtaGeneratorTool,
  },
  'feedback-survey': {
    'csat-calculator': CsatCalculatorTool,
    'ces-calculator': CesCalculatorTool,
    'sample-size-calculator': SampleSizeCalculatorTool,
    'response-rate-calculator': ResponseRateCalculatorTool,
    'margin-of-error-calculator': MarginOfErrorCalculatorTool,
  },
  'team-productivity': {
    'meeting-cost-calculator': MeetingCostCalculatorTool,
    'sprint-velocity-calculator': SprintVelocityCalculatorTool,
    'salary-calculator': SalaryCalculatorTool,
    'project-timeline-estimator': ProjectTimelineEstimatorTool,
  },
}