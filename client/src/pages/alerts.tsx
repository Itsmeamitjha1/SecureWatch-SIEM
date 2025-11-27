import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert } from "@shared/schema";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Open":
      return <Clock className="h-4 w-4 text-chart-2" />;
    case "In Progress":
      return <AlertTriangle className="h-4 w-4 text-chart-5" />;
    case "Resolved":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "Closed":
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const { toast } = useToast();

  const { data: alerts = [], isLoading, isError } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/alerts/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert updated",
        description: "Alert status has been updated successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Alerts</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load alerts. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const alertCounts = {
    total: alerts.length,
    open: alerts.filter((a) => a.status === "Open").length,
    inProgress: alerts.filter((a) => a.status === "In Progress").length,
    resolved: alerts.filter((a) => a.status === "Resolved").length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Alert Management</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Monitor and respond to security alerts
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-primary/10 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-total-alerts">
                {alertCounts.total}
              </p>
              <p className="text-xs text-muted-foreground truncate">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-chart-2/10 shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-open-alerts">
                {alertCounts.open}
              </p>
              <p className="text-xs text-muted-foreground truncate">Open</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-chart-5/10 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-chart-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-inprogress-alerts">
                {alertCounts.inProgress}
              </p>
              <p className="text-xs text-muted-foreground truncate">In Progress</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-green-500/10 shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-resolved-alerts">
                {alertCounts.resolved}
              </p>
              <p className="text-xs text-muted-foreground truncate">Resolved</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-36" data-testid="select-severity-filter">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Alert
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Severity
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Created
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No alerts found matching filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className="hover-elevate"
                    data-testid={`alert-row-${alert.id}`}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {alert.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityVariant(alert.severity)} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{alert.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <span className="text-sm">{alert.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(alert.createdAt), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      {alert.status === "Open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: alert.id,
                              status: "In Progress",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-investigate-${alert.id}`}
                        >
                          Investigate
                        </Button>
                      )}
                      {alert.status === "In Progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: alert.id,
                              status: "Resolved",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-resolve-${alert.id}`}
                        >
                          Resolve
                        </Button>
                      )}
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
