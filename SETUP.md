# 🏆 Prode Mundial 2026 - Guía de Setup

## Pasos para lanzar

### 1. Crear cuenta en Supabase
1. Ir a [supabase.com](https://supabase.com) y crear cuenta gratuita
2. Crear un nuevo proyecto
3. Copiar las credenciales de **Settings > API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configurar la base de datos
1. En Supabase, ir a **SQL Editor**
2. Copiar y ejecutar todo el contenido de `supabase-schema.sql`

### 3. Configurar las variables de entorno
Editar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
FOOTBALL_API_KEY=tu_api_key  # opcional, ver abajo
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=un-secreto-seguro
```

### 4. API de Fútbol (opcional pero recomendado)
- Registrarse en [football-data.org](https://www.football-data.org/) (gratis)
- Obtener API key y ponerla en `FOOTBALL_API_KEY`
- Sin API key, se usan datos de demo para desarrollo

### 5. Instalar y correr
```bash
npm install
npm run dev
```

### 6. Poblar partidos (primera vez)
Con el servidor corriendo, ejecutar:
```bash
curl -X POST http://localhost:3000/api/matches/seed
```
Esto carga los partidos de demo. Con API key real, usar el endpoint de sync.

### 7. Sincronización automática
Para mantener los resultados actualizados, podés configurar un cron job que llame:
```
POST /api/matches/sync
Authorization: Bearer {CRON_SECRET}
```

Por ejemplo con Vercel Cron (en `vercel.json`):
```json
{
  "crons": [{
    "path": "/api/matches/sync",
    "schedule": "*/15 * * * *"
  }]
}
```

## Deploy en Vercel
1. Conectar repo en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno en Settings
3. Deploy automático 🚀

## Funcionalidades
- ⚽ Predicciones de todos los partidos (grupos + eliminatorias)
- 🏅 Ranking global en tiempo real
- 👥 Ligas privadas con código de invitación
- 🌟 Predicciones bonus (campeón, subcampeón, tercer puesto, goleador)
- 💬 Comentarios y reacciones en cada partido
- 🏆 Sistema de logros/badges
- 📊 Estadísticas por jugador
- 🎯 3 pts resultado exacto / 1 pt resultado correcto

