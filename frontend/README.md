# Student Messaging Frontend

Interfaz web (Vite + React + TypeScript) que consume el API Gateway del sistema de mensajería estudiantil.

## Requisitos
- Node.js 18+
- npm 9+

## Configuración
1. Copia el archivo de variables de entorno:
```
cp .env.example .env.local
```
2. Ajusta la variable `VITE_API_BASE_URL` si es necesario. Por defecto usa el gateway desplegado:
```
VITE_API_BASE_URL=http://134.199.176.197/apigateway
```

## Ejecutar en desarrollo
```
npm install
npm run dev
```
La app corre en `http://localhost:5173`.

## Funcionalidades
- Registro y login contra `/users/*`
- Carga del perfil `/users/me`
- Actualización automática de presencia (`/presence/`)
- Listado y creación de canales (`/channels/*`)
- Listar threads y crear threads en un canal (`/channels/threads`)
- Listar y enviar mensajes en un thread (`/messages/threads/*`)
  - Nota: el header `X-User-Id` se envía automáticamente a partir del perfil de usuario.

## Estructura
```
frontend/
├─ src/
│  ├─ auth/AuthContext.tsx
│  ├─ lib/api.ts
│  ├─ components/TopBar.tsx
│  ├─ pages/
│  │  ├─ LoginPage.tsx
│  │  ├─ RegisterPage.tsx
│  │  ├─ DashboardPage.tsx
│  │  └─ ChannelsPage.tsx
│  │  └─ ChannelDetailPage.tsx
│  ├─ App.tsx
│  └─ main.tsx
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ .env.example
```

## Producción
```
npm run build
npm run preview
```
