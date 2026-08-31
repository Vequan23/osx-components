import { computed, useAttrs, type ComputedRef } from "vue";

/**
 * Reads the native HTMLElement.title property through its reflected attribute.
 *
 * Vue custom elements warn when a component redeclares `title` because the
 * property already belongs to HTMLElement. Keeping it as a host attribute
 * preserves the public HTML and JavaScript contract without shadowing the
 * platform property.
 */
export function useHostTitle(fallback: string): ComputedRef<string> {
  const attributes = useAttrs();
  return computed(() => typeof attributes.title === "string" ? attributes.title : fallback);
}
