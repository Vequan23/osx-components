# OSX Components

OSX Components is an open-source collection of OS X-inspired web components authored with Vue 3. Components render through the Custom Elements API, so they work in Vue, React, Svelte, Astro, or plain HTML.

The project recreates the interaction language—not Apple assets or source code—with accessible controls, Shadow DOM encapsulation, and a shared token contract.

## Install

```bash
npm install osx-components
```

```ts
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";

registerOsxComponents();
```

## Build with an AI agent

Install the versioned `build-with-osx-components` skill so coding agents select real components, follow the theme and accessibility contracts, and verify the finished interface instead of approximating the system from screenshots.

```bash
# Portable Agent Skills location; works with compatible agents
npx osx-components agent install

# Agent-specific project installation
npx osx-components agent install --target codex
npx osx-components agent install --target claude
npx osx-components agent install --target opencode
npx osx-components agent install --target cursor

# Install every project adapter
npx osx-components agent install --target all
```

Use `--scope user` with `agents`, `codex`, `claude`, or `opencode` to install the skill globally. Re-run with `--force` after upgrading the package. Cursor rules remain project scoped.

The skill includes component-selection guidance, framework integration patterns, application and agent-workspace compositions, the project quality standard, and a deterministic interface audit:

```bash
npx osx-components agent install --target agents
node .agents/skills/build-with-osx-components/scripts/audit-osx-ui.mjs .
```

```html
<div data-osx-theme="aqua">
  <osx-window title="Preferences" subtitle="Appearance">
    <osx-toolbar slot="toolbar">
      <strong slot="leading">General</strong>
      <osx-button slot="trailing" size="small">Show All</osx-button>
    </osx-toolbar>
    <osx-button variant="primary">Save changes</osx-button>
  </osx-window>
</div>
```

## Themes

Set `data-osx-theme` on any ancestor. Tokens inherit across each component's Shadow DOM boundary.

- `aqua` — bright blue, translucent highlights, and cool raised surfaces
- `graphite` — the Aqua structure with a neutral accent system
- `panther` — a dark interpretation designed as if the original system had shipped one

Every visual decision is exposed through `--osx-*` custom properties. Override the tokens on an application shell or an individual component.

## Components

| Element | Purpose |
| --- | --- |
| `<osx-app-shell>` | Responsive application workspace with toolbar, sidebar, content, composer, inspector, and status slots |
| `<osx-agent-composer>` | Prompt input with Enter-to-send, busy state, model context, and stop action |
| `<osx-agent-message>` | User, assistant, system, streaming, and error conversation states |
| `<osx-agent-run-status>` | Plan, work, verify, complete, and failure lifecycle visualization |
| `<osx-agent-approval>` | Risk-aware human approval with explicit action scope |
| `<osx-thinking>` | Collapsible, streaming reasoning summaries and progress traces |
| `<osx-plan>` | Ordered agent steps with pending, active, done, failed, and skipped states |
| `<osx-artifact>` | Generated file, document, and code output with copy, download, open, and version actions |
| `<osx-markdown>` | Injection-safe, streaming Markdown with code copy, tables, lists, quotes, and links |
| `<osx-citation>` | Inline citation chip for grounded RAG and search responses |
| `<osx-source-panel>` | Coordinated source list with selection, domains, and supporting excerpts |
| `<osx-tool-call>` | Expandable queued, running, successful, and failed tool activity |
| `<osx-diff-viewer>` | Unified and split code review with line numbers, statistics, and layout controls |
| `<osx-terminal>` | Command output with lifecycle state, rerun, interrupt, and clear actions |
| `<osx-file-tree>` | Filterable repository hierarchy with selection and Git status markers |
| `<osx-alert>` | Persistent information, success, warning, and error feedback |
| `<osx-toast>` | Transient notifications with placement, timeout, and dismissal control |
| `<osx-shimmer>` | Flexible reduced-motion-aware loading placeholder |
| `<osx-skeleton>` | Text, profile, and card loading compositions |
| `<osx-spinner>` | Compact reduced-motion-aware indeterminate activity feedback |
| `<osx-icon>` | Curated Lucide SVG iconography with consistent sizing and accessible labels |
| `<osx-icon-button>` | Accessible icon-only actions with standardized hit areas and states |
| `<osx-tooltip>` | Supplemental hover and focus hints for compact controls |
| `<osx-popover>` | Anchored contextual content with explicit dismissal |
| `<osx-menu>` | Keyboard-oriented collections of application commands |
| `<osx-menu-item>` | Action and checkbox menu rows with optional shortcuts |
| `<osx-tabs>` | Related content panels with roving keyboard selection |
| `<osx-dialog>` | Centered modal with focus management and controlled actions |
| `<osx-ecosystem-card>` | Transparent first-party product discovery with provenance and host-owned tracking hooks |
| `<osx-empty-state>` | Zero-data guidance with an optional recovery action |
| `<osx-badge>` | Compact status, count, and category labels |
| `<osx-avatar>` | Initials, image fallback, and presence status |
| `<osx-heading>` | Semantic display, title, section, and label typography |
| `<osx-copy>` | Body copy with readable measures, sizes, tones, and emphasis |
| `<osx-link>` | Native navigation with external, download, and disabled states |
| `<osx-button>` | Default, primary, danger, loading, compact, and Lucide icon actions |
| `<osx-checkbox>` | Checked, mixed, disabled, and slotted-label states |
| `<osx-toggle>` | Immediate on/off settings with native switch semantics |
| `<osx-window>` | Window chrome, controls, toolbar and footer slots |
| `<osx-toolbar>` | Three-region application toolbar |
| `<osx-segmented-control>` | Accessible single-selection view control |
| `<osx-select>` | Native selection with OS X pop-up styling |
| `<osx-sheet>` | Window-attached confirmation and task dialog |
| `<osx-source-list>` | Finder-style application navigation |
| `<osx-split-view>` | Primary-detail horizontal or vertical layout |
| `<osx-status-bar>` | Readiness, activity, and connection state |
| `<osx-table>` | Responsive native data table with sortable columns and safe narrow-screen scrolling |
| `<osx-data-table>` | Searchable, sortable, selectable, paginated application data with client and server orchestration modes |
| `<osx-text-field>` | Labeled text, email, password, and search inputs with optional Lucide icons |
| `<osx-progress>` | Determinate and indeterminate progress |

