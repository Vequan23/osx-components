import { registerOsxComponents } from "@vraxis/osx-components";
import "@vraxis/osx-components/theme.css";
registerOsxComponents();
document.querySelector("#app").innerHTML = '<osx-button variant="primary">Save</osx-button>';
