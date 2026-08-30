import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components.html");
  await expect(page.getByRole("heading", { name: "Every component, rendered." })).toBeVisible();
});

test("marketing site and component explorer default to Dark Graphite", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("data-osx-theme", "graphite-dark");
  await expect(page.getByRole("radio", { name: "Dark Graphite" })).toHaveAttribute("aria-checked", "true");

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-osx-theme", "graphite-dark");
  await expect(page.locator("#theme-picker").getByRole("radio", { name: "Dark Graphite" })).toHaveAttribute("aria-checked", "true");
});

test("explorer has no serious accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).exclude("osx-app-shell").analyze();
  const serious = results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
  expect(serious, serious.map((item) => `${item.id}: ${item.help}`).join("\n")).toEqual([]);
});

test("changed forms and app shell have no serious violations in every theme", async ({ page }) => {
  for (const theme of ["Aqua", "Graphite", "Panther", "Dark Graphite"]) {
    await page.getByRole("radio", { name: theme, exact: true }).click();
    const results = await new AxeBuilder({ page })
      .include("#story-osx-app-shell")
      .include("#story-osx-text-field")
      .include("#story-osx-textarea")
      .include("#story-osx-select")
      .include("#story-osx-radio-group")
      .include("#story-osx-agent-composer")
      .analyze();
    const serious = results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""));
    expect(serious, `${theme}: ${serious.map((item) => `${item.id}: ${item.help}`).join("\n")}`).toEqual([]);
  }
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

test("documentation disclosures align and advertise their action", async ({ page }) => {
  const cards = page.locator("#story-osx-agent-composer, #story-osx-agent-message");
  const summaries = cards.locator(".story-docs summary");
  await expect(summaries).toHaveCount(2);
  await expect(summaries.first()).toContainText("View details");
  await expect(summaries.nth(1)).toContainText("View details");
  await summaries.first().click();
  await expect(summaries.first()).toContainText("Hide details");
  await expect(cards.first().locator(".story-docs")).toHaveAttribute("open", "");
});

test("component discovery is alphabetical and the Lucide catalog is complete", async ({ page }) => {
  const labels = await page.locator("#story-nav a").allTextContents();
  expect(labels).toEqual([...labels].sort((left, right) => left.localeCompare(right)));
  await expect(page.locator("#catalog-icon-grid > div")).toHaveCount(59);
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
  await composer.evaluate((element) => {
    (window as Window & { __composerInputEvents?: unknown[] }).__composerInputEvents = [];
    element.addEventListener("input", (event) => {
      const custom = event as CustomEvent;
      (window as Window & { __composerInputEvents?: unknown[] }).__composerInputEvents?.push({ detail: custom.detail, bubbles: custom.bubbles, composed: custom.composed });
    });
  });
  await input.fill("Review the patch");
  expect(await page.evaluate(() => (window as Window & { __composerInputEvents?: unknown[] }).__composerInputEvents)).toEqual([{ detail: ["Review the patch"], bubbles: true, composed: true }]);
  expect(await composer.evaluate((element) => (element as HTMLElement & { value: string }).value)).toBe("Review the patch");
  await composer.evaluate((element) => element.addEventListener("submit", (event: Event) => { (window as Window & { __submittedPrompt?: string }).__submittedPrompt = String((event as CustomEvent).detail?.[0]); }, { once: true }));
  await input.press("Enter");
  expect(await page.evaluate(() => (window as Window & { __submittedPrompt?: string }).__submittedPrompt)).toBe("Review the patch");
});

