# Dealer Locator Frontend

Vue 3 + TypeScript frontend application for the Dealer Locator API.

## Features

- Search dealers by postal code
- Search dealers by place name (city)
- Filter dealers by manufacturer (KIA, Seat, Opel)
- Export dealers to CSV/Excel
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Vue components
│   ├── DealerCard.vue
│   ├── DealerList.vue
│   └── DealerSearch.vue
├── views/         # Page views
│   └── HomeView.vue
├── stores/        # Pinia stores
│   └── dealerStore.ts
├── services/      # API services
│   └── api.ts
├── types/         # TypeScript types
│   └── dealer.ts
├── router/        # Vue Router
│   └── index.ts
├── App.vue
└── main.ts
```

## API Connection

The frontend is configured to connect to the backend API running on `http://localhost:3001`.

The Vite dev server is configured with a proxy:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- API calls from frontend: `/api/v1/*` → proxied to `http://localhost:3001/api/v1/*`

## Usage

1. Make sure the backend API is running on port 3001
2. Start the frontend: `npm run dev`
3. Open `http://localhost:3000` in your browser
4. Search for dealers by postal code or place name
5. Filter by manufacturer
6. Export results to CSV or Excel
