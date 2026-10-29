"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

// c15t (provider, banner, dialog and script loader) loads after hydration so it stays
// out of the bundle that first paint waits on. Its state reaches always-rendered UI
// through consent-state.ts.
const ConsentRoot = dynamic(() => import("./consent-root"), { ssr: false });

export default function ConsentProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ConsentRoot />
    </>
  );
}
