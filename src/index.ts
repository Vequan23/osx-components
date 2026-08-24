import { defineCustomElement } from "vue";
import "./theme.css";
import OsxAgentApprovalComponent from "./components/OsxAgentApproval.ce.vue";
import OsxAgentComposerComponent from "./components/OsxAgentComposer.ce.vue";
import OsxAgentMessageComponent from "./components/OsxAgentMessage.ce.vue";
import OsxAgentRunStatusComponent from "./components/OsxAgentRunStatus.ce.vue";
import OsxAlertComponent from "./components/OsxAlert.ce.vue";
import OsxAvatarComponent from "./components/OsxAvatar.ce.vue";
import OsxBadgeComponent from "./components/OsxBadge.ce.vue";
import OsxAppShellComponent from "./components/OsxAppShell.ce.vue";
import OsxButtonComponent from "./components/OsxButton.ce.vue";
import OsxCheckboxComponent from "./components/OsxCheckbox.ce.vue";
import OsxCopyComponent from "./components/OsxCopy.ce.vue";
import OsxDiffViewerComponent from "./components/OsxDiffViewer.ce.vue";
import OsxDialogComponent from "./components/OsxDialog.ce.vue";
import OsxEmptyStateComponent from "./components/OsxEmptyState.ce.vue";
import OsxFileTreeComponent from "./components/OsxFileTree.ce.vue";
import OsxIconComponent from "./components/OsxIcon.ce.vue";
import OsxIconButtonComponent from "./components/OsxIconButton.ce.vue";
import OsxHeadingComponent from "./components/OsxHeading.ce.vue";
import OsxLinkComponent from "./components/OsxLink.ce.vue";
import OsxMenuComponent from "./components/OsxMenu.ce.vue";
import OsxMenuItemComponent from "./components/OsxMenuItem.ce.vue";
import OsxPopoverComponent from "./components/OsxPopover.ce.vue";
import OsxProgressComponent from "./components/OsxProgress.ce.vue";
import OsxSegmentedControlComponent from "./components/OsxSegmentedControl.ce.vue";
import OsxSelectComponent from "./components/OsxSelect.ce.vue";
import OsxSheetComponent from "./components/OsxSheet.ce.vue";
import OsxShimmerComponent from "./components/OsxShimmer.ce.vue";
import OsxSkeletonComponent from "./components/OsxSkeleton.ce.vue";
import OsxSourceListComponent from "./components/OsxSourceList.ce.vue";
import OsxSplitViewComponent from "./components/OsxSplitView.ce.vue";
import OsxStatusBarComponent from "./components/OsxStatusBar.ce.vue";
import OsxTextFieldComponent from "./components/OsxTextField.ce.vue";
import OsxTerminalComponent from "./components/OsxTerminal.ce.vue";
import OsxTabsComponent from "./components/OsxTabs.ce.vue";
import OsxToolCallComponent from "./components/OsxToolCall.ce.vue";
import OsxToolbarComponent from "./components/OsxToolbar.ce.vue";
import OsxToastComponent from "./components/OsxToast.ce.vue";
import OsxTooltipComponent from "./components/OsxTooltip.ce.vue";
import OsxWindowComponent from "./components/OsxWindow.ce.vue";

export const componentDefinitions = {
  "osx-agent-approval": OsxAgentApprovalComponent,
  "osx-agent-composer": OsxAgentComposerComponent,
  "osx-agent-message": OsxAgentMessageComponent,
  "osx-agent-run-status": OsxAgentRunStatusComponent,
  "osx-alert": OsxAlertComponent,
  "osx-avatar": OsxAvatarComponent,
  "osx-badge": OsxBadgeComponent,
  "osx-app-shell": OsxAppShellComponent,
  "osx-button": OsxButtonComponent,
  "osx-checkbox": OsxCheckboxComponent,
  "osx-copy": OsxCopyComponent,
  "osx-diff-viewer": OsxDiffViewerComponent,
  "osx-dialog": OsxDialogComponent,
  "osx-empty-state": OsxEmptyStateComponent,
  "osx-file-tree": OsxFileTreeComponent,
  "osx-icon": OsxIconComponent,
  "osx-icon-button": OsxIconButtonComponent,
  "osx-heading": OsxHeadingComponent,
  "osx-link": OsxLinkComponent,
  "osx-menu": OsxMenuComponent,
  "osx-menu-item": OsxMenuItemComponent,
  "osx-popover": OsxPopoverComponent,
  "osx-progress": OsxProgressComponent,
  "osx-segmented-control": OsxSegmentedControlComponent,
  "osx-select": OsxSelectComponent,
  "osx-sheet": OsxSheetComponent,
  "osx-shimmer": OsxShimmerComponent,
  "osx-skeleton": OsxSkeletonComponent,
  "osx-source-list": OsxSourceListComponent,
  "osx-split-view": OsxSplitViewComponent,
  "osx-status-bar": OsxStatusBarComponent,
  "osx-text-field": OsxTextFieldComponent,
  "osx-terminal": OsxTerminalComponent,
  "osx-tabs": OsxTabsComponent,
  "osx-tool-call": OsxToolCallComponent,
  "osx-toolbar": OsxToolbarComponent,
  "osx-toast": OsxToastComponent,
  "osx-tooltip": OsxTooltipComponent,
  "osx-window": OsxWindowComponent,
} as const;

export type OsxComponentName = keyof typeof componentDefinitions;

export function registerOsxComponents(): void {
  if (typeof customElements === "undefined") return;
  for (const [name, component] of Object.entries(componentDefinitions)) {
    if (!customElements.get(name)) customElements.define(name, defineCustomElement(component));
  }
}

export {
  OsxAgentApprovalComponent,
  OsxAgentComposerComponent,
  OsxAgentMessageComponent,
  OsxAgentRunStatusComponent,
  OsxAlertComponent,
  OsxAvatarComponent,
  OsxBadgeComponent,
  OsxAppShellComponent,
  OsxButtonComponent,
  OsxCheckboxComponent,
  OsxCopyComponent,
  OsxDiffViewerComponent,
  OsxDialogComponent,
  OsxEmptyStateComponent,
  OsxFileTreeComponent,
  OsxIconComponent,
  OsxIconButtonComponent,
  OsxHeadingComponent,
  OsxLinkComponent,
  OsxMenuComponent,
  OsxMenuItemComponent,
  OsxPopoverComponent,
  OsxProgressComponent,
  OsxSegmentedControlComponent,
  OsxSelectComponent,
  OsxSheetComponent,
  OsxShimmerComponent,
  OsxSkeletonComponent,
  OsxSourceListComponent,
  OsxSplitViewComponent,
  OsxStatusBarComponent,
  OsxTextFieldComponent,
  OsxTerminalComponent,
  OsxTabsComponent,
  OsxToolCallComponent,
  OsxToolbarComponent,
  OsxToastComponent,
  OsxTooltipComponent,
  OsxWindowComponent,
};

export { iconNames, iconRegistry } from "./icons";
export type { OsxIconName } from "./icons";
