# Local Bus & Shared Auto Finder

A community-sourced local transport wiki for shared autos and private buses in Indian towns.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Zustand
- **Database**: PostgreSQL
- **Maps**: Leaflet, OpenStreetMap

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Copy `backend/.env.example` to `backend/.env` and configure
5. Run database migrations: `npm run prisma:migrate --workspace backend`
6. Start development servers: `npm run dev`

## Deployment Options

### Option 1: Railway (Recommended)
1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables in Railway dashboard
4. Railway will automatically build and deploy

### Option 2: Vercel + Railway
- Frontend on Vercel
- Backend on Railway

### Option 3: Traditional VPS
1. Set up server with Node.js, PostgreSQL
2. Clone repository
3. Install dependencies
4. Build applications
5. Set up PM2 for process management
6. Configure Nginx as reverse proxy

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@host:5432/database"
JWT_SECRET="your_secure_jwt_secret"
PORT=4000
NODE_ENV="production"
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Frontend
```
NEXT_PUBLIC_API_BASE_URL="https://your-backend-domain.com"
```

## Build Commands

```bash
# Build backend
npm run build --workspace backend

# Build frontend
npm run build --workspace frontend

# Build both
npm run build
```

## Production Start

```bash
# Start backend
npm run start --workspace backend

# Start frontend (if not using Vercel)
npm run start --workspace frontend
```
# local-route-finder
# local-route-finder
