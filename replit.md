# SecureWatch SIEM Platform

## Overview

SecureWatch is an enterprise-grade Security Information and Event Management (SIEM) platform with integrated Governance, Risk, and Compliance (GRC) capabilities and OWASP ZAP vulnerability scanning. The platform provides real-time security event monitoring, alert management, incident tracking, compliance framework management, risk assessment, and automated vulnerability scanning for security operations centers (SOCs).

The application follows a modern full-stack architecture with a React-based frontend using shadcn/ui components styled with the Carbon Design System principles, and an Express.js backend with PostgreSQL database storage via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router
- TanStack Query (React Query) for server state management with aggressive caching (staleTime: Infinity)

**UI Component System**
- shadcn/ui components built on Radix UI primitives for accessible, unstyled base components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Design system inspired by IBM Carbon Design System for enterprise data applications
- IBM Plex Sans/Serif/Mono font family via Google Fonts CDN for professional typography

**Design Philosophy**
- Information-dense layouts prioritizing data visibility over decoration
- Clear visual hierarchy using size, weight, and positioning for severity differentiation
- No unnecessary animations; functional interactions only
- Professional restraint suitable for Security Operations Centers

**State Management**
- TanStack Query for all API data fetching with centralized queryClient configuration
- Custom `apiRequest` helper for standardized fetch calls with credentials
- Local component state with React hooks for UI-only state
- Form state managed via react-hook-form with Zod validation

**Page Structure**
- Dashboard: Real-time metrics with Recharts visualizations (LineChart, AreaChart, BarChart, PieChart)
- Events: Security event log with filtering and search capabilities
- Alerts: Alert management with status updates and assignment
- Incidents: Incident tracking and resolution workflow
- GRC: Compliance framework and control management with accordion UI, plus interactive compliance questionnaire system for updating compliance standings with status tracking, response documentation, and evidence collection
- Risk: Risk assessment matrix with severity scoring
- ZAP: OWASP ZAP scan orchestration and vulnerability tracking
- Reports: Compliance, security, vulnerability, and risk report generation

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for REST API endpoints
- HTTP server created via Node's `http.createServer()` for potential WebSocket upgrade
- Custom logging middleware tracking request duration and response status
- JSON body parsing with raw body preservation for webhook verification

**Development vs Production**
- Development: Vite middleware integration for HMR and on-demand compilation
- Production: Static file serving from pre-built `dist/public` directory
- Environment-aware configuration via `NODE_ENV` variable

**API Route Structure**
- RESTful endpoints following resource-based URL patterns
- CRUD operations for all major entities (events, alerts, incidents, compliance, risk, ZAP scans)
- Zod schema validation using `insertSchema` derived from Drizzle tables
- Consistent error handling with appropriate HTTP status codes (400, 404, 500)

**Build Process**
- Client built with Vite to `dist/public`
- Server bundled with esbuild to `dist/index.cjs` for reduced cold starts
- Dependency allowlist strategy: bundle critical deps, externalize others
- Single production artifact with embedded static assets

### Data Storage

**Database System**
- PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- Connection string provided via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe database queries and migrations

**Schema Design**
- UUID primary keys generated via `gen_random_uuid()`
- Timestamp fields with `defaultNow()` for created/updated tracking
- Text fields for flexibility (event types, severities, statuses, descriptions)
- No foreign key constraints visible in current schema (denormalized for read performance)

**Core Entities**
- `security_events`: Timestamped security events with type, severity, source, destination, user, IP
- `alerts`: Actionable alerts with status, assignment, and related event linking
- `incidents`: Incident cases with severity, status, category, and timestamps
- `compliance_frameworks`: Top-level compliance standards (ISO 27001, NIST, GDPR, etc.)
- `compliance_controls`: Individual controls within frameworks with implementation status
- `risk_assessments`: Risk entries with likelihood, impact, scores, and mitigation plans
- `zap_scans`: OWASP ZAP scan records with target URL, scan type, status, and results
- `vulnerabilities`: Individual vulnerabilities discovered by ZAP scans with CVSS scores

**Storage Interface**
- Abstract `IStorage` interface defining all data operations
- In-memory implementation for development/testing (not shown but implied)
- Database implementation for production (structure defined, implementation external)
- Supports GET (list/single), CREATE, and UPDATE operations across all entities

### Design System Implementation

