import { defineCustomElement } from "vue";
import "./theme.css";
import { defineFormAssociatedElement, defineFormButtonElement, type FormControlConfig } from "./form-associated-element";
import OsxAgentApprovalComponent from "./components/OsxAgentApproval.ce.vue";
import OsxAgentComposerComponent from "./components/OsxAgentComposer.ce.vue";
import OsxAgentMessageComponent from "./components/OsxAgentMessage.ce.vue";
import OsxAgentRunStatusComponent from "./components/OsxAgentRunStatus.ce.vue";
import OsxAlertComponent from "./components/OsxAlert.ce.vue";
import OsxArtifactComponent from "./components/OsxArtifact.ce.vue";
import OsxAvatarComponent from "./components/OsxAvatar.ce.vue";
import OsxBadgeComponent from "./components/OsxBadge.ce.vue";
import OsxAppShellComponent from "./components/OsxAppShell.ce.vue";
import OsxButtonComponent from "./components/OsxButton.ce.vue";
import OsxCheckboxComponent from "./components/OsxCheckbox.ce.vue";
import OsxCopyComponent from "./components/OsxCopy.ce.vue";
import OsxCitationComponent from "./components/OsxCitation.ce.vue";
import OsxDataTableComponent from "./components/OsxDataTable.ce.vue";
import OsxDiffViewerComponent from "./components/OsxDiffViewer.ce.vue";
import OsxDialogComponent from "./components/OsxDialog.ce.vue";
import OsxEcosystemCardComponent from "./components/OsxEcosystemCard.ce.vue";
import OsxEmptyStateComponent from "./components/OsxEmptyState.ce.vue";
import OsxFileTreeComponent from "./components/OsxFileTree.ce.vue";
import OsxIconComponent from "./components/OsxIcon.ce.vue";
import OsxIconButtonComponent from "./components/OsxIconButton.ce.vue";
import OsxHeadingComponent from "./components/OsxHeading.ce.vue";
import OsxLinkComponent from "./components/OsxLink.ce.vue";
import OsxMenuComponent from "./components/OsxMenu.ce.vue";
import OsxMenuItemComponent from "./components/OsxMenuItem.ce.vue";
import OsxMarkdownComponent from "./components/OsxMarkdown.ce.vue";
import OsxPlanComponent from "./components/OsxPlan.ce.vue";
import OsxPopoverComponent from "./components/OsxPopover.ce.vue";
import OsxProgressComponent from "./components/OsxProgress.ce.vue";
import OsxRadioGroupComponent from "./components/OsxRadioGroup.ce.vue";
import OsxSegmentedControlComponent from "./components/OsxSegmentedControl.ce.vue";
import OsxSelectComponent from "./components/OsxSelect.ce.vue";
import OsxSheetComponent from "./components/OsxSheet.ce.vue";
import OsxShimmerComponent from "./components/OsxShimmer.ce.vue";
import OsxSkeletonComponent from "./components/OsxSkeleton.ce.vue";
import OsxSpinnerComponent from "./components/OsxSpinner.ce.vue";
import OsxSourceListComponent from "./components/OsxSourceList.ce.vue";
import OsxSourcePanelComponent from "./components/OsxSourcePanel.ce.vue";
import OsxSplitViewComponent from "./components/OsxSplitView.ce.vue";
import OsxStatusBarComponent from "./components/OsxStatusBar.ce.vue";
import OsxTableComponent from "./components/OsxTable.ce.vue";
import OsxTextAreaComponent from "./components/OsxTextArea.ce.vue";
import OsxTextFieldComponent from "./components/OsxTextField.ce.vue";
import OsxThinkingComponent from "./components/OsxThinking.ce.vue";
import OsxTerminalComponent from "./components/OsxTerminal.ce.vue";
import OsxTabsComponent from "./components/OsxTabs.ce.vue";
import OsxToolCallComponent from "./components/OsxToolCall.ce.vue";
import OsxToolbarComponent from "./components/OsxToolbar.ce.vue";
import OsxToggleComponent from "./components/OsxToggle.ce.vue";
import OsxToastComponent from "./components/OsxToast.ce.vue";
import OsxTooltipComponent from "./components/OsxTooltip.ce.vue";
import OsxWindowComponent from "./components/OsxWindow.ce.vue";

