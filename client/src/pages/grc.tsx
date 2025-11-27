import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComplianceFramework, ComplianceControl, ComplianceQuestion, ComplianceResponse } from "@shared/schema";
import { ClipboardCheck, CheckCircle2, Clock, XCircle, Download, FileQuestion, ChevronLeft, ChevronRight, Save, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const getResponseStatusColor = (status: string) => {
  switch (status) {
    case "Compliant":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "Partially Compliant":
      return "bg-chart-5/10 text-chart-5 border-chart-5/20";
    case "Non-Compliant":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "Not Applicable":
      return "bg-muted text-muted-foreground border-muted";
    default:
      return "bg-muted text-muted-foreground border-muted";
  }
};

export default function GRC() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { status: string; response: string; evidence: string }>>({});
  const { toast } = useToast();

  const { data: frameworks = [], isLoading: frameworksLoading, isError: frameworksError } = useQuery<ComplianceFramework[]>({
    queryKey: ["/api/compliance/frameworks"],
  });

  const { data: controls = [], isLoading: controlsLoading, isError: controlsError } = useQuery<ComplianceControl[]>({
    queryKey: ["/api/compliance/controls"],
  });

  const { data: questions = [] } = useQuery<ComplianceQuestion[]>({
    queryKey: ["/api/compliance/questions"],
  });

  const { data: savedResponses = [] } = useQuery<ComplianceResponse[]>({
    queryKey: ["/api/compliance/responses"],
  });

  const submitResponseMutation = useMutation({
    mutationFn: async (data: { questionId: string; frameworkId: string; controlId: string; status: string; response: string; evidence: string }) => {
      return await apiRequest("POST", "/api/compliance/responses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/responses"] });
    },
  });

  const filteredControls = selectedFramework
    ? controls.filter((c) => c.frameworkId === selectedFramework)
    : [];

  const frameworkQuestions = selectedFramework
    ? questions.filter((q) => q.frameworkId === selectedFramework)
    : [];

  const frameworkResponses = selectedFramework
    ? savedResponses.filter((r) => r.frameworkId === selectedFramework)
    : [];

  const selectedFrameworkData = frameworks.find(f => f.id === selectedFramework);

  const currentQuestion = frameworkQuestions[currentQuestionIndex];

  const answeredCount = frameworkQuestions.filter(q => 
    savedResponses.some(r => r.questionId === q.id)
  ).length;

  const questionnaireProgress = frameworkQuestions.length > 0 
    ? (answeredCount / frameworkQuestions.length) * 100 
    : 0;

  const handleStartQuestionnaire = () => {
    if (!selectedFramework) return;
    
    const existingResponses: Record<string, { status: string; response: string; evidence: string }> = {};
    frameworkResponses.forEach(r => {
      existingResponses[r.questionId] = {
        status: r.status,
        response: r.response || "",
        evidence: r.evidence || "",
      };
    });
    setResponses(existingResponses);
    setCurrentQuestionIndex(0);
    setQuestionnaireOpen(true);
  };

  const handleResponseChange = (questionId: string, field: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId] || { status: "", response: "", evidence: "" },
        [field]: value,
      },
    }));
  };

  const handleSaveResponse = async () => {
    if (!currentQuestion || !selectedFramework) return;

    const responseData = responses[currentQuestion.id];
    if (!responseData?.status) {
      toast({
        title: "Status Required",
        description: "Please select a compliance status for this question.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitResponseMutation.mutateAsync({
        questionId: currentQuestion.id,
        frameworkId: selectedFramework,
        controlId: currentQuestion.controlId,
        status: responseData.status,
        response: responseData.response,
        evidence: responseData.evidence,
      });

      toast({
        title: "Response Saved",
        description: "Your compliance response has been saved.",
      });

      if (currentQuestionIndex < frameworkQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteQuestionnaire = () => {
    setQuestionnaireOpen(false);
    toast({
      title: "Questionnaire Complete",
      description: `You have answered ${answeredCount} out of ${frameworkQuestions.length} questions.`,
    });
  };

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

            const fwQuestions = questions.filter(q => q.frameworkId === framework.id);
            const fwResponses = savedResponses.filter(r => r.frameworkId === framework.id);
            const fwAnswered = fwQuestions.filter(q => fwResponses.some(r => r.questionId === q.id)).length;
            const fwProgress = fwQuestions.length > 0 ? (fwAnswered / fwQuestions.length) * 100 : 0;

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
                      <span className="text-muted-foreground">Controls</span>
                      <span className="font-semibold font-mono">
                        {completionPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {framework.implementedControls} / {framework.totalControls} implemented
                      </span>
                    </div>
                  </div>

                  {fwQuestions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Questionnaire</span>
                        <span className="font-semibold font-mono">
                          {fwProgress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={fwProgress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{fwAnswered} / {fwQuestions.length} answered</span>
                        {framework.lastAuditDate && (
                          <span>
                            Audit: {format(new Date(framework.lastAuditDate), "MMM dd")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {selectedFramework && (
        <>
          <Card className="p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">Compliance Questionnaire</h3>
                <p className="text-sm text-muted-foreground">
                  Answer questions to update your compliance standing for {selectedFrameworkData?.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{answeredCount} / {frameworkQuestions.length}</p>
                  <p className="text-xs text-muted-foreground">Questions Answered</p>
                </div>
                <Button 
                  onClick={handleStartQuestionnaire}
                  disabled={frameworkQuestions.length === 0}
                  data-testid="button-start-questionnaire"
                >
                  <FileQuestion className="h-4 w-4 mr-2" />
                  {answeredCount > 0 ? "Continue" : "Start"} Questionnaire
                </Button>
              </div>
            </div>

            {frameworkResponses.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Responses</h4>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {frameworkResponses.slice(0, 5).map((response) => {
                    const question = questions.find(q => q.id === response.questionId);
                    return (
                      <div 
                        key={response.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                      >
                        <Badge className={`text-xs shrink-0 ${getResponseStatusColor(response.status)}`}>
                          {response.status}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{question?.question || "Unknown question"}</p>
                          {response.response && (
                            <p className="text-xs text-muted-foreground truncate mt-1">{response.response}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

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
        </>
      )}

      {!selectedFramework && frameworks.length > 0 && (
        <Card className="p-12">
          <div className="text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Select a Framework</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a compliance framework above to view its controls and complete the questionnaire
            </p>
          </div>
        </Card>
      )}

      <Dialog open={questionnaireOpen} onOpenChange={setQuestionnaireOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              {selectedFrameworkData?.name} Questionnaire
            </DialogTitle>
            <DialogDescription>
              Answer each question to update your compliance standing. Progress is saved automatically.
            </DialogDescription>
          </DialogHeader>

          {currentQuestion && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Question {currentQuestionIndex + 1} of {frameworkQuestions.length}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.category}
                </Badge>
              </div>

              <Progress 
                value={((currentQuestionIndex + 1) / frameworkQuestions.length) * 100} 
                className="h-2" 
              />

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm font-medium mb-2">
                    <span className="text-muted-foreground font-mono mr-2">{currentQuestion.controlId}</span>
                  </p>
                  <p className="text-base">{currentQuestion.question}</p>
                  {currentQuestion.guidance && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{currentQuestion.guidance}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="status">Compliance Status *</Label>
                  <Select
                    value={responses[currentQuestion.id]?.status || ""}
                    onValueChange={(value) => handleResponseChange(currentQuestion.id, "status", value)}
                  >
                    <SelectTrigger id="status" data-testid="select-status">
                      <SelectValue placeholder="Select compliance status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Compliant">Compliant</SelectItem>
                      <SelectItem value="Partially Compliant">Partially Compliant</SelectItem>
                      <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="response">Response / Explanation</Label>
                  <Textarea
                    id="response"
                    placeholder="Describe how your organization addresses this requirement..."
                    value={responses[currentQuestion.id]?.response || ""}
                    onChange={(e) => handleResponseChange(currentQuestion.id, "response", e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-response"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="evidence">Evidence Documentation</Label>
                  <Textarea
                    id="evidence"
                    placeholder="List relevant documentation, policies, or artifacts that demonstrate compliance..."
                    value={responses[currentQuestion.id]?.evidence || ""}
                    onChange={(e) => handleResponseChange(currentQuestion.id, "evidence", e.target.value)}
                    className="min-h-[80px]"
                    data-testid="textarea-evidence"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  data-testid="button-prev-question"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleSaveResponse}
                    disabled={submitResponseMutation.isPending}
                    data-testid="button-save-response"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {submitResponseMutation.isPending ? "Saving..." : "Save"}
                  </Button>

                  {currentQuestionIndex === frameworkQuestions.length - 1 ? (
                    <Button
                      onClick={handleCompleteQuestionnaire}
                      data-testid="button-complete-questionnaire"
                    >
                      Complete
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      data-testid="button-next-question"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {frameworkQuestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No questions available for this framework.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