**Color Palette**
- HSL-based CSS custom properties for theme consistency
- Semantic color naming (primary, secondary, destructive, muted, accent)
- Severity-specific colors mapped to chart variables (Critical: destructive, High: chart-2, Medium: chart-5, Low: chart-1)
- Separate light/dark mode palettes with automatic class-based switching

**Spacing & Layout**
- 12-column grid system for dashboard widget placement
- Fixed 16rem (256px) sidebar width with 3rem icon-only collapsed state
- Consistent padding units: p-4 to p-6 for components, px-6 to px-8 for containers
- Responsive breakpoints using Tailwind's md/lg prefixes

**Typography Scale**
- Page Titles: 2xl (24px) semibold
- Section Headers: xl (20px) semibold
- Card Titles: lg (18px) medium
- Body Text: base (16px) normal
- Data Labels: sm (14px) medium
- Table Headers: sm (14px) semibold uppercase with tracking

**Component Variants**
- Buttons: default, destructive, outline, secondary, ghost with size variants (sm, default, lg, icon)
- Badges: default, secondary, destructive, outline with hover elevation
- Cards: Rounded xl borders with subtle shadows and card-specific border colors
- Elevation system: `--elevate-1` and `--elevate-2` for hover/active states

## External Dependencies

**UI Component Libraries**
- Radix UI primitives: Complete set including Dialog, Dropdown Menu, Select, Tabs, Accordion, Toast, etc.
- Recharts: Chart library for data visualization (line, area, bar, pie charts)
- Lucide React: Icon library for consistent iconography
- embla-carousel-react: Carousel component (imported but not heavily used)

**Form & Validation**
- react-hook-form: Form state management with performance optimization
- @hookform/resolvers: Integration layer for Zod validation
- Zod: Runtime type validation and schema definition
- drizzle-zod: Automatic schema generation from Drizzle table definitions

**Utility Libraries**
- clsx & tailwind-merge: Conditional className composition via `cn()` helper
- class-variance-authority: Type-safe component variant management
- date-fns: Date formatting and manipulation
- nanoid: Random ID generation for cache busting

**Database & ORM**
- @neondatabase/serverless: PostgreSQL client for serverless environments
- drizzle-orm: Type-safe ORM with query builder
- drizzle-kit: Migration generation and database push utilities
- connect-pg-simple: PostgreSQL session store for Express (imported but session not configured)

**Development Tools**
- @replit/vite-plugin-runtime-error-modal: Error overlay for development
- @replit/vite-plugin-cartographer: Code navigation assistance
- @replit/vite-plugin-dev-banner: Development environment indicator
- tsx: TypeScript execution for build scripts and development server

**Build & Bundling**
- Vite: Frontend build tool with React plugin
- esbuild: Fast server bundling for production
- Tailwind CSS with PostCSS: Utility-first CSS processing
- Autoprefixer: Automatic vendor prefix addition

### Authentication System

**Authentication Provider**
- Local authentication using passport-local strategy
- Username/password login with bcrypt password hashing
- Session-based authentication with PostgreSQL session storage

**Authentication Files**
- `server/replitAuth.ts`: Passport-local configuration, session management, admin user seeding
- `client/src/hooks/useAuth.ts`: React hook for authentication state
- `client/src/pages/login.tsx`: Login page with form validation

**Default Credentials (Development)**
- Default admin user: username "admin", password "admin"
- Override with environment variables: `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- Security warning logged when using default credentials

**Session Configuration**
- 7-day session TTL stored in PostgreSQL `sessions` table
- Environment-aware secure cookie flag (secure in production only)
- Session secret via `SESSION_SECRET` environment variable

**User Management**
- Users table stores profile data (id, username, password, email, firstName, lastName, role)
- Admin user auto-seeded on first boot
- Profile page at `/profile` route with account details

**API Endpoints**
- `POST /api/login`: Authenticate with { username, password }
- `POST /api/logout`: End current session
- `GET /api/auth/user`: Returns current authenticated user (401 if not authenticated)

**Protected Routes**
- Auth middleware `isAuthenticated` for protected API endpoints
- Frontend uses `useAuth` hook to conditionally render auth-dependent UI
- App.tsx guards all routes, redirecting to login if not authenticated

**Auth UI Components**
- Login page with username/password form and error handling
- Logout button in sidebar footer with POST request
- User avatar and profile link for authenticated users

**Potential Future Integrations**
- OWASP ZAP API: External vulnerability scanning service integration
- Email service (nodemailer imported in build config)
- WebSocket server: HTTP server configured for potential upgrade