import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { setBaseUrl } from "@toppers/api-client";
import "./index.css";

// In development: Vite proxy handles /api/* → backend, so no base URL needed.
// In production or with direct backend access: set VITE_API_BASE_URL to the backend root URL
// (e.g., "https://api.example.com") and the /api prefix will be appended automatically.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? null;
setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);

