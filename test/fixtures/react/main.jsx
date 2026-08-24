import React from "react";
import { createRoot } from "react-dom/client";
import { registerOsxComponents } from "osx-components";
import "osx-components/theme.css";
registerOsxComponents();
createRoot(document.querySelector("#app")).render(<osx-button variant="primary">Save</osx-button>);
