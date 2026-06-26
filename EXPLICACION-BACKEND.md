# Arquitectura del Backend (NestJS)

> Documento de estudio personal. Explica el **diseño** del backend: por qué está
> armado así, qué hace cada programa y de qué piezas se compone. No es una
> explicación línea por línea, sino del cuadro completo.

---

## 1. ¿Qué clase de aplicación es?

El backend es un **monolito modular en capas**. Vale la pena desarmar esa frase
porque define toda la arquitectura:

- **Monolito**: es UN solo programa que se despliega de una vez (un solo proceso,
  un solo `npm start`). No son microservicios separados. Todo vive junto y
  comparte la misma base de datos.
- **Modular**: aunque es un solo programa, por dentro está dividido en **módulos
  independientes por dominio** (gastos, presupuestos, ahorros, etc.). Cada
  módulo es como una "mini-aplicación" autocontenida. Esto da el orden de los
  microservicios sin la complejidad de operarlos por separado.
- **En capas**: dentro de cada módulo, el código está separado por
  responsabilidad (recibir el pedido / pensar la lógica / hablar con la base).

La meta de fondo de todo el diseño es una sola: **separación de
responsabilidades**. Cada archivo tiene un único trabajo. Así el sistema es
fácil de entender, de probar y de modificar sin romper otra cosa.

---

## 2. La arquitectura en capas (lo más importante)

Esta es la columna vertebral. Un pedido HTTP que entra atraviesa **capas**, y
cada capa tiene una única responsabilidad. De afuera hacia adentro:

```
        ┌─────────────────────────────────────────────┐
        │  CLIENTE (el frontend, el navegador)          │
        └───────────────────────┬─────────────────────┘
                                 │  HTTP (JSON)
        ┌───────────────────────▼─────────────────────┐
   1.   │  CONTROLLER  — la "puerta de entrada"         │
        │  Define las URLs. Recibe el pedido y lo deriva.│
        └───────────────────────┬─────────────────────┘
                                 │  llama a
        ┌───────────────────────▼─────────────────────┐
   2.   │  SERVICE  — el "cerebro"                       │
        │  La lógica de negocio: reglas, cálculos, decisiones.│
        └───────────────────────┬─────────────────────┘
                                 │  pide datos a
        ┌───────────────────────▼─────────────────────┐
   3.   │  DATABASE  — el "almacén"                      │
        │  Único punto que habla con PostgreSQL.         │
        └───────────────────────┬─────────────────────┘
                                 │
        ┌───────────────────────▼─────────────────────┐
        │  PostgreSQL (la base de datos)                 │
        └───────────────────────────────────────────────┘
```

**¿Por qué separar en capas y no escribir todo junto?**

- El **Controller** solo sabe de HTTP (rutas, códigos de estado). No sabe SQL ni
  reglas de negocio. Si mañana cambiás de REST a otra cosa, tocás solo esta capa.
