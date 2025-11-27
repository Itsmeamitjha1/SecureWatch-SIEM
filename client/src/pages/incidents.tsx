import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Incident } from "@shared/schema";
import { Bug, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "destructive";
    case "High":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "text-chart-2";
    case "In Progress":
      return "text-chart-5";
    case "Resolved":
      return "text-green-600";
    case "Closed":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
};

export default function Incidents() {
  const { data: incidents = [], isLoading, isError } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Bug className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading incidents...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Bug className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Incidents</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load incidents. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const incidentCounts = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "Open").length,
    inProgress: incidents.filter((i) => i.status === "In Progress").length,
    resolved: incidents.filter((i) => i.status === "Resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Incident Response</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage security incidents
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Bug className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono" data-testid="text-total-incidents">
                {incidentCounts.total}
              </p>
              <p className="text-xs text-muted-foreground">Total Incidents</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-2/10">
              <AlertCircle className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono" data-testid="text-open-incidents">
                {incidentCounts.open}
              </p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-5/10">
              <Clock className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono" data-testid="text-inprogress-incidents">
                {incidentCounts.inProgress}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold font-mono" data-testid="text-resolved-incidents">
                {incidentCounts.resolved}
              </p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Active Incidents</h3>
          <p className="text-sm text-muted-foreground">
            Monitor ongoing security incidents and response status
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Incident
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Severity
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Impact
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Assigned To
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No incidents found
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className="hover-elevate"
                    data-testid={`incident-row-${incident.id}`}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{incident.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {incident.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityVariant(incident.severity)} className="text-xs">
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{incident.category}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {incident.impactLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{incident.assignedTo || "Unassigned"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(incident.createdAt), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
