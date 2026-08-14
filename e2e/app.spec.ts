import { test, expect } from "@playwright/test";

test.describe("Navegación principal", () => {
  test("debe cargar la página de inicio", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/gestion.*citas/i);
  });

  test("debe mostrar el contenido principal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("no debe tener errores de consola críticos", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");

    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe("Accesibilidad básica", () => {
  test("debe tener un lang attribute", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
  });

  test("debe tener viewport meta tag", async ({ page }) => {
    await page.goto("/");
    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(viewport).toBeTruthy();
  });
});

test.describe("Rendimiento", () => {
  test("debe cargar en menos de 3 segundos", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });
});
