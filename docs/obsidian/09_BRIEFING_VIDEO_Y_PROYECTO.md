# Truth Tribunal — Briefing del Proyecto para el Video

> **Documento personal.** Usa esta información para armar tu guión, preparar la narrativa del video y tener claro qué mostrar y qué decir. No es parte del código ni del README público.

---

## Qué es Truth Tribunal (tu pitch de elevador)

Truth Tribunal es un tribunal colaborativo en tiempo real donde el público vota si una afirmación es LEGIT (legítima) o SMOKE (puro humo), y después un pipeline de IA investiga en dos fases para contrastar esa afirmación con fuentes reales de internet.

**La gracia:** no le cree al público ni a la IA a ciegas. El voto del jurado expresa intuición; la investigación aporta evidencia; y si no hay suficiente sustento, el sistema se abstiene en vez de inventar una conclusión.

---

## El flujo que el video debe mostrar (resumen visual)

```
Claim → Sala → Votos en vivo → Investigación (2 fases) → Veredicto → Siguiente caso
```

1. **Alguien dice algo exagerado** → Se mete al tribunal
2. **El público vota** → LEGIT o SMOKE, en vivo, con sonido de tribunal
3. **La IA investiga** → Busca fuentes, encuentra brechas, busca de nuevo
4. **Sale el veredicto** → Con citas, métricas y limitaciones honestas
5. **Si quieres más profundidad** → Pro te da el dossier completo

---

## Las 6 tecnologías integradas (para mencionarlas naturalmente)

No necesitas nombrar todas como una lista de compras. Menciónalas cuando aparezcan en pantalla:

| Tecnología | Momento natural para mencionarla |
|---|---|
| **Convex** | Cuando los votos se actualizan en tiempo real entre dos navegadores. "Todo está sincronizado en tiempo real con Convex." |
| **Linkup** | Cuando aparecen las fuentes de investigación. "Linkup busca en internet en dos rondas: primero los hechos, después las contradicciones." |
| **Nebius** | Cuando sale el veredicto con tokens y latencia. "Nebius Token Factory evalúa la evidencia y emite el veredicto." |
| **Render** | Cuando se ve el monitor del workflow con los checkpoints. "Todo el proceso corre en un worker de Render que puede recuperarse de fallos sin perder progreso." |
| **RevenueCat** | Cuando se abre el paywall Pro. "La suscripción Pro pasa por RevenueCat Test Store, sandbox sin cobro real." |
| **Web Audio** | Cuando suena el martillazo del juez o la sirena de humo. "Todo el audio es generado en el navegador con Web Audio API, sin archivos de sonido." |

---

## La idea del video con el clip del streamer

Tu concepto: integrar un clip de un streamer que tuvo un momento vergonzoso/exagerado (una promesa absurda, un fail, un claim ridículo) y usarlo como el **claim que se somete al tribunal**.

### Estructura sugerida para la edición:

1. **Intro con el clip del streamer** (2-3 seg)
   - El streamer dice algo exagerado o ridículo
   - Corte rápido, texto en pantalla: *"¿Esto es real?"*

2. **Transición al tribunal** (1-2 seg)
   - Sonido del martillazo de juez (generado por Web Audio)
   - Se abre Truth Tribunal con ese claim ya escrito

3. **Demo en vivo del producto** (~1 min 30 seg)
   - Mostrar el flujo completo: votos → investigación → veredicto
   - Los votos cambiando en dos ventanas simultáneas
   - Las fuentes apareciendo con sus citas
   - El veredicto final con métricas

4. **Cierre** (10-15 seg)
   - Volver brevemente al clip del streamer
   - El veredicto del tribunal superpuesto sobre el clip
   - Slogan: *"Presenta la promesa. Convoca al jurado. Examina las pruebas."*
   - URL del proyecto

### Tips para la edición:

- **No necesitas que el clip del streamer sea largo.** 2-3 segundos del momento clave bastan para el hook.
- **El contraste es lo que hace gracia:** algo absurdo del streamer → el tribunal profesional analizándolo con IA y fuentes reales.
- **Si el claim del streamer sale como CERTIFIED_SMOKE**, perfecto: eso es el punchline del video.
- **Si sale INSUFFICIENT_EVIDENCE**, también funciona: puedes decir *"Ni la IA pudo con este nivel de humo."*

---

## Datos duros que puedes mencionar en el video o descripción

- **67 pruebas automatizadas** pasando
- **8 fuentes reales** recopiladas por auditoría (4 iniciales + 4 de contraste)
- **~4,800 tokens procesados** por Nebius en cada evaluación
- **Latencia de inferencia:** ~33 segundos para la evaluación completa
- **Bilingüe:** español e inglés con toggle instantáneo
- **Cero archivos de audio:** todo sintetizado matemáticamente
- **Códigos de sala:** `HYPE-XXXXXX` con ~887 millones de combinaciones posibles
- **Fallback automático:** si Render no responde, Convex continúa la auditoría sin perder datos

---

## URLs importantes

| Recurso | URL |
|---|---|
| **App en producción** | https://brave-lemur-868.convex.site |
| **Repositorio GitHub** | https://github.com/arenasantiago/burningtoken |
| **Dashboard Convex** | https://dashboard.convex.dev/t/santiago-holguin/burningtoken/brave-lemur-868 |

---

## Qué NO mostrar ni decir

- No menciones precios de premios del hackathon.
- No muestres las API keys ni el dashboard de Convex con secretos.
- No presentes un fallback como si fuera la integración real de Render.
- No digas que el sistema "certifica" o "garantiza" nada — el tribunal audita y puede abstenerse.
- No muestres el `.env.local` ni la configuración de secretos en pantalla.

---

## Checklist antes de grabar

- [ ] La app en `https://brave-lemur-868.convex.site` carga correctamente con el favicon nuevo
- [ ] Puedes crear una sala y unirte desde otra ventana/navegador
- [ ] Los votos se sincronizan entre ambas ventanas
- [ ] La investigación corre y muestra fuentes reales
- [ ] El veredicto aparece con métricas de Nebius
- [ ] El audio del martillazo suena (requiere un clic/gesto primero)
- [ ] El idioma cambia con el toggle ES/EN
- [ ] Tienes el clip del streamer listo para editar
- [ ] Tienes un claim preparado basado en lo que dice el streamer
