---
tags:
  - diseño
  - ui
  - ux
  - roadmap
updated: 2026-09-12
---

# 06 · Diseño Y Evolución Visual

Volver a [[00_INDICE_TRUTH_TRIBUNAL|Índice]].

## Lenguaje Visual

La interfaz usa una estética de tribunal tecnológico: fondo oscuro, acentos púrpura, rojo para humo, verde para sustento y dorado para Pro. La meta no es decorar cada pantalla, sino hacer legibles tres tensiones:

- intuición humana frente a evidencia;
- fuente real frente a fallback;
- conclusión frente a incertidumbre.

## Decisiones Ya Materializadas

- Header responsive, estado de conexión y cambio ES/EN.
- Lobby con ejemplos, código de sala y asistente de formulación.
- Apodos y modal de entrada para invitados.
- Hype-o-Meter semicircular, feed reactivo y botones táctiles.
- Audio procedural con sonidos diferentes para voto, alerta y resultado.
- Evidencias separadas por fase, procedencia e incertidumbre.
- Glosario contextual mediante `PericialTerm`.
- Reporte final con métricas y caso límite.
- Diferenciación Free/Pro, matriz de riesgo y salida PDF/Markdown.
- Diseño responsive comprobado en viewports móviles pequeños.

## Principios Para El Pulido Final

1. **La evidencia domina la decoración.** URL, cita, fase y procedencia deben ser legibles en la grabación.
2. **Un color tiene significado estable.** Rojo no puede indicar indistintamente error, humo y acción primaria.
3. **El movimiento explica estado.** Evitar animaciones que compitan con el cambio reactivo importante.
4. **Dos ventanas deben seguir siendo legibles.** Para demostrar multiplayer, ampliar las zonas que cambian.
5. **El audio es breve.** Un efecto confirma una acción; no debe tapar la voz.
6. **Movimiento reducido se respeta.** La experiencia no depende de animaciones para comunicar información.

## Mejoras Posteriores Al Video

- Dividir el bundle principal, actualmente grande, sin arriesgar la demo.
- Revisar navegación completa con lector de pantalla.
- Ensayar dispositivos físicos y conexiones lentas.
- Crear filtros de evidencia si el volumen real los vuelve necesarios.
- Añadir comparación visual entre voto humano y resultado pericial.
- Sustituir cualquier texto promocional que parezca una certificación absoluta.

## Fuera Del Alcance Inmediato

- Extensión de navegador para X/LinkedIn.
- Bot público para auditar menciones.
- Carga de pitch decks.
- Staking o quema de tokens.
- Debate multiagente Fiscal/Defensor.

Estas ideas pertenecen al roadmap; no deben aparecer en el video como capacidades presentes.

## Checklist Visual Antes De Grabar

- Claim corto y legible.
- Zoom del navegador consistente.
- Sin barras, pestañas ni datos sensibles innecesarios.
- Host e invitado identificables.
- Fuente y cita visibles durante al menos dos segundos.
- Métricas sin números ficticios.
- Etiquetas “Sandbox” y “espera recortada” cuando correspondan.
- Audio probado después de un gesto de usuario.

Siguiente: [[07_COMO_EXPLICAR_EL_PROYECTO|Cómo explicar el proyecto]].