test("composer searches commands, skills, and context without moving textbox focus", async ({ page }) => {
  const composer = page.locator("#catalog-composer");
  const input = composer.getByRole("textbox", { name: "Message to agent" });
  await composer.evaluate((element) => {
    (window as Window & { __composerQueries?: unknown[]; __composerSelections?: unknown[]; __composerCommands?: unknown[]; __composerContext?: unknown[] }).__composerQueries = [];
    (window as Window & { __composerSelections?: unknown[] }).__composerSelections = [];
    (window as Window & { __composerCommands?: unknown[] }).__composerCommands = [];
    element.addEventListener("suggestion-query", (event) => (window as Window & { __composerQueries?: unknown[] }).__composerQueries?.push((event as CustomEvent).detail?.[0]));
    element.addEventListener("suggestion-select", (event) => (window as Window & { __composerSelections?: unknown[] }).__composerSelections?.push((event as CustomEvent).detail));
    element.addEventListener("command-select", (event) => (window as Window & { __composerCommands?: unknown[] }).__composerCommands?.push((event as CustomEvent).detail));
    element.addEventListener("context-change", (event) => { (window as Window & { __composerContext?: unknown[] }).__composerContext = (event as CustomEvent).detail?.[0]; });
  });

  await input.fill("/");
  await expect(input).toBeFocused();
  const commands = composer.getByRole("listbox", { name: "Commands" });
  await expect(commands).toBeVisible();
  await expect(commands.getByRole("option")).toHaveCount(3);
  await expect(input).toHaveAttribute("aria-activedescendant", /command-model/);
  await input.press("Enter");
  await expect(input).toHaveValue("");
  expect((await page.evaluate(() => (window as Window & { __composerCommands?: Array<[unknown, { trigger?: string; query?: string; behavior?: string; value?: string }]> }).__composerCommands))?.at(-1)?.[1]).toEqual({ trigger: "/", query: "", behavior: "emit", value: "" });

  await input.fill("/");
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute("aria-activedescendant", /command-plan/);
  await input.press("Enter");
  await expect(input).toHaveValue("/plan ");
  await expect(commands).toBeHidden();
  const commandSelection = (await page.evaluate(() => (window as Window & { __composerCommands?: Array<[{ id?: string }, { behavior?: string; value?: string }]> }).__composerCommands))?.at(-1);
  expect(commandSelection?.[0]?.id).toBe("command-plan");
  expect(commandSelection?.[1]).toMatchObject({ behavior: "insert", value: "/plan " });

  await input.fill("$secur");
  const skills = composer.getByRole("listbox", { name: "Skills" });
  await expect(skills.getByRole("option")).toHaveCount(1);
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(composer.getByText("Security Audit", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __composerQueries?: unknown[] }).__composerQueries)).toContainEqual({ trigger: "$", query: "secur" });
  expect((await page.evaluate(() => (window as Window & { __composerSelections?: Array<[{ id?: string }]> }).__composerSelections))?.at(-1)?.[0]?.id).toBe("skill-security");
  expect((await page.evaluate(() => (window as Window & { __composerContext?: Array<{ id?: string }> }).__composerContext))?.map((item) => item.id)).toContain("skill-security");

  await input.fill("@composer");
  await expect(composer.getByRole("listbox", { name: "Context items" })).toBeVisible();
  await input.press("Escape");
  await expect(composer.getByRole("listbox", { name: "Context items" })).toBeHidden();
  await expect(input).toBeFocused();
});

