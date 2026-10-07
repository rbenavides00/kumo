# Kumo

> **Self-hosted cloud storage for managing, organizing, and sharing files.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-2D3748?logo=pnpm&logoColor=white)](https://pnpm.io/)

**Kumo** is a self-hosted cloud storage application for uploading, organizing,
and sharing files and folders between users.

It supports private content, direct sharing with specific users, and public
sharing for authenticated users.

## Tech Stack

### Frontend

- React + Vite
- React Router
- Tailwind CSS + shadcn/ui
- Axios

### Backend

- Node.js + Express
- SQLite + better-sqlite3
- JWT authentication
- Multer + Sharp

### Shared

- TypeScript types shared between frontend and backend

### Development

- Bruno for API testing
- pnpm
- ESLint

## Features

- User authentication with username/email and password
- File upload and download
- Folder creation, renaming, and deletion
- Nested folders with breadcrumb navigation
- List and grid views with pagination
- File and folder sharing:
  - **Private**: accessible only by the owner
  - **Direct sharing**: shared with specific users
  - **Public**: accessible to all users
- File and folder filters:
  - **My Files**: shows items owned by the current user
  - **Shared with Me**: shows items shared with the current user, either directly or through public access
- User profiles with name, avatar, and password management
- Light, dark, and system themes
- Configurable default Files view and filter

## Architecture

Kumo is a pnpm monorepo with three packages:

```text
.
├── backend/          # REST API, authentication, database and file storage
├── frontend/         # React application
├── shared/           # Types shared by frontend and backend (@kumo/shared)
└── bruno/            # API collection for development and testing
```

The frontend communicates with the backend through a REST API served under the
`/api` prefix. The backend handles authentication, authorization, file
operations, sharing rules, and persistence.

Frontend and backend share a single origin: in development, the Vite dev server
proxies `/api` to the backend, and in production a reverse proxy (Caddy, Nginx,
etc.) should do the same. This removes the need for CORS configuration.

Uploaded files, avatars, and the SQLite database are stored locally in
`backend/storage/` and are excluded from version control.

## Project Structure

```text
backend/
└── src/
    ├── routes/       # API endpoints
    ├── middleware/   # Authentication and upload middleware
    ├── db/           # Database connection, schema, rows and mappers
    ├── utils/        # Access control and shared utilities
    ├── app.ts        # Express app (middleware and routes)
    └── index.ts      # Server entry point

frontend/
└── src/
    ├── api/          # API clients organized by resource
    ├── components/   # shadcn/ui primitives and feature components
    ├── context/      # Application contexts
    ├── hooks/        # Shared application logic
    ├── layouts/      # Application layouts
    ├── pages/        # Route-level components
    ├── routes/       # Route guards
    └── utils/        # Formatting and helper functions

shared/
└── src/
    └── types/        # Types for API payloads and entities

bruno/
└── ...               # API requests organized by resource
```

## Getting Started

### Prerequisites

- Node.js
- pnpm

### 1. Clone and install

```bash
git clone https://github.com/rbenavides00/kumo
cd kumo
pnpm install
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and update the values:

```env
PORT=3001
JWT_SECRET=your-secret-here
```

### 3. Start the app

From the repository root:

```bash
pnpm dev
```

This starts both apps in parallel:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001` (reached through the frontend at `/api`)

On the first run, Kumo automatically creates the SQLite database and required
storage directories.

## Scripts

Run from the repository root:

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start frontend and backend in watch mode |
| `pnpm build`     | Build all packages                       |
| `pnpm typecheck` | Type-check all packages                  |
| `pnpm lint`      | Lint the frontend                        |

## API Testing

A [Bruno](https://www.usebruno.com/) collection is included in `bruno/` for testing the REST API.
Select the **Localhost** environment, whose base URL points to `http://localhost:3001/api`.

Requests are organized by resource, including:

- Auth
- Folders
- Files
- Users
- Shares

## License

Kumo is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
