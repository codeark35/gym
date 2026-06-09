# CLAUDE.md — GymTracker Pro

> Documento de contexto para agente IA. Leer completo antes de generar cualquier código.

---

## 1. Visión del producto

**GymTracker Pro** es una aplicación gratuita mobile-first para tracking de progreso de fuerza en el gimnasio. Permite registrar sesiones, ejercicios, series/reps/peso, visualizar progreso, estimar 1RM y recibir análisis con IA. El uso **primario es desde celular** (85%+ del tráfico esperado), por lo que toda UI debe diseñarse primero para pantallas de 375px–430px.

Cualquier persona puede registrarse de forma gratuita usando su cuenta de Google y comenzar a medir su progreso sin límites ni suscripciones. No hay planes de pago ni restricciones por uso.

---

## 2. Stack tecnológico confirmado

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| NestJS | ^10 | Framework principal |
| Fastify | ^4 | Adapter HTTP (mayor performance que Express) |
| Prisma | ^5 | ORM + migraciones |
| PostgreSQL | 15+ | Base de datos principal |
| Redis | ^7 | Cache, sesiones, rate limiting |
| Google OAuth 2.0 | — | Registro e inicio de sesión con Google |
| JWT (HS256) | — | Tokens de sesión propios |
| Passport.js | — | Estrategia Google OAuth + JWT |
| @react-oauth/google | — | Google Sign-In en React |
| @google/genai | — | Gemini 3 Flash Preview SDK |
| EventEmitter2 | — | Eventos internos (state machines) |
| class-validator | — | DTOs y validación |
| class-transformer | — | Serialización |

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | ^5 | Tipado estático |
| Vite | ^5 | Build tool |
| Bootstrap 5 | ^5.3 | **Único sistema de UI** (NO usar Tailwind) |
| react-bootstrap | ^2 | Componentes Bootstrap para React |
| lucide-react | ^0.400 | Iconografía |
| TanStack Query | v5 | Server state, cache, loading states |
| Axios | ^1 | HTTP client con interceptors |
| React Router | v6 | Navegación SPA |
| Recharts | ^2 | Gráficos de progreso |

### Infraestructura
- **Deploy backend**: Railway (NestJS + PostgreSQL + Redis como servicios)
- **Deploy frontend**: Cloudflare Pages
- **Auth**: OAuth 2.0 (Google) + JWT propio (HS256)
- **Dominio/CDN**: Cloudflare

### Reglas absolutas de stack
- **Bootstrap 5 es el único sistema de UI**. Cero Tailwind, cero Material UI, cero Chakra.
- **No instalar librerías de UI alternativas** sin aprobación explícita.
- **PWA obligatorio**: el frontend debe ser instalable como app en Android/iOS.
- Toda lógica de negocio va en el **backend**. El frontend es "thin client".

---

## 3. Arquitectura del sistema

### 3.1 Estructura de módulos NestJS

```
src/
├── app.module.ts
├── main.ts                         # Fastify bootstrap
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/                           # Auth propio con Google OAuth
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── google.strategy.ts          # Passport Google OAuth
│   ├── jwt.strategy.ts             # HS256 verify
│   └── jwt-auth.guard.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── workouts/                       # Sesiones de entrenamiento
│   ├── workouts.module.ts
│   ├── workouts.controller.ts
│   ├── workouts.service.ts
│   └── dto/
│       ├── create-workout.dto.ts
│       └── update-workout.dto.ts
├── exercises/                      # Catálogo de ejercicios
│   ├── exercises.module.ts
│   ├── exercises.controller.ts
│   ├── exercises.service.ts
│   └── dto/
├── sets/                           # Series dentro de un workout
│   ├── sets.module.ts
│   ├── sets.controller.ts
│   ├── sets.service.ts
│   └── dto/
├── progress/                       # Cálculos de progreso y 1RM
│   ├── progress.module.ts
│   ├── progress.controller.ts
│   └── progress.service.ts
├── stats/                          # Agregaciones y métricas
│   ├── stats.module.ts
│   ├── stats.controller.ts
│   └── stats.service.ts
├── ai/                             # Integración IA para análisis
│   ├── ai.module.ts
│   ├── ai.controller.ts
│   └── ai.service.ts
└── common/
    ├── decorators/
    │   └── current-user.decorator.ts
    ├── guards/
    ├── interceptors/
    │   └── transform.interceptor.ts
    └── filters/
        └── http-exception.filter.ts
```