test("composer exposes host-controlled runtime, attachment, submission, voice, and stop contracts", async ({ page }) => {
  const composer = page.locator("#catalog-composer");
  const input = composer.getByRole("textbox", { name: "Message to agent" });
  await composer.evaluate((element) => {
    const state = window as Window & { __composerEvents?: Record<string, unknown[]> };
    state.__composerEvents = {};
    for (const name of ["model-change", "reasoning-change", "access-mode-change", "attachment-request", "attachment-add", "attachment-remove", "voice-request", "submit", "stop"]) {
      element.addEventListener(name, (event) => { state.__composerEvents![name] = (event as CustomEvent).detail; });
    }
  });

  await composer.getByRole("button", { name: "Claude Sonnet" }).click();
  const models = composer.getByRole("listbox", { name: "Choose model" });
  await expect(models.getByRole("option")).toHaveCount(4);
  await models.getByRole("option", { name: /GPT-5/ }).click();
  await expect(composer.getByRole("button", { name: "GPT-5" })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __composerEvents?: Record<string, unknown[]> }).__composerEvents?.["model-change"]?.[0])).toBe("gpt");

  await composer.getByRole("button", { name: "High" }).click();
  await composer.getByRole("option", { name: /Max/ }).click();
  await expect(composer.getByRole("button", { name: "Max" })).toBeVisible();
  await composer.getByRole("button", { name: "Workspace" }).click();
  await composer.getByRole("option", { name: /Read only/ }).click();
  await expect(composer.getByRole("button", { name: "Read only" })).toBeVisible();

  await composer.evaluate((element) => { (element as HTMLElement & { attachmentAccept: string }).attachmentAccept = ".md,image/*"; });
  const chooserPromise = page.waitForEvent("filechooser");
  await composer.getByRole("button", { name: "Add attachment" }).click();
  const chooser = await chooserPromise;
  expect(chooser.isMultiple()).toBe(true);
  expect(await chooser.element().getAttribute("accept")).toBe(".md,image/*");
  await chooser.setFiles({ name: "release-notes.md", mimeType: "text/markdown", buffer: Buffer.from("Verified release") });
  await composer.getByRole("button", { name: "Start voice input" }).click();
  expect(await page.evaluate(() => (window as Window & { __composerEvents?: Record<string, unknown[]> }).__composerEvents?.["attachment-request"]?.[0])).toEqual({ accept: ".md,image/*" });
  expect(await page.evaluate(() => ((window as Window & { __composerEvents?: Record<string, unknown[]> }).__composerEvents?.["attachment-add"]?.[0] as File[]).map((file) => ({ name: file.name, type: file.type, size: file.size })))).toEqual([{ name: "release-notes.md", type: "text/markdown", size: 16 }]);
  await expect(composer.getByText("release-notes.md", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __composerEvents?: Record<string, unknown[]> }).__composerEvents?.["voice-request"])).toEqual([]);

  await input.fill("Review the composer contract");
  await input.press("Enter");
  const submission = await page.evaluate(() => (window as Window & { __composerEvents?: Record<string, unknown[]> }).__composerEvents?.submit);
  expect(submission?.[0]).toBe("Review the composer contract");
  expect(submission?.[1]).toMatchObject({ modelId: "gpt", reasoningId: "max", accessModeId: "read" });
  expect((submission?.[1] as { attachments: unknown[] }).attachments).toHaveLength(2);
  expect((submission?.[1] as { contextItems: unknown[] }).contextItems).toHaveLength(2);

  await composer.evaluate((element) => { (element as HTMLElement & { state: string }).state = "streaming"; });
  const stop = composer.getByRole("button", { name: "Stop agent" });
  await expect(stop).toBeVisible();
  await stop.click();
  expect(await page.evaluate(() => (window as Window & { __composerEvents?: Record<string, unknown[]> }).__composerEvents?.stop)).toEqual([]);

  const bounds = await composer.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.client);
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

test("ecosystem cards expose provenance and host-owned activation", async ({ page }) => {
  const card = page.locator("#story-osx-ecosystem-card osx-ecosystem-card").first();
  const link = card.getByRole("link", { name: "Explore Aperta: Aperta" });
  await expect(card.getByText("Built with osx Components")).toBeVisible();
  await expect(link).toHaveAttribute("href", "https://aperta-six.vercel.app/");
  await expect(link).toHaveAttribute("rel", "noreferrer noopener");
  await card.evaluate((element) => {
    element.shadowRoot?.querySelector("a")?.addEventListener("click", (event) => event.preventDefault());
    element.addEventListener("activate", (event) => { (window as Window & { __ecosystemActivation?: unknown }).__ecosystemActivation = (event as CustomEvent).detail?.[0]; }, { once: true });
  });
  await link.click();
  expect(await page.evaluate(() => (window as Window & { __ecosystemActivation?: unknown }).__ecosystemActivation)).toEqual({ name: "Aperta", href: "https://aperta-six.vercel.app/", trackingId: "docs-aperta" });
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
  await toggle.evaluate((element) => element.addEventListener("change", (event) => { (window as Window & { __toggleValue?: boolean }).__toggleValue = Boolean((event as CustomEvent).detail?.[0]); }, { once: true }));
  await control.press("Space");
  await expect(control).not.toBeChecked();
  expect(await page.evaluate(() => (window as Window & { __toggleValue?: boolean }).__toggleValue)).toBe(false);

  await expect(page.locator("#story-osx-spinner osx-spinner").nth(1).getByRole("status", { name: "Loading results" })).toBeVisible();
  await expect(page.locator("#story-osx-button osx-button").nth(1).getByRole("button", { name: "Download" }).locator("svg")).toBeVisible();
});

