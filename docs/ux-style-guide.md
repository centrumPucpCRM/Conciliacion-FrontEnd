# Guía de Estilos UX – Sistema de Conciliación

Esta guía resume los tokens visuales y patrones de componentes usados en el frontend para mantener coherencia en todos los módulos (Propuestas, Conciliaciones, etc.).

## Paleta de colores

| Token             | HEX      | Uso principal                            | Tailwind sugerido |
|-------------------|----------|------------------------------------------|-------------------|
| `color-primary`   | `#1D4ED8`| Acciones principales, botones primarios  | `bg-blue-600`     |
| `color-primary/dk`| `#1E40AF`| Hover/pressed de botones primarios       | `hover:bg-blue-700`|
| `color-accent`    | `#0EA5E9`| Acciones destacadas secundarias          | `bg-sky-500`      |
| `color-success`   | `#10B981`| Estados satisfactorios/sucesos           | `bg-emerald-500`  |
| `color-warning`   | `#F59E0B`| Advertencias                             | `bg-amber-500`    |
| `color-danger`    | `#EF4444`| Errores/críticos                         | `bg-red-500`      |
| `neutral-900`     | `#0F172A`| Titulares                                | `text-slate-900`  |
| `neutral-700`     | `#334155`| Texto principal                          | `text-slate-700`  |
| `neutral-500`     | `#64748B`| Texto secundario                         | `text-slate-500`  |
| `neutral-200`     | `#E2E8F0`| Bordes, divisores, contenedores sutiles  | `border-slate-200`|
| `neutral-100`     | `#F1F5F9`| Fondos suaves                            | `bg-slate-100`    |

## Tipos de botones

| Tipo        | Fondo / Borde                                  | Texto                 | Uso                       |
|-------------|------------------------------------------------|-----------------------|---------------------------|
| Primario    | `bg-sky-500` ? `hover:bg-sky-600`              | `text-white`          | Acción principal (CTA).   |
| Secundario  | `bg-white` + `border-slate-200` ? `hover:bg-slate-50` | `text-slate-600` | Acciones alternativas, cancelar. |
| Neutro suave| `bg-slate-100` ? `hover:bg-slate-200`          | `text-slate-600`      | Filtros o acciones poco críticas. |
| Destructivo | `bg-red-500` ? `hover:bg-red-600`              | `text-white`          | Acciones irreversibles.   |
| Ghost       | `bg-transparent`                               | `text-sky-500`        | Links con aspecto botón.  |

## Modales

Patrones comunes:

- Contenedor: `rounded-2xl bg-white shadow-xl border border-slate-100` con padding `px-8 py-6` (ajustar en pantallas pequeñas a `px-6`).
- Cabecera: título `text-xl font-semibold text-slate-800`, botones de cierre `text-slate-400`.
- Inputs: `border border-slate-200 rounded-lg px-4 py-3` con `focus:border-sky-400 focus:ring-sky-200`.
- Pie de modal: `flex justify-end gap-3 pt-6 border-t border-slate-200` usando botones tipificados.

## Chips y etiquetas

- Estado Primario: `bg-blue-100 text-blue-700`.
- Estado Secundario: `bg-emerald-100 text-emerald-700`.
- Neutros: `bg-slate-100 text-slate-600`.

## Iconografía

- Íconos de acción: tamaño base `w-5 h-5`, color `text-slate-400` y cambiar a `text-sky-500` en hover.
- Avatares: círculos `h-10 w-10 bg-sky-500 text-white font-semibold`.

## Espaciados

- Containers principales: `px-2` en layouts con sidebar. Añadir `md:px-4 lg:px-8` cuando se requiera espacio mayor.
- Separación entre tarjetas/tabs: `mt-3` máximo para mantener cohesión vertical.
- Formularios: `space-y-4` entre campos, `gap-6` en grids.

## Uso recomendado

1. Siempre utilizar los tokens anteriores (colores y espacios) antes de introducir nuevos valores.
2. Botón Cancelar ? estilo secundario.
3. Botón primario en modales ? `bg-sky-500 hover:bg-sky-600 text-white`.
4. Evitar mezclar grises de distinta intensidad dentro del mismo modal.
5. Los modales deben seguir el patrón de cabecera + contenido + footer descrito.

Esta guía debe aplicarse a los modales existentes (`ModalBusquedaAvanzada`, `ModalNuevaPropuesta`) y a futuros componentes.
