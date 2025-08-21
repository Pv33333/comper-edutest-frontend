# Copilot Instructions for This Codebase

## Overview
This is a Vite + React + Tailwind CSS monorepo for an educational platform (Comper Inregistrare) with multi-role support (admin, teacher, student, parent). The codebase is organized for clear separation of concerns and scalable feature growth.

## Architecture
- **Entry Point:** `src/main.jsx` mounts the `App` component.
- **Routing:** All navigation is handled in `src/router.jsx` using `react-router-dom`, with routes grouped by user role (admin, teacher, student, parent, public).
- **Layouts:**
  - `src/layouts/SiteLayout.jsx` and `src/layouts/AppShell.jsx` provide top-level structure.
- **Pages:**
  - All user-facing pages are in `src/pages/`, grouped by role (e.g., `admin/`, `profesor/`, `elev/`, `parinte/`).
- **Components:**
  - Shared UI and logic in `src/components/` and `src/components/ui/`.
- **Styling:**
  - Tailwind CSS is configured in `tailwind.config.js` and used throughout. Custom colors and fonts are defined in the config and `src/index.css`.

## Developer Workflows
- **Start Dev Server:** `npm run dev` (uses Vite)
- **Build for Production:** `npm run build`
- **Preview Production Build:** `npm run preview`
- **No built-in test scripts** (add tests in the future as needed).

## Project Conventions
- **Lazy Loading:** Most pages are lazy-loaded in `src/router.jsx` for performance.
- **Toast Notifications:** Use the `useToast` hook and `ToastContainer` from `src/components/ui/Toast.jsx` for global messages.
- **Component Naming:** Use PascalCase for components and group by feature/role when possible.
- **CSS:** Use Tailwind utility classes. Add custom styles in `src/index.css` if needed.
- **Assets:** Place images and icons in `public/assets/` and reference with absolute paths from public root.

## Integration Points
- **Charting:** Uses `chart.js` and `react-chartjs-2` for data visualization.
- **Routing:** All navigation is client-side via `react-router-dom`.
- **No backend API integration** is present in this codebase (add as needed).

## Examples
- To add a new teacher page: create a file in `src/pages/profesor/`, add a lazy import in `src/router.jsx`, and register a route.
- To add a new global UI component: add to `src/components/ui/` and import where needed.

## Key Files
- `src/router.jsx` — All routes and lazy loading
- `src/layouts/` — Layout wrappers
- `src/components/ui/Toast.jsx` — Toast notification system
- `tailwind.config.js` & `src/index.css` — Styling conventions

---
For questions about project structure or conventions, check the above files first. If unclear, ask for clarification or review similar patterns in the codebase.
