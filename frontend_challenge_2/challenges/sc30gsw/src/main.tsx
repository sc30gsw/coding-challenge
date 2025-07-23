import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./global.css"
import { NuqsAdapter } from "nuqs/adapters/react"
import { App } from "~/app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NuqsAdapter>
      <App />
    </NuqsAdapter>
  </StrictMode>,
)
