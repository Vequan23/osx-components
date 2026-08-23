import { defineCustomElement } from "vue";
import "./theme.css";
import OsxButtonComponent from "./components/OsxButton.ce.vue";
import OsxCheckboxComponent from "./components/OsxCheckbox.ce.vue";
import OsxProgressComponent from "./components/OsxProgress.ce.vue";
import OsxSegmentedControlComponent from "./components/OsxSegmentedControl.ce.vue";
import OsxSelectComponent from "./components/OsxSelect.ce.vue";
import OsxSheetComponent from "./components/OsxSheet.ce.vue";
import OsxSourceListComponent from "./components/OsxSourceList.ce.vue";
import OsxSplitViewComponent from "./components/OsxSplitView.ce.vue";
import OsxStatusBarComponent from "./components/OsxStatusBar.ce.vue";
import OsxTextFieldComponent from "./components/OsxTextField.ce.vue";
import OsxToolbarComponent from "./components/OsxToolbar.ce.vue";
import OsxWindowComponent from "./components/OsxWindow.ce.vue";

export const componentDefinitions = {
  "osx-button": OsxButtonComponent,
  "osx-checkbox": OsxCheckboxComponent,
  "osx-progress": OsxProgressComponent,
  "osx-segmented-control": OsxSegmentedControlComponent,
  "osx-select": OsxSelectComponent,
  "osx-sheet": OsxSheetComponent,
  "osx-source-list": OsxSourceListComponent,
  "osx-split-view": OsxSplitViewComponent,
  "osx-status-bar": OsxStatusBarComponent,
  "osx-text-field": OsxTextFieldComponent,
  "osx-toolbar": OsxToolbarComponent,
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
  OsxButtonComponent,
  OsxCheckboxComponent,
  OsxProgressComponent,
  OsxSegmentedControlComponent,
  OsxSelectComponent,
  OsxSheetComponent,
  OsxSourceListComponent,
  OsxSplitViewComponent,
  OsxStatusBarComponent,
  OsxTextFieldComponent,
  OsxToolbarComponent,
  OsxWindowComponent,
};