test("data table searches, sorts, selects, and paginates without losing semantics", async ({ page }) => {
  const table = page.locator("#catalog-data-table");
  await expect(table.getByRole("table", { name: "Distribution opportunities" })).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(6);
  await expect(table.getByText("1–5 of 7")).toBeVisible();

  await table.getByRole("searchbox", { name: "Search Distribution opportunities" }).fill("GitHub");
  await expect(table.getByRole("row")).toHaveCount(3);
  await expect(table.getByText("1–2 of 2")).toBeVisible();
  await table.getByRole("button", { name: "Clear search" }).click();

  await table.getByRole("button", { name: /Score/ }).click();
  await expect(table.getByRole("columnheader", { name: /Score/ })).toHaveAttribute("aria-sort", "ascending");
  const rowCheckboxes = table.getByRole("checkbox");
  await rowCheckboxes.nth(1).check();
  await expect(rowCheckboxes.nth(1)).toBeChecked();

  await table.getByRole("button", { name: "Next page" }).click();
  await expect(table.getByText("6–7 of 7")).toBeVisible();
  await expect(table.getByText("Page 2 of 2")).toBeVisible();
});

test("text fields and file filters keep icon spacing inside the input boundary", async ({ page }) => {
  const fields = page.locator("#story-osx-text-field osx-text-field");
  await expect(fields).toHaveCount(3);
  await expect(fields.nth(0).locator(".field-icon")).toBeVisible();
  await expect(fields.nth(1).getByRole("searchbox", { name: "Filter" })).toBeVisible();
  await expect(fields.nth(2).locator(".icon-trailing .field-icon")).toBeVisible();
  const filter = page.locator("#story-osx-file-tree osx-file-tree .filter");
  const spacing = await filter.evaluate((element) => {
    const icon = element.querySelector("svg")!.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    return { left: icon.left - bounds.left, right: bounds.right - icon.right };
  });
  expect(spacing.left).toBeGreaterThanOrEqual(9);
  expect(spacing.right).toBeGreaterThan(spacing.left);
});

test("text field host delegates focus and keyboard input to its native control", async ({ page }) => {
  const field = page.locator("#story-osx-text-field osx-text-field").first();
  const input = field.getByRole("textbox", { name: "Project name" });

  await field.locator(".label").dispatchEvent("pointerdown");
  await expect(input).toBeFocused();
  await field.evaluate((element) => (element as HTMLElement).focus());
  await expect(input).toBeFocused();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("vraxis-home");

  await expect(input).toHaveValue("vraxis-home");
  expect(await field.evaluate((element) => element.shadowRoot?.delegatesFocus)).toBe(true);
});

