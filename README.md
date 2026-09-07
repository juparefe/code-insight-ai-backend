# Code-Insight-AI-Backend

Este es el repositorio backend de Code Insight AI, proporciona la API REST que orquesta el análisis de repositorios de código. Recibe una URL de un repositorio de GitHub, realiza un análisis estático, construye el contexto y genera un análisis asistido por IA (arquitectura, tecnologías, componentes, hallazgos y recomendaciones). Aplicando diferentes conceptos como:

- API REST con Express 5 y validación de esquemas con Zod
- Procesamiento asíncrono con colas (AWS SQS) y jobs cuyo estado se persiste en DynamoDB
- Sondeo (polling) de estado del job mediante un endpoint de consulta
- Análisis estático de repositorios (detección de componentes, endpoints y archivos importantes)
- Análisis con IA mediante AWS Bedrock (modelos Claude)
- Arquitectura hexagonal / limpia orientada a features (puertos y adaptadores, inyección de dependencias por contenedor)
- Ejecución dual: servidor Express en local y funciones AWS Lambda (API y worker) en producción vía serverless-express
- Configuración por entornos con variables de entorno y dotenv
- Seguridad de cabeceras HTTP con Helmet y CORS
- Módulos ESM con TypeScript (resolución NodeNext)
- Pruebas unitarias y de integración con Jest, ts-jest y Supertest

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- **Node.js**: [Descargar Node.js](https://nodejs.org/) (versión 20 o superior)
- **npm** (administrador de paquetes de Node.js): Viene incluido con Node.js
- **Cuenta de AWS con credenciales configuradas**: necesaria para el análisis con IA y el flujo asíncrono (acceso a Bedrock, SQS y DynamoDB)
- **Lenguajes utilizados**: TypeScript
- **Frameworks, herramientas o librerias utilizados**: Express, Zod, AWS SDK v3 (Bedrock, SQS, DynamoDB), serverless-express, Jest, Supertest, ESLint, Prettier, tsx

## Scripts Disponibles

- **Instalar Dependencias**: `npm install`
- **Iniciar la Aplicación en modo desarrollo (con recarga)**: `npm run dev`
- **Construir la Aplicación**: `npm run build`
- **Iniciar la Aplicación construida**: `npm start`
- **Verificar Tipos**: `npm run typecheck`
- **Ejecutar Pruebas Unitarias**: `npm test`
- **Ejecutar Pruebas en modo observador**: `npm run test:watch`
- **Linteo del Código**: `npm run lint`
- **Corregir problemas de Linteo**: `npm run lint:fix`
- **Formatear el Código**: `npm run format`

## Endpoints principales

Todos los endpoints se exponen bajo el prefijo `/api/v1`.

- **`GET /api/v1/health`**: verificación de estado del servicio.
- **`POST /api/v1/repositories/analyze`**: inicia el análisis de un repositorio. Cuerpo:

  ```json
  {
    "source": {
      "type": "GITHUB",
      "url": "https://github.com/usuario/repositorio"
    }
  }
  ```

  Para repositorios pequeños responde `200` con `{ "status": "COMPLETED", "result": { ... } }`.
  Para repositorios grandes responde `202` con `{ "jobId": "...", "status": "PENDING" }` y el análisis continúa en segundo plano.

- **`GET /api/v1/repositories/analyze/:jobId`**: consulta el estado de un job asíncrono. Devuelve `{ id, status, createdAt, updatedAt, result?, error? }`, donde `status` es `PENDING`, `PROCESSING`, `COMPLETED` o `FAILED`.

## Variables de Entorno

La configuración se carga desde un archivo `.env` en la raíz del proyecto (puedes partir de `.env.example`). El esquema se valida con Zod al iniciar la aplicación.

| Variable | Requerida | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Entorno de ejecución (`development`, `test`, `production`). |
| `PORT` | No | `3000` | Puerto del servidor Express local. |
| `AWS_REGION` | No | `us-east-1` | Región de AWS para Bedrock, SQS y DynamoDB. |
| `BEDROCK_MODEL_ID` | No | `global.anthropic.claude-sonnet-4-6` | Identificador del modelo de Bedrock usado para el análisis. |
| `TEMP_DIRECTORY` | No | Directorio temporal del sistema | Carpeta de trabajo para descargar y descomprimir repositorios. |
| `MAX_REPOSITORY_FILES` | No | `10` | Número máximo de archivos considerados en el análisis. |
| `MAX_REPOSITORY_SIZE_MB` | No | `1` | Tamaño máximo (MB) antes de tratar el repositorio como "grande" y procesarlo de forma asíncrona. |
| `ANALYSIS_JOBS_QUEUE_URL` | Sí | — | URL de la cola SQS donde se encolan los jobs de análisis. |
| `ANALYSIS_JOBS_TABLE_NAME` | Sí | — | Nombre de la tabla de DynamoDB donde se persiste el estado de los jobs. |

## Paso a paso para ejecutar el repositorio

Para poder utilizar este repositorio debes seguir estas instrucciones y luego dirigirte al Repositorio Frontend Code Insight AI y seguir las instrucciones para levantar la interfaz de la aplicacion

1. Clonar el repositorio en el entorno local utilizando el comando

   ```bash
   git clone https://github.com/juparefe/code-insight-ai-backend.git
   ```

2. Abrir la carpeta clonada utilizando algun editor de codigo

3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Crea el archivo `.env` a partir de `.env.example` y ajusta los valores según tu entorno (región de AWS, modelo de Bedrock, URL de la cola SQS y nombre de la tabla de DynamoDB). Asegúrate de tener credenciales de AWS válidas disponibles en el entorno.

5. Ejecuta el siguiente comando para iniciar el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

6. Por defecto la aplicacion se levanta en el puerto 3000 y la API queda disponible en `http://localhost:3000/api/v1`

## Arquitectura

El código se organiza por features dentro de `src/modules`, siguiendo una arquitectura hexagonal:

- **`domain`**: entidades y tipos del dominio (por ejemplo, `AnalysisJob`).
- **`application`**: casos de uso, puertos (interfaces) y servicios de orquestación.
- **`infrastructure`**: adaptadores concretos (AWS Bedrock, SQS, DynamoDB, análisis estático, acceso a GitHub).
- **`interfaces`**: capa de entrada HTTP (controladores, rutas y DTOs) y consumidores de cola.

El módulo `analysis` es el núcleo del sistema y el módulo `repository` se encarga de obtener y preparar el código fuente. Los contenedores (`analysis-container.ts` y `analysis-worker-container.ts`) resuelven las dependencias e inyectan los adaptadores.

En producción la aplicación se despliega como dos funciones Lambda: la **API** (`src/lambda.ts`, mediante serverless-express) y el **worker** (`src/lambda-worker.ts`, disparado por SQS). En local se ejecuta como un servidor Express tradicional (`src/server.ts`).

## Integración Continua

- **`requirements.yml`**: se ejecuta en cada Pull Request hacia `main` y corre, en orden, el linteo, las pruebas unitarias con cobertura y la construcción.
- **`deploy.yml`**: se ejecuta al hacer push a `main`, empaqueta el artefacto y actualiza el código de las funciones Lambda de API y worker en AWS usando autenticación por OIDC.
