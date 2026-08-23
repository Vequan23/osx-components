import type { DefineComponent } from "vue";

export type OsxButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "small" | "medium";
  disabled?: boolean;
  loading?: boolean;
};

export type OsxCheckboxProps = { checked?: boolean; label?: string; disabled?: boolean; indeterminate?: boolean };
export type OsxProgressProps = { value?: number; max?: number; indeterminate?: boolean; label?: string };
export type OsxSegmentedControlProps = { items?: string; value?: string; label?: string; disabled?: boolean };
export type OsxSelectProps = { options?: string; value?: string; label?: string; disabled?: boolean };
export type OsxSheetProps = { open?: boolean; title?: string; description?: string; dismissible?: boolean };
export type OsxSourceListProps = { items?: string; value?: string; label?: string; heading?: string; compact?: boolean };
export type OsxSplitViewProps = { orientation?: "horizontal" | "vertical"; primarySize?: string; label?: string };
export type OsxStatusBarProps = { label?: string; status?: "ready" | "working" | "offline"; detail?: string };
export type OsxTextFieldProps = {
  value?: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "search";
  disabled?: boolean;
  hint?: string;
};
export type OsxToolbarProps = { label?: string; compact?: boolean };
export type OsxWindowProps = { title?: string; subtitle?: string; active?: boolean; closeable?: boolean; minimizable?: boolean; zoomable?: boolean };

export const OsxButtonComponent: DefineComponent<OsxButtonProps>;
export const OsxCheckboxComponent: DefineComponent<OsxCheckboxProps>;
export const OsxProgressComponent: DefineComponent<OsxProgressProps>;
export const OsxSegmentedControlComponent: DefineComponent<OsxSegmentedControlProps>;
export const OsxSelectComponent: DefineComponent<OsxSelectProps>;
export const OsxSheetComponent: DefineComponent<OsxSheetProps>;
export const OsxSourceListComponent: DefineComponent<OsxSourceListProps>;
export const OsxSplitViewComponent: DefineComponent<OsxSplitViewProps>;
export const OsxStatusBarComponent: DefineComponent<OsxStatusBarProps>;
export const OsxTextFieldComponent: DefineComponent<OsxTextFieldProps>;
export const OsxToolbarComponent: DefineComponent<OsxToolbarProps>;
export const OsxWindowComponent: DefineComponent<OsxWindowProps>;

export const componentDefinitions: {
  "osx-button": typeof OsxButtonComponent;
  "osx-checkbox": typeof OsxCheckboxComponent;
  "osx-progress": typeof OsxProgressComponent;
  "osx-segmented-control": typeof OsxSegmentedControlComponent;
  "osx-select": typeof OsxSelectComponent;
  "osx-sheet": typeof OsxSheetComponent;
  "osx-source-list": typeof OsxSourceListComponent;
  "osx-split-view": typeof OsxSplitViewComponent;
  "osx-status-bar": typeof OsxStatusBarComponent;
  "osx-text-field": typeof OsxTextFieldComponent;
  "osx-toolbar": typeof OsxToolbarComponent;
  "osx-window": typeof OsxWindowComponent;
};

export type OsxComponentName = keyof typeof componentDefinitions;
export function registerOsxComponents(): void;
