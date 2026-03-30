import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export interface ReportEmailProps {
    recipientName?: string
    workspaceName: string
    itemName: string
    itemUrl: string
    itemType: "post" | "comment"
    reason: string
    description?: string | null
    reportCount: number
    brand?: Brand
}

export function ReportEmail({
    recipientName,
    workspaceName,
    itemName,
    itemUrl,
    itemType,
    reason,
    description,
    reportCount,
    brand,
}: ReportEmailProps) {
    const eyebrow = "New Report"
    const title = `A ${itemType} has been reported in ${workspaceName}`

    const intro = `Hello ${recipientName || "there"},`

    const paragraphs = [
        `${itemName} has received a new report.`,
        `Reason: ${reason}`,
        description ? `Description: ${description}` : "",
        `Total Reports: ${reportCount}`
    ].filter(Boolean) as string[]

    const highlight = reportCount >= 3 ? "Warning: This content has reached 3+ reports." : undefined

    return (
        <BrandedEmail
            eyebrow={eyebrow}
            title={title}
            intro={intro}
            paragraphs={paragraphs}
            highlight={highlight}
            ctaText={`View ${itemType === "post" ? "Post" : "Comment"}`}
            ctaUrl={itemUrl}
            brand={brand}
        />
    )
}

export async function renderReportEmail(props: ReportEmailProps) {
    const element = <ReportEmail {...props} />
    const html = await render(element)
    const text = toPlainText(html)
    return { html, text }
}
