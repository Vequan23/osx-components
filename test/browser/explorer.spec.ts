import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components.html");
  await expect(page.getByRole("heading", { name: "Every component, rendered." })).toBeVisible();
});

test("explorer has no serious accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).exclude("osx-app-shell").analyze();
  const serious = results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
  expect(serious, serious.map((item) => `${item.id}: ${item.help}`).join("\n")).toEqual([]);
});

test("documentation is searchable, framework-aware, and keyboard reachable", async ({ page }) => {
  await page.getByPlaceholder("Search components…").fill("toast");
  await expect(page.locator(".story:visible")).toHaveCount(1);
  await page.getByRole("radio", { name: "React" }).click();
  const docs = page.locator("#story-osx-toast .story-docs");
  await docs.locator("summary").click();
  await expect(docs.getByText("React example")).toBeVisible();
  await expect(docs.locator("pre")).toContainText("export function Example");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});

test("component discovery is alphabetical and the Lucide catalog is complete", async ({ page }) => {
  const labels = await page.locator("#story-nav a").allTextContents();
  expect(labels).toEqual([...labels].sort((left, right) => left.localeCompare(right)));
  await expect(page.locator("#catalog-icon-grid > div")).toHaveCount(56);
  await expect(page.locator("#story-osx-icon-button osx-icon-button")).toHaveCount(5);
  await expect(page.locator("#story-osx-icon-button").getByRole("button", { name: "Search" })).toBeVisible();
});

test("sheet supports escape and composer supports enter", async ({ page }) => {
  await page.getByRole("button", { name: "Open sheet" }).click();
  await expect(page.getByRole("dialog", { name: "Install component?" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Install component?" })).toBeHidden();
  const composer = page.locator("#story-osx-agent-composer osx-agent-composer");
  const input = composer.getByRole("textbox", { name: "Message to agent" });
  await input.fill("Review the patch");
  await composer.evaluate((element) => element.addEventListener("submit", (event: Event) => { (window as Window & { __submittedPrompt?: string }).__submittedPrompt = String((event as CustomEvent).detail?.[0]); }, { once: true }));
  await input.press("Enter");
  expect(await page.evaluate(() => (window as Window & { __submittedPrompt?: string }).__submittedPrompt)).toBe("Review the patch");
});

test("catalog has no horizontal overflow", async ({ page }, testInfo) => {
  const size = page.viewportSize();
  const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll, `overflow at ${size?.width}px`).toBeLessThanOrEqual(dimensions.client);
});

test("typography stories preserve semantic hierarchy and link states", async ({ page }) => {
  const display = page.locator("#story-osx-heading osx-heading").first().getByRole("heading", { level: 1, name: "Built for thoughtful software." });
  await expect(display).toBeVisible();
  const links = page.locator("#story-osx-link osx-link");
  await expect(links.nth(0).getByRole("link", { name: "Browse buttons" })).toHaveAttribute("href", "#story-osx-button");
  await expect(links.nth(1).getByRole("link", { name: /View on GitHub/ })).toHaveAttribute("rel", "noreferrer noopener");
  await expect(links.nth(2).getByRole("link", { name: "Unavailable destination" })).toHaveAttribute("aria-disabled", "true");
});

test("agent output primitives preserve structure, state, and source coordination", async ({ page }) => {
  const thinking = page.locator("#story-osx-thinking osx-thinking").first();
  await expect(thinking.locator("details")).toHaveAttribute("aria-busy", "true");
  await expect(thinking.locator("details")).toHaveAttribute("open", "");

  const plan = page.locator("#catalog-plan");
  await expect(plan.locator("li")).toHaveCount(4);
  await expect(plan.locator('[aria-current="step"]')).toContainText("Trace token rotation");

  const markdown = page.locator("#catalog-markdown");
  await expect(markdown.getByRole("heading", { level: 2, name: "Verification result" })).toBeVisible();
  await expect(markdown.locator("pre code")).toContainText("const result");
  await expect(markdown.locator("table")).toBeVisible();
  await expect(markdown.getByRole("button", { name: /Copy .*code/ })).toBeVisible();

  await expect(page.locator("#catalog-artifact").getByRole("button")).toHaveCount(3);
  await expect(page.locator("#catalog-source-panel li")).toHaveCount(3);
  await page.locator("#story-osx-citation osx-citation").nth(1).getByRole("button").click();
  await expect(page.locator("#catalog-source-panel").getByRole("button", { name: /OWASP/ })).toHaveAttribute("aria-pressed", "true");
});

test("data, activity, and switch controls retain native interaction semantics", async ({ page }) => {
  const table = page.locator("#catalog-table");
  await expect(table.getByRole("table", { name: "Recent agent runs" })).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(4);
  const taskHeader = table.getByRole("button", { name: /Task/ });
  await taskHeader.click();
  await expect(table.getByRole("columnheader", { name: /Task/ })).toHaveAttribute("aria-sort", "ascending");
  await taskHeader.click();
  await expect(table.getByRole("columnheader", { name: /Task/ })).toHaveAttribute("aria-sort", "descending");

  const toggle = page.locator("#story-osx-toggle osx-toggle").first();
  const control = toggle.getByRole("switch", { name: "Enable agent tools" });
  await expect(control).toBeChecked();
  await control.press("Space");
  await expect(control).not.toBeChecked();

  await expect(page.locator("#story-osx-spinner osx-spinner").nth(1).getByRole("status", { name: "Loading results" })).toBeVisible();
  await expect(page.locator("#story-osx-button osx-button").nth(1).getByRole("button", { name: "Download" }).locator("svg")).toBeVisible();
});

test("foundation overlays and navigation honor keyboard contracts", async ({ page }) => {
  await expect(page.getByRole("tooltip", { name: "Open component settings" })).toBeVisible();
  await page.getByRole("button", { name: "Project info" }).click();
  await expect(page.getByRole("dialog", { name: "Project details" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Project details" })).toBeHidden();
  const tabs = page.locator("#story-osx-tabs osx-tabs");
  await tabs.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "API" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Open dialog" }).click();
  await expect(page.getByRole("dialog", { name: "Publish component?" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Publish component?" })).toBeHidden();
});

test("signature stories remain visually stable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop baselines own theme fidelity");
  await expect(page.locator("#story-osx-alert")).toHaveScreenshot("alert-aqua.png");
  await expect(page.locator("#story-osx-diff-viewer")).toHaveScreenshot("diff-aqua.png");
  await page.getByRole("radio", { name: "Panther" }).click();
  await expect(page.locator("#story-osx-alert")).toHaveScreenshot("alert-panther.png");
  await expect(page.locator("#story-osx-terminal")).toHaveScreenshot("terminal-panther.png");
});
