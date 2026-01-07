import baseConfig from "./index.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...baseConfig,
    {
        rules: {
            // Next.js specific rules
            "@next/next/no-html-link-for-pages": "off",
        },
    },
];
