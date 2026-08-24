import { createApp, h } from "vue";
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";
registerOsxComponents();
createApp({ render: () => h("osx-alert", { tone: "success", title: "Ready" }) }).mount("#app");
