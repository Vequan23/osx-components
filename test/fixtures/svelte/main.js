import { mount } from "svelte";
import App from "./App.svelte";
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";
registerOsxComponents();
mount(App, { target: document.querySelector("#app") });