test("form controls preserve native input, choice, option, and validation semantics", async ({ page }) => {
  const invalidField = page.locator("#story-osx-text-field osx-text-field").nth(2);
  const account = invalidField.getByRole("textbox", { name: "Account" });
  await expect(account).toHaveAttribute("aria-invalid", "true");
  const fieldDescription = await account.getAttribute("aria-describedby");
  expect(fieldDescription).toBeTruthy();
  await expect(invalidField.locator(`[id="${fieldDescription}"]`)).toContainText("could not be verified");

  const textArea = page.locator("#story-osx-textarea osx-textarea").first();
  const notes = textArea.getByRole("textbox", { name: /Review notes/ });
  await textArea.evaluate((element) => element.addEventListener("input", (event) => { (window as Window & { __textareaValue?: string }).__textareaValue = String((event as CustomEvent).detail?.[0]); }));
  await notes.fill("The contract is ready for review.");
  expect(await page.evaluate(() => (window as Window & { __textareaValue?: string }).__textareaValue)).toBe("The contract is ready for review.");

  const radioGroup = page.locator("osx-radio-group#catalog-radio-group");
  await expect(radioGroup.getByRole("radio")).toHaveCount(3);
  await expect(radioGroup.getByRole("radio", { name: /Managed/ })).toBeDisabled();
  await radioGroup.evaluate((element) => element.addEventListener("change", (event) => { (window as Window & { __radioValue?: string }).__radioValue = String((event as CustomEvent).detail?.[0]); }, { once: true }));
  await radioGroup.getByRole("radio", { name: /Cloud/ }).check();
  expect(await page.evaluate(() => (window as Window & { __radioValue?: string }).__radioValue)).toBe("cloud");

  const checkbox = page.locator("#story-osx-checkbox osx-checkbox").first();
  await checkbox.evaluate((element) => element.addEventListener("change", (event) => { (window as Window & { __checkboxValue?: boolean }).__checkboxValue = Boolean((event as CustomEvent).detail?.[0]); }, { once: true }));
  await checkbox.getByRole("checkbox", { name: "Use smooth scrolling" }).uncheck();
  expect(await page.evaluate(() => (window as Window & { __checkboxValue?: boolean }).__checkboxValue)).toBe(false);

  const select = page.locator("#catalog-select").getByRole("combobox", { name: /Appearance/ });
  await expect(select.locator("option")).toHaveCount(5);
  await expect(select.locator('option[value="classic"]')).toHaveAttribute("disabled", "");
});

