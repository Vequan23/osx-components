import type { DefineComponent } from "vue";

export type OsxAgentApprovalProps = {
  title?: string;
  description?: string;
  risk?: "low" | "medium" | "high";
  scope?: string;
  approveLabel?: string;
  rejectLabel?: string;
  disabled?: boolean;
};
export type OsxAgentComposerProps = { value?: string; placeholder?: string; model?: string; busy?: boolean; disabled?: boolean; rows?: number };
export type OsxAgentMessageProps = { role?: "user" | "assistant" | "system"; author?: string; model?: string; timestamp?: string; status?: "complete" | "streaming" | "error" };
export type OsxAgentRunStatusProps = { phase?: "planning" | "working" | "verifying" | "complete" | "error"; label?: string; detail?: string };
export type OsxAppShellProps = { appTitle?: string; sidebarWidth?: string; inspectorWidth?: string; inspectorOpen?: boolean; label?: string };

export type OsxButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "small" | "medium";
  disabled?: boolean;
  loading?: boolean;
};

export type OsxCheckboxProps = { checked?: boolean; label?: string; disabled?: boolean; indeterminate?: boolean };
export type OsxDiffViewerProps = { file?: string; patch?: string; view?: "unified" | "split"; language?: string; additions?: number; deletions?: number; label?: string };
export type OsxFileTreeProps = { files?: string; selected?: string; statuses?: string; label?: string; filterable?: boolean };
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
export type OsxTerminalProps = { title?: string; command?: string; output?: string; cwd?: string; status?: "idle" | "running" | "success" | "error"; duration?: string; label?: string };
export type OsxToolbarProps = { label?: string; compact?: boolean };
export type OsxToolCallProps = { name?: string; status?: "queued" | "running" | "success" | "error"; summary?: string; duration?: string; open?: boolean };
export type OsxWindowProps = { title?: string; subtitle?: string; active?: boolean; closeable?: boolean; minimizable?: boolean; zoomable?: boolean };

export const OsxAgentApprovalComponent: DefineComponent<OsxAgentApprovalProps>;
export const OsxAgentComposerComponent: DefineComponent<OsxAgentComposerProps>;
export const OsxAgentMessageComponent: DefineComponent<OsxAgentMessageProps>;
export const OsxAgentRunStatusComponent: DefineComponent<OsxAgentRunStatusProps>;
export const OsxAppShellComponent: DefineComponent<OsxAppShellProps>;
export const OsxButtonComponent: DefineComponent<OsxButtonProps>;
export const OsxCheckboxComponent: DefineComponent<OsxCheckboxProps>;
export const OsxDiffViewerComponent: DefineComponent<OsxDiffViewerProps>;
export const OsxFileTreeComponent: DefineComponent<OsxFileTreeProps>;
export const OsxProgressComponent: DefineComponent<OsxProgressProps>;
export const OsxSegmentedControlComponent: DefineComponent<OsxSegmentedControlProps>;
export const OsxSelectComponent: DefineComponent<OsxSelectProps>;
export const OsxSheetComponent: DefineComponent<OsxSheetProps>;
export const OsxSourceListComponent: DefineComponent<OsxSourceListProps>;
export const OsxSplitViewComponent: DefineComponent<OsxSplitViewProps>;
export const OsxStatusBarComponent: DefineComponent<OsxStatusBarProps>;
export const OsxTextFieldComponent: DefineComponent<OsxTextFieldProps>;
export const OsxTerminalComponent: DefineComponent<OsxTerminalProps>;
export const OsxToolbarComponent: DefineComponent<OsxToolbarProps>;
export const OsxToolCallComponent: DefineComponent<OsxToolCallProps>;
export const OsxWindowComponent: DefineComponent<OsxWindowProps>;

export const componentDefinitions: {
  "osx-agent-approval": typeof OsxAgentApprovalComponent;
  "osx-agent-composer": typeof OsxAgentComposerComponent;
  "osx-agent-message": typeof OsxAgentMessageComponent;
  "osx-agent-run-status": typeof OsxAgentRunStatusComponent;
  "osx-app-shell": typeof OsxAppShellComponent;
  "osx-button": typeof OsxButtonComponent;
  "osx-checkbox": typeof OsxCheckboxComponent;
  "osx-diff-viewer": typeof OsxDiffViewerComponent;
  "osx-file-tree": typeof OsxFileTreeComponent;
  "osx-progress": typeof OsxProgressComponent;
  "osx-segmented-control": typeof OsxSegmentedControlComponent;
  "osx-select": typeof OsxSelectComponent;
  "osx-sheet": typeof OsxSheetComponent;
  "osx-source-list": typeof OsxSourceListComponent;
  "osx-split-view": typeof OsxSplitViewComponent;
  "osx-status-bar": typeof OsxStatusBarComponent;
  "osx-text-field": typeof OsxTextFieldComponent;
  "osx-terminal": typeof OsxTerminalComponent;
  "osx-toolbar": typeof OsxToolbarComponent;
  "osx-tool-call": typeof OsxToolCallComponent;
  "osx-window": typeof OsxWindowComponent;
};

export type OsxComponentName = keyof typeof componentDefinitions;
export function registerOsxComponents(): void;
