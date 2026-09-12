---
tags:
  - pitch
  - aprendizaje
  - presentacion
updated: 2026-09-12
---

# 07 · Cómo Explicar El Proyecto

Volver a [[00_INDICE_TRUTH_TRIBUNAL|Índice]].

## En Una Frase

Truth Tribunal es un tribunal multijugador que permite votar una promesa y después contrastarla con investigación web y una evaluación trazable de IA.

## En Treinta Segundos

> “Las promesas de IA y startups se publican más rápido de lo que podemos comprobarlas. En Truth Tribunal, un host presenta el claim, comparte una sala y el público vota si parece legítimo o puro humo. Luego Linkup investiga en dos fases, Nebius evalúa las fuentes con citas verificables y Convex sincroniza todo en tiempo real. El resultado puede respaldar, contradecir o abstenerse si no hay evidencia suficiente.”

## El Problema

- El contenido viral premia seguridad y velocidad, no trazabilidad.
- Verificar una promesa requiere convertirla en algo medible.
- Las fuentes pueden ser parciales o contradictorias.
- Un LLM puede sonar convincente incluso cuando carece de evidencia.

## La Solución

- Hace visible la intuición colectiva mediante votos.
- Separa esa intuición del análisis posterior.
- Busca evidencia inicial y luego ataca las brechas.
- Exige citas trazables para relaciones fuertes.
- Muestra procedencia, incertidumbre y límites.
- Mantiene abierta la posibilidad de no decidir.

## Por Qué Es Divertido

El producto convierte una tarea normalmente solitaria en un evento: código de sala, apodos, votos simultáneos, tacómetro, martillazo, sirena y confetti. La estética aumenta participación, pero el resultado sigue sujeto a evidencia.

## Qué Hace Cada Tecnología

| Tecnología | Explicación de una línea |
|---|---|
| Convex | Mantiene a todos los participantes viendo el mismo caso en tiempo real. |
| Linkup | Encuentra fuentes y ejecuta una segunda búsqueda guiada por las brechas. |
| Nebius | Evalúa el claim frente a esas fuentes y propone un resultado estructurado. |
| Render | Debe ejecutar la investigación de forma resiliente aunque un intento falle. |
| RevenueCat | Gestiona la compra sandbox y el acceso al dossier Pro. |
| Web Audio | Genera la identidad sonora sin descargar archivos de audio. |

## Decisiones Técnicas Defendibles

### ¿Por qué separar votos y veredicto?

Porque popularidad no equivale a verdad. Mostrar ambos permite descubrir cuándo el jurado estaba sesgado o cuándo la evidencia no alcanza para corregirlo.

### ¿Por qué dos búsquedas?

Una consulta inicial descubre el terreno. La segunda se formula después de ver qué entidades, condiciones o contradicciones faltan.

### ¿Por qué validar citas?

Porque un modelo puede inventar una justificación plausible. Una relación fuerte sólo se acepta si la cita existe en el fragmento entregado al modelo.

### ¿Por qué permitir evidencia insuficiente?

Porque forzar LEGIT o SMOKE ante datos débiles convertiría el producto en otra máquina de hype.

### ¿Por qué checkpoints e idempotencia?

Porque investigar consume tiempo y cuota. Un reintento no debe duplicar fuentes ni generar resultados competidores.

### ¿Por qué validar RevenueCat en servidor?

Porque el navegador puede ser manipulado. El acceso Pro debe depender de lo que confirma RevenueCat, no de una bandera local.

## Preguntas Difíciles

**¿Truth Tribunal determina la verdad?**

No. Produce una evaluación trazable de un claim frente a fuentes recuperadas y declara sus límites.

**¿Qué pasa si las fuentes son malas?**

Se muestra su procedencia e incertidumbre. Sin citas suficientes, el sistema debe abstenerse.

**¿El hype score es científico?**

Es una señal de producto derivada de la evaluación, no una probabilidad universal ni certificación jurídica.

**¿La compra Pro cobra dinero?**

No durante la demo: usa RevenueCat Test Store sandbox.

**¿Render ya está verificado?**

El contrato está implementado y probado automáticamente; la ejecución en el servicio real sigue pendiente mientras exista el bloqueo de despliegue.

## Cierre

> “Truth Tribunal no promete resolver la verdad. Hace visible qué creemos, qué evidencias encontramos y hasta dónde podemos concluir.”

Siguiente: [[08_GUION_Y_CHECKLIST_DEL_VIDEO|Guion y checklist del video]].
