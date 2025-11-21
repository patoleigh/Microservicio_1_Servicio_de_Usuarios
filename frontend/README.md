# Sistema de Mensajería - Frontend (Grupo 1)

Frontend completo para el sistema de mensajería que integra **9 microservicios** a través del API Gateway.

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales
- **Autenticación y Autorización**: Login, registro y gestión de sesiones con JWT
- **Canales**: Crear, listar y buscar canales de comunicación
- **Hilos (Threads)**: Organizar conversaciones por temas dentro de canales
- **Mensajería en Tiempo Real**: Enviar, editar y eliminar mensajes
- **Búsqueda Global**: Buscar en mensajes, archivos, canales e hilos con Elasticsearch
- **Presencia en Línea**: Indicadores de estado online/offline/away con heartbeat automático
- **Moderación de Contenido**: Detección automática de contenido tóxico con Detoxify AI
- **Chatbots AI**:
  - 📚 **Wikipedia Bot**: Consultas a Wikipedia multiidioma (es, en, fr, de)
  - 💻 **Programming Bot**: Asistente de programación
- **Estadísticas**: Panel con usuarios conectados y actividad en tiempo real

## 📋 Requisitos Previos
- Node.js 18+
- npm 9+ o pnpm
- Acceso al API Gateway: `https://apigateway.grupo1.inf326.nursoft.dev`

## 🔧 Configuración

### 1. Variables de Entorno
Crea un archivo `.env` (o copia `.env.example`):
```bash
cp .env.example .env
```

Contenido del `.env`:
```env
VITE_API_URL=https://apigateway.grupo1.inf326.nursoft.dev
```

### 2. Instalación
```bash
npm install
# o con pnpm
pnpm install
```

### 3. Desarrollo
```bash
npm run dev
```
La aplicación corre en `http://localhost:5173`

### 4. Producción
```bash
npm run build
npm run preview
```

## 🏗️ Arquitectura

```
Frontend (React + TypeScript + Tailwind)
       ↓
API Gateway (https://apigateway.grupo1.inf326.nursoft.dev)
       ↓
┌──────────────────────────────────────────────┐
│  9 Microservicios Integrados:                │
│  1. Users Service (Autenticación)            │
│  2. Channels Service (CRUD + Members)         │
│  3. Messages Service (Thread-based)           │
│  4. Search Service (Elasticsearch)            │
│  5. Presence Service (Online/Offline)         │
│  6. Moderation Service (Toxicity Detection)   │
│  7. Files Service (MinIO/S3)                  │
│  8. Wikipedia Chatbot (Multilenguaje)        │
│  9. Programming Chatbot (Asistencia)         │
└──────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── auth/
│   │   └── AuthContext.tsx          # Contexto de autenticación
│   ├── components/
│   │   ├── TopBar.tsx               # Barra de navegación
│   │   ├── GlobalSearch.tsx         # 🆕 Búsqueda global
│   │   ├── PresenceIndicator.tsx    # 🆕 Indicadores de presencia
│   │   └── ChatbotPanel.tsx         # 🆕 Panel de chatbots AI
│   ├── lib/
│   │   └── api.ts                   # 🆕 Cliente API con servicios
│   ├── pages/
│   │   ├── LoginPage.tsx            # Página de login
│   │   ├── RegisterPage.tsx         # Página de registro
│   │   ├── DashboardPage.tsx        # 🆕 Dashboard mejorado
│   │   ├── ChannelsPage.tsx         # 🆕 Lista de canales mejorada
│   │   └── ChannelDetailPage.tsx    # 🆕 Mensajería completa
│   ├── App.tsx
│   └── main.tsx
├── .env                             # Variables de entorno
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔌 API Services

El archivo `src/lib/api.ts` proporciona wrappers organizados:

```typescript
// Canales
channelsService.getMyChannels(userId)
channelsService.create(data)
channelsService.getThreads(channelId)
channelsService.createThread(data)

