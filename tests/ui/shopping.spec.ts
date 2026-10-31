import { expect, test, type Page } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { SearchResultsPage } from '../../pages/SearchResultsPage';

const searchTerm = 'wireless mouse';

async function openHome(page: Page): Promise<HomePage> {
  const home = new HomePage(page);
  await home.goto();
  const challengePage = page.getByRole('heading', {
    name: /click the button below to continue shopping|robot check/i
  }).or(page.getByRole('button', { name: /continue shopping/i }))
    .or(page.locator('#captchacharacters, form[action*="validateCaptcha"]'));
  const pageState = await Promise.race([
    challengePage.first().waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => 'challenge' as const).catch(() => undefined),
    home.logo.waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => 'storefront' as const).catch(() => undefined)
  ]);
  if (pageState === 'challenge') {
    test.skip(true, 'Amazon bot-protection challenge blocked the storefront in this run.');
  }
  if (pageState !== 'storefront') {
    throw new Error('Amazon did not render the storefront or its recognized bot-protection page.');
  }
  return home;
}

async function skipIfUnavailableForDelivery(page: Page): Promise<void> {
  const unavailableNotice = page.getByText(
    /cannot be shipped to your selected delivery location/i
  ).first();
  if (await unavailableNotice.isVisible().catch(() => false)) {
    test.skip(true, 'The selected listing is unavailable for the current Amazon delivery location.');
  }
}

async function openProduct(page: Page): Promise<ProductPage> {
  const home = await openHome(page);
  await home.searchFor(searchTerm);
  const results = new SearchResultsPage(page);
  await results.openFirstProduct();
  await skipIfUnavailableForDelivery(page);
  return new ProductPage(page);
}

async function addOneItemToCart(page: Page): Promise<string> {
  const home = await openHome(page);
  const previousCount = await home.readCartCount();
  await home.searchFor(searchTerm);
  const results = new SearchResultsPage(page);
  await results.openFirstProduct();
  await skipIfUnavailableForDelivery(page);
  const product = new ProductPage(page);
  const productTitle = (await product.title.innerText()).trim();
  await product.addToCart();
  await expect(home.cartCount, 'Amazon cart count should increase after adding the product')
    .toHaveText(String(previousCount + 1));
  return productTitle;
}

test.describe('Amazon shopping flows @ui', () => {
  test('homepage loads with title, logo, and search @smoke', async ({ page }) => {
    const home = await openHome(page);
    await expect(page).toHaveTitle(/amazon/i);
    await home.expectLoaded();
  });

  test('search returns relevant wireless mouse products @smoke', async ({ page }) => {
    const home = await openHome(page);
    await home.searchFor(searchTerm);
    await new SearchResultsPage(page).expectRelevantResults(/wireless mouse/i);
  });

  test('a brand filter narrows the search results', async ({ page }) => {
    const home = await openHome(page);
    await home.searchFor(searchTerm);
    await new SearchResultsPage(page).applyBrandFilter();
  });

  test('product detail page shows title, price, rating, and image', async ({ page }) => {
    const product = await openProduct(page);
    await product.expectDetailsVisible();
  });

  test('adding a product increments the cart count', async ({ page }) => {
    await addOneItemToCart(page);
  });

  test('cart shows the product, quantity, and subtotal', async ({ page }) => {
    const productTitle = await addOneItemToCart(page);
    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectContainsProduct(productTitle);
    await cart.expectQuantityOne();
    await cart.expectSubtotalVisible();
  });

  test('checkout stops at the sign-in checkpoint', async ({ page }) => {
    await addOneItemToCart(page);
    const cart = new CartPage(page);
    await cart.goto();
    await cart.proceedToCheckout();

    const signInEmail = page.locator('#ap_email, input[type="email"]').first();
    const signInHeading = page.getByRole('heading', { name: /sign in/i }).first();
    await expect(
      signInEmail.or(signInHeading),
      'Checkout should stop at Amazon sign-in; no order placement is attempted'
    ).toBeVisible();
  });
});
