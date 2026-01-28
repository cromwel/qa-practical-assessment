import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE ?? 'automation/config/env.local' });

export default defineConfig({
  testDir: './automation',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/test-run-results/html', open: 'never' }]
  ],
  use: {
    baseURL: process.env.UI_BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  },
  webServer: {
    command: 'npx http-server automation/ui/mock-app -p 4173',
    url: process.env.UI_BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
  timeout: 60_000
});
