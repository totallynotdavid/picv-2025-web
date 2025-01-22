# TSDHN

TSDHN es una aplicación web para la estimación de parámetros de tsunamis de origen lejano mediante simulaciones numéricas. Este proyecto forma parte del Programa de Investigación Científica (PICV 2025) de la Universidad Nacional Mayor de San Marcos.

## Arquitectura

```mermaid
flowchart LR
    User((Usuario)) --> Frontend[Frontend\nNext.js + TypeScript]
    Frontend --> CloudflarePages[Cloudflare Pages]
    CloudflarePages --> API[API REST\nPython]
    API --> Model[Modelo Numérico\nFortran]
    Model --> API
    API --> CloudflarePages
    CloudflarePages --> Frontend
    Frontend --> User
```

El sistema está dividido en dos componentes principales que trabajan en conjunto para procesar y visualizar las simulaciones de tsunamis:

El **backend** ([picv-2025](https://github.com/totallynotdavid/picv-2025)) maneja el procesamiento numérico y cálculos, implementado en Python y Fortran. Este componente expone una API REST que procesa las solicitudes y ejecuta las simulaciones necesarias.

El **frontend** ([picv-2025-web](https://github.com/totallynotdavid/picv-2025-web)) proporciona la interfaz de usuario, desarrollada en Next.js y TypeScript. Permite a los usuarios configurar parámetros y visualizar los resultados de las simulaciones.

## Desarrollo

Para comenzar, necesitarás:

- Node.js 20.x (puedes usar [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating))
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) (opcional, pero recomendado)

### Configuración del entorno

1. Instalar Node.js 20:

```bash
nvm install 20
nvm use 20
```

2. Configurar el proyecto:

```bash
git clone https://github.com/totallynotdavid/picv-2025-web
cd picv-2025-web
npm install
```

### Variables de entorno

Crea un archivo `.env.local` en la carpeta principal del proyecto con las siguientes variables:

| Variable | Desarrollo            | Producción                              |
| -------- | --------------------- | --------------------------------------- |
| API_URL  | http://localhost:8000 | https://api.tsdhn.pages.dev (pendiente) |
| NODE_ENV | development           | production                              |

## Deploy

El sistema utiliza Cloudflare Pages para el frontend y un servidor privado del GI para el backend, conectados mediante Cloudflare Tunnel. La configuración de despliegue es automática y se activa con cada push a la rama principal del repositorio.

Para configurar un nuevo deploy en Cloudflare Pages:

1. Selecciona Next.js como framework preset
2. Establece `npm run build` como `build command`
3. Configura las variables de entorno en el panel de Cloudflare

## Equipo

El desarrollo está a cargo de un equipo multidisciplinario de la UNMSM:

- Cesar Jimenez (Coordinador)
- David Duran ([@totallynotdavid](https://github.com/totallynotdavid))
- David Salles ([@David-Salles](https://github.com/David-Salles))
- Elvis Velasquez ([@elvis-velper](https://github.com/elvis-velper))
