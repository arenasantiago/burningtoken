# Plan de entrega — Burning Token 2026

Revisión: 2026-09-08. Estrategia: un proyecto, los seis retos y una demo de hasta dos minutos. El estado técnico se registra en [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

## Fechas y fuentes

- **Objetivo operativo temprano:** 12 de septiembre, 23:59 PDT = 13 de septiembre, 01:59 Bogotá = 06:59 UTC. Es la fecha indicada por el usuario, sus notas y el dashboard consultado.
- **Discrepancia oficial pendiente de aclarar:** [las reglas generales](https://app.burningtoken.dev/rules) indican 13 de septiembre, 23:59 ART = 13 de septiembre, 21:59 Bogotá = 14 de septiembre, 02:59 UTC. No posponer la entrega basándose en esta fecha más tardía hasta aclarar la diferencia con el dashboard.
- [Dashboard](https://app.burningtoken.dev/dashboard), [briefs de los tracks](https://app.burningtoken.dev/dashboard/tracks) y reglas generales leídos en una sesión autenticada del navegador el 2026-09-08.
- Contexto del proyecto cotejado con las notas de Obsidian “Hackathon Nerdconf 2026” e “Inbox/_Readme” y sus diagramas de secuencia/estados. Las instrucciones actuales de AGENTS prevalecen sobre nombres antiguos de entitlements y propuestas de audio por archivos.

## Qué debe poder comprobar el jurado

| Reto | Evidencia de aceptación |
|---|---|
| Convex | Frontend público en Convex Static Hosting; dos sesiones ven acciones compartidas sin recargar. |
| Linkup | Hallazgos guardados determinan la búsqueda siguiente; mostrar fuentes, seguimiento, incertidumbre y efecto en el resultado. |
| Nebius | Token Factory dentro del flujo principal, pequeña evaluación con entradas representativas, al menos una medida de precisión/tiempo/costo y un caso difícil. Conservar además los objetivos de métricas de AGENTS, identificando datos aún no disponibles. |
| Render | **Render Workflows**, no sólo un worker genérico; ejecución completa, falla controlada real, recuperación y ausencia de efectos duplicados, estados y errores visibles. |
| RevenueCat | SDK, oferta y entitlement; antes/después de compra de prueba, usuario correcto, y comportamiento ante compra fallida o acceso vencido. Sandbox identificado; no se exige ingreso real. |
| Fun Build | Interacción funcional, original y divertida que pueda probar alguien externo; no requiere integración de sponsor. |

La elegibilidad se comprueba antes de puntuar. Una integración ausente impide competir por ese premio. Las reglas asignan 35 puntos a Shipping, 25 a cada uno de los siguientes dos criterios y 15 al cuarto; gastar más tokens o añadir integraciones por sí solo no da puntos. Identificar simulaciones, compras sandbox, esperas editadas y pasos manuales.

## Secuencia propuesta (hora de Bogotá)

| Fecha | Incremento y salida verificable |
|---|---|
| 8 septiembre | Origen explícito, abstención, dos búsquedas reales y pruebas de fuentes/métricas. Registrar fallos reales de proveedores. |
| 9 septiembre | Consolidar evaluación Nebius con pocos claims representativos y conectar Render Workflows; comprobar accesos temprano. |
| 10 septiembre | Falla/reintento/deduplicación en Render y compra/fracaso/expiración en RevenueCat. |
| 11 septiembre | Despliegue coordinado frontend/backend, recorrido Host/Invitado, tester externo y correcciones de su feedback. |
| 12 septiembre | Congelar versión de demo, grabar video, completar y enviar formulario; dejar margen para fallos de acceso. |

Cada fila es un objetivo, no una tarea ya verificada ni una automatización. Cerrar incrementos pequeños con evidencia antes de ampliar funcionalidad. Bots, extensión, tokens y niveles enterprise siguen en el roadmap.

## Entrega

- Crear o seleccionar el proyecto en Burning Token: el dashboard mostraba **0 proyectos y 0 enviados** al revisarlo. No se creó ni envió ninguno durante esta revisión.
- Una entrega por proyecto: nombre, equipo, usuarios, descripción, URL pública funcional, IA utilizada para construirlo, retos seleccionados y prueba concreta por reto.
- Video en X de hasta dos minutos, etiquetando `@nerdconf_ar`; timestamps, links o pasos verificables pueden sustentar los retos.
- Describir trabajo previo, cambios del evento y créditos. El repo público es opcional según las reglas. Registrar versión inicial y changelog; el commit local al iniciar estos incrementos era `6483f63` (2026-09-08), no una prueba del estado anterior al evento.
- Guardar borrador **no envía** la entrega: se requiere Submit/Update submission. La versión enviada y sus enlaces deben seguir disponibles durante evaluación.
- Credenciales de prueba y acceso limitado sólo por canales privados; nunca secretos en el video, formulario o repositorio.

## Dependencias de próximos incrementos

Convex CLI autenticado y claves locales Linkup/Nebius disponibles para comprobaciones. La presencia de variables no demuestra configuración equivalente en Convex Cloud. Acceso a Render Workflows y configuración de RevenueCat (offering, producto, entitlement y verificación backend) aún por comprobar. Ningún requisito obliga a pedir secretos por chat.

## Actualización de estrategia — 2026-09-11

El [plan de cierre competitivo](FINAL_PUSH_PLAN.md) reemplaza la secuencia propuesta anterior para el trabajo restante: Render real, compra RevenueCat verificada, pruebas y video. La web pública reconfirma el cierre general del 13/09 a las 23:59 ART, pero la discrepancia con el contador temprano y la elegibilidad actual de Render/RevenueCat quedan pendientes de comprobar en el dashboard autenticado. Objetivo interno: enviar el 12/09 a las 20:00 Bogotá. No se creó ni envió una entrega en esta revisión.
