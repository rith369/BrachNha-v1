import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app";
import { registerServiceWorker } from "@/lib/install-prompt";
import { installGlobalErrorHandlers } from "@/lib/telemetry";
import "@/styles/globals.css";

// Imported here, in the entry, rather than first reached from a component:
// the browser's install event can fire before React mounts, and the listener
// in lib/install-prompt.ts has to exist by then to catch it.
registerServiceWorker();
// Production only, and it pulls nothing until an error actually happens.
installGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
