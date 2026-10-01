# Kumo

> **Self-hosted cloud storage for managing, organizing, and sharing files.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
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
- Tailwind CSS
- Axios
- Vitest + React Testing Library

### Backend

- Node.js + Express
- SQLite + better-sqlite3
- JWT authentication
- Multer

### Development

- Bruno for API testing
- pnpm

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

## Architecture

Kumo is split into two applications:

```text
.
├── backend/          # REST API, authentication, database and file storage
├── frontend/         # React application
└── bruno/            # API collection for development and testing
```

The frontend communicates with the backend through a REST API. The backend handles authentication, authorization, file operations, sharing rules, and persistence.

Uploaded files, avatars, and the SQLite database are stored locally and are excluded from version control.

## Project Structure

```text
backend/
└── src/
    ├── routes/       # API endpoints
    ├── middleware/   # Authentication and upload middleware
    ├── utils/        # Access control and shared utilities
    └── db.js         # Database connection and schema

frontend/
└── src/
    ├── api/          # API clients organized by resource
    ├── components/   # Reusable and feature-specific components
    ├── context/      # Application contexts
    ├── hooks/        # Shared application logic
    ├── layouts/      # Application layouts
    ├── pages/        # Route-level components
    └── utils/        # Formatting and helper functions

bruno/
└── ...               # API requests organized by resource
```

## Getting Started

### Prerequisites

- Node.js
- pnpm

### 1. Clone the repository

```bash
git clone https://github.com/rbenavides00/kumo
cd kumo
```

### 2. Start the backend

```bash
cd backend
pnpm install
```

Copy `.env.example` to `.env` and update the environment variables as needed:

```env
PORT=3001
JWT_SECRET=your-secret-here
```

Start the development server:

```bash
pnpm dev
```

The API runs on `http://localhost:3001` by default.

On the first run, Kumo automatically creates the SQLite database and required storage directories.

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend runs on `http://localhost:5173` by default.

## Testing

Frontend tests use Vitest and React Testing Library.

```bash
cd frontend
pnpm test
```

Tests are co-located with the code they cover.

## API Testing

A [Bruno](https://www.usebruno.com/) collection is included in `bruno/` for testing the REST API.

Requests are organized by resource, including:

- Auth
- Folders
- Files
- Users
- Shares

## License

Kumo is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
