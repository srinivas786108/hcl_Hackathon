import { expect, type Locator, type Page } from '@playwright/test';

export class SearchResultsPage {
  readonly results: Locator;
  readonly searchField: Locator;

  constructor(private readonly page: Page) {
    this.results = page.locator('div[data-component-type="s-search-result"]');
    this.searchField = page.locator('#twotabsearchtextbox');
  }

  async expectRelevantResults(query: RegExp): Promise<void> {
    await expect(this.results.first()).toBeVisible();
    await expect(this.page.locator('[data-component-type="s-search-result"] h2').first())
      .toContainText(query);
  }

  async applyBrandFilter(): Promise<void> {
    const brandFilter = this.page.locator('#s-refinements').getByText('Logitech', { exact: true }).first();
    await expect(brandFilter, 'A Logitech brand filter should be available on the search results page')
      .toBeVisible();
    const before = this.page.url();
    await brandFilter.click();
    await expect(this.page).not.toHaveURL(before);
    await expect(this.results.first()).toBeVisible();
  }

  async openFirstProduct(): Promise<void> {
    const purchasableProductLink = this.page.getByRole('link', { name: 'product-detail' }).first();
    const productLink = this.page.locator('a[href*="/dp/"]').filter({
      has: this.page.locator('h2')
    }).first();
    if (await purchasableProductLink.count()) {
      await expect(purchasableProductLink, 'A purchasable product detail link should be visible')
        .toBeVisible();
      await purchasableProductLink.click();
    } else {
      await expect(productLink, 'The first search result should have a product link').toBeVisible();
      await productLink.click();
    }
    await expect(this.page.locator('#productTitle')).toBeVisible();
  }
}
