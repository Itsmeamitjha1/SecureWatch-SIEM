import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AiChatMessage, AiAnalysisSession, SecurityEvent } from "@shared/schema";
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Filter,
  Loader2,
  Clock,
  Shield,
  AlertTriangle,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

export default function AiAnalysis() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<AiAnalysisSession[]>({
    queryKey: ["/api/ai/sessions"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<AiChatMessage[]>({
    queryKey: ["/api/ai/sessions", currentSessionId, "messages"],
    enabled: !!currentSessionId,
  });

  const { data: events = [] } = useQuery<SecurityEvent[]>({
    queryKey: ["/api/events"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/sessions", { title: "New Analysis Session" });
      return res.json();
    },
    onSuccess: (session: AiAnalysisSession) => {
      setCurrentSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/sessions"] });
    },
  });

  const [aiError, setAiError] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId: string }) => {
      const filters: Record<string, string> = {};
      if (selectedSeverity !== "all") filters.severity = selectedSeverity;
      if (selectedEventType !== "all") filters.eventType = selectedEventType;

      const res = await apiRequest("POST", "/api/ai/analyze", {
        message,
        sessionId,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 503) {
          throw new Error(errorData.message || "AI service is currently unavailable");
        }
        throw new Error(errorData.error || "Failed to analyze");
      }
      
      return res.json();
    },
    onSuccess: () => {
      setAiError(null);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/sessions", currentSessionId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/sessions"] });
    },
    onError: (error: Error) => {
      setAiError(error.message);
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    let sessionId = currentSessionId;

    if (!sessionId) {
      const newSession = await createSessionMutation.mutateAsync();
      sessionId = newSession.id;
    }

    setInputMessage("");
    await analyzeMutation.mutateAsync({ message: inputMessage, sessionId: sessionId! });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewSession = async () => {
    await createSessionMutation.mutateAsync();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const eventTypes = Array.from(new Set(events.map((e) => e.eventType)));

  const formatMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-foreground mb-2">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={i} className="ml-4 text-sm text-muted-foreground">
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-sm text-muted-foreground mb-1">
          {line}
        </p>
      );
    });
  };

  const [showSessions, setShowSessions] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          AI Security Analyst
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Ask questions about security events and get AI-powered insights
        </p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0">
        <Card className={`md:w-64 shrink-0 flex flex-col ${showSessions ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 border-b">
            <Button
              onClick={startNewSession}
              className="w-full"
              disabled={createSessionMutation.isPending}
              data-testid="button-new-session"
            >
              {createSessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              New Analysis
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sessionsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No sessions yet</p>
                  <p className="text-xs">Start a new analysis</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentSessionId(session.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors hover-elevate ${
                      currentSessionId === session.id
                        ? "bg-primary/10 border border-primary/20"
                        : ""
                    }`}
                    data-testid={`session-${session.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="flex-1 flex flex-col min-w-0">
          <div className="p-3 sm:p-4 border-b flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setShowSessions(!showSessions)}
                data-testid="button-toggle-sessions"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate">
                {currentSessionId
                  ? sessions.find((s) => s.id === currentSessionId)?.title || "Analysis"
                  : "New Analysis"}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 px-2 sm:px-3"
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Filters</span>
                {showFilters ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
              {currentSessionId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/ai/sessions", currentSessionId, "messages"] })}
                  data-testid="button-refresh-messages"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="p-3 sm:p-4 border-b bg-muted/30">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground">Filter by:</span>
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger className="w-28 sm:w-36 h-8" data-testid="select-severity-filter">
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
                  <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                    <SelectTrigger className="w-28 sm:w-36 h-8" data-testid="select-type-filter">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(selectedSeverity !== "all" || selectedEventType !== "all") && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Target className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 p-4">
            {messagesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Bot className="h-16 w-16 text-primary/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Security Analyst</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  I can help you analyze security events, identify threats, explain MITRE ATT&CK
                  techniques, and provide actionable recommendations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                  <button
                    onClick={() => setInputMessage("What are the most critical security events?")}
                    className="p-3 text-left rounded-lg border hover-elevate"
                    data-testid="button-suggestion-critical"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive mb-2" />
                    <p className="text-sm font-medium">Critical Events</p>
                    <p className="text-xs text-muted-foreground">Analyze high-priority threats</p>
                  </button>
                  <button
                    onClick={() => setInputMessage("Are there any suspicious patterns in recent events?")}
                    className="p-3 text-left rounded-lg border hover-elevate"
                    data-testid="button-suggestion-patterns"
                  >
                    <Shield className="h-4 w-4 text-primary mb-2" />
                    <p className="text-sm font-medium">Pattern Analysis</p>
                    <p className="text-xs text-muted-foreground">Identify attack patterns</p>
                  </button>
                  <button
                    onClick={() => setInputMessage("Explain the MITRE ATT&CK techniques detected")}
                    className="p-3 text-left rounded-lg border hover-elevate"
                    data-testid="button-suggestion-mitre"
                  >
                    <Target className="h-4 w-4 text-orange-500 mb-2" />
                    <p className="text-sm font-medium">MITRE ATT&CK</p>
                    <p className="text-xs text-muted-foreground">Understand threat tactics</p>
                  </button>
                  <button
                    onClick={() => setInputMessage("What remediation actions should I take?")}
                    className="p-3 text-left rounded-lg border hover-elevate"
                    data-testid="button-suggestion-remediation"
                  >
                    <Sparkles className="h-4 w-4 text-green-500 mb-2" />
                    <p className="text-sm font-medium">Recommendations</p>
                    <p className="text-xs text-muted-foreground">Get response guidance</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                      data-testid={`message-${msg.id}`}
                    >
                      {msg.role === "user" ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {formatMessageContent(msg.content)}
                        </div>
                      )}
                      <div
                        className={`mt-2 flex items-center gap-2 text-xs ${
                          msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {format(new Date(msg.timestamp), "h:mm a")}
                        {msg.tokenCount && msg.role === "assistant" && (
                          <>
                            <Separator orientation="vertical" className="h-3" />
                            <span>{msg.tokenCount} tokens</span>
                          </>
                        )}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about security events, threats, or get recommendations..."
                disabled={analyzeMutation.isPending}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || analyzeMutation.isPending}
                data-testid="button-send-message"
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {(analyzeMutation.isError || aiError) && (
              <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive">
                  {aiError || "Failed to send message. Please try again."}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
