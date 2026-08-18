# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Nota**: Para documentación detallada de arquitectura, patrones de diseño y metodologías, ver [ARQUITECTURA.md](./ARQUITECTURA.md).

## Project Overview

Edu Analytics BI is a Business Intelligence system for analyzing university admission data. It's a full-stack application with a Node.js backend API and Angular 21 frontend dashboard.

## Architecture

### Backend (backend-nodejs/)

Node.js + Express + MongoDB with **Hexagonal Architecture** (Ports & Adapters):

```
src/
├── domain/models/          # Domain entities (User, AdmissionData)
├── application/services/   # Business logic, services by feature
│   └── ai-analysis/       # AIAnalysisService with streaming support
├── infrastructure/         # External adapters
│   ├── database/          # MongoDB connection
│   └── ai-providers/      # AI providers (OpenRouter, Ollama) via Factory pattern
└── presentation/          # HTTP layer
    ├── controllers/       # Route handlers
    ├── routes/            # Route definitions
    └── middleware/        # Auth (JWT), error handling
```

Key services:
- `biService.js` - Business intelligence aggregations
- `dataMiningService.js` - Data mining and pattern analysis
- `advancedAnalyticsService.js` - Disability, gender, and response strategy analytics
- `statisticalDistributionService.js` - Distribution calculations and box plots
- `AIAnalysisService.js` - AI-powered analysis with OpenRouter/Ollama providers

**AI Provider Pattern**: Factory pattern with automatic fallback support. Configured via `AI_PROVIDER` env var (`openrouter` or `ollama`). OpenRouter uses Claude/GPT-4 models; Ollama runs local models.

API routes (`/api/*`): `auth`, `admission`, `bi`, `data-mining`, `advanced-analytics`, `statistical`, `ai`

### Frontend (frontend-angular/)

Angular 21 + Tailwind CSS + AG Charts (box plots) + Chart.js with feature-based organization:

```
src/app/
├── core/                  # Guards, interceptors, interfaces, AuthService
├── features/              # Feature modules (lazy loaded via routes)
│   ├── auth/             # Login, session expired
│   ├── dashboard/        # Main dashboard with BI widgets
│   ├── admission/        # Excel upload, admission list
│   ├── reports/          # BI reports (institutions, geographic, careers)
│   ├── advanced-analytics/ # Disability impact, gender-career, response strategy
│   ├── statistical-distribution/ # Distributions, box plots, comparative views
│   ├── ai-analytics/     # AI-powered analysis with streaming UI
│   └── users/            # User management (admin only)
├── layout/               # MainLayout, SubLayout
└── shared/               # Reusable components, pipes (markdown), services
```

**Chart Libraries**: AG Charts for box plots (enterprise features), Chart.js for other visualizations via ng2-charts.

**Streaming**: AI responses stream to the UI via `StreamingService` for real-time narrative reports.

## Development Commands

### Backend
```bash
cd backend-nodejs
npm install
npm run dev          # Development with nodemon (port 3000)
npm start            # Production start
npm run seed         # Seed default users (admin/analyst/viewer)
npm run export-docs  # Export Swagger docs locally
```

### Frontend
```bash
cd frontend-angular
npm install          # Uses --legacy-peer-deps if needed
npm start            # Dev server at http://localhost:4200
ng build             # Production build
ng test              # Run unit tests (Karma + Jasmine)
```

**Note**: The project has `skipTests: true` in angular.json schematics, so generating new components/services won't create `.spec.ts` files by default.

## Environment Configuration

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/admision_bi
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# AI Provider: 'openrouter' or 'ollama'
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=...
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet:beta
OLLAMA_BASE_URL=http://localhost:11434
```

### Frontend (src/environments/environment.ts)
```typescript
apiUrl: 'http://localhost:3000/api'
jwtTokenKey: 'auth_token'
```

## Default Users

| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Analyst | analyst  | analyst123 |
| Viewer  | viewer   | viewer123  |

## Data Model Key Fields

- `tipoUnidadEducativa`: "Fiscal" | "Particular" | "Municipal" | "Fiscomisional"
- `conCupo`: "SI" | "NO" - whether student has admission slot
- `sexo`: "M" | "F"
- `provinciaReside`, `cantonReside`: Geographic location
- `cierreCarnetDiscapacidad`, `cierreTipoDiscapacidad`: Disability info
- `scores`: Map of component scores (dynamic based on uploaded data)

## AI Features

AI analysis supports multiple providers via the `AIProviderFactory`:
- **OpenRouter**: Cloud models (Claude 3.5 Sonnet, GPT-4, etc.)
- **Ollama**: Local models (llama3.1, mistral, etc.)

Features include:
- Narrative reports with streaming output
- Period comparison analysis
- Outlier detection with explanations
- Predictive analysis
- Quartile-based insights

Configure provider via `AI_PROVIDER` env var. Fallback provider supported via `AI_FALLBACK_PROVIDER`.

## Common Tasks

### Running full stack locally
1. Start MongoDB
2. `cd backend-nodejs && npm run dev` (port 3000)
3. `cd frontend-angular && npm start` (port 4200)
4. Access: http://localhost:4200
5. API docs: http://localhost:3000/api-docs (dev mode only)

### Uploading admission data
Use the admission upload feature - accepts Excel files (.xlsx) with student data. Automatically extracts period/year from filename (e.g., "admisiones_2025-2.xlsx"). Normalizes component scores and creates aggregated records per student.

### Adding a new chart component
1. Create component in appropriate `features/` subfolder
2. Use AG Charts for box plots (requires enterprise license or community features)
3. Use Chart.js for other chart types via ng2-charts
4. Add service method in corresponding backend service
5. Update routes in backend and frontend as needed

### Adding AI analysis endpoints
1. Add service method in `AIAnalysisService.js` with appropriate prompt template
2. Support both streaming and non-streaming responses
3. Add controller method in `AIAnalysisController.js`
4. Add route in `aiRoutes.js` with authentication middleware
5. Create frontend component using `StreamingService` for real-time updates
