import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const palette =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";

const designSyntax = [
  {
    selector:
      "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral",
    message: "Use cn() instead of a template literal.",
  },
  {
    selector: "Literal[value=/font-display font-bold uppercase/]",
    message: "Use heading() from @/components/base/heading.",
  },
  {
    selector: "Literal[value=/text-\\[(0?\\.\\d+rem|\\d+(\\.\\d+)?px)\\]/]",
    message:
      "Use a theme text size (text-5xs…text-7xl) instead of a small rem or px value.",
  },
  {
    selector: "Literal[value=/hsl\\(var\\(--|-\\[(#|rgb|hsl|oklch)/]",
    message:
      "Use a theme color token (bg-primary, from-brand-start…) instead of a raw color.",
  },
  {
    selector: `Literal[value=/\\b(bg|text|border|from|via|to|ring|fill|stroke|outline|divide|decoration|shadow)-(${palette})-\\d{2,3}\\b/]`,
    message:
      "Use a theme color token instead of the Tailwind palette; add one to globals.css if it is missing.",
  },
  {
    selector:
      "Literal[value=/(^|[\\s:])(bg-foreground|text-background|(bg|text)-(white|black))(\\/\\d+)?(?=\\s|$)/]",
    message:
      "Don't invert or hard-code light and dark: use bg-card, text-foreground, text-primary-foreground… so both themes stay consistent.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**", "src/components/base/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              importNames: ["Loader2", "Loader2Icon"],
              message: "Use Spinner from @/components/base/spinner.",
            },
            {
              name: "react-dom",
              importNames: ["createPortal"],
              message: "Use BottomSheet from @/components/base/sheet.",
            },
            {
              name: "cn",
              message:
                "Import cn from @/lib/utils, which knows the theme text sizes.",
            },
            {
              name: "@/components/ui/button",
              message: "Use Button from @/components/base/button.",
            },
            {
              name: "@/components/ui/spinner",
              message: "Use Spinner from @/components/base/spinner.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        ...designSyntax,
        {
          selector: "Property[key.name='queryKey'] > ArrayExpression",
          message:
            "Define the query in @/lib/queries and use its queryKey instead of writing one by hand.",
        },
      ],
    },
  },
  {
    files: ["src/lib/queries.ts"],
    rules: { "no-restricted-syntax": ["error", ...designSyntax] },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/api.ts",
      "src/lib/server-api.ts",
      "src/**/*.test.{ts,tsx}",
    ],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Call the API through api from @/lib/api (or server-api on the server).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "e2e-report/**",
    "e2e-results/**",
  ]),
]);

export default eslintConfig;
