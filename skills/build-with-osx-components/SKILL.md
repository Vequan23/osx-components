---
name: build-with-osx-components
description: Build, refactor, or review web interfaces that use the @vraxis/osx-components package and its OS X-inspired custom elements. Use for application shells, dashboards, settings, data tables, agent workbenches, feedback, typography, theming, icons, responsive layouts, accessibility, or migrations from bespoke controls to OSX Components in HTML, Vue, React, Svelte, Astro, and other web projects.
---

# Build with OSX Components

Build cohesive interfaces from the published primitives before creating custom UI. Treat the package as a framework-neutral Custom Elements design system: the host owns application state, data, routing, model calls, tool execution, persistence, and analytics.

## Workflow

1. Inspect the host project before editing.
   - Identify its framework, package manager, entry point, theme root, and existing `@vraxis/osx-components` version.
   - Search for existing OSX Components usage and preserve established composition patterns.
   - Do not install, upgrade, or replace dependencies unless the task authorizes it.
2. Choose primitives before writing markup.
   - Read [references/component-selection.md](references/component-selection.md) when selecting or combining components.
   - Inspect `node_modules/@vraxis/osx-components/types/index.d.ts` for the exact installed API. In the library repository, inspect `types/index.d.ts` and `demo/component-docs.ts`.
   - Never invent a component, prop, slot, event, token, or icon name.
3. Integrate once at the application boundary.
   - Import `@vraxis/osx-components/theme.css` once.
   - Call `registerOsxComponents()` once in the client entry point.
   - Set `data-osx-theme="aqua"`, `graphite`, or `panther` on a stable ancestor.
   - Read [references/framework-usage.md](references/framework-usage.md) only for the active framework.
4. Compose the interface.
   - Read [references/composition-patterns.md](references/composition-patterns.md) for shells, agent workspaces, settings, repository tools, and data-heavy views.
   - Prefer component props and slots over shadow-root overrides.
   - Use `--osx-*` tokens for intentional product-level customization.
   - Keep application behavior outside the components and respond to emitted custom events.
5. Verify the finished experience.
   - Read [references/quality-standard.md](references/quality-standard.md).
   - Run the host project's typecheck, tests, and production build.
   - Run `node <skill-directory>/scripts/audit-osx-ui.mjs <project-root>` and address errors. Use `--strict` when warnings should block completion.
   - Exercise keyboard behavior and inspect desktop and mobile layouts in a real browser.

## Non-negotiable rules

- Keep rendered text at 12px or larger.
- Use `<osx-icon>` or component icon props with a supported Lucide name. Do not use emoji, Unicode symbols, or improvised text glyphs as interface icons.
- Use `<osx-icon-button label="…">` for icon-only actions. Pair unfamiliar compact actions with `<osx-tooltip>`.
- Prefer native-semantic components over clickable generic containers.
- Preserve visible focus, keyboard operation, accessible names, textual status, and reduced-motion behavior.
- Do not convey state with color alone.
- Do not make Apple affiliation claims or copy Apple assets. Reuse the interaction language and token system only.
- Do not make components perform hidden network requests, analytics, model calls, or privileged actions. Keep those decisions with the host.
- Do not expose private reasoning as chain-of-thought. Use `<osx-thinking>` for a concise model-provided progress or reasoning summary.
- Do not create a new primitive merely to reproduce a published component. Compose existing primitives first.

## Event and data boundary

Custom-element events expose Vue event arguments in `event.detail`. Read the first emitted argument with `event.detail[0]` unless the installed type or documentation says otherwise.

Assign arrays and objects as DOM properties when possible. JSON attributes remain useful for static HTML examples, but property assignment avoids escaping errors and preserves value types.

## Completion report

State which OSX Components were used, any intentional custom CSS or missing primitive, the theme verified, and the checks run. Mention unresolved accessibility, mobile, or API uncertainty explicitly.
