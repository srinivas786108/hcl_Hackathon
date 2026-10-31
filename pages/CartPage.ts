import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly subtotal: Locator;
  readonly proceedToCheckoutButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.locator('#sc-active-cart .sc-list-item, .sc-list-item');
    this.subtotal = page.locator('#sc-subtotal-amount-activecart, #sc-subtotal-amount-buybox');
    this.proceedToCheckoutButton = page.locator('#sc-buy-box-ptc-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/gp/cart/view.html');
  }

  async expectContainsProduct(productTitle: string): Promise<void> {
    await expect(this.items.first(), 'The cart should contain the added product').toBeVisible();
    await expect(this.items.first()).toContainText(productTitle);
  }

  async expectQuantityOne(): Promise<void> {
    const quantity = this.page.locator('select[name="quantity"]').first();
    await expect(quantity, 'The cart quantity selector should be available').toHaveValue('1');
  }

  async expectSubtotalVisible(): Promise<void> {
    await expect(this.subtotal, 'The cart subtotal should be displayed').toBeVisible();
    await expect(this.subtotal).not.toHaveText(/\$0\.00/);
  }

  async proceedToCheckout(): Promise<void> {
    await expect(this.proceedToCheckoutButton).toBeVisible();
    await this.proceedToCheckoutButton.click();
  }
}
