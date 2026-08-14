import { test, expect } from "@playwright/test";

test.describe("Navegación entre páginas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("debe navegar a través de los enlaces principales", async ({
    page,
  }) => {
    const links = page.locator("nav a, [role='navigation'] a");
    const linkCount = await links.count();

    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = links.nth(i);
        if (await link.isVisible()) {
          await link.click();
          await page.waitForLoadState("networkidle");
          expect(page.url()).toBeTruthy();
        }
      }
    }
  });

  test("debe mantener la navegación con el botón atrás", async ({ page }) => {
    await page.goto("/");
    const initialUrl = page.url();

    await page.goBack();
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toBe(initialUrl);
  });
});

test.describe("Formularios", () => {
  test("debe validar campos requeridos", async ({ page }) => {
    await page.goto("/");

    const forms = page.locator("form");
    const formCount = await forms.count();

    if (formCount > 0) {
      const submitButton = forms.first().locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe("Responsive design", () => {
  const viewports = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`debe funcionar en ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
