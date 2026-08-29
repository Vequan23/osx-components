import { createApp, h } from "vue";
import { registerOsxComponents } from "@vraxis/osx-components";
import "@vraxis/osx-components/theme.css";
registerOsxComponents();
createApp({ render: () => h("osx-alert", { tone: "success", title: "Ready" }) }).mount("#app");
