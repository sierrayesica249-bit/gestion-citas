const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`[console] ${m.text()}`); });

  // ===== 1. APRENDIZ: book appointment =====
  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle" });
  await page.fill("#login-email", "aprendiz@senas.edu");
  await page.fill("#login-password", "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15000 });
  console.log("1. Aprendiz dashboard:", page.url());

  // Open booking form
  await page.getByRole("button", { name: /Agendar cita/i }).first().click();
  await page.waitForSelector("#dep-dependency", { timeout: 10000 });
  // Choose a dependency (non-placeholder option)
  const depOpts = await page.locator("#dep-dependency option").allTextContents();
  const depValue = await page.locator("#dep-dependency option").nth(1).getAttribute("value");
  console.log("   Dependencies:", depOpts, "→ value:", depValue);
  await page.selectOption("#dep-dependency", depValue);
  // Choose a date (next week) and time
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await page.fill("#dep-date", future);
  await page.selectOption("#dep-time", "10:00");
  await page.fill("#dep-reason", "Necesito una revisión médica de rutina por favor.");
  await page.getByRole("button", { name: "Solicitar Cita" }).click();
  // Wait for toast (success or error)
  await page.waitForTimeout(1200);
  const toastText = await page.locator("[data-sonner-toast]").allTextContents().catch(() => []);
  console.log("2. Toast(s):", JSON.stringify(toastText));
  // Wait a bit more in case success closes the form
  await page.waitForTimeout(1500);
  const formVisible = await page.locator("#dep-dependency").count();
  console.log("   Form closed after booking:", formVisible === 0);

  // Find the newly created appointment id via API later; logout
  await page.getByRole("button", { name: /Cerrar sesión/i }).click();
  await page.waitForURL(/login/, { timeout: 10000 });

  // ===== 2. ENFERMERIA: confirm =====
  await page.fill("#login-email", "enfermeria@senas.edu");
  await page.fill("#login-password", "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/enfermeria/, { timeout: 15000 });
  console.log("3. Enfermeria dashboard:", page.url());

  // Go to "Mis Citas" tab and switch filter to Pendientes (default)
  await page.getByRole("tab", { name: /Mis Citas/i }).click();
  await page.waitForTimeout(1500);
  // Find a pending row with "Atender" button
  const atenderBtn = page.getByRole("button", { name: /Atender/i }).first();
  if (await atenderBtn.count()) {
    await atenderBtn.click();
    await page.waitForTimeout(1500);
    console.log("4. Confirm clicked. Pending rows remaining:", await page.locator("text=Pendiente").count());
  } else {
    console.log("4. No pending 'Atender' button found on enfermeria (checking pending list)");
    const pendingCount = await page.locator(".nursing-enhanced-status", { hasText: "Pendiente" }).count();
    console.log("   Pending badges on screen:", pendingCount);
  }

  // ===== 3. PROFILE: no 403 links =====
  await page.goto("http://localhost:5173/profile", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /Rol y Funciones/i }).click();
  await page.waitForTimeout(800);
  const permTexts = await page.locator(".profile-permission-text").allTextContents();
  console.log("5. Enfermeria role functions:", permTexts);
  const hasAdminLink = await page.locator('.profile-permission-item[role="button"]', { hasText: "Gestionar usuarios" }).count();
  console.log("   Has admin link:", hasAdminLink > 0);

  console.log("\n===== ERRORS =====");
  errors.forEach((e) => console.log(e));
  if (!errors.length) console.log("(sin errores)");

  await browser.close();
})();
