import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ComplianceFramework, ComplianceControl } from "@shared/schema";
import { ClipboardCheck, CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Implemented":
      return "text-green-600";
    case "In Progress":
      return "text-chart-5";
    case "Not Started":
      return "text-muted-foreground";
    case "Not Applicable":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Implemented":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "In Progress":
      return <Clock className="h-4 w-4 text-chart-5" />;
    case "Not Started":
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    default:
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function GRC() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);

  const { data: frameworks = [], isLoading: frameworksLoading, isError: frameworksError } = useQuery<ComplianceFramework[]>({
    queryKey: ["/api/compliance/frameworks"],
  });

  const { data: controls = [], isLoading: controlsLoading, isError: controlsError } = useQuery<ComplianceControl[]>({
    queryKey: ["/api/compliance/controls"],
    enabled: !!selectedFramework,
  });

  if (frameworksLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading compliance frameworks...</p>
        </div>
      </div>
    );
  }

  if (frameworksError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error Loading Frameworks</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load compliance frameworks. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const filteredControls = selectedFramework
    ? controls.filter((c) => c.frameworkId === selectedFramework)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">GRC Compliance</h1>
        <p className="text-sm text-muted-foreground">
          Governance, Risk, and Compliance management
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {frameworks.length === 0 ? (
          <Card className="p-6 col-span-3">
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">No compliance frameworks available</p>
            </div>
          </Card>
        ) : (
          frameworks.map((framework) => {
            const completionPercentage =
              (framework.implementedControls / framework.totalControls) * 100;

            return (
              <Card
                key={framework.id}
                className={`p-6 hover-elevate cursor-pointer ${
                  selectedFramework === framework.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedFramework(framework.id)}
                data-testid={`framework-card-${framework.id}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {framework.version || "v1.0"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{framework.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {framework.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-semibold font-mono">
                        {completionPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {framework.implementedControls} / {framework.totalControls} controls
                      </span>
                      {framework.lastAuditDate && (
                        <span>
                          Last audit: {format(new Date(framework.lastAuditDate), "MMM dd, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {selectedFramework && (
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Compliance Controls</h3>
              <p className="text-sm text-muted-foreground">
                Detailed control implementation status
              </p>
            </div>
            <Button variant="outline" size="default" data-testid="button-export-report">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {controlsLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="mx-auto h-8 w-8 animate-pulse text-muted-foreground mb-2" />
              <p className="text-sm">Loading controls...</p>
            </div>
          ) : controlsError ? (
            <div className="text-center text-destructive py-8">
              <p className="text-sm">Error loading controls</p>
            </div>
          ) : filteredControls.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No controls found for this framework
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {filteredControls.map((control) => (
                <AccordionItem
                  key={control.id}
                  value={control.id}
                  className="rounded-md border border-border px-4"
                  data-testid={`control-item-${control.id}`}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 flex-1 text-left">
                      {getStatusIcon(control.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-muted-foreground">
                            {control.controlId}
                          </span>
                          <span className="text-sm font-medium">{control.title}</span>
                        </div>
                      </div>
                      <Badge
                        variant={control.status === "Implemented" ? "secondary" : "secondary"}
                        className={`text-xs ${getStatusColor(control.status)}`}
                      >
                        {control.status}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Description</p>
                        <p className="text-sm text-muted-foreground">{control.description}</p>
                      </div>

                      {control.owner && (
                        <div>
                          <p className="text-sm font-medium mb-1">Owner</p>
                          <p className="text-sm text-muted-foreground">{control.owner}</p>
                        </div>
                      )}

                      {control.implementationDate && (
                        <div>
                          <p className="text-sm font-medium mb-1">Implementation Date</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(control.implementationDate), "MMMM dd, yyyy")}
                          </p>
                        </div>
                      )}

                      {control.evidence && (
                        <div>
                          <p className="text-sm font-medium mb-2">Evidence</p>
                          <div className="rounded-md bg-muted p-3">
                            <p className="text-sm text-muted-foreground">{control.evidence}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Card>
      )}

      {!selectedFramework && frameworks.length > 0 && (
        <Card className="p-12">
          <div className="text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Select a Framework</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a compliance framework above to view its controls
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
