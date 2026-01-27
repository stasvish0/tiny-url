import { faker } from '@faker-js/faker';

export interface TestUrl {
  originalUrl: string;
  customSlug?: string;
}

export class UrlFactory {
  createUrl(overrides: Partial<TestUrl> = {}): TestUrl {
    return {
      originalUrl: faker.internet.url(),
      ...overrides,
    };
  }

  createValidUrl(): string {
    return faker.internet.url();
  }

  createInvalidUrl(): string {
    return 'not-a-valid-url';
  }

  createCustomSlug(): string {
    return faker.string.alphanumeric({ length: 8, casing: 'lower' });
  }

  createReservedSlug(): string {
    const reserved = ['api', 'health', 'admin', 'static', 'assets'];
    return faker.helpers.arrayElement(reserved);
  }

  createLongUrl(): string {
    const base = 'https://example.com/';
    const path = faker.string.alphanumeric({ length: 500 });
    return base + path;
  }
}
