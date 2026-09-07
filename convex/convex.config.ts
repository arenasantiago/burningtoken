import { defineApp } from "convex/server";
import staticHosting from "@convex-dev/static-hosting/convex.config";

// Componente oficial de Static Hosting de Convex para servir la SPA en https://<deployment>.convex.site
const app = defineApp({ httpPrefix: "/api" });
app.use(staticHosting, { httpPrefix: "/" });

export default app;
