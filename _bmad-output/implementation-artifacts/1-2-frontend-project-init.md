# Story 1.2: Frontend Project Initialization

Status: done

## Story

As a **developer**,
I want **to initialize the React frontend with Vite and TypeScript**,
so that **I have a working SPA development environment**.

## Acceptance Criteria

1. Vite + React + TypeScript project created
2. Tailwind CSS configured
3. shadcn/ui initialized
4. `npm run dev` starts development server
5. Project structure matches architecture spec

## Tasks / Subtasks

- [x] Task 1: Initialize Vite + React + TypeScript project (AC: #1)
  - [x] Run `npm create vite@latest frontend -- --template react-ts`
  - [x] Verify project structure created correctly
  - [x] Run `npm install` to install dependencies
  - [x] Verify `npm run dev` starts development server

- [x] Task 2: Configure Tailwind CSS (AC: #2)
  - [x] Install Tailwind CSS v4.x and dependencies
  - [x] Create/update `tailwind.config.js` (Note: Tailwind v4 uses @theme in CSS, no separate config needed)
  - [x] Add Tailwind directives to CSS
  - [x] Verify Tailwind classes work in components

- [x] Task 3: Initialize shadcn/ui (AC: #3)
  - [x] Run `npx shadcn@latest init` (manual setup for Tailwind v4 compatibility)
  - [x] Configure components.json for project
  - [x] Install at least one component to verify setup (e.g., Button)
  - [x] Verify component renders correctly

- [x] Task 4: Create project structure (AC: #5)
  - [x] Create `src/components/` directory
  - [x] Create `src/hooks/` directory
  - [x] Create `src/lib/` directory
  - [x] Create `src/types/` directory
  - [x] Create placeholder files to establish structure

- [x] Task 5: Configure TypeScript (AC: #1)
  - [x] Verify strict mode is enabled in `tsconfig.json`
  - [x] Configure path aliases if needed
  - [x] Ensure TypeScript compilation works

- [x] Task 6: Setup package.json scripts (AC: #4)
  - [x] Verify `dev`, `build`, `preview` scripts exist
  - [x] Add `lint` script if not present
  - [x] Verify all scripts work correctly

## Dev Notes

### Architecture Compliance

**Technology Stack:**
- Framework: React 18.x
- Build Tool: Vite 6.x
- Language: TypeScript 5.x with strict mode
- Styling: Tailwind CSS 4.x
- Components: shadcn/ui (latest)

**Initialization Commands:**
```bash
# Step 1: Create Vite project
npm create vite@latest frontend -- --template react-ts

# Step 2: Install Tailwind CSS v4
cd frontend
npm install tailwindcss @tailwindcss/vite

# Step 3: Initialize shadcn/ui
npx shadcn@latest init
```

### Project Structure (MUST FOLLOW)

```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── components.json          # shadcn/ui config
├── index.html
├── public/
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Root component
│   ├── index.css            # Global styles with Tailwind
│   ├── components/          # UI components (kebab-case files)
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   │   └── use-shorten.ts   # (placeholder for future)
│   ├── lib/                 # Utilities
│   │   ├── api.ts           # (placeholder for future)
│   │   ├── utils.ts         # shadcn/ui utility (cn function)
│   │   └── validation.ts    # (placeholder for future)
│   └── types/
│       └── index.ts         # Shared TypeScript types
└── .gitignore
```

### Vite Configuration

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Tailwind CSS v4 Setup

**CRITICAL:** Tailwind CSS v4 has a different setup than v3. Use the Vite plugin approach:

**index.css:**
```css
@import "tailwindcss";
```

**Note:** Tailwind v4 uses `@import "tailwindcss"` instead of the v3 directives (`@tailwind base`, etc.)

### shadcn/ui Configuration

**components.json (expected after init):**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### TypeScript Configuration

**tsconfig.json requirements:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Naming Conventions (CRITICAL)

- Files: `kebab-case.tsx` (e.g., `url-input.tsx`, `result-card.tsx`)
- Components: `PascalCase` (e.g., `UrlInput`, `ResultCard`)
- Hooks: `camelCase` starting with `use` (e.g., `useShorten`)
- Types/Interfaces: `PascalCase` (e.g., `ShortenRequest`, `ApiResponse`)
- Constants: `SCREAMING_SNAKE_CASE`

### Anti-Patterns to Avoid

❌ DO NOT use Redux or complex state management (use React hooks)
❌ DO NOT use CSS modules or styled-components (use Tailwind)
❌ DO NOT create class components (use functional components)
❌ DO NOT skip TypeScript strict mode
❌ DO NOT add comments unless explicitly asked
❌ DO NOT use Tailwind v3 syntax with v4 (no `@tailwind` directives)

### Testing Requirements

- Create `__tests__/` directory for future tests
- Use Vitest for testing (consistent with backend)
- Test file naming: `{component}.test.tsx`

### Previous Story Learnings (from 1-1-backend-project-init)

**Patterns Established:**
- Use try/catch with structured error handling
- Use response helpers for consistent API responses
- Use typed mocks in tests instead of `as any`
- Include `.gitignore` from the start
- Document all files in project structure

**Code Review Insights:**
- Always use defined types (don't leave things untyped)
- Keep documentation in sync with actual implementation
- Verify all tasks are actually complete before marking done

### References

- [Source: architecture.md#Frontend Starter]
- [Source: architecture.md#Frontend Architecture]
- [Source: architecture.md#Project Structure]
- [Source: project-context.md#Frontend Structure]
- [Source: project-context.md#Naming Conventions]

---

## Dev Agent Record

### Agent Model Used

Claude (Cascade)

### Debug Log References

- TypeScript compilation: `npm run build` - PASSED
- ESLint: `npm run lint` - PASSED
- Vite build output: 223.67 kB JS, 10.67 kB CSS

### Completion Notes List

- Initialized Vite + React + TypeScript project using `npm create vite@latest`
- Installed and configured Tailwind CSS v4 using `@tailwindcss/vite` plugin
- Tailwind v4 uses `@import "tailwindcss"` and `@theme` directive (different from v3)
- Manually configured shadcn/ui for Tailwind v4 compatibility (CLI has v3 assumptions)
- Created Button component from shadcn/ui with proper styling
- Set up path aliases (`@/`) in both vite.config.ts and tsconfig.app.json
- Created project structure with components, hooks, lib, and types directories
- Added placeholder files: api.ts, validation.ts, use-shorten.ts, types/index.ts
- All scripts working: dev, build, lint, preview
- React 19.2.0, Vite 7.x, TypeScript 5.9.x, Tailwind 4.x

### Code Review Fixes Applied

- **[H1]** Created `src/__tests__/` directory with .gitkeep
- **[H2]** Added HTTP error handling (response.ok check) in api.ts
- **[H3]** Updated index.html title from "frontend" to "tiny-url"
- **[M2]** Added dark mode support via prefers-color-scheme media query
- **[M4]** Created `.env.example` documenting VITE_API_URL
- **[L1]** Removed unused Vite template assets (vite.svg, react.svg)
- **[L3]** Replaced Vite favicon with link emoji favicon

### Change Log

- 2026-01-25: Story created with full context
- 2026-01-25: Implemented frontend project initialization
- 2026-01-25: Code review fixes - error handling, dark mode, tests dir, env example

### File List

_Files created/modified during implementation:_
- [x] `frontend/package.json`
- [x] `frontend/tsconfig.json`
- [x] `frontend/tsconfig.app.json`
- [x] `frontend/tsconfig.node.json`
- [x] `frontend/vite.config.ts`
- [x] `frontend/components.json`
- [x] `frontend/index.html`
- [x] `frontend/.gitignore`
- [x] `frontend/.env.example`
- [x] `frontend/eslint.config.js`
- [x] `frontend/src/main.tsx`
- [x] `frontend/src/App.tsx`
- [x] `frontend/src/index.css`
- [x] `frontend/src/lib/utils.ts`
- [x] `frontend/src/lib/api.ts`
- [x] `frontend/src/lib/validation.ts`
- [x] `frontend/src/types/index.ts`
- [x] `frontend/src/hooks/use-shorten.ts`
- [x] `frontend/src/components/ui/button.tsx`
- [x] `frontend/src/__tests__/.gitkeep`
