import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

type TestFixtures = {
  apiClient: ApiClient;
  baseURL: string;
};

export const test = base.extend<TestFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },
  baseURL: async ({}, use) => {
    const url = process.env.API_URL || 'http://localhost:3000';
    await use(url);
  },
});

export { expect };