// Mensajes
messagesService.getMessages(threadId, limit, cursor)
messagesService.sendMessage(threadId, data)
messagesService.updateMessage(threadId, msgId, data)
messagesService.deleteMessage(threadId, msgId)

// Búsqueda
searchService.searchMessages(query)
searchService.searchChannels(query)
searchService.searchThreadsByKeyword(keyword)
searchService.searchFiles(query)

// Moderación
moderationService.checkMessage(data)
moderationService.getUserStatus(userId, channelId)

// Presencia
presenceService.register(data)
presenceService.update(userId, data)
presenceService.getPresence(userId)
presenceService.getStats()

// Chatbots
chatbotService.askWikipedia(question, language)
chatbotService.askProgramming(question, context)
```

## 🎨 Componentes Nuevos

### 🆕 DashboardPage
- Vista principal con estadísticas de presencia
- Panel de búsqueda global integrado
- Acceso a chatbots AI
- Registro automático de presencia con heartbeat

### 🆕 GlobalSearch
- Búsqueda unificada en: mensajes, archivos, canales, hilos
- Selector de tipo de búsqueda
- Resultados en tiempo real

### 🆕 ChatbotPanel
- Selector de bot (Wikipedia o Programación)
- Selector de idioma para Wikipedia (es, en, fr, de)
- Interfaz conversacional
- Respuestas formateadas

### 🆕 PresenceIndicator
- Indicador visual de estado por usuario
- `PresenceStats` para estadísticas globales
- Actualización automática cada 30s

### 🆕 ChannelDetailPage Mejorado
- Edición y eliminación de mensajes propios
- Moderación automática de contenido
- Indicadores de presencia por usuario
- UI moderna con Tailwind CSS

## 🔐 Autenticación

Headers automáticos en todas las peticiones:
```typescript
Authorization: Bearer <token>
X-User-Id: <user_id>
Content-Type: application/json
```

## 🛡️ Moderación de Contenido

Antes de enviar mensajes, se verifica automáticamente:
```typescript
const modCheck = await moderationService.checkMessage({
  message_id: uuid(),
  user_id: user.id,
  channel_id: channelId,
  content: message
})

if (modCheck.is_toxic) {
  showWarning(`Contenido tóxico (${toxicity_score}%)`)
}
```

## 📊 Presencia en Línea

Sistema de heartbeat automático:
1. **Registro inicial** al cargar el dashboard
2. **Heartbeat cada 45s** para mantener status online
3. **Timeout de 60s** en el servidor
4. **Actualización visual** cada 30s

## 🤖 Uso de Chatbots

### Wikipedia Bot
```typescript
const response = await chatbotService.askWikipedia(
  "¿Qué es la inteligencia artificial?",
  "es" // Idiomas: es, en, fr, de
)
```

### Programming Bot
```typescript
const response = await chatbotService.askProgramming(
  "¿Cómo implementar un singleton en Python?"
)
```

## 🎯 Endpoints del API Gateway

Documentación completa: https://apigateway.grupo1.inf326.nursoft.dev/docs

### Principales rutas:
- `/users/*` - Gestión de usuarios
- `/channels/*` - Canales y miembros
- `/messages/*` - Mensajería
- `/search/*` - Búsqueda global
- `/presence/*` - Estado de usuarios
- `/moderation/*` - Moderación
- `/chatbots/*` - Asistentes AI
- `/files/*` - Gestión de archivos

## 🐛 Troubleshooting

**Token expirado (401)**: Cierra sesión y vuelve a iniciar sesión

**Presencia no se actualiza**: Verifica que el heartbeat esté activo (consola del navegador)

**Moderación no funciona**: El mensaje se enviará sin moderación (no es crítico)

## 👥 Equipo

**Grupo 1 - Arquitectura de Software**

---

**Documentación del API Gateway**: https://apigateway.grupo1.inf326.nursoft.dev/docs
