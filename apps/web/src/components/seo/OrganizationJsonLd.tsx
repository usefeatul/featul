import React from 'react'
import { getOrganizationJsonLd } from '@/config/seo'

export default function OrganizationJsonLd() {
  return (
    <script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationJsonLd()) }} />
  )
}
