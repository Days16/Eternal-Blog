# LOG DE CAMBIOS — ETERNIDAD

Historial de cambios significativos ordenado de más reciente a más antiguo.

---

## [Security] Ciclo de seguridad completo — Corrección de 6 hallazgos

**Rol ejecutor:** 01_Arquitecto → 02_Programador → 03_QA_Inspector → 04_Documentador

### Hallazgos corregidos

| ID  | Severidad | Descripción                                        | Archivo(s) afectado(s)                       | Estado |
|-----|-----------|---------------------------------------------------|----------------------------------------------|--------|
| C-1 | CRÍTICO   | XSS: `dangerouslySetInnerHTML` sin sanitización    | `app/admin/comentarios/page.tsx`             | ✅ RESUELTO |
| C-2 | CRÍTICO   | Sin whitelist de `kind` en endpoint de reacciones | `app/api/reactions/route.ts`                 | ✅ RESUELTO |
| C-3 | CRÍTICO   | Race condition en XP (read-modify-write no atómica)| `lib/xp/award.ts`, `lib/achievements/evaluator.ts` | ✅ RESUELTO |
| M-1 | MEDIO     | Sin rate limit en `/api/xp`                        | `app/api/xp/route.ts`                        | ✅ RESUELTO |
| M-3 | MEDIO     | `unsafe-eval` en CSP activo en producción          | `next.config.ts`                             | ✅ RESUELTO |
| B-1 | BAJO      | Variable de entorno incorrecta en feed RSS          | `app/feed.xml/route.ts`                      | ✅ RESUELTO |

> **Nota:** M-2 (rate-limit en-memoria multi-instancia → Upstash Redis) y B-2
> (DOMPurify migration) requieren credenciales/paquetes externos y se registran
> como deuda técnica pendiente.

---

### Detalle de cambios

#### C-1 — XSS en panel de moderación
- **Problema:** El cuerpo de comentarios se renderizaba sin sanitizar en el panel
  de admin, exponiendo a los moderadores a XSS almacenado.
- **Solución:** Importado `sanitizeForDisplay()` de `lib/utils/sanitize.ts` y
  aplicado al valor de `dangerouslySetInnerHTML`.

#### C-2 — Inyección de `kind` arbitrario en reacciones
- **Problema:** El campo `kind` se insertaba directamente en la tabla `reactions`
  sin validar contra los valores definidos en el frontend.
- **Solución:** Agregada constante `ALLOWED_REACTION_KINDS = Set(['magic','bright','uneasy','dreamer'])`
  y validación temprana que retorna HTTP 400 ante valores no reconocidos.

#### C-3 — Race condition en acumulación de XP
- **Problema:** `awardXP` y el evaluador de logros hacían read-modify-write
  no atómico sobre `users.xp`, permitiendo que dos peticiones concurrentes
  corrompieran el total de XP.
- **Solución:**
  1. Creada migración SQL `supabase/migrations/001_add_xp_rpc.sql` con función
     `add_xp(p_user_id, p_delta)` que usa `SELECT … FOR UPDATE` + `UPDATE` en
     una sola transacción de Postgres.
  2. `lib/xp/award.ts` migrado a `supabase.rpc('add_xp', …)`.
  3. `lib/achievements/evaluator.ts` migrado a `supabase.rpc('add_xp', …)`,
     eliminando el patrón `user.xp += reward` + update manual.
- **⚠️ Acción requerida:** Ejecutar `supabase/migrations/001_add_xp_rpc.sql`
  desde el SQL Editor del Dashboard de Supabase antes de desplegar.

#### M-1 — Sin rate limit en `/api/xp`
- **Problema:** El endpoint de Easter Eggs no tenía protección contra abuso.
- **Solución:** Añadido `rateLimit(\`xp:${session.user.id}\`, 10, 60_000)` al
  inicio del handler POST (10 eventos/minuto por usuario).

#### M-3 — `unsafe-eval` en CSP de producción
- **Problema:** La directiva `script-src` incluía `'unsafe-eval'` en todos los
  entornos, debilitando la protección CSP en producción.
