---
tags:
  - video
  - demo
  - entrega
updated: 2026-09-12
---

# 08 · Guion Y Checklist Del Video

Volver a [[00_INDICE_TRUTH_TRIBUNAL|Índice]].

## Objetivo

Contar una historia completa en menos de dos minutos y hacer visible una prueba, no una lista de logos.

**Idea narrativa:** el jurado vota; las fuentes ponen a prueba el hype.

## Claim De Demo

Elegir un claim:

- corto, legible y empírico;
- con fuentes públicas accesibles;
- con suficiente contraste para explicar la segunda búsqueda;
- ensayado antes de grabar, sin prefijar ni alterar el resultado.

Evitar claims metafísicos, excesivamente recientes o dependientes de contenido privado.

## Guion De 115–120 Segundos

| Tiempo | Toma | Voz sugerida | Prueba visible |
|---|---|---|---|
| 0:00–0:10 | Claim y portada. | “Una promesa viral tarda segundos en publicarse y horas en comprobarse.” | Producto funcionando y URL. |
| 0:10–0:28 | Host e invitado lado a lado. | “Primero vota el jurado: legítimo o puro humo.” | Dos identidades, conteo y medidor sincronizados. |
| 0:28–0:52 | Evidencias. | “Linkup busca una primera respuesta y usa lo que falta para construir el contraste.” | Consulta inicial, brecha, segunda fase, URL y cita. |
| 0:52–1:12 | Workflow o trazabilidad. | Con Render verificado: “Provocamos un fallo; el reintento conserva el checkpoint y no duplica evidencia.” | Run ID, intento, checkpoint y conteo. |
| 1:12–1:34 | Resultado Nebius. | “Nebius evalúa las fuentes. El backend exige citas literales y puede abstenerse.” | Veredicto, cita, tokens, latencia y caso límite. |
| 1:34–1:52 | Pro. | Con RevenueCat verificado: “Una compra Test Store, sin cobro real, habilita el dossier tras validación del servidor.” | Estado Free, checkout sandbox y dossier. |
| 1:52–2:00 | Siguiente caso y CTA. | “Presenta la promesa. Convoca al jurado. Examina las pruebas.” | Continuidad de sala y URL pública. |

## Plan B Honesto

### Si Render No Está Verificado

- No usar el botón como demostración de recuperación real.
- Extender Linkup/Nebius: mostrar brecha, fuente, cita y abstención.
- Decir: “El contrato resiliente está implementado; el run en Render sigue pendiente de despliegue.”

### Si RevenueCat No Está Verificado End-to-End

- Mostrar el paywall como línea Pro y la compra sandbox ya observada sólo si se puede reproducir.
- No mostrar el dossier como acceso confirmado por servidor.
- Decir: “Test Store está configurado; falta cerrar la sincronización privada del entitlement.”

### Si Una API Falla Durante La Toma

- No presentar el fallback como resultado real.
- Usar una toma previamente grabada de una ejecución real o explicar el fallo visible.
- Rotular cualquier replay o espera recortada.

## Lista De Tomas

- Toma A: portada y claim.
- Toma B: host crea sala.
- Toma C: invitado entra y elige apodo.
- Toma D: ambos votan y cambia el Hype-o-Meter.
- Toma E: consulta inicial, brecha y contraste.
- Toma F: una fuente abierta y cita legible.
- Toma G: Render, sólo con run real.
- Toma H: resultado Nebius y métricas.
- Toma I: RevenueCat, sólo con validación completa.
- Toma J: siguiente caso y URL.

## Checklist Técnico Antes De Grabar

- [ ] Confirmar duración exacta exigida en el dashboard.
- [ ] Confirmar tracks elegibles y formulario del proyecto.
- [ ] Congelar commit/build de la demo.
- [ ] Ejecutar `npm test`.
- [ ] Ejecutar `npm run build`.
- [ ] Ejecutar `npm run build:workflow`.
- [ ] Validar backend con `npx convex dev --once` si hubo cambios.
- [ ] Publicar frontend si corresponde.
- [ ] Confirmar HTTP 200 y assets correctos en producción.
- [ ] Probar dos identidades de sesión distintas.
- [ ] Probar audio después de un clic.
- [ ] Ocultar secretos, dashboards privados e identificadores sensibles.
- [ ] Preparar un claim alternativo.
- [ ] Tener captura completa de cada integración real.

## Checklist Editorial

- [ ] 1920×1080, 30 fps, H.264/AAC.
- [ ] Duración objetivo de 115–120 segundos.
- [ ] Subtítulos grandes y contrastados.
- [ ] Dos ventanas legibles, no miniaturas diminutas.
- [ ] Sin silencios largos ni cursores buscando opciones.
- [ ] “Espera recortada” cuando se acorte procesamiento.
- [ ] “Sandbox · sin cobro real” durante RevenueCat.
- [ ] Proveedores nombrados cuando se ve su prueba.
- [ ] Música opcional por debajo de la voz; audio del producto breve.
- [ ] URL pública visible al final.

## Checklist De Entrega

- [ ] Ver el video exportado completo antes de subirlo.
- [ ] Verificar audio, subtítulos y legibilidad en móvil.
- [ ] Publicar en X etiquetando `@nerdconf_ar` si el brief vigente lo exige.
- [ ] Abrir el enlace publicado en una sesión sin autenticar.
- [ ] Copiar URL del video al formulario.
- [ ] Seleccionar sólo tracks que puedan defenderse con evidencia.
- [ ] Añadir timestamps y enlaces de prueba.
- [ ] Pulsar Submit/Update submission; guardar confirmación.

## Texto Corto Para X

> ¿Promesa real o puro humo? Truth Tribunal convierte el hype de IA en un juicio multijugador: vota, contrasta fuentes y examina la evidencia. Construido para #BurningToken @nerdconf_ar. Pruébalo: https://brave-lemur-868.convex.site

## Frase Final

**Presenta la promesa. Convoca al jurado. Examina las pruebas.**
