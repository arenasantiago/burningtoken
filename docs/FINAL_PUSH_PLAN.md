# Plan de cierre competitivo — Truth Tribunal

Actualizado: 2026-09-11, 00:35 Bogotá. Plan propuesto; no constituye ejecución de Render, compra ni publicación del video.

## Tiempo y decisión estratégica

A las 00:32 Bogotá del 11 de septiembre quedan aproximadamente 49 h 27 min hasta el objetivo conservador del 13 de septiembre a las 01:59 Bogotá. La [web oficial](https://www.burningtoken.dev/) confirma ahora el cierre general el 13 de septiembre a las 23:59 ART, equivalente a las 21:59 Bogotá: aproximadamente 69 h 27 min desde esa consulta. Mantener la fecha temprana hasta reconciliar el dashboard. Objetivo propio: entrega enviada el sábado 12 a las 20:00 Bogotá, casi seis horas antes del corte conservador.

La portada pública enumera Linkup, Convex, Nebius y Open Build; no enumera Render ni RevenueCat. Esto NO demuestra que esos retos hayan sido eliminados. El dashboard de tracks redirigió a login en esta revisión. Antes de invertir el bloque largo: abrir la sesión del participante, confirmar los seis briefs, premios, elegibilidad, duración del video y hora del contador. Los USD 900 en créditos de Render proceden de nuestras instrucciones anteriores, no quedaron reconfirmados hoy. El requisito de video de hasta dos minutos y mención a @nerdconf_ar procede de la revisión autenticada anterior registrada en HACKATHON_PLAN.md.

Estimación de trabajo concentrado para una persona: 21–28 horas, suponiendo accesos disponibles y sin bloqueo de proveedor. No son horas de ejecución garantizadas ni estimación de probabilidad de ganar. Vamos a tiempo para una entrega competitiva, pero atrasados frente al plan anterior en las dos integraciones. Congelar funciones nuevas; invertir en pruebas reproducibles, claridad del caso de uso y evidencia por sponsor.

## Estado competitivo

| Reto | Posición actual | Qué falta para presentar una candidatura sólida |
|---|---|---|
| Convex | Fuerte base técnica: dos sesiones reales, votos, resultado y siguiente caso verificados el 11/09 | Publicar último frontend y repetir recorrido en URL pública; guardar video y versión |
| Linkup | Dos fases dependientes implementadas, fuentes vistas en el recorrido real | Mostrar una brecha concreta que cambie la segunda consulta y una cita trazable |
| Nebius | Inferencia integrada; tokens y latencia reales disponibles | Evaluación pequeña representativa, costo con tarifa verificada y confianza con significado explícito |
| Fun Build | Diferenciación por juego colectivo, audio y medidor | Tres testers externos, reacción real y una mejora derivada del feedback |
| Render | Prototipo, aún sin ejecución real | Servicio Workflows, ejecución, fallo y recuperación comprobables |
| RevenueCat | SDK y paywall presentes; acceso concedido incluso ante fallo | Compra Test Store válida, identidad consistente y control backend |

60 pruebas aprobadas y build correcto acreditan regresión técnica; no son prueba de compras ni del orquestador. Falta publicar el frontend UX. No asignar un porcentaje global de finalización ni presentar cuatro sponsors como premios asegurados.

## Orden de trabajo y puertas de salida

1. **Accesos y elegibilidad — 30–60 min.** Confirmar briefs y registro del proyecto, acceso al repo desde Render, capacidad de crear Workflows, catálogo RevenueCat y credencial privada de lectura del cliente. Revisar permisos y créditos sin exponer secretos. Preparar borrador de entrega desde el inicio. Si Render bloquea acceso, avanzar RevenueCat mientras se resuelve; evitar horas de implementación sin un primer run ejecutable.
2. **Render — 8–10 h.** Primer run mínimo en la primera hora; después integración, pruebas de recuperación y evidencia.
3. **RevenueCat — 5–7 h.** Cerrar acceso por defecto, compra/servidor, restauración y pruebas negativas.
4. **Nebius y Linkup — 2–3 h.** Seis claims: dos sustentados, dos contradichos y dos ambiguos o fuera de alcance. Conservar etiquetas humanas previas, fuentes y outputs; reportar aciertos N/6, abstenciones y latencia. Una muestra pequeña no acredita precisión general.
5. **Publicación y testers — 2 h.** Backend/frontend coordinados, dos sesiones sobre convex.site, móvil y tres personas externas. Corregir sólo bloqueos de demo.
6. **Video, X y formulario — 3–4 h.** Grabar, subtitular, exportar, publicar y verificar entrega enviada. Reservar margen por procesamiento del video y fallos de acceso.

## Render real: implementación propuesta

El código actual conserva un Set en memoria y pasos vacíos; App.tsx llama directamente a executeFullAudit. render.yaml declara un worker genérico. **Ese manifiesto no acredita Render Workflows:** la documentación actual indica que Blueprints todavía no gestionan Workflows. Crear el servicio mediante el flujo soportado, enlazando el repo y registrando tareas TypeScript. [Render Workflows](https://render.com/docs/workflows), [primer workflow](https://render.com/docs/workflows-tutorial).

Diseño: frontend → solicitud validada en Convex → despacho servidor a Render → tareas de búsqueda inicial, contraste y síntesis → persistencia en Convex → UI reactiva. Mantener la política de evidencia existente y reutilizar módulos para no mantener dos motores distintos. No sustituir el flujo por otra simulación si falla Render; mostrar error y reintento.

Implementación y aceptación propias:

- Persistir una investigación por caso, clave de idempotencia estable y run ID real; excluir ejecuciones competidoras mediante reclamación atómica/lease. El navegador no lleva credenciales Render ni decide el estado del worker.
- Checkpoints con resultados persistidos por etapa. Guardar evidencia y marcador de etapa de forma consistente; deduplicar por investigación y URL normalizada. No prometer exactamente una llamada externa si el proceso cae después de pagar una API pero antes de guardar: garantizar ausencia de registros duplicados y explicar esa ventana.
- Reemplazar el botón actual por una solicitud de fallo consumible una vez. Lanzar una excepción real después del checkpoint inicial; dejar que el reintento configurado retome. Reintentos agotados deben finalizar en error visible.
- Proteger escritura de progreso/resultado con credencial de servicio y validar sala/caso/run. La identidad de host requiere verificación servidor, no sólo ocultar botones.
- Pruebas: ejecución feliz; fallo inducido; reintento tras pérdida del proceso; doble inicio; callback repetido; agotamiento de reintentos. Cerrar la pestaña del host durante el run y comprobar que el invitado recibe el resultado.
- Evidencia de salida: run ID y logs de Render, fallo y reintento visibles, checkpoint inicial conservado, conteo y unicidad de evidencias antes/después y un solo resultado final. Guardar un reporte y un clip corto sin credenciales.

Los reintentos administrados son una capacidad del servicio, no una garantía automática de idempotencia de nuestros efectos. Configurarlos explícitamente. [Definir tareas y reintentos](https://render.com/docs/workflows-defining).

## RevenueCat: compra verificada

Hallazgos locales: SDK instalado 1.58.0; compatible con el mínimo Web 1.15.0 de Test Store. El hook usa `hasEntitlement || true` y concede Pro al fallar; grantProAccess acepta datos del cliente sin verificar. El estado Pro se combina en frontend y la auditoría recibe isPro del cliente. Corregir toda la cadena.

Test Store genera compras sandbox, CustomerInfo y entitlements comprobables sin cobro real. Configurar `pro_auditor_monthly`, asociar `pro_auditor_access` y una offering; seleccionar el producto esperado, no el primer package arbitrario. Mostrar la etiqueta sandbox durante la demo. [Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store).

Implementación y aceptación propias:

- Eliminar todos los desbloqueos por fallback. Cancelación, error, oferta ausente y entitlement ausente conservan Free con un mensaje específico.
- Separar identidad de compra estable de voterId de pestaña. Vincularla a una sesión comprobable en backend; un userId enviado por el navegador no prueba titularidad. Conservar invitados ligeros sin exigirles compra.
- Tras compra, consultar RevenueCat desde el servidor usando credencial privada. Guardar entitlement, vencimiento, entorno y fecha de verificación con mutación interna. El acceso al dossier y a investigación Pro se decide también en servidor.
- Revalidar al volver y antes de un acceso protegido; caducidad real. Si hay webhooks disponibles, verificar Authorization, deduplicar event ID y reconciliar con el estado actual para tolerar eventos repetidos o desordenados. La documentación señala dependencia del plan para webhooks; no bloquear la demo si basta una consulta servidor al volver y al acceder. [Webhooks y reconciliación](https://www.revenuecat.com/docs/integrations/webhooks).
- Derivar dossier del claim y sus evidencias o identificar contenido demostrativo; retirar afirmaciones de certificación y riesgos fijos presentados como hallazgos del caso.
- Matriz: compra exitosa, cancelada, fallida, producto equivocado, recarga/restauración, expiración, acceso desde otra identidad y petición Pro manipulada. La cancelación de renovación no equivale siempre a pérdida inmediata de acceso; usar el entitlement activo y su vencimiento.
- Evidencia: mismo cliente en SDK, dashboard RevenueCat y Convex; transacción sandbox; dossier bloqueado antes y habilitado después; fracaso sin acceso; vencimiento con acceso revocado. Usar identificadores de prueba en clips.

## Agenda propuesta — Bogotá

| Momento | Hito |
|---|---|
| Viernes 11, antes de las 09:00 | Confirmar briefs/accesos y dejar proyecto registrado o borrador comprobado |
| Viernes 11, 09:00–18:00 | Render desplegado y prueba de recuperación; si no hay primer run a las 10:00, resolver bloqueo y adelantar RevenueCat |
| Viernes 11, 18:00–22:00 | RevenueCat: catálogo, eliminación de bypasses y verificación servidor |
| Sábado 12, 08:00–11:00 | Completar compras, restauración/expiración y pruebas negativas |
| Sábado 12, 11:00–13:00 | Evaluación de claims, métricas y evidencia por reto |
| Sábado 12, 13:00–15:00 | Despliegue final, testers y freeze de funciones |
| Sábado 12, 15:00–19:00 | Grabación, edición y publicación en X |
| Sábado 12, 19:00–20:00 | Formulario enviado y comprobación de enlaces/estado |

Son hitos de planificación, no recordatorios programados. Si a las 11:00 del sábado una integración no pasa su aceptación, dedicar sólo correcciones acotadas hasta las 13:00. Proteger la entrega de los retos demostrables; no adjudicar cumplimiento a integraciones simuladas. Mantener el objetivo de los seis mientras elegibilidad y tiempo lo permitan.

## Video: una historia con seis pruebas

Propuesta de posicionamiento: «El jurado vota; las fuentes ponen a prueba el hype». Usuario concreto: comunidades y equipos que evalúan promesas de productos de IA. Pro aporta un expediente trazable para profundizar, sin venderlo como due diligence certificada.

| Tiempo | Prueba visual |
|---|---|
| 0:00–0:10 | Claim breve y problema concreto; mostrar producto inmediatamente |
| 0:10–0:27 | Host e invitado votan; contador cambia en ambas pantallas; martillazo corto |
| 0:27–0:47 | Investigación: hallazgo inicial → brecha → consulta de contraste y fuente |
| 0:47–1:07 | Fallo real de Render → reintento → avance; overlay con mismo run/caso y conteo sin duplicados |
| 1:07–1:30 | Resultado Nebius, cita, tokens/latencia/costo disponibles y una limitación; no fabricar confianza |
| 1:30–1:50 | Compra Test Store → entitlement confirmado → dossier; rótulo «Sandbox, sin cobro real» |
| 1:50–2:00 | Hallazgo de un tester real, continuidad de sala y URL para probar |

Preparar los clips reales por separado para capturar compras y fallos con calma. Recortar sólo esperas y rotular «espera recortada»; conservar grabación completa y logs. Mostrar una corrida representativa; si el resultado no es concluyente, explicarlo. Los segmentos Render/RevenueCat se graban como funcionales únicamente después de pasar pruebas. Añadir subtítulos y priorizar textos grandes: dos ventanas ilegibles no demuestran multiplayer.

Exportación propuesta: 1920x1080, 30 fps, MP4 H.264/AAC, 115–120 segundos, menos de 512 MB. X admite hasta 140 segundos y 512 MB sin Premium; el límite operativo de dos minutos sigue siendo el del hackathon registrado previamente. [Ayuda oficial de X](https://help.x.com/en/using-x/x-videos).

Borrador de publicación, sujeto al estado final:

> ¿Promesa real o puro humo? ⚖️ Truth Tribunal convierte el hype de IA en un juicio multijugador: vota, contrasta fuentes y revisa la evidencia. Construido para #BurningToken @nerdconf_ar. Demo 👇 Pruébalo: https://brave-lemur-868.convex.site

Al publicar: comprobar reproducción completa, subtítulos y URL; copiar enlace del post al formulario; seleccionar sólo retos acreditados y añadir timestamps/pruebas; pulsar Submit/Update submission y guardar confirmación. Publicar en X no sustituye enviar el proyecto. No se publicó ni envió nada durante la elaboración de este plan.

## División de trabajo propuesta

Implementación, pruebas y reportes: asistente durante los turnos de trabajo autorizados. Accesos del participante, confirmación de briefs, tres testers y voz/participación en el video: Santiago. Esta división no implica trabajo automático en segundo plano. Cualquier costo o permiso de cuenta que aparezca se resuelve con el alcance concreto.