test("form controls participate in native submission, validation, reset, and public state", async ({ page }) => {
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "native-form-fixture";
    form.innerHTML = `
      <osx-text-field name="project" label="Project" required></osx-text-field>
      <osx-textarea name="notes" label="Notes" required></osx-textarea>
      <osx-select name="appearance" label="Appearance" required></osx-select>
      <osx-radio-group name="runtime" label="Runtime" required></osx-radio-group>
      <osx-checkbox name="consent" value="accepted" label="Accept" required indeterminate></osx-checkbox>
      <osx-toggle name="tools" value="enabled" label="Tools" checked></osx-toggle>
      <osx-button type="submit">Save</osx-button>
      <osx-button type="reset">Reset</osx-button>
    `;
    document.body.append(form);
    (form.querySelector("osx-select") as HTMLElement & { options: unknown }).options = [
      { value: "", label: "Choose" },
      { value: "aqua", label: "Aqua" },
    ];
    (form.querySelector("osx-radio-group") as HTMLElement & { options: unknown }).options = [
      { value: "local", label: "Local" },
      { value: "cloud", label: "Cloud" },
    ];
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      (window as Window & { __nativeSubmitCount?: number }).__nativeSubmitCount = ((window as Window & { __nativeSubmitCount?: number }).__nativeSubmitCount ?? 0) + 1;
    });
  });

  const form = page.locator("#native-form-fixture");
  await expect.poll(() => form.evaluate((element) => (element as HTMLFormElement).checkValidity())).toBe(false);

  const field = form.locator("osx-text-field");
  await field.evaluate((element) => {
    element.addEventListener("input", (event) => {
      const custom = event as CustomEvent;
      (window as Window & { __formInput?: unknown }).__formInput = {
        bubbles: custom.bubbles,
        composed: custom.composed,
        detail: custom.detail,
        target: (custom.target as Element).localName,
      };
    }, { once: true });
  });
  await field.getByRole("textbox", { name: "Project" }).fill("Vraxis");
  await form.locator("osx-textarea").getByRole("textbox", { name: "Notes" }).fill("Ready");
  await form.locator("osx-select").getByRole("combobox", { name: "Appearance" }).selectOption("aqua");
  await form.locator("osx-radio-group").getByRole("radio", { name: "Cloud" }).check();
  await form.locator("osx-checkbox").getByRole("checkbox", { name: "Accept" }).check();

  expect(await page.evaluate(() => (window as Window & { __formInput?: unknown }).__formInput)).toEqual({
    bubbles: true,
    composed: true,
    detail: ["Vraxis"],
    target: "osx-text-field",
  });
  await expect.poll(() => form.evaluate((element) => (element as HTMLFormElement).checkValidity())).toBe(true);
  expect(await form.evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement)))).toEqual({
    appearance: "aqua",
    consent: "accepted",
    notes: "Ready",
    project: "Vraxis",
    runtime: "cloud",
    tools: "enabled",
  });
  expect(await field.evaluate((element) => (element as HTMLElement & { value: string }).value)).toBe("Vraxis");
  expect(await form.locator("osx-checkbox").evaluate((element) => ({
    checked: (element as HTMLElement & { checked: boolean }).checked,
    indeterminate: (element as HTMLElement & { indeterminate: boolean }).indeterminate,
  }))).toEqual({ checked: true, indeterminate: false });

  await form.getByRole("button", { name: "Save" }).click();
  expect(await page.evaluate(() => (window as Window & { __nativeSubmitCount?: number }).__nativeSubmitCount)).toBe(1);
  await form.getByRole("button", { name: "Reset" }).click();
  await expect.poll(() => field.evaluate((element) => (element as HTMLElement & { value: string }).value)).toBe("");
  await expect(form.locator("osx-checkbox").getByRole("checkbox", { name: "Accept" })).not.toBeChecked();
  await expect(form.locator("osx-toggle").getByRole("switch", { name: "Tools" })).toBeChecked();
});

test("segmented control uses roving focus and remains distinguishable in forced colors", async ({ page }) => {
  const control = page.locator("#story-osx-segmented-control osx-segmented-control");
  const buttons = control.getByRole("radio");
  await expect(buttons.nth(0)).toHaveAttribute("tabindex", "0");
  await expect(buttons.nth(1)).toHaveAttribute("tabindex", "-1");
  await buttons.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(buttons.nth(1)).toBeFocused();
  await expect(buttons.nth(1)).toHaveAttribute("aria-checked", "true");
  expect(await control.evaluate((element) => (element as HTMLElement & { value: string }).value)).toBe("Controls");
  await page.keyboard.press("End");
  await expect(buttons.nth(2)).toBeFocused();
  await expect(buttons.nth(2)).toHaveAttribute("aria-checked", "true");

  await page.emulateMedia({ forcedColors: "active" });
  await expect.poll(() => buttons.nth(2).evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe("3px");
  const forcedColors = await buttons.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).backgroundColor));
  expect(forcedColors[2]).not.toBe(forcedColors[0]);
});

