import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { SecurityEvent, Alert, ZapScan } from "@shared/schema";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SEVERITY_COLORS = {
  Critical: "hsl(var(--destructive))",
  High: "hsl(var(--chart-2))",
  Medium: "hsl(var(--chart-5))",
  Low: "hsl(var(--chart-1))",
  Info: "hsl(var(--muted))",
};

export default function Dashboard() {
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery<SecurityEvent[]>({
    queryKey: ["/api/events"],
  });

  const { data: alerts = [], isLoading: alertsLoading, isError: alertsError } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: scans = [], isLoading: scansLoading, isError: scansError } = useQuery<ZapScan[]>({
    queryKey: ["/api/zap/scans"],
  });

  const criticalAlerts = alerts.filter((a) => a.severity === "Critical").length;
  const highAlerts = alerts.filter((a) => a.severity === "High").length;
  const activeIncidents = alerts.filter((a) => a.status === "Open").length;
  const recentScans = scans.filter((s) => s.status === "Completed").length;

  const eventsByType = events.reduce((acc: Record<string, number>, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(eventsByType).map(([name, value]) => ({
    name,
    value,
  }));

  const eventTrend = events.slice(0, 10).reverse().map((event, idx) => ({
    time: format(new Date(event.timestamp), "HH:mm"),
    events: idx + 1,
  }));

  const severityDistribution = [
    { severity: "Critical", count: alerts.filter((a) => a.severity === "Critical").length },
    { severity: "High", count: alerts.filter((a) => a.severity === "High").length },
    { severity: "Medium", count: alerts.filter((a) => a.severity === "Medium").length },
    { severity: "Low", count: alerts.filter((a) => a.severity === "Low").length },
  ];

  if (eventsLoading || alertsLoading || scansLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (eventsError || alertsError || scansError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Dashboard</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Security Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Real-time security monitoring and analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Critical Alerts</p>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-semibold font-mono" data-testid="text-critical-alerts">
              {criticalAlerts}
            </p>
            <p className="text-xs text-muted-foreground">
              {highAlerts} high severity
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Active Incidents</p>
            <Activity className="h-4 w-4 text-chart-2" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-semibold font-mono" data-testid="text-active-incidents">
              {activeIncidents}
            </p>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Security Events</p>
            <Shield className="h-4 w-4 text-chart-1" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-semibold font-mono" data-testid="text-security-events">
              {events.length}
            </p>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Scans Completed</p>
            <TrendingUp className="h-4 w-4 text-chart-5" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-semibold font-mono" data-testid="text-scans-completed">
              {recentScans}
            </p>
            <p className="text-xs text-muted-foreground">
              Vulnerability assessments
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">Event Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={eventTrend}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="events"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorEvents)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">Alert Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="severity" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">Event Type Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="hsl(var(--chart-1))"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Object.values(SEVERITY_COLORS)[index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No event data available
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-md border border-border p-3 hover-elevate"
                data-testid={`alert-item-${alert.id}`}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 text-chart-2" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge
                      variant={
                        alert.severity === "Critical" ? "destructive" : "secondary"
                      }
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.category}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No active alerts</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
