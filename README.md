# Sinhala OCR Labeler Frontend

DocLabel is a Next.js web application for collecting Sinhala handwriting samples and creating OCR training datasets from documents. It provides workflows for contributors, annotators, reviewers, and administrators.

## Features

- Sinhala handwriting prompt and image submission workflow
- User registration and sign-in with role selection
- PDF/document and bulk image uploads
- Page conversion, line extraction, OCR text extraction, correction, and verification
- Verification progress and team activity dashboards
- User administration and finalized dataset downloads
- Light/dark theme support and responsive UI

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4 with Radix UI components
- React Hook Form, Zod, Recharts, Lucide React, and Sonner
- A separate HTTP API for authentication, documents, lines, dashboards, and users

## Requirements

- Node.js 20 or newer
- npm
- A running DocLabel backend API

## Getting started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

If omitted, the frontend defaults to `http://localhost:8000`.

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and workflow entry points |
| `/handwriting` | Collect handwriting samples |
| `/login` | Sign in |
| `/signup` | Create an account and choose a role |
| `/documents` | Browse and process documents |
| `/upload` | Upload documents |
| `/upload/bulk` | Upload multiple images as one document |
| `/label` | Annotate extracted document lines |
| `/verify` | Review and verify annotations |
| `/datasets` | View and download finalized datasets |
| `/users` | Manage users and view team activity |

Most application routes require authentication. Tokens and the current user are managed client-side by the authentication context and API client.

## Project structure

```text
app/             Next.js pages and route-specific UI
components/      Shared layout and UI components
lib/              API clients, authentication, storage, and utilities
types/            Shared TypeScript types
public/           Static images and application assets
styles/           Additional global styles
```

## Backend

The backend for this frontend is maintained in the [`train-printed`](https://github.com/hasindu-k/train-printed) repository.

## Backend integration

API clients are defined in `lib/*-api.ts` and use `NEXT_PUBLIC_API_BASE_URL`. The backend must provide authentication, document/page processing, extracted-line, OCR, verification, dataset, dashboard, and user-management endpoints. Configure the backend to allow requests from the frontend origin.

## Production build

```bash
npm run lint
npm run build
npm run start
```

For deployment, set `NEXT_PUBLIC_API_BASE_URL` to the publicly reachable backend URL. The application can be deployed to Vercel or another platform that supports a Next.js production server.
