import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

type TestFixtures = {
  apiClient: ApiClient;
};

export const test = base.extend<TestFixtures>({
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },
});

export { expect };
