# SecureWatch SIEM Platform

A comprehensive Security Information and Event Management (SIEM) platform with integrated Governance, Risk, and Compliance (GRC) capabilities and OWASP ZAP vulnerability scanning integration.

## Features

- **Real-time Security Dashboard** - Monitor critical alerts, active incidents, and security events with interactive visualizations
- **Security Events Log** - Track and analyze security events with filtering, search, and export capabilities
- **Alert Management** - Manage security alerts with status tracking, assignment, and resolution workflows
- **Incident Response** - Full incident lifecycle management from detection to resolution
- **GRC Compliance** - Support for major frameworks including NIST, ISO 27001, and SOC 2
- **Risk Assessment** - Visual risk matrix with likelihood/impact scoring and mitigation tracking
- **OWASP ZAP Integration** - Vulnerability scanning with detailed findings and CVSS scores
- **Reports Generation** - Compliance, security, vulnerability, and risk assessment reports
- **User Authentication** - Secure authentication via Replit Auth (OpenID Connect)
- **Dark/Light Theme** - Full theme support with professional Carbon Design System styling

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for server state management
- Tailwind CSS with shadcn/ui components
- Wouter for client-side routing
- Recharts for data visualization
- IBM Plex font family

### Backend
- Express.js with TypeScript
- PostgreSQL database with Drizzle ORM
- OpenID Connect authentication
- Session-based auth with PostgreSQL session storage

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-session-secret-here
REPL_ID=your-replit-app-id
ISSUER_URL=https://replit.com/oidc
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/securewatch-siem.git
cd securewatch-siem
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and query client
│   │   ├── pages/       # Page components
│   │   ├── App.tsx      # Main application component
│   │   └── index.css    # Global styles and CSS variables
│   └── index.html       # HTML entry point
├── server/              # Express backend
│   ├── db.ts            # Database connection
│   ├── index.ts         # Server entry point
│   ├── replitAuth.ts    # Authentication configuration
│   ├── routes.ts        # API routes
│   ├── static.ts        # Static file serving
│   ├── storage.ts       # Data storage interface
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared code between client/server
│   └── schema.ts        # Database schema and types
└── script/
    └── build.ts         # Production build script
```

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user
- `GET /api/callback` - OIDC callback
- `GET /api/auth/user` - Get current user

### Security Events
- `GET /api/events` - List all security events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event

### Alerts
- `GET /api/alerts` - List all alerts
- `GET /api/alerts/:id` - Get specific alert
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id` - Update alert

### Incidents
- `GET /api/incidents` - List all incidents
- `GET /api/incidents/:id` - Get specific incident
- `POST /api/incidents` - Create new incident
- `PATCH /api/incidents/:id` - Update incident

### Compliance
- `GET /api/compliance/frameworks` - List frameworks
- `GET /api/compliance/frameworks/:id` - Get specific framework
- `POST /api/compliance/frameworks` - Create framework
- `GET /api/compliance/controls` - List controls
- `POST /api/compliance/controls` - Create control

### Risk Assessment
- `GET /api/risk/assessments` - List risk assessments
- `GET /api/risk/assessments/:id` - Get specific assessment
- `POST /api/risk/assessments` - Create assessment

### ZAP Scans
- `GET /api/zap/scans` - List all scans
- `GET /api/zap/scans/:id` - Get specific scan
- `POST /api/zap/scans` - Create new scan
- `GET /api/zap/vulnerabilities` - List vulnerabilities
- `POST /api/zap/vulnerabilities` - Create vulnerability

## Demo Data

The application comes preloaded with realistic demo data:
- 50 security events with various types and severities
- 20 alerts across different categories
- 10 incidents with full lifecycle tracking
- 3 compliance frameworks (NIST, ISO 27001, SOC 2) with controls
- 15 risk assessments with likelihood/impact scores
- 8 vulnerability scans with findings

## Screenshots

### Dashboard
Real-time metrics with event trends, severity distribution, and recent alerts.

### Security Events
Filterable log of security events with severity badges and source information.

### Risk Assessment
Interactive 5x5 risk heat map with likelihood vs. impact visualization.

### GRC Compliance
Framework cards with progress tracking and expandable control details.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please use the GitHub Issues page.
