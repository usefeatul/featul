import { redirect } from "next/navigation"
import { flattenDocsNav } from "@/config/docsNav"

/** No docs home: /docs opens straight into the first page. */
export default function DocsIndexPage() {
  redirect(flattenDocsNav()[0]?.href ?? "/")
}
