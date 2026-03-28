# Leads API — One Million Copy SAS

Bienvenido al repositorio Backend del proyecto **Leads API**. Se trata de un servicio RESTful robusto desarrollado en [NestJS](https://nestjs.com/) para la gestión integral de prospectos (leads) de marketing digital. Utiliza **PostgreSQL** como base de datos y **Prisma ORM** para interactuar con los datos.

## 🚀 Características Principales

- **💡 Operaciones CRUD completas**: Registro, consulta, edición y borrado lógico de Leads.
- **🛡️ Autenticación por API Key**: Seguridad en los endpoints de escritura mediante el header `x-api-key`.
- **📊 Estadísticas Avanzadas**: Cálculo de métricas en tiempo real.
- **🤖 Integración con Inteligencia Artificial**: Generación de resúmenes ejecutivos usando OpenAI (o un mock por defecto) al proveer la variable de entorno `OPENAI_API_KEY`.
- **🛑 Rate Limiting**: Protección global contra abusos restringiendo a **60 peticiones por minuto por IP**.
- **🌱 Seeding**: Generador de base de datos con decenas de leads de prueba generados aleatoriamente.
- **📖 Documentación Autogenerada**: Integración nativa con **Swagger UI**.

---

## 🏗️ Estructura de Carpetas

El proyecto sigue una arquitectura modular altamente organizada, estándar en la comunidad de NestJS:

```text
leads-api/
│
├── prisma/                 # Configuración del ORM y base de datos
│   ├── schema.prisma       # Definición de modelos (ej. Lead, Enum Fuente)
│   └── seed.ts             # Script automatizado para poblar base de datos de prueba
│
├── src/                    # Código fuente principal de la aplicación
│   ├── ai/                 # Módulo de Inteligencia Artificial (OpenAI Service)
│   ├── auth/               # Módulo de autenticación (Guards para API Key)
│   ├── common/             # Interceptores, filtros (ej. HTTP Exception filter) y utilidades globales
│   ├── leads/              # Módulo principal (Controladores, Servicios y DTOs para Leads)
│   ├── prisma/             # Módulo que expone y configura instanciación global de PrismaClient
│   ├── app.module.ts       # Módulo raíz que ensambla toda la aplicación y configura Rate Limiting
│   └── main.ts             # Archivo de arranque, configuración de CORS, globales y Swagger
│
├── postman_collection.json # Colección pre-configurada para testear y ejecutar en Postman
├── Dockerfile              # Configuración base para contenerización futura
├── docker-compose.yml      # orquestación de DB con docker
└── package.json            # Dependencias y scripts
```

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado en tu máquina lo siguiente:

- **Node.js**: v18+
- **PostgreSQL**: corriendo localmente o mediante Docker (ver `docker-compose.yml`).

---

## ⚙️ Configuración y Ejecución

**1. Instalar dependencias**

```bash
npm install
```

**2. Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto basándote en un archivo `.env.example` (en caso de existir) e incluye:

```env
# URL de conexión a tu Base de datos PostgreSQL local
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/leads_db?schema=public"

# API Key obligatoria para endpoints de creación y modificación
API_KEY="tu_super_secreto_api_key"

# (Opcional) OpenAI API Key para activar la generación de IA en modo "Real"
# Si la omites, la aplicación utilizará un generador 'mock' de resúmenes.
OPENAI_API_KEY="sk-proj-xxxxxxxx..."
```

**3. Levantar la base de datos (Opcional si usas Docker)**

```bash
docker-compose up -d
```

**4. Aplicar Migraciones en Base de Datos**
Alinea la BD con tu esquema de Prisma.

```bash
npx prisma migrate dev
```

**5. Llenar base de datos con prueba (Seed)**
Ejecuta el script incluido que generará 50 leads de forma automática en tu PostgreSQL:

```bash
npm run seed
```

**6. Ejecutar la Aplicación**

```bash
# Modo de desarrollo con auto recarga
npm run start:dev
```

La aplicación correrá en: `http://localhost:3000/api`
La documentación Swagger la encontrarás en: `http://localhost:3000/api/docs`

---

## 🧪 Cómo Probar el Rate Limiting (60 req/min)

La aplicación tiene una excelente protección contra ataques DDoS y de fuerza bruta con ThrottlerGuard, limitando cada IP a 60 peticiones/min.

Existen 2 maneras muy sencillas de probar y verificar que este error `429 Too Many Requests` efectivamente funcione:

### Opción 1: A través de Postman

Puedes añadir un script en Postman para simular ráfagas de pruebas.

1. Abre tu **Postman**.
2. Dale click al endpoint por ejemplo: **`Listar Leads`**.
3. Navega a la pestaña de **"Pre-request Script"** y pega el siguiente código:
   ```javascript
   for (let i = 0; i < 70; i++) {
     pm.sendRequest('http://localhost:3000/api/leads', function (err, res) {
       console.log(res.code); // Verás códigos 200, hasta que cambie a 429
     });
   }
   ```
4. Dale a **Send**. Verás en la "Postman Console" cómo las primeras peticiones responden con un código HTTP exitoso y luego empiezan a saltar errores o bien el request principal caerá en HTTP 429.

### Opción 2: A través de la Consola / Terminal (Curl)

Puedes ejecutar este ciclo en sistemas basados en Bash/Zsh para hacer 70 intentos consecutivos y notar en pantalla el bloqueo tras la petición número 60:

```bash
for i in {1..70}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/leads; done
```

_Tip: El comando está configurado para mostrar solo en qué código HTTP responde cada petición, deberías visualizar un montón de `200` y luego el bloqueo en respuesta `429`._

---

## 📫 Probar en Postman

Incluimos un archivo listo para que puedas importar a tu Postman: `Leads API - One Million Copy.postman_collection`.

1. Abre tu Postman.
2. Clic en **Import** y selecciona el archivo mencionado en la raíz.
3. Dirígete a las Variables (Pestaña "Variables") dentro de la colección exportada, y asegúrate de colocar tu variable `api_key` con el valor idéntico definido en tu `.env`.

¡Estás listo para desarrollar y gestionar tus Leads de marketing! 🚀