## Events

Custom-element events expose Vue event arguments in `event.detail`.

```js
document.querySelector("osx-segmented-control")
  .addEventListener("change", (event) => console.log(event.detail[0]));
```

`<osx-window>` emits `close`, `minimize`, and `zoom`. `<osx-sheet>` emits `close` and `confirm`. Selection and form components emit `change`; `<osx-text-field>` also emits `input`, and `<osx-table>` emits `sort` with the selected key and direction. `<osx-data-table>` emits `search`, `sort`, `page-change`, `page-size-change`, `selection-change`, and `row-activate`, allowing its client-side behavior to be replaced by server orchestration without changing the visual contract. `<osx-ecosystem-card>` emits `activate` with its product name, destination, and optional tracking ID. It never sends analytics or makes network requests itself; the host application decides whether and how to measure discovery.

Agent events preserve backend neutrality. `<osx-agent-composer>` emits `input`, `submit`, and `stop`; `<osx-agent-approval>` emits `approve` and `reject`; `<osx-thinking>` emits `toggle`; `<osx-artifact>` emits `copy`, `download`, and `open`; `<osx-markdown>` emits `copy`; and citations coordinate through `activate` and `select`. `<osx-diff-viewer>` emits `view-change` and `copy`; `<osx-terminal>` emits `rerun`, `interrupt`, and `clear`; `<osx-file-tree>` emits `select` and `toggle`. `<osx-alert>` emits `dismiss`; `<osx-toast>` emits `dismiss` with either `manual` or `timeout` as its reason. Your application owns model calls, tool execution, permission policy, persistence, and streaming transport.

## Icons

`<osx-icon>` is the library's shared icon contract. It exposes a curated 56-icon vocabulary from the maintained `@lucide/vue` package, using direct SVG component imports instead of an icon font. Icons share Lucide's consistent stroke geometry and support custom size, stroke width, and accessible labels. Decorative icons are hidden from assistive technology; pass `label` when an icon carries meaning.

Use `<osx-icon-button>` for icon-only actions. It requires an accessible label and standardizes small, medium, and large hit areas; pair unfamiliar actions with `<osx-tooltip>` for visible guidance. Standard `<osx-button>` actions accept `icon` and `icon-position` when an icon should reinforce a visible text label.

## Agent workspace

The agent components are deliberately composable. The shell manages layout; it does not execute tools or call a model.

```html
<osx-app-shell app-title="Project Agent" inspector-open>
  <nav slot="sidebar">...</nav>
  <osx-agent-message message-role="assistant" author="Agent" model="Your model">
    <p>I inspected the change and verified the focused test.</p>
  </osx-agent-message>
  <osx-agent-composer slot="composer" model="Provider · Model"></osx-agent-composer>
  <aside slot="inspector">...</aside>
  <osx-status-bar slot="status" label="Ready"></osx-status-bar>
</osx-app-shell>
```

## Framework starters

The showcase includes shareable, URL-addressable starters for HTML, Vue, React, and Svelte. Choose a framework in the [Snippet Lab](https://osx-components.vercel.app/#snippets), copy the generated component shell, or share a URL such as `?framework=react#snippets`.

## Component explorer

The [Component Explorer](https://osx-components.vercel.app/components) is a Storybook-style second entry point with searchable, deep-linkable, live examples of every published element. It is built from the same package entry point consumers install, so the stories exercise the actual Custom Elements API rather than a private Vue-only layer.

## Development

```bash
npm install
npm run dev
npm run check
npm run build:site
```

The showcase deliberately consumes the library as native HTML elements. That keeps framework independence honest. `npm run build` creates the publishable component package in `dist`; `npm run build:site` creates the deployable showcase in `site-dist`.

## Direction

The next useful components are breadcrumbs, date pickers, command palettes, disclosure groups, context meters, and inspector panels. Visual fidelity matters, but accessibility and predictable web behavior win when the two conflict.

## License

MIT. “Mac,” “Mac OS,” and “OS X” are trademarks of Apple Inc. This independent project is not affiliated with or endorsed by Apple.