### 3.2 Estructura de módulos React (Feature-Based)

```
client/src/
├── main.tsx
├── App.tsx
├── vite.config.ts
├── public/
│   ├── manifest.json               # PWA manifest
│   └── sw.js                       # Service Worker
├── api/
│   ├── axios.ts                    # Instancia con interceptors JWT
│   └── queryClient.ts              # TanStack Query config
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/DashboardPage.tsx
│   ├── workouts/
│   │   ├── components/
│   │   │   ├── WorkoutLogger.tsx   # UI de registro rápido mobile
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── SetRow.tsx
│   │   │   └── WorkoutSummary.tsx
│   │   ├── hooks/
│   │   │   ├── useWorkouts.ts
│   │   │   └── useActiveWorkout.ts
│   │   └── pages/
│   ├── exercises/
│   │   ├── components/
│   │   │   ├── ExercisePicker.tsx  # Búsqueda/filtro mobile-friendly
│   │   │   └── ExerciseCatalog.tsx
│   │   ├── hooks/
│   │   └── pages/
│   ├── progress/
│   │   ├── components/
│   │   │   ├── StrengthChart.tsx   # Recharts
│   │   │   ├── VolumeChart.tsx
│   │   │   └── PRBadge.tsx         # Badge de record personal
│   │   ├── hooks/
│   │   │   └── useProgress.ts
│   │   └── pages/ProgressPage.tsx
│   ├── stats/
│   │   ├── components/
│   │   │   ├── StatsGrid.tsx
│   │   │   └── StreakCard.tsx
│   │   └── pages/StatsPage.tsx
│   └── ai/
│       ├── components/
│       │   └── AIAnalysisPanel.tsx
│       ├── hooks/
│       │   └── useAIAnalysis.ts
│       └── pages/AIPage.tsx
├── components/                     # Componentes globales reutilizables
│   ├── layout/
│   │   ├── MobileNav.tsx           # Bottom navigation bar (mobile)
│   │   ├── TopBar.tsx
│   │   └── AppShell.tsx
│   ├── ui/
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── MetricCard.tsx
│   │   └── PRBadge.tsx
│   └── forms/
│       └── NumberInput.tsx         # Input numérico optimizado mobile
├── hooks/
│   └── useAuth.ts
├── types/
│   ├── workout.types.ts
│   ├── exercise.types.ts
│   └── progress.types.ts
├── utils/
│   ├── orm.utils.ts               # Cálculos 1RM (Epley, Brzycki, etc.)
│   ├── volume.utils.ts
│   └── date.utils.ts
└── styles/
    └── custom.scss                # Variables Bootstrap overrides
```

---

## 4. Modelo de datos (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Usuarios ────────────────────────────────────────────────

model User {
  id             String       @id @default(cuid())
  googleId       String       @unique  // ID de Google OAuth
  email          String       @unique
  name           String
  avatarUrl      String?
  profile        UserProfile?
  workouts       Workout[]
  exercises      Exercise[]   // ejercicios personalizados del usuario
  bodyMetrics    BodyMetric[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@map("users")
}

model UserProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  birthDate     DateTime?
  weightKg      Float?
  heightCm      Float?
  fitnessGoal   FitnessGoal @default(STRENGTH)
  experienceLevel ExperienceLevel @default(INTERMEDIATE)
  preferredUnit WeightUnit  @default(KG)
  updatedAt     DateTime @updatedAt

  @@map("user_profiles")
}

// ─── Catálogo de ejercicios ──────────────────────────────────

model Exercise {
  id           String        @id @default(cuid())
  name         String
  nameEs       String?       // nombre en español
  muscleGroup  MuscleGroup
  secondaryMuscles MuscleGroup[]
  equipment    Equipment     @default(BARBELL)
  movementType MovementType
  isGlobal     Boolean       @default(false) // true = catálogo global
  userId       String?       // null si es global
  user         User?         @relation(fields: [userId], references: [id])
  sets         Set[]
  createdAt    DateTime      @default(now())

  @@unique([name, userId])
  @@map("exercises")
}

// ─── Workouts (sesiones) ─────────────────────────────────────