- El **Service** solo sabe de reglas del negocio ("un gasto no puede ser
  negativo", "solo ves tus propios datos"). No sabe si lo llamaron por HTTP ni
  qué motor de base hay debajo. Es la capa que más vale y la más reutilizable.
- La capa de **Datos** solo sabe de PostgreSQL. Si mañana cambiás de base, tocás
  solo acá; el resto del sistema ni se entera.

Cada capa **depende de la de abajo, nunca al revés**. El controller conoce al
service, el service conoce a la base. La base no sabe que existen los services.
Esa dirección única de dependencia es lo que mantiene el sistema ordenado.

---

## 3. La pieza que une todo: la inyección de dependencias

Las capas necesitan hablarse: el controller necesita un service, el service
necesita la base de datos. La pregunta de diseño es: **¿quién crea esos objetos
y los conecta?**

La respuesta de NestJS: **no los creás vos, los crea el framework**. A esto se le
llama **inyección de dependencias** (DI). Vos solo *declarás* qué necesita cada
clase, y un componente central de Nest (el "contenedor de DI") se encarga de
fabricar cada objeto una sola vez y entregárselo a quien lo pida.

**¿Por qué es bueno arquitectónicamente?**

- **Bajo acoplamiento**: una clase no se ata a *cómo* se construyen sus
  dependencias, solo a *qué* necesita. Pedís "un servicio de base de datos", no
  te importa cómo se arma.
- **Una sola instancia compartida** (singleton): hay un único `DatabaseService`
  vivo, con un único pool de conexiones, reutilizado por todos. No se crea uno
  nuevo en cada pedido.
- **Testeable**: en un test podés inyectar una base de datos falsa sin tocar el
  código que la usa.

---

## 4. Catálogo de módulos: qué hace cada "programa"

El sistema está compuesto por **módulos de dominio** (resuelven una funcionalidad
del negocio) y **módulos de infraestructura** (dan servicios técnicos a los
demás). Todos se registran en el módulo raíz [app.module.ts](Backend/src/app.module.ts),
que funciona como el índice/ensamblador de la aplicación.

### Módulos de dominio (las funcionalidades del producto)

| Módulo | Qué resuelve | Componentes propios destacables |
|--------|--------------|-------------------------------|
| **auth** | Registro, login, verificación de email y emisión de tokens. Es la **puerta de seguridad** de todo el sistema. | Sub-servicios `PasswordService` (hashing) y `TokenService` (JWT); los guards de seguridad. |
| **expenses** | El corazón del producto: cargar, listar, editar y borrar **gastos**, y calcular estadísticas. | Endpoint extra de `stats`. |
| **budgets** | **Presupuestos** por categoría y mes; además calcula el avance (`progress`) y hace predicciones (`predictions`) de gasto. | Lógica de cálculo más rica que un CRUD simple. |
| **savings** | **Metas de ahorro**: crearlas, editarlas y registrar depósitos parciales hacia el objetivo. | Operación especial `deposit` (suma a lo ahorrado). |
| **recommendations** | Mensajes que un **asesor** le deja a un usuario. El usuario las lee, el asesor las crea. | Acceso mixto: leer (cualquiera) vs. crear (solo rol `advisor`). |
| **tickets** | Recibe la **foto de un ticket/factura** y extrae comercio, fecha y monto automáticamente (OCR con IA). | No usa base de datos: es un puente hacia un servicio externo. |
| **users** | Panel del **asesor**: listar usuarios, ver el detalle de uno y sus estadísticas. | Módulo entero protegido para rol `advisor`. |
| **profile** | Que el usuario logueado gestione **sus propios datos** (perfil). | — |

Fijate un patrón de diseño en la tabla: hay **dos roles** en el sistema
(`user` y `advisor`). Algunos módulos son para el usuario común (expenses,
budgets, savings, profile), otros son exclusivos del asesor (users), y otros son
compartidos con permisos distintos según el rol (recommendations). Esa
separación por rol es una decisión de arquitectura, no un detalle.

### Módulos de infraestructura (servicios técnicos transversales)

| Módulo | Qué provee al resto del sistema |
|--------|-------------------------------|
| **database** | El acceso a PostgreSQL. Es **global**: cualquier módulo puede pedir datos sin reimportarlo. También inicializa el esquema y carga datos demo al arrancar. |
| **email** | Envío de los códigos de verificación (a través de un webhook externo de n8n). Lo usa `auth`. |
| **health** | Un endpoint de "signos vitales" (`/api/health`) para que el servidor de hosting compruebe que la app está viva. |

### ¿De qué se compone un módulo de dominio por dentro?

Todos los módulos de dominio repiten **la misma estructura interna**. Esta
uniformidad es intencional: una vez que entendés uno, entendés los ocho.

```
expenses/                        ← un dominio
├── expenses.module.ts           ← el "ensamblador": declara qué controller y
│                                   qué service tiene, y qué importa/exporta
├── expenses.controller.ts       ← CAPA 1: las rutas /api/expenses
├── expenses.service.ts          ← CAPA 2: la lógica + acceso a datos
└── dto/                         ← los "contratos" de datos de entrada
    ├── create-expense.dto.ts     (qué hace falta para CREAR)
    ├── update-expense.dto.ts     (qué hace falta para EDITAR)
    └── query-expense.dto.ts      (qué filtros se aceptan al BUSCAR)
```

- El **module** no tiene lógica: es puro cableado. Dice "este dominio se compone
  de tal controller y tal service". Es el plano de armado que lee la inyección
  de dependencias.
- Los **DTO** (Data Transfer Object) son la **frontera de validación**. Definen
  la forma exacta que deben tener los datos que entran. Nada llega al service sin
  pasar antes por el filtro del DTO. Es una decisión de seguridad y robustez:
  los datos sucios se rechazan en la puerta, no adentro.

---

## 5. Componentes transversales (cross-cutting)

Hay preocupaciones que **no pertenecen a ningún dominio en particular** porque
afectan a todos: seguridad, validación, manejo de errores, configuración.
Meterlas dentro de cada módulo sería repetir código por todos lados. La
arquitectura las resuelve como **componentes transversales** que se aplican de
forma centralizada. Viven sobre todo en la carpeta `common/`.

- **Configuración** ([configuration.ts](Backend/src/common/config/configuration.ts)):
  un único lugar que lee las variables de entorno (puerto, secreto del JWT, URL
  de la base, claves de servicios externos). El resto del código nunca lee
  `process.env` directo: le pide los valores a este componente. Centralizar la
  config evita tener "secretos" desperdigados.

- **Guards (porteros de seguridad)**: se ejecutan **antes** de llegar al
  controller y deciden si el pedido pasa. Hay dos:
  - `JwtAuthGuard`: "¿estás autenticado?" — valida el token. Si no, corta con 401.
  - `RolesGuard`: "¿tenés el rol necesario?" — para rutas exclusivas de asesor.
  Son transversales: cualquier ruta de cualquier módulo los puede activar con una
  anotación, sin reescribir la lógica de seguridad.

- **Pipes (validación/transformación)**: el `ValidationPipe` global aplica las
  reglas de los DTO a **todos** los pedidos automáticamente, y además limpia y
  convierte los datos. Se configura una vez y rige para todo el sistema.

- **Filters (manejo de errores)**: el `AllExceptionsFilter` global **centraliza
  la forma de los errores**. En vez de que cada service arme su propia respuesta
  de error, lanzan una excepción y este filtro la traduce a una respuesta HTTP
  con formato uniforme. El cliente siempre recibe los errores igual.

- **Decoradores propios** (ej. `@CurrentUser`, `@Roles`): pequeñas etiquetas
  reutilizables que limpian el código repetitivo (sacar el usuario del pedido,
  marcar qué rol exige una ruta).

La idea de fondo: **lo que se repite en todos lados se resuelve una sola vez en
el centro**, no copiado en cada módulo.

---

## 6. Cómo dialogan las piezas: el recorrido de un pedido

Juntando todo, así viaja un pedido típico (ej. "dame mis gastos",
`GET /api/expenses`):

```
1. Llega el HTTP  →  Nest enruta por el prefijo /api
2. GUARDS         →  ¿token válido? ¿rol correcto?   (seguridad transversal)
3. PIPE           →  ¿los datos cumplen el DTO?       (validación transversal)
4. CONTROLLER     →  identifica la ruta y delega       (capa 1)
5. SERVICE        →  aplica reglas y pide los datos    (capa 2)
6. DATABASE       →  consulta PostgreSQL               (capa 3)
   ←── la respuesta vuelve por el mismo camino, en JSON ──→
   (si algo falla en cualquier punto → el FILTER arma el error uniforme)
```

Lo valioso de este diseño: cada paso es **reemplazable e inspeccionable por
separado**. Un problema de seguridad se mira en los guards; uno de datos
inválidos, en los DTO; una regla de negocio mal calculada, en el service; una
consulta lenta, en la capa de base.

---

## 7. El modelo de datos

Toda la información vive en **PostgreSQL**, una base relacional. El esquema está
en [schema.sql](Backend/src/database/schema.sql) y gira alrededor de una entidad
central, **`users`**:

```
                    ┌─────────┐
                    │  users  │  (la persona: nombre, email, password, rol)
                    └────┬────┘
       ┌─────────────┬───┴────┬──────────────┬──────────────┐
       ▼             ▼        ▼              ▼              ▼
 ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐ (advisor_id)
 │ expenses │ │ budgets  │ │ savings │ │recommendations│
 │ (gastos) │ │(presup.) │ │ _goals  │ │  (consejos)   │
 └──────────┘ └──────────┘ └─────────┘ └──────────────┘
```

- **Relación uno-a-muchos**: un usuario tiene muchos gastos, muchos
  presupuestos, muchas metas. Cada fila de esas tablas guarda un `user_id` que
  apunta a su dueño. Esa columna es la que permite que **cada usuario vea solo lo
  suyo** (el service siempre filtra por ahí).
- **Borrado en cascada** (`ON DELETE CASCADE`): si se elimina un usuario, se
  borran automáticamente todos sus gastos, presupuestos y metas. La integridad la
  garantiza la base, no hay que recordarlo en el código.
- **recommendations** es especial: tiene dos vínculos a `users`, el destinatario
  (`user_id`) y el asesor que la escribió (`advisor_id`). Modela la relación
  asesor → usuario.

---

## 8. Integraciones externas

El backend no resuelve todo solo: **delega ciertas capacidades a servicios de
terceros**. Es una decisión de arquitectura (no reinventar lo que ya existe):

- **PostgreSQL** — la base de datos (puede correr local o en Railway en la nube).
- **Groq (IA de visión)** — el módulo `tickets` le manda la foto de la factura y
  recibe los datos extraídos. El backend solo orquesta: prepara la imagen, llama
  al servicio y traduce la respuesta. Si no hay clave configurada, degrada con
  elegancia (le pide al usuario que cargue los datos a mano).
- **n8n (webhook de email)** — el módulo `email` dispara el envío del código de
  verificación. Si no está configurado, en desarrollo lo muestra por consola.

Patrón común en las tres: **el backend depende del servicio externo pero no se
rompe si falta**. Cada integración tiene un plan B. Eso hace al sistema más
resistente.

---

## 9. Resumen de las decisiones de diseño

Si tuvieras que explicar la arquitectura en cinco frases:

1. **Un monolito modular**: un solo programa, ordenado por dominios independientes.
2. **Capas con responsabilidad única**: rutas (controller) → lógica (service) →
   datos (database), dependiendo siempre hacia abajo.
3. **Inyección de dependencias**: el framework arma y conecta los objetos; el
   código solo declara qué necesita.
4. **Lo transversal, centralizado**: seguridad, validación, errores y config se
   definen una vez y se aplican a todo.
5. **Tolerante a fallos externos**: las integraciones (IA, email) degradan con
   gracia en lugar de tumbar el sistema.