export const componentDefinitions = {
  "osx-agent-approval": OsxAgentApprovalComponent,
  "osx-agent-composer": OsxAgentComposerComponent,
  "osx-agent-message": OsxAgentMessageComponent,
  "osx-agent-run-status": OsxAgentRunStatusComponent,
  "osx-alert": OsxAlertComponent,
  "osx-artifact": OsxArtifactComponent,
  "osx-avatar": OsxAvatarComponent,
  "osx-badge": OsxBadgeComponent,
  "osx-app-shell": OsxAppShellComponent,
  "osx-button": OsxButtonComponent,
  "osx-checkbox": OsxCheckboxComponent,
  "osx-copy": OsxCopyComponent,
  "osx-citation": OsxCitationComponent,
  "osx-data-table": OsxDataTableComponent,
  "osx-diff-viewer": OsxDiffViewerComponent,
  "osx-dialog": OsxDialogComponent,
  "osx-ecosystem-card": OsxEcosystemCardComponent,
  "osx-empty-state": OsxEmptyStateComponent,
  "osx-file-tree": OsxFileTreeComponent,
  "osx-icon": OsxIconComponent,
  "osx-icon-button": OsxIconButtonComponent,
  "osx-heading": OsxHeadingComponent,
  "osx-link": OsxLinkComponent,
  "osx-menu": OsxMenuComponent,
  "osx-menu-item": OsxMenuItemComponent,
  "osx-markdown": OsxMarkdownComponent,
  "osx-plan": OsxPlanComponent,
  "osx-popover": OsxPopoverComponent,
  "osx-progress": OsxProgressComponent,
  "osx-radio-group": OsxRadioGroupComponent,
  "osx-segmented-control": OsxSegmentedControlComponent,
  "osx-select": OsxSelectComponent,
  "osx-sheet": OsxSheetComponent,
  "osx-shimmer": OsxShimmerComponent,
  "osx-skeleton": OsxSkeletonComponent,
  "osx-spinner": OsxSpinnerComponent,
  "osx-source-list": OsxSourceListComponent,
  "osx-source-panel": OsxSourcePanelComponent,
  "osx-split-view": OsxSplitViewComponent,
  "osx-status-bar": OsxStatusBarComponent,
  "osx-table": OsxTableComponent,
  "osx-textarea": OsxTextAreaComponent,
  "osx-text-field": OsxTextFieldComponent,
  "osx-thinking": OsxThinkingComponent,
  "osx-terminal": OsxTerminalComponent,
  "osx-tabs": OsxTabsComponent,
  "osx-tool-call": OsxToolCallComponent,
  "osx-toolbar": OsxToolbarComponent,
  "osx-toggle": OsxToggleComponent,
  "osx-toast": OsxToastComponent,
  "osx-tooltip": OsxTooltipComponent,
  "osx-window": OsxWindowComponent,
} as const;

export type OsxComponentName = keyof typeof componentDefinitions;

const focusDelegatedComponents = new Set<OsxComponentName>([
  "osx-agent-composer",
  "osx-button",
  "osx-checkbox",
  "osx-radio-group",
  "osx-segmented-control",
  "osx-select",
  "osx-textarea",
  "osx-text-field",
  "osx-toggle",
]);

const formControlConfigs: Partial<Record<OsxComponentName, FormControlConfig>> = {
  "osx-checkbox": { controlSelector: 'input[type="checkbox"]', stateProperty: "checked", stateEvent: "change", resetIndeterminate: true },
  "osx-radio-group": { controlSelector: 'input[type="radio"]:checked, input[type="radio"]', stateProperty: "value", stateEvent: "change" },
  "osx-select": { controlSelector: "select", stateProperty: "value", stateEvent: "change" },
  "osx-textarea": { controlSelector: "textarea", stateProperty: "value", stateEvent: "input" },
  "osx-text-field": { controlSelector: "input", stateProperty: "value", stateEvent: "input" },
  "osx-toggle": { controlSelector: 'input[type="checkbox"]', stateProperty: "checked", stateEvent: "change" },
};

export function registerOsxComponents(): void {
  if (typeof customElements === "undefined") return;
  for (const [rawName, component] of Object.entries(componentDefinitions)) {
    const name = rawName as OsxComponentName;
    if (customElements.get(name)) continue;
    const options = focusDelegatedComponents.has(name)
      ? { shadowRootOptions: { delegatesFocus: true } }
      : undefined;
    const formConfig = formControlConfigs[name];
    const element = name === "osx-button"
      ? defineFormButtonElement(component, options)
      : formConfig
        ? defineFormAssociatedElement(component, formConfig, options)
        : defineCustomElement(component, options);
    customElements.define(name, element);
  }
}

export {
  OsxAgentApprovalComponent,
  OsxAgentComposerComponent,
  OsxAgentMessageComponent,
  OsxAgentRunStatusComponent,
  OsxAlertComponent,
  OsxArtifactComponent,
  OsxAvatarComponent,
  OsxBadgeComponent,
  OsxAppShellComponent,
  OsxButtonComponent,
  OsxCheckboxComponent,
  OsxCopyComponent,
  OsxCitationComponent,
  OsxDataTableComponent,
  OsxDiffViewerComponent,
  OsxDialogComponent,
  OsxEcosystemCardComponent,
  OsxEmptyStateComponent,
  OsxFileTreeComponent,
  OsxIconComponent,
  OsxIconButtonComponent,
  OsxHeadingComponent,
  OsxLinkComponent,
  OsxMenuComponent,
  OsxMenuItemComponent,
  OsxMarkdownComponent,
  OsxPlanComponent,
  OsxPopoverComponent,
  OsxProgressComponent,
  OsxRadioGroupComponent,
  OsxSegmentedControlComponent,
  OsxSelectComponent,
  OsxSheetComponent,
  OsxShimmerComponent,
  OsxSkeletonComponent,
  OsxSpinnerComponent,
  OsxSourceListComponent,
  OsxSourcePanelComponent,
  OsxSplitViewComponent,
  OsxStatusBarComponent,
  OsxTableComponent,
  OsxTextAreaComponent,
  OsxTextFieldComponent,
  OsxThinkingComponent,
  OsxTerminalComponent,
  OsxTabsComponent,
  OsxToolCallComponent,
  OsxToolbarComponent,
  OsxToggleComponent,
  OsxToastComponent,
  OsxTooltipComponent,
  OsxWindowComponent,
};

export { iconNames, iconRegistry } from "./icons";
export type { OsxIconName } from "./icons";
