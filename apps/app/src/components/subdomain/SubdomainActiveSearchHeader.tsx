"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildUrlWithSearchParam } from "@/utils/subdomain-search-url";
import { SubdomainSearchResultsHeader } from "./SubdomainSearchResultsHeader";

type SubdomainActiveSearchHeaderProps = {
  query: string;
  totalCount: number;
};

export function SubdomainActiveSearchHeader({
  query,
  totalCount,
}: SubdomainActiveSearchHeaderProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  if (!query) return null;

  const onClear = () => {
    router.push(buildUrlWithSearchParam(pathname, searchParams, ""));
  };

  return (
    <SubdomainSearchResultsHeader
      query={query}
      totalCount={totalCount}
      onClear={onClear}
    />
  );
}
