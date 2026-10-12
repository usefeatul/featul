import type { Script } from "c15t";
import {
  PREFERRED_SOURCE_SCRIPT_ID,
  PREFERRED_SOURCE_SCRIPT_SRC,
} from "./preferred-source";

const selineToken = process.env.NEXT_PUBLIC_SELINE_TOKEN?.trim();

// Neither vendor has a helper in @c15t/integrations 3.0.0.
// c15t owns both loaders and reloads after consent is withdrawn.
export const scripts: (Omit<Script, "category"> & {
  category: "measurement" | "functionality";
})[] = [
  ...(selineToken
    ? [
        {
          id: "seline",
          category: "measurement" as const,
          src: "https://cdn.seline.com/seline.js",
          attributes: { "data-token": selineToken },
          async: true,
        },
      ]
    : []),
  {
    id: PREFERRED_SOURCE_SCRIPT_ID,
    category: "functionality",
    src: PREFERRED_SOURCE_SCRIPT_SRC,
    attributes: { "preferred-sources-control": "manual" },
    async: true,
  },
];
