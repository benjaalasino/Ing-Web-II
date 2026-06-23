# GastoClaro — Backend (NestJS)

API REST para la gestión de gastos personales, presupuestos, metas de ahorro,
recomendaciones de asesores y extracción de datos de tickets por OCR.

> **Migración a NestJS.** Este backend fue reescrito desde un servidor
> Express.js plano hacia el framework **NestJS** con TypeScript, manteniendo
> el 100% de las funcionalidades y el contrato de la API (mismas rutas,
> mismos cuerpos de respuesta), pero con una arquitectura modular,
> tipada y con separación de responsabilidades.

---

## Stack

- **NestJS 10** + **TypeScript**
- **PostgreSQL** mediante el driver `pg` (SQL crudo encapsulado)
- **JWT** (`@nestjs/jwt`) para autenticación
- **class-validator / class-transformer** para validación vía DTOs
- **bcryptjs** para hash de contraseñas
- **Multer** (`@nestjs/platform-express`) para la carga de imágenes
- **Groq** (modelo de visión) para el OCR de tickets

---

## Cómo correrlo

```bash
cd Backend
npm install
cp .env.example .env   # y completá las variables

# desarrollo (recarga en caliente)
npm run start:dev

# producción
npm run build
npm start
```

La app levanta en `http://localhost:3000`, sirve el frontend estático de
`Frontend/public/src` y expone la API bajo el prefijo **`/api`**.

### Variables de entorno

| Variable          | Descripción                                             |
| ----------------- | ------------------------------------------------------- |
| `PORT`            | Puerto HTTP (default 3000)                              |
| `JWT_SECRET`      | Secreto para firmar los JWT                             |
| `DATABASE_URL`    | Cadena de conexión a PostgreSQL                         |
| `N8N_WEBHOOK_URL` | Webhook de n8n para enviar los códigos de verificación  |
| `GROQ_API_KEY`    | API key de Groq para el OCR de tickets (opcional)       |
| `APP_URL`         | URL pública de la app                                   |

---

## Arquitectura

Cada dominio es un **módulo** de NestJS con su controlador (rutas), su
servicio (lógica de negocio) y sus DTOs (validación de entrada). El acceso a
datos está centralizado en `DatabaseService`.

```
src/
├── main.ts                  # Bootstrap: pipes, filtro, CORS, prefijo /api, frontend estático
├── app.module.ts            # Módulo raíz que importa todos los demás
├── app.controller.ts        # GET /api (info)
│
├── common/                  # Infraestructura transversal
│   ├── config/              # Configuración tipada (configuration.ts)
│   ├── constants/           # CATEGORIES
│   ├── decorators/          # @CurrentUser, @Roles
│   ├── filters/             # AllExceptionsFilter (formato { statusCode, message })
│   ├── interfaces/          # AuthUser
│   └── utils/               # date, expense-stats, expense-mapper, frontend-path
│
├── database/                # DatabaseModule (global)
│   ├── database.service.ts  # Pool pg + query() + init de schema/seed
│   ├── schema.sql
│   └── seed.ts
│
├── auth/                    # Registro, login, verificación de email
│   ├── guards/              # JwtAuthGuard (requireAuth), RolesGuard (requireRole)
│   ├── dto/
│   ├── token.service.ts     # firma/verificación de JWT
│   └── password.service.ts  # hash/compare con bcrypt
│
├── email/                   # Envío de códigos vía n8n
├── health/                  # GET /api/health
├── profile/                 # Perfil del usuario autenticado
├── expenses/                # CRUD de gastos + estadísticas
├── budgets/                 # Presupuestos + progreso + predicciones
├── savings/                 # Metas de ahorro + depósitos
├── recommendations/         # Recomendaciones de asesores
├── users/                   # Listado/detalle de usuarios (solo asesores)
└── tickets/                 # Carga de ticket + OCR con Groq
```

### Patrón por módulo (separación de responsabilidades)

- **Controlador** → sólo define rutas, aplica guards y delega. No tiene lógica.
- **Servicio** → contiene las reglas de negocio y el acceso a datos vía `DatabaseService`.
- **DTO** → valida y tipa el cuerpo/query de la request con `class-validator`.
- **Guard** → autorización (token válido + rol).

---

## Endpoints (sin cambios respecto a la versión Express)

Todos cuelgan de `/api`. Salvo `auth` y `health`, requieren `Authorization: Bearer <token>`.

