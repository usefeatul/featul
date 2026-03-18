import React from 'react'
import { getOrganizationJsonLd } from '@/config/seo'
import { serializeJsonLd } from "@/lib/security";

export default function OrganizationJsonLd() {
  return (
    <script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(getOrganizationJsonLd()) }} />
  )
}
