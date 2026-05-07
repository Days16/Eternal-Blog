# ETERNIDAD

> Blog-wiki personal de un escritor en formación. Estética *dark academia / biblioteca arcana* — añil nocturno, pergamino dorado, sellos de cera y runas.

---

## Vista general

ETERNIDAD es una aplicación web full-stack que combina blog, enciclopedia (*Codex*), portafolio y comunidad en torno a la obra de un escritor. Incluye un sistema de gamificación completo: niveles, XP, logros desbloqueables, racha diaria y misiones.

| Pantalla | Descripción |
|---|---|
| **Crónicas** | Feed cronológico de entradas (notas, guías, previews, worldbuilding) |
| **Codex** | Entradas enciclopédicas — personajes, criaturas, lugares, glosarios |
| **Portafolio** | Previews de obra en curso |
| **Perfil** | Estadísticas públicas del usuario, nivel, logros |
| **Comunidad** | Comentarios anidados, reacciones, teorías |
| **Admin** | Panel de moderación y gestión (Cámara del Archimago) |

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org) — App Router, React Server Components |
| **UI** | React 19, CSS Variables (design tokens propios), Tailwind CSS |
| **Base de datos** | [Supabase](https://supabase.com) (PostgreSQL) con RLS |
| **Autenticación** | [NextAuth.js v5](https://authjs.dev) — Credentials + JWT |
| **Email** | [Resend](https://resend.com) |
| **Fetch client** | [SWR](https://swr.vercel.app) |
| **Editor** | Tiptap |
| **Deploy** | Vercel / Cloudflare Pages |

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| **Visitante** | Lectura pública |
| **Lector** | Comentarios y reacciones |
| **Escriba** | Acceso extendido, XP bonus |
| **Moderador** | Moderación de comentarios y entradas |
| **Dev** | Dev Sanctum — acceso técnico |
| **Admin** | Control total — Cámara del Archimago |
| **Oráculo / Cronista** | Roles especiales por nivel de gamificación |

---

## Gamificación

Sistema de niveles basado en XP acumulado por actividad:

```
Aprendiz → Iniciado → Adepto → Druida → Archimago
```

Eventos que otorgan XP: leer, comentar, reaccionar, racha diaria, easter eggs y misiones completadas. Los logros se desbloquean automáticamente por criterios en código y se muestran como *cromos rúnicos*.

---

## Requisitos previos

- **Node.js** ≥ 20
- **npm** / pnpm / yarn
- Cuenta y proyecto en **Supabase** (PostgreSQL)
- Cuenta en **Resend** para emails transaccionales

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/<usuario>/eternidad.git
cd eternidad

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus claves reales

# 4. Ejecutar el schema de base de datos
# Importar /supabase/schema.sql desde el dashboard de Supabase

# 5. Arrancar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:3000`.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz. **Nunca lo subas al repositorio.**

```env
# URL pública de la aplicación
NEXT_PUBLIC_URL=http://localhost:3000

# NextAuth — generar con: openssl rand -hex 32
AUTH_SECRET=<64-caracteres-hexadecimales>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<id-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave-anon-publica>
SUPABASE_SERVICE_ROLE_KEY=<clave-service-role-privada>

# Resend (email transaccional)
RESEND_API_KEY=re_<tu-clave>
```

Existe un archivo [`env.local.example`](.env.local.example) con las claves en blanco para usar como plantilla.

---

## Estructura del proyecto

```
.
├── app/
│   ├── (auth)/            # Login y registro
│   ├── admin/             # Panel de administración (protegido por rol)
│   │   ├── entradas/      # Gestión de entradas del blog
│   │   ├── codex/         # Gestión del wiki
│   │   ├── comentarios/   # Moderación de comentarios
│   │   ├── usuarios/      # Gestión de usuarios y roles
│   │   ├── logros/        # Logros desbloqueables
│   │   ├── misiones/      # Misiones / quests
│   │   ├── roles/         # Roles y permisos
│   │   └── tema/          # Tema y aspecto visual
│   ├── api/               # Rutas de API REST
│   │   ├── auth/          # NextAuth handlers
│   │   ├── comments/      # CRUD de comentarios
│   │   ├── reactions/     # Reacciones a entradas
│   │   ├── notifications/ # Notificaciones de usuario
│   │   ├── search/        # Búsqueda global
│   │   ├── user/          # Stats de usuario
│   │   └── xp/            # Eventos de XP
│   ├── buscar/            # Buscador público
│   ├── codex/             # Wiki / enciclopedia pública
│   ├── cronicas/          # Feed del blog
│   ├── grimorio/          # Grimorio personal del autor
│   ├── perfil/            # Perfiles públicos
│   ├── sobre/             # Página "Sobre el autor"
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/             # KPICard, ActivityChart, EntryForm
│   ├── auth/              # Botones de sesión
│   ├── comments/          # CommentTree, CommentNode, CommentForm
│   ├── content/           # EntryCard, WikiCard, ReactionControl
│   ├── editor/            # TiptapEditor
│   ├── gamification/      # AchievementToast, EasterEgg
│   ├── layout/            # TopNav, AdminSidebar, AdminNav, Footer
│   ├── search/            # SearchClient
│   └── ui/                # Primitivos (Btn, Tag, Badge…)
├── lib/
│   ├── achievements/      # Evaluador de logros
│   ├── auth/              # Configuración NextAuth y helpers de sesión
│   ├── rate-limit.ts      # Rate limiter en memoria
│   ├── supabase/          # Cliente, queries y helpers de Supabase
│   ├── utils/             # Fechas, sanitización HTML, slugs
│   └── xp/                # Eventos y cálculo de XP
├── styles/
│   ├── tokens.css         # Design tokens — paleta, tipografía, espaciado
│   └── globals.css        # Reset, utilidades y estilos base
├── types/                 # Tipos TypeScript compartidos
├── middleware.ts          # Protección de rutas por rol
└── auth.ts                # Instancia NextAuth
```

---

## Sistema de diseño

Los tokens están en [`styles/tokens.css`](styles/tokens.css). No modificar la paleta sin consenso.

| Token | Valor | Uso |
|---|---|---|
| `--moss-900` | `#0b1119` | Fondo principal |
| `--moss-800` | `#131b27` | Fondo elevado |
| `--moss-700` | `#1c2638` | Tarjetas |
| `--spore` | `#d4a64a` | Acento dorado principal |
| `--rune` | `#c89b3c` | Acento runa |
| `--ember` | `#a83232` | Sello de cera, alertas |
| `--mist` | `#6e8bb8` | Enlaces |
| `--amethyst` | `#7c4a8e` | Roles especiales |

**Tipografía:** Cormorant Garamond (display) · Fraunces (body) · Inter (UI) · JetBrains Mono (código)

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo en http://localhost:3000
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

---

## Prototipo HTML

Para revisar el sistema visual sin necesidad de backend, abre [`ETERNIDAD.html`](ETERNIDAD.html) en cualquier navegador. Contiene todas las pantallas en canvas pan/zoom y un modo prototipo navegable con router propio.

---

## Licencia

Todos los derechos reservados © 2025. El código puede usarse como referencia de aprendizaje. El sistema visual, los textos y la identidad de ETERNIDAD son propiedad exclusiva del autor.
