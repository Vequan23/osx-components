export function emitElementEvent<T extends unknown[]>(
  host: HTMLElement | null,
  type: string,
  detail: T,
): boolean {
  if (!host) return true;
  return host.dispatchEvent(new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail,
  }));
}

export function updateElementState<T>(
  host: HTMLElement | null,
  property: "checked" | "indeterminate" | "value",
  value: T,
): void {
  if (!host) return;
  (host as HTMLElement & Record<typeof property, T>)[property] = value;
}
