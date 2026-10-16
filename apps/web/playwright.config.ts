import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e-results",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "./e2e-report" }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "iphone", use: { ...devices["iPhone 13"] } }],
});
