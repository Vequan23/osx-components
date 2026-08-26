# Framework usage

Register the custom elements once and import the theme once. Avoid invoking `registerOsxComponents()` from every view or component.

## HTML and framework-neutral entry points

```html
<script type="module">
  import { registerOsxComponents } from "osx-components";
  import "osx-components/theme.css";
  registerOsxComponents();
</script>

<main data-osx-theme="panther">
  <osx-button variant="primary" icon="sparkle">Create</osx-button>
</main>
```

For structured data, assign the DOM property:

```js
const table = document.querySelector("osx-data-table");
table.columns = columns;
table.rows = rows;
table.addEventListener("selection-change", (event) => {
  selectedKeys = event.detail[0];
});
```

## Vue

Register from the client entry point:

```ts
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";

registerOsxComponents();
```

Vue templates can bind complex properties directly:

```vue
<osx-data-table
  :columns="columns"
  :rows="rows"
  selectable
  @selection-change="selected = $event.detail[0]"
/>
```

Keep Vue application state outside the custom element. Treat the emitted event as the request to update that state.

## React

Register in a client-only entry module. React 19 handles custom-element properties and events more naturally, but use a ref when a framework or toolchain serializes complex values as attributes.

```tsx
import { useEffect, useRef } from "react";
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";

registerOsxComponents();

export function Results({ rows, columns }) {
  const ref = useRef<HTMLElement & { rows: unknown[]; columns: unknown[] }>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.rows = rows;
    ref.current.columns = columns;
  }, [rows, columns]);
  return <osx-data-table ref={ref} label="Results" />;
}
```

Use `addEventListener` with cleanup when React's event typing does not recognize a custom event.

## Svelte

Register once in a client entry or `onMount`, then assign complex properties through a bound element when necessary.

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { registerOsxComponents } from "osx-components";
  import "osx-components/theme.css";
  onMount(registerOsxComponents);
</script>

<osx-button variant="primary">Save</osx-button>
```

## SSR environments

Call `registerOsxComponents()` only in the browser. Use the framework's client entry, client-only boundary, or mount hook so `customElements` is available. Render stable fallback content where hydration behavior matters.

## Theme boundary

Apply one theme to the highest stable product container:

```html
<div data-osx-theme="aqua">...</div>
```

Nest a different theme only for a deliberate preview or isolated surface. Prefer `--osx-*` token overrides on the product container over penetrating component shadow roots.
