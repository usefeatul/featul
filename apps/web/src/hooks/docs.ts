import { useIsMobile } from "@featul/ui/hooks/use-mobile"

const DOCS_TABLET_BREAKPOINT = 1024

export function useIsDocsMobile() {
  return useIsMobile(DOCS_TABLET_BREAKPOINT)
}
