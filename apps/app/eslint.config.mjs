import baseConfig from "@featul/eslint-config/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...baseConfig,
    {
        ignores: [".next/**", "node_modules/**"],
    },
];
