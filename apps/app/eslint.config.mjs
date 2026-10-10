import baseConfig from "@featul/eslint-config/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/global/icons.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "lucide-react",
                "lucide-react/*",
                "@tabler/icons-react",
                "@tabler/icons-react/*",
                "@featul/ui/icons/*",
                "@/components/global/artwork",
              ],
              message:
                "Import shared icons from @/components/global/icons so the same action uses the same artwork throughout the app.",
            },
          ],
        },
      ],
    },
  },
];