test("app shell fills its assigned height without content-driven growth", async ({ page }, testInfo) => {
  await page.evaluate(() => {
    const fixture = document.createElement("div");
    fixture.id = "app-shell-height-fixture";
    fixture.style.height = "640px";
    fixture.innerHTML = `
      <osx-app-shell app-title="Height contract" inspector-open>
        <nav slot="sidebar">Navigation</nav>
        <div style="height: 1800px">Tall workspace content</div>
        <aside slot="inspector">Inspector</aside>
        <osx-status-bar slot="status" label="Ready"></osx-status-bar>
      </osx-app-shell>
    `;
    document.body.append(fixture);
  });

  const shell = page.locator("#app-shell-height-fixture osx-app-shell");
  const metrics = await shell.evaluate((element) => {
    const root = element.shadowRoot?.querySelector<HTMLElement>(".shell");
    const content = element.shadowRoot?.querySelector<HTMLElement>(".content");
    if (!root || !content) throw new Error("App shell internals did not render");
    return {
      hostHeight: Math.round(element.getBoundingClientRect().height),
      rootHeight: Math.round(root.getBoundingClientRect().height),
      rootClientHeight: root.clientHeight,
      rootScrollHeight: root.scrollHeight,
      rootOverflow: getComputedStyle(root).overflowY,
      contentClientHeight: content.clientHeight,
      contentScrollHeight: content.scrollHeight,
    };
  });

  expect(metrics.hostHeight).toBe(640);
  expect(metrics.rootHeight).toBe(640);
  expect(metrics.contentScrollHeight).toBeGreaterThan(metrics.contentClientHeight);
  if (testInfo.project.name === "mobile") {
    expect(metrics.rootOverflow).toBe("auto");
    expect(metrics.rootScrollHeight).toBeGreaterThanOrEqual(metrics.rootClientHeight);
  } else {
    expect(metrics.rootOverflow).toBe("hidden");
    expect(metrics.rootScrollHeight).toBeLessThanOrEqual(metrics.rootClientHeight);
  }
});

test("app shell panels resize with pointer and keyboard then stack without handles", async ({ page }, testInfo) => {
  const shell = page.locator("#story-osx-app-shell osx-app-shell");
  const handles = shell.locator(".resizer:visible");
  if (testInfo.project.name === "mobile") {
    await expect(handles).toHaveCount(0);
    return;
  }

  await expect(handles).toHaveCount(2);
  const sidebar = shell.getByRole("separator", { name: "Resize navigation panel" });
  const initial = Number(await sidebar.getAttribute("aria-valuenow"));
  await shell.evaluate((element) => element.addEventListener("panel-resize", (event) => { (window as Window & { __panelResize?: unknown[] }).__panelResize = (event as CustomEvent).detail; }));
  await sidebar.focus();
  await page.keyboard.press("ArrowRight");
  await expect(sidebar).toHaveAttribute("aria-valuenow", String(initial + 10));
  expect(await page.evaluate(() => (window as Window & { __panelResize?: unknown[] }).__panelResize)).toEqual(["sidebar", initial + 10]);

  await sidebar.dispatchEvent("pointerdown", { pointerId: 17, button: 0, clientX: 100 });
  await page.evaluate(() => window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 17, clientX: 120 })));
  await page.evaluate(() => window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 17, clientX: 120 })));
  await expect.poll(async () => Number(await sidebar.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(initial + 29);
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
  test.skip(process.platform !== "darwin", "macOS baselines own theme fidelity");
  await page.getByRole("radio", { name: "Aqua" }).click();
  await expect(page.locator("#story-osx-alert")).toHaveScreenshot("alert-aqua.png");
  await expect(page.locator("#story-osx-diff-viewer")).toHaveScreenshot("diff-aqua.png");
  await expect(page.locator("#story-osx-ecosystem-card")).toHaveScreenshot("ecosystem-card-aqua.png");
  await page.getByRole("radio", { name: "Panther" }).click();
  await expect(page.locator("#story-osx-alert")).toHaveScreenshot("alert-panther.png");
  await expect(page.locator("#story-osx-terminal")).toHaveScreenshot("terminal-panther.png");
  await expect(page.locator("#story-osx-ecosystem-card")).toHaveScreenshot("ecosystem-card-panther.png");
  await page.getByRole("radio", { name: "Dark Graphite" }).click();
  await expect(page.locator("#story-osx-alert")).toHaveScreenshot("alert-graphite-dark.png");
  await expect(page.locator("#story-osx-terminal")).toHaveScreenshot("terminal-graphite-dark.png");
  await expect(page.locator("#story-osx-ecosystem-card")).toHaveScreenshot("ecosystem-card-graphite-dark.png");
});
