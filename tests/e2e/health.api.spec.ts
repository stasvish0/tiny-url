import { test, expect } from '../support/fixtures';

test.describe('Health API', () => {
  test('should return ok status', async ({ apiClient }) => {
    const response = await apiClient.health();

    expect(response.success).toBe(true);
    expect(response.data.status).toBe('ok');
  });
});
