import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComplianceFramework } from "@shared/schema";
import { FileText, Download, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

const getReportBgColor = (reportId: string) => {
  switch (reportId) {
    case "compliance":
      return "bg-chart-1/10";
    case "security":
      return "bg-chart-2/10";
    case "vulnerability":
      return "bg-destructive/10";
    case "risk":
      return "bg-chart-5/10";
    default:
      return "bg-primary/10";
  }
};

export default function Reports() {
  const { data: frameworks = [], isLoading } = useQuery<ComplianceFramework[]>({
    queryKey: ["/api/compliance/frameworks"],
  });

  const reportTypes = [
    {
      id: "compliance",
      title: "Compliance Status Report",
      description: "Comprehensive overview of all compliance frameworks and control implementation status",
      icon: CheckCircle2,
      iconColor: "text-chart-1",
    },
    {
      id: "security",
      title: "Security Events Summary",
      description: "Analysis of security events, alerts, and incidents for the reporting period",
      icon: FileText,
      iconColor: "text-chart-2",
    },
    {
      id: "vulnerability",
      title: "Vulnerability Assessment Report",
      description: "Detailed findings from OWASP ZAP scans and vulnerability remediation status",
      icon: XCircle,
      iconColor: "text-destructive",
    },
    {
      id: "risk",
      title: "Risk Management Report",
      description: "Risk assessment matrix, identified risks, and mitigation strategies",
      icon: Calendar,
      iconColor: "text-chart-5",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Reports</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Generate compliance and security reports
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="p-4 sm:p-6" data-testid={`report-card-${report.id}`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-md shrink-0 ${getReportBgColor(report.id)}`}>
                <report.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${report.iconColor}`} />
              </div>
              <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                <div>
                  <h3 className="text-base sm:text-lg font-medium">{report.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {report.description}
                  </p>
                </div>
                <Button variant="outline" size="sm" data-testid={`button-generate-${report.id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-medium">Framework Reports</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate reports for each framework
          </p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading frameworks...</div>
          ) : frameworks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No compliance frameworks available
            </div>
          ) : (
            frameworks.map((framework) => {
              const completionPercentage =
                (framework.implementedControls / framework.totalControls) * 100;

              return (
                <div
                  key={framework.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-md border border-border p-3 sm:p-4 hover-elevate"
                  data-testid={`framework-report-${framework.id}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h4 className="text-sm font-medium">{framework.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {completionPercentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {framework.implementedControls} / {framework.totalControls} controls
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    data-testid={`button-download-${framework.id}`}
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-medium">Scheduled Reports</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure automated report generation
          </p>
        </div>

        <div className="flex h-40 sm:h-48 items-center justify-center rounded-md border border-dashed">
          <div className="text-center px-4">
            <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            <h4 className="mt-3 sm:mt-4 text-sm font-medium">No Scheduled Reports</h4>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
              Set up automated reports
            </p>
            <Button className="mt-3 sm:mt-4" variant="outline" size="sm" data-testid="button-schedule-report">
              Schedule Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
