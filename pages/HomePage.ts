import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly cartCount: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.locator('#nav-logo-sprites');
    this.searchInput = page.locator('#twotabsearchtextbox');
    this.cartCount = page.locator('#nav-cart-count');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async readCartCount(): Promise<number> {
    const countText = (await this.cartCount.textContent())?.trim() ?? '0';
    return Number.parseInt(countText, 10) || 0;
  }
}
