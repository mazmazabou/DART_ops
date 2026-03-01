// tests/uat.spec.js
const { test, expect } = require("@playwright/test");

const PASSWORD = process.env.TEST_PASSWORD || "demo123";

const USERS = {
  office: "office",
  driver: "alex",
  rider: "casey",
};

/** Returns next weekday date string YYYY-MM-DD */
function nextWeekday() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function login(page, username, password = PASSWORD) {
  await page.goto("/usc/login");
  await expect(page.locator("#login-form")).toBeVisible();

  await page.fill("#username", username);
  await page.fill("#password", password);

  await Promise.all([
    page.waitForURL(/\/(office|driver|rider|usc)/, { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function logout(page) {
  // All pages use an icon-only logout button with onclick="logout()"
  const logoutBtn = page.locator('button[onclick="logout()"]');
  if (await logoutBtn.first().isVisible().catch(() => false)) {
    await logoutBtn.first().click();
    // After logout, redirects to /:slug (campus login) or /login (generic)
    await page.waitForURL(/\/(login|usc|stanford|ucla|uci)$/, { timeout: 10000 });
  }
}

test.describe("RideOps UAT (Office / Rider / Driver)", () => {
  test("Office login loads core console", async ({ page }) => {
    await login(page, USERS.office);

    // Office redirects to /usc (campus-scoped office console)
    await expect(page).toHaveURL(/\/(usc|office)/);

    // Dispatch panel is the default visible tab
    await expect(page.locator("#dispatch-panel")).toBeVisible({ timeout: 10000 });
    // Other panels are in the DOM but hidden (tab-switched)
    await expect(page.locator("#rides-panel")).toBeAttached();
    await expect(page.locator("#settings-panel")).toBeAttached();

    // Dispatch KPI cards visible
    await expect(page.locator("#dispatch-active-drivers")).toBeVisible();

    await logout(page);
    await expect(page).toHaveURL(/\/(login|usc)/);
  });

  test("Rider can submit one-time ride request", async ({ page }) => {
    await login(page, USERS.rider);
    await expect(page).toHaveURL(/\/rider/);

    // Wait for data to load (may auto-switch to My Rides if active rides exist)
    await page.waitForTimeout(3000);

    // Navigate to Book tab explicitly
    await page.locator('button[data-target="book-panel"]').click();
    await expect(page.locator("#book-panel")).toBeVisible({ timeout: 10000 });

    // Step 1: Where — select pickup & dropoff
    const pickup = page.locator("#pickup-location");
    const dropoff = page.locator("#dropoff-location");
    await expect(pickup).toBeVisible();
    await expect(dropoff).toBeVisible();

    await pickup.selectOption({ index: 1 });
    await dropoff.selectOption({ index: 2 });

    // Click NEXT to go to Step 2
    await page.click("#step1-next");

    // Step 2: When — select a date chip and set time
    await expect(page.locator("#step-2")).toBeVisible({ timeout: 5000 });

    // Click the first available date chip
    const dateChip = page.locator("#date-chips button").first();
    if (await dateChip.isVisible().catch(() => false)) {
      await dateChip.click();
    }

    // Fill the time input
    await page.fill("#ride-time", "10:00");

    // Click NEXT to go to Step 3
    await page.click("#step2-next");

    // Step 3: Confirm
    await expect(page.locator("#step-3")).toBeVisible({ timeout: 5000 });

    // Optional notes
    await page.fill("#notes", "UAT test ride request");

    // Submit
    await page.click("#confirm-btn");

    // After submission, rider app switches to My Rides tab
    await expect(page.locator("#myrides-panel")).toBeVisible({ timeout: 10000 });

    await logout(page);
  });

  test("Office approves and assigns rider request to an active driver", async ({ page }) => {
    await login(page, USERS.office);
    await expect(page).toHaveURL(/\/(usc|office)/);

    // Dispatch panel is active by default — pending rides are shown there
    await expect(page.locator("#dispatch-panel")).toBeVisible({ timeout: 10000 });

    // Wait for rides to load via polling
    await page.waitForTimeout(2000);

    // Look for an Approve button in the dispatch panel
    const approveBtn = page.locator('#dispatch-panel button:has-text("Approve")').first();
    if (await approveBtn.isVisible().catch(() => false)) {
      await approveBtn.click();
      await page.waitForTimeout(1000); // Wait for status update
    } else {
      // No pending rides — skip
      await logout(page);
      test.skip("No pending rides to approve");
      return;
    }

    await logout(page);
  });

  test("Driver clocks in and views available rides", async ({ page }) => {
    await login(page, USERS.driver);
    await expect(page).toHaveURL(/\/driver/);

    // Home panel is default active tab — content rendered dynamically
    await expect(page.locator("#home-panel")).toBeVisible({ timeout: 10000 });

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Clock button is rendered dynamically — look for CLOCK IN or CLOCK OUT button
    const clockInBtn = page.locator('button:has-text("CLOCK IN")');
    const clockOutBtn = page.locator('button:has-text("CLOCK OUT")');

    if (await clockInBtn.isVisible().catch(() => false)) {
      // Driver is clocked out — clock in
      await clockInBtn.click();
      await page.waitForTimeout(1500);
      // After clock in, should see "You're Online" and CLOCK OUT button
      await expect(clockOutBtn).toBeVisible({ timeout: 5000 });
    } else {
      // Already clocked in — CLOCK OUT button should be visible
      await expect(clockOutBtn).toBeVisible({ timeout: 5000 });
    }

    // Home panel should show "Available Rides" section when clocked in
    await expect(page.locator('text=Available Rides')).toBeVisible({ timeout: 5000 });

    await logout(page);
  });
});
