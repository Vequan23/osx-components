# Composition patterns

## Product workspace

Use `osx-app-shell` as the layout owner. Put primary navigation in `sidebar`, persistent actions in `toolbar`, contextual detail in `inspector`, creation input in `composer`, and concise state in `status`. Keep page-specific content in the default slot.

Set `resizable` when desktop users benefit from changing the navigation or inspector width. Configure the four pixel bounds for the product's content, listen for `panel-resize`, and let the host persist the preference. Resize handles disappear when the shell stacks on narrow screens.

Do not repeat project identity, model identity, or run status in multiple shell regions. Give each fact one stable home.

## Agent workbench

Compose:

1. `osx-agent-message` for the conversation.
2. `osx-thinking` for an optional progress summary.
3. `osx-plan` for explicit task steps.
4. `osx-tool-call` for bounded actions and inspectable output.
5. `osx-artifact` or `osx-diff-viewer` for generated work.
6. `osx-agent-approval` before consequential actions.
7. `osx-agent-composer` as the persistent input.

Show the response immediately after completion. Keep raw tool traces in activity, not in the primary response body. Never manufacture changes when the agent answered with analysis only.

## Repository comprehension

Use `osx-file-tree` beside `osx-diff-viewer` or an artifact preview. Use a resizable `osx-split-view` when both panes need sustained attention. Put verification output in `osx-terminal`; summarize the result in an alert or status bar rather than duplicating the complete log.

## Settings

Use semantic headings and copy, `osx-text-field` for single-line values, and `osx-textarea` for multi-line content. Use `osx-radio-group` when a mutually exclusive choice should stay visible, `osx-select` when space matters, toggles for immediate binary settings, checkboxes for independent selection, and segmented controls for switching among a few views. Put validation text in the controls' `error` props so it remains programmatically associated. Use a sheet or dialog only when the decision must interrupt the current workflow.

## Data-heavy views

Use `osx-data-table` for application records that need search, sorting, selection, or pagination. Use server mode when the host owns remote filtering and pagination. Keep row actions explicit and avoid making every cell independently clickable.

Pair the table with:

- `osx-empty-state` before data exists.
- `osx-skeleton` when the table shape is not yet known.
- the table's loading state when rows are refreshing in place.
- `osx-alert` for recoverable fetch errors.
- `osx-toast` for completed mutations.

## Responsive hierarchy

Preserve task order on narrow screens. Collapse secondary navigation and inspectors before compressing primary content. Allow data tables, diffs, terminals, and file trees to scroll within their own bounded regions. Do not reduce typography below 12px to make dense layouts fit.
