# Quality standard

## Visual consistency

- Use one theme boundary and the shared `--osx-*` tokens.
- Use published spacing, radii, borders, and control sizes before adding custom values.
- Keep icon geometry consistent through `osx-icon` and supported component icon props.
- Avoid redundant headers, duplicate status labels, and decorative controls without a task.
- Keep every rendered font size at 12px or larger.

## Interaction

- Make the primary action obvious and singular within each decision surface.
- Clear forms after successful submission when retention would cause accidental duplicates.
- Show immediate feedback for save, submit, copy, connection, and destructive operations.
- Return focus after dismissing a modal or popover.
- Ensure loading states explain what is happening and do not trap the user.

## Accessibility

- Use semantic components and landmarks.
- Provide visible labels for inputs and text labels or accessible names for every action.
- Use `osx-icon-button` only with `label`.
- Keep status textual; color and icons may reinforce it but cannot be the only signal.
- Verify focus visibility and logical keyboard order.
- Respect reduced motion and sufficient contrast in Aqua, Graphite, and Panther where applicable.

## Responsive behavior

- Test at a desktop width and at 390px or narrower.
- Check the document and each dense component for unintended horizontal overflow.
- Stack toolbars and action groups deliberately rather than squeezing labels.
- Keep interactive targets usable by touch.

## Technical verification

1. Run the host typecheck and tests.
2. Run the production build.
3. Run `audit-osx-ui.mjs` against the changed source tree.
4. Exercise critical interactions in a browser.
5. Check the browser console for new errors and warnings.
6. Report any missing primitive or intentional native control instead of silently duplicating the design system.
