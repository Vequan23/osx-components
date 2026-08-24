import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";
registerOsxComponents();
document.querySelector("#app").innerHTML = '<osx-button variant="primary">Save</osx-button>';
