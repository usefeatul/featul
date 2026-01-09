import type { LucideIcon } from 'lucide-react'
import { BarChart3, TrendingUp, User, CircleDollarSign, Tag, LineChart, MessageSquare, PenLine, ClipboardList, Users } from 'lucide-react'

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'product-feature-analytics': BarChart3,
  'revenue-growth': TrendingUp,
  'customer-metrics': User,
  'financial-health': CircleDollarSign,
  'pricing-valuation': Tag,
  'performance-roi': LineChart,
  'content-marketing': PenLine,
  'feedback-survey': ClipboardList,
  'team-productivity': Users,
}

export const DEFAULT_CATEGORY_ICON: LucideIcon = MessageSquare

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICON_MAP[slug] ?? DEFAULT_CATEGORY_ICON
}