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
import { RiskAssessment } from "@shared/schema";
import { TrendingUp, AlertTriangle, Download } from "lucide-react";

const getRiskLevel = (score: number) => {
  if (score >= 15) return { label: "Critical", variant: "destructive" as const, color: "bg-destructive" };
  if (score >= 10) return { label: "High", variant: "destructive" as const, color: "bg-chart-2" };
  if (score >= 6) return { label: "Medium", variant: "secondary" as const, color: "bg-chart-5" };
  return { label: "Low", variant: "secondary" as const, color: "bg-chart-1" };
};

export default function Risk() {
  const { data: risks = [], isLoading, isError } = useQuery<RiskAssessment[]>({
    queryKey: ["/api/risk/assessments"],
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <TrendingUp className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading risk assessments...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Risk Assessments</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load risk data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Create 5x5 heat map matrix
  const heatMapData: { likelihood: number; impact: number; count: number; risks: RiskAssessment[] }[] = [];
  for (let likelihood = 1; likelihood <= 5; likelihood++) {
    for (let impact = 1; impact <= 5; impact++) {
      const cellRisks = risks.filter(
        (r) => r.likelihood === likelihood && r.impact === impact
      );
      heatMapData.push({
        likelihood,
        impact,
        count: cellRisks.length,
        risks: cellRisks,
      });
    }
  }

  const riskCounts = {
    total: risks.length,
    critical: risks.filter((r) => r.riskScore >= 15).length,
    high: risks.filter((r) => r.riskScore >= 10 && r.riskScore < 15).length,
    medium: risks.filter((r) => r.riskScore >= 6 && r.riskScore < 10).length,
    low: risks.filter((r) => r.riskScore < 6).length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Risk Assessment</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Identify and manage organizational risks
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-destructive/10 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-critical-risks">
                {riskCounts.critical}
              </p>
              <p className="text-xs text-muted-foreground truncate">Critical</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-chart-2/10 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-high-risks">
                {riskCounts.high}
              </p>
              <p className="text-xs text-muted-foreground truncate">High</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-chart-5/10 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-medium-risks">
                {riskCounts.medium}
              </p>
              <p className="text-xs text-muted-foreground truncate">Medium</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-chart-1/10 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-semibold font-mono" data-testid="text-low-risks">
                {riskCounts.low}
              </p>
              <p className="text-xs text-muted-foreground truncate">Low</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-medium">Risk Heat Map</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Likelihood vs. Impact matrix
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1" style={{ gridTemplateColumns: "100px repeat(5, 1fr)" }}>
              <div></div>
              {[1, 2, 3, 4, 5].map((impact) => (
                <div
                  key={`impact-${impact}`}
                  className="text-center text-xs font-semibold uppercase tracking-wide p-2"
                >
                  Impact {impact}
                </div>
              ))}

              {[5, 4, 3, 2, 1].map((likelihood) => (
                <>
                  <div
                    key={`likelihood-${likelihood}`}
                    className="flex items-center justify-center text-xs font-semibold uppercase tracking-wide p-2"
                  >
                    Likelihood {likelihood}
                  </div>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const cell = heatMapData.find(
                      (d) => d.likelihood === likelihood && d.impact === impact
                    );
                    const score = likelihood * impact;
                    const riskLevel = getRiskLevel(score);

                    return (
                      <div
                        key={`cell-${likelihood}-${impact}`}
                        className={`${riskLevel.color} min-h-20 p-3 rounded-md flex flex-col items-center justify-center text-white hover-elevate cursor-pointer`}
                        data-testid={`risk-cell-${likelihood}-${impact}`}
                      >
                        <span className="text-2xl font-bold font-mono">
                          {cell?.count || 0}
                        </span>
                        <span className="text-xs opacity-90">Risk{cell?.count !== 1 ? "s" : ""}</span>
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-destructive"></div>
              <span className="text-xs text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-chart-2"></div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-chart-5"></div>
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-chart-1"></div>
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <h3 className="text-base sm:text-lg font-medium">Risk Register</h3>
          <Button variant="outline" size="sm" data-testid="button-export-risks">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Risk Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Likelihood
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Impact
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Risk Level
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Owner
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No risks found
                  </TableCell>
                </TableRow>
              ) : (
                risks.map((risk) => {
                  const riskLevel = getRiskLevel(risk.riskScore);
                  return (
                    <TableRow
                      key={risk.id}
                      className="hover-elevate"
                      data-testid={`risk-row-${risk.id}`}
                    >
                      <TableCell className="text-sm font-medium">{risk.riskName}</TableCell>
                      <TableCell className="text-sm">{risk.category}</TableCell>
                      <TableCell className="text-sm font-mono">{risk.likelihood}</TableCell>
                      <TableCell className="text-sm font-mono">{risk.impact}</TableCell>
                      <TableCell>
                        <Badge variant={riskLevel.variant} className="text-xs">
                          {riskLevel.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{risk.owner || "Unassigned"}</TableCell>
                      <TableCell className="text-sm">{risk.status}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
