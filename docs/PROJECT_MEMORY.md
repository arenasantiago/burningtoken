# Memoria del proyecto — Truth Tribunal

Actualizada: **2026-09-11**. Contexto persistente dentro del repositorio para retomar el trabajo; contrastar siempre con el código y el registro de comprobaciones.

## Producto y dirección

Truth Tribunal convierte la revisión de afirmaciones exageradas de IA, startups y redes sociales en un tribunal multijugador. El público vota LEGIT/SMOKE; dos búsquedas de Linkup y una evaluación de Nebius contrastan la afirmación. La opinión del jurado y la evidencia tienen papeles distintos. La incertidumbre y la abstención son resultados válidos.

La experiencia incluye salas continuas, apodos, asistencia para reformular claims, un medidor de hype y audio procedural. Pro explora un dossier de due diligence, con implementación todavía demostrativa. La prioridad inmediata es una demo convincente y verificable para Burning Token 2026, preservando los seis objetivos de sponsors.

## Contexto del usuario

- El usuario pidió actualizar esta memoria y presentar la idea con un README cuidado y claro, en español.
- Quiere una valoración honesta sobre las posibilidades de ganar. No se dispone de información suficiente sobre competidores ni decisiones del jurado para asignar probabilidades.
- La fortaleza del proyecto es combinar participación, investigación trazable y una identidad lúdica. La prioridad para competir es demostrar la ejecución y cerrar brechas antes de ampliar el alcance.

## Estado al retomar

- Leer [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), incluidas las correcciones del 11 de septiembre. Las pruebas y despliegues anteriores son evidencia histórica, no una nueva comprobación de producción.
- Investigación: dos fases implementadas; prueba real Linkup/Nebius registrada el 8 de septiembre. Tokens y latencia con origen definido; costo y confianza aún no disponibles.
- Convex: creación atómica, estado reactivo, continuidad de sala y hosting. Recorrido simultáneo Host/Invitado verificado el 11/09; frontend UX publicado. Falta grabación de entrega.
- Render: `src/App.tsx` llama directamente a la acción Convex. El worker conserva pasos vacíos y estado en memoria. Checkpoints y deduplicación parciales en Convex no acreditan Render Workflows.
- RevenueCat: `purchasePro` concede acceso incluso sin entitlement o tras error; la mutación backend no verifica compra. El dossier exporta un archivo real con claim y valores de riesgo prefijados. No tratarlo como compra ni informe pericial verificados.
- `npm run deploy` publica sólo el frontend. Backend: `npx convex dev --once` sobre el deployment configurado.

## Prioridades

1. Probar y grabar el flujo completo con dos participantes.
2. Verificar recuperación real en Render Workflows y compra/fracaso/expiración de RevenueCat con validación backend.
3. Sustituir las afirmaciones y riesgos prefijados del dossier por contenido trazable al caso.
4. Ampliar la evaluación con claims sustentados, contradichos y ambiguos.
5. Congelar la demo, grabar hasta dos minutos y completar la entrega. Consultar [HACKATHON_PLAN.md](HACKATHON_PLAN.md) para la discrepancia de fechas; no asumir que está resuelta.

## Invariantes

Preservar AGENTS.md: sala/claim atómicos, audio sin archivos externos, fallbacks identificados, secretos fuera de Git y evidencia fechada para cada incremento. No convertir aspiraciones en capacidades verificadas. Bots, extensión, tokens y agentes adversariales pertenecen al roadmap.
