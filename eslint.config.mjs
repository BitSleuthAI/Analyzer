import { defineConfig, globalIgnores } from "eslint/config";
import { fixupPluginRules } from "@eslint/compat";
import eslintConfigNext from "eslint-config-next";
import tsParser from "@typescript-eslint/parser";

const [nextConfig, typescriptConfig, ...restConfigs] = eslintConfigNext;

// Wrap plugins that haven't updated to ESLint 10's rule context API
// (context.getFilename → context.filename, context.getScope → context.sourceCode.getScope, etc.)
const patchedPlugins = Object.fromEntries(
  Object.entries(nextConfig.plugins).map(([name, plugin]) => [
    name,
    fixupPluginRules(plugin),
  ]),
);

export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Next.js core config (React, React Hooks, Import, JSX-a11y, @next/next)
  // Override parser: eslint-config-next/parser bundles an old eslint-scope
  // that lacks the ScopeManager#addGlobals() method required by ESLint 10.
  // Using @typescript-eslint/parser for all files (project is 100% TypeScript).
  {
    files: nextConfig.files,
    plugins: patchedPlugins,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...nextConfig.rules,
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react/no-unescaped-entities": "off",
    },
  },

  // TypeScript config
  {
    files: typescriptConfig.files,
    plugins: Object.fromEntries(
      Object.entries(typescriptConfig.plugins).map(([name, plugin]) => [
        name,
        fixupPluginRules(plugin),
      ]),
    ),
    languageOptions: typescriptConfig.languageOptions,
    rules: {
      ...(typescriptConfig.rules ?? {}),
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "off",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
    },
  },

  // Remaining configs from eslint-config-next, excluding the ignores-only
  // object that is now handled by globalIgnores() above.
  ...restConfigs.filter((c) => !c.ignores || Object.keys(c).length > 1),
]);