- **Solución:** Agregada constante `isDev = process.env.NODE_ENV === 'development'`
  y aplicada condicionalmente: `unsafe-eval` solo se emite en modo desarrollo.

#### B-1 — Variable de entorno incorrecta en RSS feed
- **Problema:** `app/feed.xml/route.ts` leía `NEXT_PUBLIC_BASE_URL` que no existe
  en `.env.local`, haciendo que todas las URLs del feed apuntaran a `localhost:3000`.
- **Solución:** Cambiado a `NEXT_PUBLIC_URL`, la variable correcta definida en el proyecto.

---

### Deuda técnica registrada

| ID  | Descripción                                          | Prioridad | Estado |
|-----|------------------------------------------------------|-----------|--------|
| M-2 | Migrar rate-limit in-memory a Upstash Redis          | Media     | Pendiente (requiere credenciales externas) |
| B-2 | Migrar `sanitizeForDisplay` a `isomorphic-dompurify` | Baja      | ✅ Resuelto en ciclo de mejoras siguiente  |

---

*Generado por el ciclo 01_Arquitecto → 02_Programador → 03_QA_Inspector → 04_Documentador*

---

## [Feature] Ciclo de mejoras del proyecto — 10 mejoras implementadas

**Rol ejecutor:** 01_Arquitecto → 02_Programador → 03_QA_Inspector → 04_Documentador

### Mejoras implementadas

| # | Área                    | Descripción                                               | Archivos principales                                       |
|---|-------------------------|-----------------------------------------------------------|------------------------------------------------------------|
| 1 | Gamificación            | Racha diaria (+10 XP por actividad consecutiva)           | `lib/xp/streak.ts`, `supabase/migrations/002_streak_columns.sql` |
| 2 | Gamificación            | Sistema de misiones con evaluador y widget SWR            | `lib/missions/evaluator.ts`, `app/api/missions/route.ts`, `components/gamification/MissionsWidget.tsx` |
| 3 | Gamificación            | Toast enriquecido (title, xpDelta, runeGlyph)             | `components/gamification/AchievementToast.tsx`             |
| 4 | Paginación              | Paginación real en crónicas (Prev/Next, total)            | `lib/supabase/queries/entries.ts`, `app/cronicas/page.tsx` |
| 5 | Validación API          | Zod schema en `/api/comments`                             | `app/api/comments/route.ts`                                |
| 6 | Variables de entorno    | `NEXT_PUBLIC_AUTHOR_ID` y `NEXT_PUBLIC_WORD_GOAL` tipadas | `lib/env.ts`, `.env.local`, `.env.local.example`           |
| 7 | Seguridad (B-2)         | `sanitizeForDisplay` migrada a `isomorphic-dompurify`     | `lib/utils/sanitize.ts`                                    |
| 8 | CSS Responsive          | Clases utilitarias responsivas + View Transitions         | `styles/globals.css`                                       |
| 9 | Tests                   | Nuevas suites: `award.test.ts`, `xp-events.test.ts`       | `__tests__/unit/award.test.ts`, `__tests__/unit/xp-events.test.ts` |
| 10| EasterEgg               | Dispatch de toast con shape enriquecido                   | `components/gamification/EasterEggClient.tsx`              |

### Resultado QA

- ✅ Build: `✓ Compiled successfully`
- ✅ Tests: 27/27 passing
- ✅ Sin errores de TypeScript

### ⚠️ Migraciones pendientes (ejecutar en Supabase Dashboard)

```
supabase/migrations/001_add_xp_rpc.sql   — función add_xp atómica (ciclo anterior)
supabase/migrations/002_streak_columns.sql — columnas streak + last_activity_date en users
supabase/migrations/003_user_missions.sql  — tabla user_missions
```

### Cambio de firma (breaking change interno)

`getPublishedChronicles()` ahora retorna `{ rows: Entry[], total: number }` en lugar de `Entry[]`.
Todos los callers actualizados. Si se añaden nuevos callers, usar `.rows` para acceder a las entradas.

---

*Generado por el ciclo 01_Arquitecto → 02_Programador → 03_QA_Inspector → 04_Documentador*
