# Bhasantar Frontend

This repository contains the React frontend for **Bhasantar** (also styled as **Bhashantar**), a web application for translating legal documents from English into Indian regional languages (primarily Bengali). Clients upload PDFs, track translation progress, and the internal legal team refines machine translations using an integrated split-screen editor.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Routing & Role-Based Access](#routing--role-based-access)
- [File Status Workflow](#file-status-workflow)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [State Management](#state-management)
- [API / Data Layer](#api--data-layer)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [CI/CD](#cicd)

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 |
| **Build Tool** | Vite 6 + SWC (`@vitejs/plugin-react-swc`) |
| **Routing** | react-router-dom 7 |
| **Styling** | Tailwind CSS 3, PostCSS, MUI 6 (Material UI), Emotion |
| **Editor** | Quill.js 2 with `quill-table-better`, `quill-resize-image` + custom `contentEditable` editor |
| **Auth** | Firebase Authentication 11 (email/password, custom claims) |
| **Database** | Firebase Firestore 11 |
| **Storage** | Firebase Storage 11 + Google Cloud Storage (via signed URLs) |
| **HTTP** | Axios |
| **PDF** | pdf-lib |
| **DOCX** | docxtemplater + pizzip |
| **Excel** | xlsx (export) |
| **Icons** | lucide-react, MUI Icons |
| **Notifications** | react-hot-toast |
| **Date** | date-fns, react-datepicker, MUI X Date Pickers |
| **Linting** | ESLint 9 |

---

## Architecture

The app follows a standard React SPA architecture with role-based routing:

```
Browser → Router → PrivateRoute (role guard) → Instance Shell → Page Components
                                                    ↓
                                            Sidebar + Nested Routes
```

**Key architectural decisions:**
- **Context-based state** (no Redux) — three React Contexts for global concerns
- **Dual data layer** — Firebase SDK for auth + real-time DB ops, Axios + Express backend for file processing, signed URLs, audit trail
- **Two editor implementations** — primary `Editor` (Quill.js), experimental `Editor2` (custom `contentEditable`)
- **Auto-save** — 3-second debounce with localStorage backup and online/offline awareness

---

## Features

- **PDF upload** with folder management and automatic page count detection
- **Dashboard** tracking document status per project (Ready / In Progress / Completed / Delivered)
- **Split-screen editor** (Quill.js) — PDF viewer on left, WYSIWYG editor on right with full formatting toolbar
- **Rich text editing** — font/size/color, tables, images, alignment, lists, page breaks, find & replace
- **Auto-save** — debounced save with offline detection, localStorage fallback, before-unload protection
- **File download** — ZIP containing original PDF + generated DOCX
- **Role-based access** — 5 roles with distinct views and permissions
- **Feedback system** — quality rating, category, severity, reviewer notes
- **Reporting** — per-user, per-file, and project-level reports with XLSX export
- **Notification badges** — real-time polling every 30 seconds
- **Audit trail** — revert history, file submission logs, feedback tracking

---

## Routing & Role-Based Access

Routes are defined in `src/App.jsx` with guards via `PrivateRoute` (`src/components/common/PrivateRoute.jsx`).

| Route | Component | Allowed Roles |
|-------|-----------|---------------|
| `/` | Login | Public |
| `/home` | DashboardWrapper (dispatches to role-specific home) | user, admin, superAdmin, QA |
| `/kyro/:companyId/*` | KyroInstance (Kyrotics workspace) | user, admin, superAdmin, QA |
| `/company/:companyId/*` | CompanyInstance (client workspace) | user, admin, superAdmin |
| `/editor/:projectId/:documentId` | Editor (Quill split-screen) | user, admin, QA, superAdmin |
| `/editortest/:projectId/:documentId` | Editor2 (custom editor) | user, admin, QA, superAdmin |
| `/myWork` | UserFileFlow (user's assigned work) | user |
| `/status` | FileStatusManager | admin, superAdmin |

### Nested Routes

**KyroInstance** (`/kyro/:companyId/`):
profile, project, clientCompanies, myWork, project/:projectId, permissionManage, roleManage, fileStatus, userReport, feedbacks, userList, register, report, userManage

**CompanyInstance** (`/company/:companyId/`):
profile, myWork, register, report, userManage, project, project/:projectId, uploadDocument, permissionManage, roleManage, userReport, feedbacks, userList

---

## File Status Workflow

Documents flow through a numeric status pipeline. The pipeline differs between the internal (Kyrotics) side and the client side.

### Kyrotics (Internal) Side

| Code | Status | Description |
|------|--------|-------------|
| 0 | Deleted | Client-initiated deletion marker |
| 1 | ML Processing | Machine translation in progress |
| 2 | Ready for Work | Translated, awaiting assignment |
| 3 | In Progress | Assigned to a translator |
| 4 | Completed | Translator finished |
| 5 | QA/Delivered | QA reviewed & delivered to client |

### Client Side

| Code | Status | Description |
|------|--------|-------------|
| 5 | Ready for Work | Delivered file, awaiting client review |
| 6 | In Progress | Assigned to client-side user |
| 7 | Completed | Client user finished review |
| 8 | Downloaded | File downloaded by client |

---

## Project Structure

```
.
├── index.html                 # HTML entry point
├── vite.config.js             # Vite config (SWC plugin, @ alias, SPA fallback)
├── tailwind.config.js         # Tailwind theme
├── postcss.config.js          # PostCSS config
├── app.yaml                   # Google App Engine deployment
├── vercel.json                # Vercel SPA rewrites
├── .env                       # Environment variables
├── pnpm-lock.yaml             # Dependency lockfile
├── package.json               # Scripts & dependencies
├── public/                    # Static assets (images)
└── src/
    ├── main.jsx               # Entry point (renders App + decorative background)
    ├── App.jsx                # Root component (routing, providers, guards)
    ├── App.css                # Global styles
    ├── index.css              # Tailwind directives
    │
    ├── assets/                # Static assets (logo, editor CSS)
    ├── config/                # Quill blot definitions, editor config
    ├── context/               # React Context providers
    │   ├── AuthContext.jsx        # Firebase auth state + custom claims
    │   ├── InstanceContext.jsx    # URL-derived instance type (kyro vs client)
    │   └── NotificationContext.jsx # Polling notification counts
    ├── hooks/                 # Custom hooks (useDebounce, useNotificationCounts)
    ├── services/              # API / data access layer
    │   ├── companyServices.jsx    # Company CRUD
    │   ├── fileServices.jsx       # File CRUD, status updates, content
    │   ├── folderServices.jsx     # Folder CRUD
    │   ├── projectServices.jsx    # Project + file fetching, counts
    │   ├── reportServices.jsx     # Report generation
    │   └── trackFileServices.jsx  # Audit trail, submissions, feedback
    ├── utils/                 # Utilities
    │   ├── auth.jsx               # Firebase auth helpers
    │   ├── firebase.jsx           # Firebase init (app, auth, db, storage)
    │   ├── firestoreUtil.jsx      # Legacy Firestore utilities
    │   ├── formatDate.jsx         # Date formatting
    │   ├── exportExcel.jsx        # XLSX export
    │   └── FilepageSum.jsx        # Summation helpers
    ├── pages/                 # Top-level page components
    │   ├── auth/                  # Login, Register
    │   ├── Admin/                 # AdminHome, KyroticsAdminHome
    │   ├── Users/                 # UserHome, KyroticsUserHome
    │   ├── QA/                    # QAHome, QAWorkspace
    │   ├── SuperAdmin/            # SuperAdminHome
    │   ├── Profile.jsx
    │   ├── ProjectList.jsx
    │   ├── FeedbacksPage.jsx
    │   ├── RoleManage.jsx / UserManage.jsx / userList.jsx
    │   └── PemissionManage.jsx
    └── components/            # Reusable UI components
        ├── common/                # FolderList, FolderView, Loader, PrivateRoute, etc.
        ├── Kyrotics/              # KyroInstance, KyroSidebar, KyroAdminFileFlow, etc.
        ├── ClientCompany/         # CompanyInstance, Sidebar, UploadDocument, etc.
        ├── Editor/                # Quill editor (Dialogs, Toolbar, EditorContainer)
        ├── Table/                 # Reusable data tables
        ├── reports/               # Reporting components
        ├── Editor.jsx             # Primary Quill split-screen editor
        ├── Editor2.jsx            # Experimental custom editor
        ├── DashboardWrapper.jsx   # Role-based dashboard router
        └── FileStatusManager.jsx  # Status management tool
```

---

## Key Components

### Editor (`Editor.jsx`)
The primary split-screen editor using Quill.js. Left pane shows the PDF via a signed URL iframe. Right pane is a Quill WYSIWYG instance with:
- Full formatting toolbar (font, size, bold, italic, underline, color, alignment, lists, indent, tables, images, page breaks)
- Find & Replace dialog
- Auto-save with 3-second debounce
- Online/offline detection (server ping every 30s)
- localStorage backup for unsaved work
- Before-unload protection
- Undo history (max 500 steps)
- Notes panel for client-side reviewers
- Feedback form (quality rating, reason, category, severity)
- Submission flow: save content → record submission → update status → navigate back
- Download as ZIP (PDF + DOCX)

### SuperAdminHome (`pages/SuperAdmin/SuperAdminHome.jsx`)
Company management dashboard. View / create / delete companies (Kyrotics + client). Table with type filter tabs.

### AdminHome (`pages/Admin/AdminHome.jsx`)
Project overview: table with counts (total files, received, not started, in progress, completed, downloads). Delivery report with date range filter and XLSX export.

### File Tables (KyroAdminFileFlow, AdminFileFlow)
Tab-based file management per project:
- Kyrotics: Ready (2) → In Progress (3) → Completed (4) → QA/Delivered (5)
- Client: Ready (5) → In Progress (6) → Completed (7) → Downloaded (8)

---

## State Management

Three React Contexts handle global state:

1. **AuthContext** (`src/context/AuthContext.jsx`)
   - `currentUser`, `userLoggedIn`, `isEmailUser`
   - Reads Firebase custom claims (`roleName`, `companyId`) from auth token
   - Provider wraps entire app

2. **InstanceContext** (`src/context/InstanceContext.jsx`)
   - `kyroId`, `instanceType` (`'kyro'` | `'client'`), `currentPath`
   - Synced from URL via `InstancePathTracker` component
   - Determines which company UI to render

3. **NotificationContext** (`src/context/NotificationContext.jsx`)
   - `notificationData` (project counts, total), `loading`, `error`
   - Polls `/api/project/:companyId/getNotificationCounts` every 30s

Component-level state uses standard `useState` / `useEffect` hooks.

---

## API / Data Layer

### Firebase SDK (Direct)
- **Auth**: email/password login, session persistence, token refresh
- **Firestore**: CRUD on `projects`, `files`, `companies`, `users`, `feedbacks`
- **Storage**: direct file uploads (legacy path)

### Express Backend (Axios HTTP)
Base URL configured in `src/main.jsx` (`http://localhost:5566` dev, GAE URL prod).

| Endpoint | Purpose |
|----------|---------|
| `POST /generateSignedUrl` | Generate GCS signed URL for upload |
| `POST /generateReadSignedUrl` | Generate GCS signed URL for reading |
| `PUT /api/document/generateSignedUrlForHtmlUpdate` | Update document content |
| `POST /api/document/deleteFile` | Delete a file from GCS |
| `GET /api/document/:projectId/:documentId/downloadPdf` | Download PDF |
| `GET /api/project/:companyId/getProjectsWithNotifications` | Projects with notification counts |
| `GET /api/project/:companyId/getNotificationCounts` | Notification counts |
| `GET /api/project/user-wip-count` | User's WIP count |
| `GET /api/project/files/inProgress` | Kyrotics in-progress files |
| `GET /api/project/files/completed` | Kyrotics completed files |
| `GET /api/project/files/ClientInProgress` | Client in-progress files |
| `GET /api/project/files/ClientCompleted` | Client completed files |
| `POST /api/folder/createFolder` | Create a folder |
| `GET /api/folder/getAllFolders/:projectId` | Get all folders for a project |
| `GET /api/company` | List companies |
| `POST /api/company/createCompany` | Create a company |
| `DELETE /api/company/:companyId` | Delete a company |
| `POST /api/track/revert` | Log file revert action |
| `GET /api/track/revert-history` | Get revert history |
| `POST /api/track/file-submission` | Record file submission |
| `POST /api/track/feedback` | Submit feedback |
| `GET /api/track/feedbacks` | Get all feedbacks |
| `PUT /api/track/feedback/status` | Update feedback status |
| `GET /server-timestamp` | Get server time |

---

## Prerequisites

- **Node.js** 22+ (LTS recommended)
- **pnpm** (recommended package manager) or npm

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd client

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Create .env file (see Environment Variables below)
touch .env

# 4. Start the development server
pnpm dev
# or: npm run dev
```

The app runs at `http://localhost:5173` by default (Vite's default port).

---

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start development server with HMR |
| `build` | `vite build` | Production build to `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint . --ext js,jsx` | Run ESLint |
| `deploy` | `gcloud app deploy` | Deploy to Google App Engine (manual) |

---

## Environment Variables

Create a `.env` file in the project root:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important:** All frontend env vars must use the `VITE_` prefix (Vite convention). The backend URL is configured in `src/main.jsx` (`server` export).

---

## Deployment

### Google App Engine (Production)

```bash
gcloud app deploy
```

The `app.yaml` uses:
- Node.js 22 runtime
- F1 instance class
- Auto-scaling (1–5 instances)
- Static file serving with SPA catch-all (all unmatched routes → `index.html`)

Environment variables are injected directly in `app.yaml`.

### Vercel (CI / Preview)

Pushes to `main` auto-deploy to Vercel. `vercel.json` configures SPA rewrites.

---

## CI/CD

- **Push to `main`** → Vercel auto-builds and deploys to preview URL
- **Production deploy** → manual `gcloud app deploy` to Google App Engine

---

## Roles & Permissions

| Role | Scope | Key Capabilities |
|------|-------|------------------|
| **superAdmin** | Global | Company CRUD, all routes, user management, role/permission management |
| **admin** | Per company | Project overview, file management, user reports, file assignment |
| **user** | Per company | Workspace (assigned files), editor, feedback |
| **QA** | Kyrotics | QA workspace, file review, revert & deliver |
