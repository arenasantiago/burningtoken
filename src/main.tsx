import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { LanguageProvider } from "./context/LanguageContext";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl && !convexUrl.includes("your-deployment-name")
  ? new ConvexReactClient(convexUrl)
  : null;

function MissingConvexConfiguration() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
      <section className="max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-mono uppercase tracking-widest text-amber-300">Configuración requerida</p>
        <h1 className="mt-2 text-2xl font-black">Convex no está configurado</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Define <code className="rounded bg-slate-950 px-1.5 py-0.5 text-purple-300">VITE_CONVEX_URL</code> con una URL válida y vuelve a compilar. No se iniciará una interfaz desconectada que pueda aparentar persistencia.
        </p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      {convex ? (
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      ) : (
        <MissingConvexConfiguration />
      )}
    </LanguageProvider>
  </React.StrictMode>
);
