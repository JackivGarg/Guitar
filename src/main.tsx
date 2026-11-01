import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/bricolage-grotesque/latin-500.css";
import "@fontsource/bricolage-grotesque/latin-600.css";
import "@fontsource/rethink-sans/latin-400.css";
import "@fontsource/rethink-sans/latin-500.css";
import "@fontsource/rethink-sans/latin-600.css";
import "./style.css";
import "./workshop.css";
import App from "./App";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
