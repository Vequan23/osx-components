# Component selection

Use this guide to choose a primitive. Inspect the installed `types/index.d.ts` before relying on exact props or events.

## Application structure

- `osx-app-shell`: full workspace with toolbar, sidebar, main content, composer, inspector, and status areas.
- `osx-window`: bounded window chrome for demos, settings, and focused surfaces.
- `osx-toolbar`: leading, center, and trailing application actions.
- `osx-source-list`: Finder-style navigation.
- `osx-split-view`: primary-detail or stacked responsive panes.
- `osx-status-bar`: concise connection or activity context.
- `osx-tabs`: switch among related panels without navigation.

## Actions and inputs

- `osx-button`: visible text action, optionally reinforced by a Lucide icon.
- `osx-icon-button`: compact icon-only action with a required accessible label.
- `osx-text-field`: labeled text, email, password, or search input with optional icon.
- `osx-select`: native single-choice input.
- `osx-checkbox`: independent or multi-select choice.
- `osx-toggle`: immediate on/off setting.
- `osx-segmented-control`: compact single selection among a few views.
- `osx-menu` and `osx-menu-item`: keyboard-oriented command collection.

## Data and repository views

- `osx-data-table`: searching, sorting, pagination, selection, loading, row activation, and server orchestration.
- `osx-table`: lightweight native table when advanced orchestration is unnecessary.
- `osx-file-tree`: filterable repository hierarchy with Git status.
- `osx-diff-viewer`: unified or split patch evidence.
- `osx-terminal`: command, output, state, and bounded execution controls.
- `osx-progress`: determinate or indeterminate progress with a measurable task.

## Agent interfaces

- `osx-agent-composer`: prompt entry, submission, busy state, model context, and stop action.
- `osx-agent-message`: user, assistant, system, streaming, and error messages.
- `osx-agent-run-status`: run-level plan, work, verify, completion, and failure lifecycle.
- `osx-agent-approval`: explicit human approval for a bounded action.
- `osx-thinking`: collapsible reasoning summary or progress trace.
- `osx-plan`: task steps with pending, active, done, failed, and skipped states.
- `osx-tool-call`: expandable tool activity.
- `osx-artifact`: generated file, document, or code output.
- `osx-markdown`: safe streaming Markdown.
- `osx-citation` and `osx-source-panel`: coordinated grounded sources.

## Feedback and overlays

- `osx-alert`: persistent contextual feedback.
- `osx-toast`: transient completion or failure notice.
- `osx-empty-state`: absence of data plus an optional recovery action.
- `osx-spinner`: compact indeterminate activity.
- `osx-shimmer` and `osx-skeleton`: layout-preserving loading placeholders.
- `osx-dialog`: centered modal decision or focused content.
- `osx-sheet`: window-attached confirmation or task surface.
- `osx-popover`: anchored contextual content.
- `osx-tooltip`: supplemental hover and focus hint, never an action's only label.

## Content and identity

- `osx-heading`, `osx-copy`, and `osx-link`: semantic typography and navigation.
- `osx-icon`: supported Lucide glyph.
- `osx-avatar`: person or agent identity and presence.
- `osx-badge`: compact category, count, or status.
- `osx-ecosystem-card`: transparent first-party ecosystem discovery with host-owned tracking.

## Selection rule

Use the smallest component that owns the needed semantics. Compose multiple primitives for product-specific layouts; create custom CSS only for arrangement and product identity that tokens and slots do not cover.
