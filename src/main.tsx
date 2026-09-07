import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl && !convexUrl.includes("your-deployment-name")
  ? new ConvexReactClient(convexUrl)
  : null;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {convex ? (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
