import { mount } from "svelte";
import App from "./App.svelte";
import { registerOsxComponents } from "@vraxis/osx-components";
import "@vraxis/osx-components/theme.css";
registerOsxComponents();
mount(App, { target: document.querySelector("#app") });