model Workout {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  date        DateTime      @db.Date
  name        String?       // "Día A - Push", "Piernas"
  notes       String?
  durationMin Int?          // duración en minutos
  bodyWeight  Float?        // peso corporal ese día (opcional)
  status      WorkoutStatus @default(IN_PROGRESS)
  sets        Set[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("workouts")
}

// ─── Series (el corazón del tracking) ───────────────────────

model Set {
  id          String    @id @default(cuid())
  workoutId   String
  workout     Workout   @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  exerciseId  String
  exercise    Exercise  @relation(fields: [exerciseId], references: [id])
  setNumber   Int       // orden dentro del workout para ese ejercicio
  reps        Int
  weightKg    Float     @default(0)
  rpe         Float?    // Rate of Perceived Exertion (1-10)
  rir         Int?      // Reps in Reserve
  isWarmup    Boolean   @default(false)
  isPR        Boolean   @default(false)  // calculado y seteado automáticamente
  notes       String?
  // Calculados y almacenados para evitar recalcular en queries
  oneRepMax   Float?    // 1RM estimado con Epley: weight * (1 + reps/30)
  volume      Float?    // sets.reps * sets.weightKg
  createdAt   DateTime  @default(now())

  @@map("sets")
}

// ─── Métricas corporales ─────────────────────────────────────

model BodyMetric {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  weightKg  Float?
  bodyFat   Float?
  notes     String?

  @@unique([userId, date])
  @@map("body_metrics")
}

// ─── Enums ───────────────────────────────────────────────────

enum MuscleGroup {
  CHEST
  BACK
  LEGS
  SHOULDERS
  BICEPS
  TRICEPS
  CORE
  GLUTES
  CALVES
  FOREARMS
  FULL_BODY
}

enum Equipment {
  BARBELL
  DUMBBELL
  MACHINE
  CABLE
  BODYWEIGHT
  KETTLEBELL
  RESISTANCE_BAND
  OTHER
}

enum MovementType {
  PUSH
  PULL
  HINGE
  SQUAT
  CARRY
  ISOLATION
}

enum WorkoutStatus {
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum FitnessGoal {
  STRENGTH
  HYPERTROPHY
  ENDURANCE
  WEIGHT_LOSS
  GENERAL_FITNESS
}

enum ExperienceLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum WeightUnit {
  KG
  LB
}
```

---

## 5. API REST — Endpoints

### Convención
- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <JWT>` en todos los endpoints protegidos
- Respuestas: `{ data: T, meta?: PaginationMeta }`
- Errores: `{ error: string, message: string, statusCode: number }`

### Workouts
```
POST   /workouts                    Crear workout (inicia sesión)
GET    /workouts                    Listar workouts del usuario (paginado)
GET    /workouts/:id                Obtener workout con sets
PATCH  /workouts/:id                Actualizar (nombre, notas, duración, status)
DELETE /workouts/:id                Eliminar workout
GET    /workouts/today              Workout de hoy si existe
```

### Sets
```
POST   /workouts/:workoutId/sets             Agregar set
GET    /workouts/:workoutId/sets             Listar sets del workout
PATCH  /workouts/:workoutId/sets/:setId      Editar set
DELETE /workouts/:workoutId/sets/:setId      Eliminar set
POST   /workouts/:workoutId/sets/bulk        Agregar múltiples sets a la vez
```

### Exercises
```
GET    /exercises                   Catálogo global + ejercicios del usuario
GET    /exercises/search?q=         Búsqueda por nombre
POST   /exercises                   Crear ejercicio personalizado
GET    /exercises/:id/history       Historial del ejercicio para el usuario
```

### Progress
```
GET    /progress/exercise/:exerciseId        Evolución: pesos, 1RM, volumen por fecha
GET    /progress/exercise/:exerciseId/pr     Record personal actual
GET    /progress/volume?from=&to=            Volumen por músculo en rango de fechas
GET    /progress/1rm/:exerciseId             Historial de 1RM estimado
```

### Stats
```
GET    /stats/summary               Resumen general (streak, total workouts, vol semana)
GET    /stats/streak                Racha actual y máxima
GET    /stats/frequency             Frecuencia por músculo (últimas N semanas)
GET    /stats/volume-weekly         Volumen por semana (últimas 12 semanas)
```

### AI
```
POST   /ai/analyze                  Análisis con IA (body: { type, context? })
POST   /ai/chat                     Chat libre con IA
```

### Auth
```
GET    /auth/google                 Iniciar login con Google (redirección)
GET    /auth/google/callback        Callback de Google OAuth
POST   /auth/logout                 Cerrar sesión
GET    /auth/me                     Datos del usuario autenticado
```
> Auth: `Authorization: Bearer <JWT>` en todos los endpoints protegidos.

---

## 6. Lógica de negocio crítica

### 6.1 Cálculo 1RM (One Rep Max)

Usar **fórmula de Epley** como principal, Brzycki como secundaria:

```typescript
// utils/orm.utils.ts

export function calcEpley(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function calcBrzycki(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (36 / (37 - reps)) * 10) / 10;
}

export function calcVolume(sets: number, reps: number, weightKg: number): number {
  return sets * reps * weightKg;
}

// Calcular y persistir en el Set al momento de guardar
export function enrichSet(reps: number, weightKg: number) {
  return {
    oneRepMax: calcEpley(weightKg, reps),
    volume: reps * weightKg,
  };
}
```

### 6.2 Detección de PR (Personal Record)

Al guardar un `Set`, el `SetsService` debe verificar si es PR:

```typescript
// sets.service.ts — lógica de PR
async checkAndMarkPR(set: Set, userId: string): Promise<boolean> {
  const previousBest = await this.prisma.set.findFirst({
    where: {
      exerciseId: set.exerciseId,
      workout: { userId },
      isWarmup: false,
      id: { not: set.id },
    },
    orderBy: { oneRepMax: 'desc' },
  });

  const isPR = !previousBest || set.oneRepMax > previousBest.oneRepMax;

  if (isPR) {
    await this.prisma.set.update({
      where: { id: set.id },
      data: { isPR: true },
    });
    // Emitir evento para notificación o badge
    this.eventEmitter.emit('set.pr', { setId: set.id, userId });
  }

  return isPR;
}
```

### 6.3 Cálculo de racha (streak)

```typescript
// stats.service.ts
async getStreak(userId: string): Promise<{ current: number; longest: number }> {
  const workouts = await this.prisma.workout.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { date: true },
    orderBy: { date: 'desc' },
  });

  const uniqueDates = [...new Set(workouts.map(w =>
    w.date.toISOString().split('T')[0]
  ))].sort().reverse();

  let current = 0;
  let longest = 0;
  let temp = 0;
  const today = new Date().toISOString().split('T')[0];
  let cursor = today;

  for (const date of uniqueDates) {
    if (date === cursor) {
      temp++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split('T')[0];
    } else if (date < cursor) {
      break;
    }
  }
  current = temp;

  // calcular longest por separado...
  return { current, longest };
}
```

### 6.4 Integración IA (Gemini 3 Flash Preview)

```typescript
// ai.service.ts
@Injectable()
export class AiService {
  private genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async analyze(userId: string, type: AnalysisType, userQuestion?: string): Promise<string> {
    const context = await this.buildUserContext(userId);

    const systemPrompt = `Sos un entrenador personal experto en entrenamiento de fuerza.
Analizás datos reales de entrenamiento y das feedback conciso, accionable y motivador.
Respondé siempre en español rioplatense informal. Máximo 250 palabras.
No inventes datos que no estén en el contexto.`;

    const userPrompt = userQuestion
      ? `${userQuestion}\n\nContexto del usuario:\n${context}`
      : this.buildPromptByType(type, context);

    const response = await this.genai.models.generateContent({
      model: 'gemini-3.0-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1024,
      },
    });

    return response.text ?? '';
  }

  private async buildUserContext(userId: string): Promise<string> {
    // Agregar últimas 4 semanas de workouts con sets
    // Calcular PR por ejercicio, volumen semanal, frecuencia muscular
    // Retornar como string estructurado
  }
}
```

---

## 7. UI/UX Mobile-First — Reglas obligatorias

### 7.1 Navegación

**Bottom Navigation Bar** (como app nativa) para mobile:

```tsx
// components/layout/MobileNav.tsx
// 5 tabs: Dashboard | Workout | Progress | Stats | Profile
// Usar Bootstrap fixed-bottom + nav pills
// Altura: 64px con safe-area-inset-bottom para iOS notch
```

Nunca usar sidebar en mobile. En desktop (≥992px) se puede mostrar sidebar izquierdo.

### 7.2 Pantalla de registro (WorkoutLogger)

La pantalla más usada. Debe ser **extremadamente rápida** de operar con una mano:

- Input de peso: teclado numérico nativo (`inputMode="decimal"`)
- Botones `+2.5kg` / `-2.5kg` para ajuste rápido sin teclado
- Botón "✓ Serie completada" grande (mínimo 48px de altura, `btn-lg`)
- Timer de descanso automático al completar serie (configurable: 60s, 90s, 120s, 180s)
- Scroll automático al siguiente ejercicio al completar todos los sets
- Swipe-to-delete en series (React gesture o botón visible)

### 7.3 Componente SetRow (mobile)

```tsx
// features/workouts/components/SetRow.tsx
// Layout: [#] [peso kg ▲▼] [× reps] [✓ / PR badge]
// Tocar el peso abre un bottom sheet con teclado numérico
// NO usar inputs pequeños — mínimo touch target 44×44px
```

### 7.4 ExercisePicker (búsqueda mobile)

```tsx
// features/exercises/components/ExercisePicker.tsx
// Abre como bottom sheet (offcanvas Bootstrap)
// Buscador sticky arriba
// Filtros rápidos: chips de músculo (Pecho, Espalda, Piernas...)
// Lista virtualizada si hay muchos ejercicios
```

### 7.5 PWA (obligatorio)

```json
// public/manifest.json
{
  "name": "GymTracker Pro",
  "short_name": "GymTracker",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#212529",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Service Worker con cache-first para assets estáticos y network-first para API.
Usar `vite-plugin-pwa` para generación automática.

### 7.6 Breakpoints y diseño

```scss
// styles/custom.scss — Bootstrap variable overrides
$primary:   #212529;   // Negro/carbón — color principal brand
$secondary: #6c757d;
$success:   #198754;
$info:      #0dcaf0;
$warning:   #ffc107;
$danger:    #dc3545;

// Tipografía
$font-family-sans-serif: 'Inter', system-ui, -apple-system, sans-serif;
$font-size-base: 0.9375rem; // 15px — mejor legibilidad en mobile

// Espaciado bottom nav
$spacer: 1rem;
```

**Regla de diseño**: todo el contenido principal debe tener `padding-bottom: 80px` para no quedar tapado por el bottom nav.

---

## 8. Modelos de datos TypeScript (Frontend)

```typescript
// types/workout.types.ts

export interface Workout {
  id: string;
  date: string;           // ISO date "2025-04-17"
  name?: string;
  notes?: string;
  durationMin?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  sets: Set[];
  createdAt: string;
}

export interface Set {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise: Exercise;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  rir?: number;
  isWarmup: boolean;
  isPR: boolean;
  notes?: string;
  oneRepMax?: number;   // calculado backend
  volume?: number;      // calculado backend
}

export interface Exercise {
  id: string;
  name: string;
  nameEs?: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  movementType: MovementType;
  isGlobal: boolean;
}

export interface ProgressEntry {
  date: string;
  maxWeightKg: number;
  bestOneRepMax: number;
  totalVolume: number;
  totalSets: number;
  isPR: boolean;
}

export interface Stats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  weeklyVolumeKg: number;
  uniqueExercises: number;
  favoriteExercise?: string;
}
```

---

## 9. Modelo de negocio

**GymTracker Pro es 100% gratuito**. No hay planes de suscripción, ni límites de uso, ni funciones de pago.

Cualquier usuario registrado con Google tiene acceso completo a:
- Registro ilimitado de workouts, ejercicios y series
- Todo el historial de progreso sin restricción de tiempo
- Análisis con IA (sin límite de consultas)
- Exportación de datos
- Creación ilimitada de ejercicios personalizados

No se implementa sistema de pagos ni módulo de suscripciones.

---

## 10. Catálogo inicial de ejercicios (seed)

El seed debe incluir al menos 60 ejercicios globales organizados por grupo muscular. Prioridad:

**Pecho**: Press banca plano, Press banca inclinado, Press banca declinado, Aperturas mancuerna, Fondos pecho, Crossover polea, Press con mancuernas.

**Espalda**: Peso muerto convencional, Remo barra, Remo mancuerna, Dominadas, Pull-down polea, Remo en polea, Face pull, Remo T-bar.

**Piernas**: Sentadilla libre, Sentadilla frontal, Leg press, Extensión cuádriceps, Curl femoral, Hip thrust, Peso muerto rumano, Zancadas, Prensa inclinada.

**Hombros**: Press militar barra, Press militar mancuernas, Elevaciones laterales, Elevaciones frontales, Face pull, Arnold press.

**Bíceps**: Curl barra recta, Curl barra Z, Curl mancuerna alternado, Curl martillo, Curl concentrado, Curl en polea.

**Tríceps**: Press francés, Extensión tríceps polea, Press cerrado, Fondos tríceps, Patada de tríceps.

**Core**: Plancha, Crunch, Crunch en polea, Rueda abdominal, Elevación de piernas colgado, Russian twist.

---

## 11. Variables de entorno

### Backend (.env)
```env
# ─── Base de datos ───────────────────────────
DATABASE_URL="postgresql://gym_user:gym_password@127.0.0.1:5432/gym_db"

# ─── Redis (opcional en desarrollo) ──────────
REDIS_URL="redis://user:pass@host:6379"

# ─── Auth (Google OAuth + JWT propio) ─────────
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3022/api/v1/auth/google/callback"
JWT_SECRET="super-secret-key-cambiar-en-produccion"
JWT_ALGORITHM="HS256"
JWT_EXPIRES_IN="7d"
JWT_DEV_SECRET="dev-secret-gymtracker-local-2024"

# ─── Frontend (redirect post-login) ────────────
FRONTEND_URL="http://localhost:5173"

# ─── IA (Gemini 3 Flash Preview) ─────────────
GEMINI_API_KEY="tu-api-key-de-gemini"

# ─── App ─────────────────────────────────────
NODE_ENV="development"
PORT=3022
CORS_ORIGINS="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3022/api/v1
VITE_APP_NAME="GymTracker Pro"
VITE_DEV_LOGIN=true
```

---

## 12. Orden de implementación recomendado

### Fase 1 — Core MVP (2-3 semanas)
1. Setup NestJS + Fastify + Prisma + PostgreSQL en Railway
2. Implementar auth propio con Google OAuth + JWT (HS256)
3. Módulos: `users`, `exercises` (catálogo global + seed), `workouts`, `sets`
4. Cálculo automático de `oneRepMax` y `volume` en `SetsService`
5. Detección de PR al guardar set
6. Endpoints básicos de `progress` y `stats`
7. Frontend: AppShell + MobileNav + WorkoutLogger + ExercisePicker + Login con Google
8. PWA: manifest + service worker básico

### Fase 2 — Progreso visual (1-2 semanas)
1. ProgressPage con gráficos Recharts (peso máximo, 1RM, volumen)
2. StatsPage: racha, frecuencia muscular, volumen semanal
3. PRBadge: mostrar animación/badge al lograr PR
4. Timer de descanso en WorkoutLogger

### Fase 3 — IA y funciones avanzadas (1-2 semanas)
1. Módulo `ai` con integración Gemini 3 Flash Preview
2. AIAnalysisPanel en frontend
3. Exportación CSV/JSON
4. Perfil de usuario y ajustes de la app

### Fase 4 — Mejoras y escala (2 semanas)
1. Optimización mobile (gestos, transiciones, offline support)
2. Notificaciones push (PWA)
3. Cache avanzado con Redis

---

## 13. Convenciones de código

- Todos los DTOs usan `class-validator` + `class-transformer`
- Todos los controllers usan `@UseGuards(JwtAuthGuard)`
- Responses paginadas: `{ data: T[], meta: { total, page, limit, totalPages } }`
- Fechas: siempre UTC en backend, convertir a local en frontend
- Nombres en inglés en código, español solo en mensajes al usuario
- Commits: `feat:`, `fix:`, `refactor:`, `docs:` (Conventional Commits)
- Cada módulo tiene su propio `*.module.ts`, `*.service.ts`, `*.controller.ts` y carpeta `dto/`
- No lógica de negocio en controllers — solo llamar al service
- Errores: siempre usar `HttpException` o sus subclases de NestJS

---

## 14. Testing

- Unit tests en `*.service.spec.ts` para lógica de cálculo (1RM, streak, PR)
- Integration tests para endpoints críticos: crear workout, agregar set, verificar PR
- El cálculo de 1RM y PR detection son prioritarios para testing

---

*Generado por Labscore — Stack: NestJS + Fastify + Prisma + PostgreSQL + Redis + React 19 + Bootstrap 5 + Railway + Cloudflare Pages*
