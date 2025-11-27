import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZapScan, Vulnerability } from "@shared/schema";
import { Shield, Play, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertZapScanSchema } from "@shared/schema";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const scanFormSchema = insertZapScanSchema.extend({
  targetUrl: z.string().url("Please enter a valid URL"),
});

type ScanFormData = z.infer<typeof scanFormSchema>;

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

export default function ZAP() {
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [showNewScanDialog, setShowNewScanDialog] = useState(false);
  const { toast } = useToast();

  const { data: scans = [], isLoading: scansLoading, isError: scansError } = useQuery<ZapScan[]>({
    queryKey: ["/api/zap/scans"],
  });

  const { data: vulnerabilities = [], isLoading: vulnsLoading, isError: vulnsError } = useQuery<Vulnerability[]>({
    queryKey: ["/api/zap/vulnerabilities", selectedScan],
    enabled: !!selectedScan,
  });

  const form = useForm<ScanFormData>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      targetUrl: "",
      scanType: "Quick",
      status: "Pending",
    },
  });

  const createScanMutation = useMutation({
    mutationFn: async (data: ScanFormData) => {
      return apiRequest("POST", "/api/zap/scans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zap/scans"] });
      setShowNewScanDialog(false);
      form.reset();
      toast({
        title: "Scan initiated",
        description: "Vulnerability scan has been started",
      });
    },
  });

  const onSubmit = (data: ScanFormData) => {
    createScanMutation.mutate(data);
  };

  if (scansLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading scans...</p>
        </div>
      </div>
    );
  }

  if (scansError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Scans</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load vulnerability scans. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const filteredVulnerabilities = selectedScan
    ? vulnerabilities.filter((v) => v.scanId === selectedScan)
    : [];

  const scanCounts = {
    total: scans.length,
    completed: scans.filter((s) => s.status === "Completed").length,
    running: scans.filter((s) => s.status === "Running").length,
    pending: scans.filter((s) => s.status === "Pending").length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">OWASP ZAP Scanner</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Security testing and vulnerability detection
          </p>
        </div>
        <Button
          onClick={() => setShowNewScanDialog(true)}
          className="shrink-0"
          data-testid="button-new-scan"
        >
          <Play className="h-4 w-4 mr-2" />
          New Scan
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-primary/10 shrink-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-total-scans">
                {scanCounts.total}
              </p>
              <p className="text-xs text-muted-foreground truncate">Total</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-green-500/10 shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-completed-scans">
                {scanCounts.completed}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-chart-5/10 shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-chart-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-running-scans">
                {scanCounts.running}
              </p>
              <p className="text-xs text-muted-foreground truncate">Running</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-chart-1/10 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-pending-scans">
                {scanCounts.pending}
              </p>
              <p className="text-xs text-muted-foreground truncate">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 p-3 sm:p-6">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">Recent Scans</h3>
          <div className="space-y-2">
            {scans.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No scans yet</div>
            ) : (
              scans.slice(0, 10).map((scan) => (
                <div
                  key={scan.id}
                  className={`p-3 rounded-md border hover-elevate cursor-pointer ${
                    selectedScan === scan.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedScan(scan.id)}
                  data-testid={`scan-item-${scan.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium font-mono truncate">
                        {new URL(scan.targetUrl).hostname}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {scan.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scan.scanType} Scan
                    </p>
                    {scan.status === "Completed" && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-destructive">{scan.criticalCount}C</span>
                        <span className="text-chart-2">{scan.highCount}H</span>
                        <span className="text-chart-5">{scan.mediumCount}M</span>
                        <span className="text-muted-foreground">{scan.lowCount}L</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-3 sm:p-6">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">Vulnerability Findings</h3>
          {!selectedScan ? (
            <div className="flex h-48 sm:h-64 items-center justify-center text-sm text-muted-foreground">
              Select a scan to view vulnerabilities
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Vulnerability
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Severity
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      CVSS
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      URL
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vulnsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <Shield className="mx-auto h-8 w-8 animate-pulse text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Loading vulnerabilities...</p>
                      </TableCell>
                    </TableRow>
                  ) : vulnsError ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <p className="text-sm text-destructive">Error loading vulnerabilities</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredVulnerabilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No vulnerabilities found for this scan
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVulnerabilities.map((vuln) => (
                      <TableRow
                        key={vuln.id}
                        className="hover-elevate"
                        data-testid={`vuln-row-${vuln.id}`}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{vuln.name}</p>
                            {vuln.cweId && (
                              <p className="text-xs text-muted-foreground">{vuln.cweId}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityVariant(vuln.severity)} className="text-xs">
                            {vuln.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {vuln.cvssScore || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm font-mono truncate max-w-xs">
                          {vuln.url}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showNewScanDialog} onOpenChange={setShowNewScanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch New Scan</DialogTitle>
            <DialogDescription>
              Configure and start a new vulnerability scan
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                placeholder="https://example.com"
                {...form.register("targetUrl")}
                data-testid="input-target-url"
              />
              {form.formState.errors.targetUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.targetUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scanType">Scan Type</Label>
              <Select
                value={form.watch("scanType")}
                onValueChange={(value) => form.setValue("scanType", value)}
              >
                <SelectTrigger data-testid="select-scan-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quick">Quick Scan</SelectItem>
                  <SelectItem value="Full">Full Scan</SelectItem>
                  <SelectItem value="API">API Scan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewScanDialog(false)}
                data-testid="button-cancel-scan"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createScanMutation.isPending}
                data-testid="button-start-scan"
              >
                {createScanMutation.isPending ? "Starting..." : "Start Scan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