| Método | Ruta                          | Descripción                         | Acceso   |
| ------ | ----------------------------- | ----------------------------------- | -------- |
| GET    | `/health`                     | Healthcheck                         | público  |
| POST   | `/auth/register`              | Crear cuenta                        | público  |
| POST   | `/auth/login`                 | Iniciar sesión                      | público  |
| POST   | `/auth/verify-email`          | Verificar email con código          | público  |
| POST   | `/auth/resend-verification`   | Reenviar código                     | público  |
| GET    | `/profile`                    | Ver perfil                          | usuario  |
| PUT    | `/profile`                    | Editar perfil / contraseña          | usuario  |
| GET    | `/expenses`                   | Listar gastos (con filtros)         | usuario  |
| GET    | `/expenses/stats`             | Estadísticas de gastos              | usuario  |
| POST   | `/expenses`                   | Crear gasto                         | usuario  |
| PUT    | `/expenses/:id`               | Editar gasto                        | usuario  |
| DELETE | `/expenses/:id`               | Eliminar gasto                      | usuario  |
| GET    | `/budgets`                    | Listar presupuestos                 | usuario  |
| GET    | `/budgets/progress`           | Progreso de presupuestos            | usuario  |
| GET    | `/budgets/predictions`        | Predicciones de gasto               | usuario  |
| POST   | `/budgets`                    | Crear presupuesto                   | usuario  |
| PUT    | `/budgets/:id`                | Editar presupuesto                  | usuario  |
| DELETE | `/budgets/:id`                | Eliminar presupuesto                | usuario  |
| GET    | `/savings`                    | Listar metas de ahorro              | usuario  |
| POST   | `/savings`                    | Crear meta                          | usuario  |
| PUT    | `/savings/:id`                | Editar meta                         | usuario  |
| PATCH  | `/savings/:id/deposit`        | Depositar/retirar de una meta       | usuario  |
| DELETE | `/savings/:id`                | Eliminar meta                       | usuario  |
| GET    | `/recommendations`            | Listar recomendaciones              | usuario  |
| POST   | `/recommendations`            | Crear recomendación                 | asesor   |
| GET    | `/users`                      | Listar usuarios                     | asesor   |
| GET    | `/users/:id`                  | Detalle de usuario                  | asesor   |
| GET    | `/users/:id/stats`            | Estadísticas de un usuario          | asesor   |
| POST   | `/tickets/upload`             | Subir ticket y extraer datos (OCR)  | usuario  |

---

## Registro de cambios (Express → NestJS)

### Estructura y arquitectura
- Migración completa de **Express.js plano** a **NestJS + TypeScript**.
- Todo el código pasó de JavaScript (`require/module.exports`) a **TypeScript** tipado.
- Las antiguas carpetas `controllers/`, `routes/`, `middlewares/`, `services/`,
  `utils/`, `config/`, `constants/`, `data/` se reorganizaron en **módulos por dominio**.
- Las rutas, antes definidas con `express.Router()`, ahora son **controladores** con decoradores (`@Controller`, `@Get`, `@Post`, …).
- La lógica de cada endpoint se movió a **servicios** inyectables (`@Injectable`).
- El acceso a PostgreSQL se centralizó en un **`DatabaseService`** global (antes era un `pool` importado directo en cada controlador).

### Validación con DTOs
- La validación de entrada se hace ahora con **DTOs** y `class-validator`
  (antes eran `if` manuales dentro de cada controlador).
- Un `ValidationPipe` global aplica los DTOs y un `exceptionFactory` conserva el
  formato de error histórico `{ statusCode, message }`.

### Autenticación y autorización
- El middleware `requireAuth` se convirtió en el guard **`JwtAuthGuard`**.
- El middleware `requireRole` se convirtió en el guard **`RolesGuard`** + decorador **`@Roles()`**.
- La firma/verificación de tokens y el hash de contraseñas se encapsularon en
  **`TokenService`** y **`PasswordService`**.
- El usuario autenticado se inyecta con el decorador **`@CurrentUser()`**
  (antes era `req.auth`).

### Manejo de errores
- El `errorHandler` de Express se reemplazó por un **`AllExceptionsFilter`** global
  que normaliza toda respuesta de error a `{ statusCode, message }` y conserva los
  campos extra que el frontend necesita (p. ej. `email`/`unverified` en el login
  de una cuenta sin verificar).

### Correcciones / mejoras
- **Bug corregido en el OCR:** el controlador original usaba una constante
  `GROQ_URL` que **nunca estaba definida** (sólo existía `GEMINI_URL`), por lo que
  la llamada al servicio fallaba. Ahora `tickets.service.ts` define correctamente
  `GROQ_URL` (`https://api.groq.com/openai/v1/chat/completions`).
- La autorización de roles quedó centralizada en `RolesGuard`; el endpoint
  `POST /recommendations` ahora se protege con `@Roles('advisor')` en lugar de un
  `if` dentro del servicio.

### Configuración y build
- Se agregaron `tsconfig.json`, `tsconfig.build.json` y `nest-cli.json`.
- `package.json` ahora usa los scripts de Nest: `start:dev`, `build`, `start`.
- El `schema.sql` se mueve a `src/database/` y se copia automáticamente a `dist/`
  durante el build.
- Se añadió `dist/` al `.gitignore`.

> **Nota de despliegue (Railway):** como el build usa `@nestjs/cli` y `typescript`
> (devDependencies), asegurate de que la instalación incluya las devDependencies
> (p. ej. `NPM_CONFIG_PRODUCTION=false`) para que `nest build` pueda ejecutarse.
