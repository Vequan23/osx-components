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

## Development

```bash
npm install
npm run dev
npm run check
npm run build:site
```

The showcase deliberately consumes the library as native HTML elements. That keeps framework independence honest. `npm run build` creates the publishable component package in `dist`; `npm run build:site` creates the deployable showcase in `site-dist`.

## Direction

The next useful components are menus, popovers, tabs, disclosure groups, list rows, tables, alerts, and inspector panels. Visual fidelity matters, but accessibility and predictable web behavior win when the two conflict.

## License

MIT. “Mac,” “Mac OS,” and “OS X” are trademarks of Apple Inc. This independent project is not affiliated with or endorsed by Apple.
