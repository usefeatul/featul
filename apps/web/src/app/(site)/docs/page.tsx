import { redirect } from "next/navigation"
import { DOCS_HOME_HREF } from "@/config/docsNav"

/** No docs home: /docs opens straight into the first page. */
export default function DocsIndexPage() {
  redirect(DOCS_HOME_HREF)
}
