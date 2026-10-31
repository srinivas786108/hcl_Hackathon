import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  readonly title: Locator;
  readonly price: Locator;
  readonly rating: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('#productTitle');
    this.price = page.locator(
      '#corePriceDisplay_desktop_feature_div .a-price:visible, #priceblock_ourprice:visible, #priceblock_dealprice:visible, #apex_desktop .a-price:visible'
    ).filter({ hasText: /\d/ }).first();
    this.rating = page.locator('#acrPopover, #averageCustomerReviews');
    this.image = page.locator('#landingImage');
    this.addToCartButton = page.locator('#add-to-cart-button');
  }

  async expectDetailsVisible(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.price, 'The product detail page should show a price').toBeVisible();
    await expect(this.rating, 'The product detail page should show a rating').toBeVisible();
    await expect(this.image, 'The primary product image should be visible').toBeVisible();
  }

  async addToCart(): Promise<void> {
    await expect(this.addToCartButton, 'The selected product should be purchasable').toBeVisible();
    await this.addToCartButton.click();
  }
}
