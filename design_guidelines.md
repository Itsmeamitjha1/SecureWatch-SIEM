# SIEM Platform Design Guidelines

## Design Approach: Carbon Design System Adaptation
**Rationale**: Enterprise-grade security application requiring information-dense layouts, clear data hierarchy, and professional aesthetic suitable for Security Operations Centers (SOCs). Carbon Design System provides the robust component architecture needed for complex dashboards and data visualization.

**Reference**: IBM Carbon Design principles for enterprise data applications, with inspiration from security platforms like Splunk, Datadog Security, and Wazuh.

## Core Design Principles
1. **Data First**: Prioritize information density and scanability over decorative elements
2. **Operational Efficiency**: Minimize clicks, maximize information visibility
3. **Visual Hierarchy**: Clear severity differentiation through size, weight, and positioning
4. **Professional Restraint**: No unnecessary animations; focus on functional interactions

---

## Typography System

**Font Stack**: IBM Plex Sans (via Google Fonts CDN) - designed for enterprise applications with excellent readability at small sizes

**Hierarchy**:
- Page Titles: 2xl (24px), font-semibold
- Section Headers: xl (20px), font-semibold  
- Card Titles: lg (18px), font-medium
- Body Text: base (16px), font-normal
- Data Labels: sm (14px), font-medium
- Metrics/Numbers: Various sizes, font-mono for data values
- Table Headers: sm (14px), font-semibold, uppercase tracking-wide

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 to gap-6
- Container padding: px-6 to px-8

**Grid Structure**:
- Dashboard: 12-column grid system for flexible widget placement
- Sidebar: Fixed 256px (w-64) navigation, collapsible on mobile
- Main Content: Fluid width with max-w-7xl container
- Cards: Grid layouts using grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for metrics

---

## Component Architecture

### Navigation
- **Sidebar**: Fixed left navigation with icon + label menu items, nested submenus for modules (Dashboard, Events, GRC, ZAP Scanner, Alerts, Reports)
- **Top Bar**: Breadcrumb navigation, global search, notification bell with badge, user profile dropdown

### Dashboard Widgets
- **Metric Cards**: Stat display with large numbers, trend indicators (↑↓), sparkline charts
- **Event Timeline**: Chronological list with timestamp, severity badge, event type icon (Heroicons)
- **Risk Matrix**: 5x5 grid heat map with likelihood vs. impact axes
- **Charts**: Line charts for trends, bar charts for comparisons, donut charts for distribution (use Chart.js)

### Data Tables
- **Structure**: Sticky header row, alternating row backgrounds, sortable columns, pagination controls
- **Features**: Row selection checkboxes, inline action buttons (view/edit/delete), expandable rows for details
- **Density**: Compact row height (h-12) for maximum data visibility

### Alert & Severity System
- **Badges**: Pill-shaped severity indicators (Critical, High, Medium, Low, Info)
- **Icons**: Warning/shield icons (Heroicons) paired with severity levels
- **Visual Weight**: Larger, bolder treatment for higher severity items

### Forms & Inputs
- **Style**: Bordered inputs with focus states, floating labels for space efficiency
- **Validation**: Inline error messages, success states with checkmark icons
- **Controls**: Standard buttons, toggle switches for binary options, multi-select dropdowns for filters

### Modals & Overlays
- **Dialog Boxes**: Centered modals with backdrop blur for incident details, scan results, report generation
- **Slide-overs**: Right-side panels for detailed views and editing forms
- **Tooltips**: Contextual help on hover for technical terms and metrics

### OWASP ZAP Integration Panel
- **Scan Launcher**: Form with target URL input, scan type selector (Quick/Full/API), action buttons
- **Results Display**: Tabular vulnerability list with CVSS scores, risk ratings, affected URLs
- **Detail View**: Expandable sections showing request/response data, remediation guidance

### GRC Compliance Module
- **Framework Cards**: Grid of compliance frameworks (NIST, ISO 27001, SOC 2) with completion percentages
- **Control Checklist**: Nested list structure with checkbox controls, status indicators, evidence attachments
- **Audit Timeline**: Vertical timeline showing compliance activities and milestones

---

## Interactions & States

**Minimal Animation Strategy**:
- Hover: Subtle background opacity change (opacity-90)
- Loading: Simple spinner icons, skeleton screens for data tables
- Transitions: Duration-200 for state changes only
- NO scroll animations, parallax effects, or decorative motion

**Interactive Elements**:
- Primary Actions: Solid buttons with font-semibold text
- Secondary Actions: Outlined buttons or text links
- Danger Actions: Distinct treatment for destructive operations
- Disabled States: Reduced opacity (opacity-50) with cursor-not-allowed

---

## Asset Requirements

**Icons**: Heroicons (via CDN) - use outline style for navigation, solid style for status indicators
**Charts**: Chart.js library for all data visualizations
**No custom SVG generation** - use library components exclusively

---

## Page-Specific Layouts

**Dashboard**: Multi-column grid (3-4 columns on desktop) with draggable/resizable widgets showing KPIs, recent events, active alerts, compliance status

**Security Events Log**: Full-width data table with advanced filtering sidebar, real-time event stream at top

**GRC Module**: Two-column layout - framework selector left, control details right; tabbed interface for different compliance views

**ZAP Scanner**: Split view - scan configuration left (30%), results table right (70%); detailed vulnerability view in slide-over panel

**Reports**: Template selection grid, form builder for custom reports, preview pane before export

---

## Accessibility Requirements
- Keyboard navigation for all interactive elements
- ARIA labels for icon-only buttons and status indicators  
- Sufficient contrast ratios for text on all backgrounds
- Screen reader announcements for real-time alerts and updates

This professional security application demands clarity, efficiency, and reliability over visual flair. Every design decision serves operational effectiveness.