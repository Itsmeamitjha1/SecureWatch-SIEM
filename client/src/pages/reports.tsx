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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate compliance and security reports
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="p-6" data-testid={`report-card-${report.id}`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-md ${getReportBgColor(report.id)}`}>
                <report.icon className={`h-6 w-6 ${report.iconColor}`} />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-medium">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {report.description}
                  </p>
                </div>
                <Button variant="outline" size="default" data-testid={`button-generate-${report.id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Compliance Framework Reports</h3>
          <p className="text-sm text-muted-foreground">
            Generate detailed reports for each compliance framework
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
                  className="flex items-center justify-between gap-4 rounded-md border border-border p-4 hover-elevate"
                  data-testid={`framework-report-${framework.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-medium">{framework.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {completionPercentage.toFixed(0)}% Complete
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {framework.implementedControls} of {framework.totalControls} controls implemented
                        {framework.lastAuditDate && (
                          <span className="ml-2">
                            • Last audit: {format(new Date(framework.lastAuditDate), "MMM dd, yyyy")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    data-testid={`button-download-${framework.id}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">
            Configure automated report generation and distribution
          </p>
        </div>

        <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h4 className="mt-4 text-sm font-medium">No Scheduled Reports</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Set up automated reports to receive regular updates
            </p>
            <Button className="mt-4" variant="outline" data-testid="button-schedule-report">
              Schedule Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
