import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-build/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Harness audit (perkakas pengujian, bukan kode aplikasi):
    "audits/**",
    // Perkakas lokal yang gitignored (paket skill audit & dokumen kerja):
    "security-audit/**",
    "internal/**",
  ]),
]);

export default eslintConfig;
