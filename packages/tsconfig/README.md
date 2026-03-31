# @featul/tsconfig

`@featul/tsconfig` contains the shared TypeScript configuration presets for the Featul monorepo. It gives apps and packages a consistent baseline for strictness, module resolution, JSX handling, and platform-specific overrides.

## Available Configs

- `base.json` for shared TypeScript defaults across packages
- `nextjs.json` for Next.js applications
- `react-library.json` for React component libraries

## What The Presets Do

`base.json` enables strict typing, declaration output, `NodeNext` module settings, JSON module support, and modern `ES2022` targets.

`nextjs.json` builds on the base config with the Next.js TypeScript plugin, bundler-style module resolution, preserved JSX, and `noEmit`.

`react-library.json` builds on the base config with `react-jsx` enabled for library packages that export React components.

## Usage

For a Next.js app:

```json
{
  "extends": "@featul/tsconfig/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", ".next/types/**/*.ts"]
}
```

For a shared React package:

```json
{
  "extends": "@featul/tsconfig/react-library.json",
  "include": ["src"]
}
```

For a non-Next package:

```json
{
  "extends": "@featul/tsconfig/base.json",
  "include": ["src"]
}
```
