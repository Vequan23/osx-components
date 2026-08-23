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
| `<osx-tool-call>` | Expandable queued, running, successful, and failed tool activity |
| `<osx-diff-viewer>` | Unified and split code review with line numbers, statistics, and layout controls |
| `<osx-terminal>` | Command output with lifecycle state, rerun, interrupt, and clear actions |
| `<osx-file-tree>` | Filterable repository hierarchy with selection and Git status markers |
| `<osx-alert>` | Persistent information, success, warning, and error feedback |
| `<osx-toast>` | Transient notifications with placement, timeout, and dismissal control |
| `<osx-shimmer>` | Flexible reduced-motion-aware loading placeholder |
| `<osx-skeleton>` | Text, profile, and card loading compositions |
| `<osx-icon>` | Consistent dependency-free SVG iconography with accessible labels |
| `<osx-button>` | Default, primary, danger, loading, and compact actions |
| `<osx-checkbox>` | Checked, mixed, disabled, and slotted-label states |
| `<osx-window>` | Window chrome, controls, toolbar and footer slots |
| `<osx-toolbar>` | Three-region application toolbar |
| `<osx-segmented-control>` | Accessible single-selection view control |
| `<osx-select>` | Native selection with OS X pop-up styling |
| `<osx-sheet>` | Window-attached confirmation and task dialog |
| `<osx-source-list>` | Finder-style application navigation |
| `<osx-split-view>` | Primary-detail horizontal or vertical layout |
| `<osx-status-bar>` | Readiness, activity, and connection state |
| `<osx-text-field>` | Labeled text, email, password, and search inputs |
| `<osx-progress>` | Determinate and indeterminate progress |

## Events

Custom-element events expose Vue event arguments in `event.detail`.

```js
document.querySelector("osx-segmented-control")
  .addEventListener("change", (event) => console.log(event.detail[0]));
```

`<osx-window>` emits `close`, `minimize`, and `zoom`. `<osx-sheet>` emits `close` and `confirm`. Selection and form components emit `change`; `<osx-text-field>` also emits `input`.

Agent events preserve backend neutrality. `<osx-agent-composer>` emits `input`, `submit`, and `stop`; `<osx-agent-approval>` emits `approve` and `reject`. `<osx-diff-viewer>` emits `view-change` and `copy`; `<osx-terminal>` emits `rerun`, `interrupt`, and `clear`; `<osx-file-tree>` emits `select` and `toggle`. `<osx-alert>` emits `dismiss`; `<osx-toast>` emits `dismiss` with either `manual` or `timeout` as its reason. Your application owns model calls, tool execution, permission policy, persistence, and streaming transport.

## Icons

`<osx-icon>` is the library's shared icon contract. It ships a deliberately small, dependency-free set of inline SVG symbols with a consistent 24×24 view box, rounded stroke geometry, and `16`, `20`, or `24` pixel application sizes. Decorative icons are hidden from assistive technology; pass `label` when an icon carries meaning. Components can still accept slotted custom artwork when a product needs its own visual language.

Use icons to clarify an action, not decorate every label. Pair unfamiliar icon-only actions with a tooltip in your application and preserve a minimum 32×32 pixel hit area.

## Agent workspace

The agent components are deliberately composable. The shell manages layout; it does not execute tools or call a model.

```html
<osx-app-shell app-title="Project Agent" inspector-open>
  <nav slot="sidebar">...</nav>
  <osx-agent-message author="Agent" model="Your model">
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

The next useful components are menus, popovers, tabs, context meters, artifact cards, citations, and inspector panels. Visual fidelity matters, but accessibility and predictable web behavior win when the two conflict.

## License

MIT. “Mac,” “Mac OS,” and “OS X” are trademarks of Apple Inc. This independent project is not affiliated with or endorsed by Apple.
