import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertSecurityEventSchema,
  insertAlertSchema,
  insertIncidentSchema,
  insertComplianceFrameworkSchema,
  insertComplianceControlSchema,
  insertRiskAssessmentSchema,
  insertZapScanSchema,
  insertVulnerabilitySchema,
  insertComplianceQuestionSchema,
  insertComplianceResponseSchema,
  type SecurityEvent,
} from "@shared/schema";
import OpenAI from "openai";

// Validate AI integration configuration
function isAiConfigured(): boolean {
  return !!(
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL &&
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY
  );
}

// Sanitize AI response - remove dangerous patterns and limit length
// Note: React JSX automatically escapes text content, so we focus on removing
// executable code patterns that could cause issues if content is used elsewhere
function sanitizeAiResponse(response: string | null | undefined, maxLength: number = 8000): string {
  if (!response) {
    return "I apologize, but I was unable to generate a response. Please try again.";
  }
  
  // Limit response length first
  let sanitized = response.slice(0, maxLength);
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[removed script]');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '[removed iframe]');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, 'javascript-blocked:');
  
  // Remove data: URLs with potentially dangerous types
  sanitized = sanitized.replace(/data\s*:\s*(text\/html|application\/javascript)/gi, 'data-blocked:');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(['"])[^'"]*\1/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');
  
  return sanitized;
}

// Initialize OpenAI client using Replit AI Integrations (lazy initialization)
let openai: OpenAI | null = null;

function getOpenAiClient(): OpenAI | null {
  if (!isAiConfigured()) {
    return null;
  }
  if (!openai) {
    openai = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
    });
  }
  return openai;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Security Events
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getSecurityEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch security events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getSecurityEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const data = insertSecurityEventSchema.parse(req.body);
      const event = await storage.createSecurityEvent(data);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // Alerts
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/:id", async (req, res) => {
    try {
      const alert = await storage.getAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alert" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const data = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(data);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, req.body);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  // Incidents
  app.get("/api/incidents", async (_req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  app.get("/api/incidents/:id", async (req, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incident" });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const data = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(data);
      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ error: "Invalid incident data" });
    }
  });

  app.patch("/api/incidents/:id", async (req, res) => {
    try {
      const incident = await storage.updateIncident(req.params.id, req.body);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to update incident" });
    }
  });

  // Compliance Frameworks
  app.get("/api/compliance/frameworks", async (_req, res) => {
    try {
      const frameworks = await storage.getComplianceFrameworks();
      res.json(frameworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance frameworks" });
    }
  });

  app.get("/api/compliance/frameworks/:id", async (req, res) => {
    try {
      const framework = await storage.getComplianceFramework(req.params.id);
      if (!framework) {
        return res.status(404).json({ error: "Framework not found" });
      }
      res.json(framework);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch framework" });
    }
  });

  app.post("/api/compliance/frameworks", async (req, res) => {
    try {
      const data = insertComplianceFrameworkSchema.parse(req.body);
      const framework = await storage.createComplianceFramework(data);
      res.status(201).json(framework);
    } catch (error) {
      res.status(400).json({ error: "Invalid framework data" });
    }
  });

  // Compliance Controls
  app.get("/api/compliance/controls", async (_req, res) => {
    try {
      const controls = await storage.getComplianceControls();
      res.json(controls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance controls" });
    }
  });

  app.get("/api/compliance/controls/:id", async (req, res) => {
    try {
      const control = await storage.getComplianceControl(req.params.id);
      if (!control) {
        return res.status(404).json({ error: "Control not found" });
      }
      res.json(control);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch control" });
    }
  });

  app.post("/api/compliance/controls", async (req, res) => {
    try {
      const data = insertComplianceControlSchema.parse(req.body);
      const control = await storage.createComplianceControl(data);
      res.status(201).json(control);
    } catch (error) {
      res.status(400).json({ error: "Invalid control data" });
    }
  });

  // Risk Assessments
  app.get("/api/risk/assessments", async (_req, res) => {
    try {
      const risks = await storage.getRiskAssessments();
      res.json(risks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk assessments" });
    }
  });

  app.get("/api/risk/assessments/:id", async (req, res) => {
    try {
      const risk = await storage.getRiskAssessment(req.params.id);
      if (!risk) {
        return res.status(404).json({ error: "Risk assessment not found" });
      }
      res.json(risk);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk assessment" });
    }
  });

  app.post("/api/risk/assessments", async (req, res) => {
    try {
      const data = insertRiskAssessmentSchema.parse(req.body);
      const risk = await storage.createRiskAssessment(data);
      res.status(201).json(risk);
    } catch (error) {
      res.status(400).json({ error: "Invalid risk assessment data" });
    }
  });

  // ZAP Scans
  app.get("/api/zap/scans", async (_req, res) => {
    try {
      const scans = await storage.getZapScans();
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ZAP scans" });
    }
  });

  app.get("/api/zap/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getZapScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan" });
    }
  });

  app.post("/api/zap/scans", async (req, res) => {
    try {
      const data = insertZapScanSchema.parse(req.body);
      const scan = await storage.createZapScan(data);
      res.status(201).json(scan);
    } catch (error) {
      res.status(400).json({ error: "Invalid scan data" });
    }
  });

  // Vulnerabilities
  app.get("/api/zap/vulnerabilities", async (_req, res) => {
    try {
      const vulnerabilities = await storage.getVulnerabilities();
      res.json(vulnerabilities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vulnerabilities" });
    }
  });

  app.get("/api/zap/vulnerabilities/:id", async (req, res) => {
    try {
      const vulnerability = await storage.getVulnerability(req.params.id);
      if (!vulnerability) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }
      res.json(vulnerability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vulnerability" });
    }
  });

  app.post("/api/zap/vulnerabilities", async (req, res) => {
    try {
      const data = insertVulnerabilitySchema.parse(req.body);
      const vulnerability = await storage.createVulnerability(data);
      res.status(201).json(vulnerability);
    } catch (error) {
      res.status(400).json({ error: "Invalid vulnerability data" });
    }
  });

  // Compliance Questions
  app.get("/api/compliance/questions", async (_req, res) => {
    try {
      const questions = await storage.getComplianceQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance questions" });
    }
  });

  app.get("/api/compliance/questions/framework/:frameworkId", async (req, res) => {
    try {
      const questions = await storage.getComplianceQuestionsByFramework(req.params.frameworkId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch framework questions" });
    }
  });

  app.get("/api/compliance/questions/:id", async (req, res) => {
    try {
      const question = await storage.getComplianceQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch question" });
    }
  });

  app.post("/api/compliance/questions", async (req, res) => {
    try {
      const data = insertComplianceQuestionSchema.parse(req.body);
      const question = await storage.createComplianceQuestion(data);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ error: "Invalid question data" });
    }
  });

  // Compliance Responses
  app.get("/api/compliance/responses", async (_req, res) => {
    try {
      const responses = await storage.getComplianceResponses();
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance responses" });
    }
  });

  app.get("/api/compliance/responses/framework/:frameworkId", async (req, res) => {
    try {
      const responses = await storage.getComplianceResponsesByFramework(req.params.frameworkId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch framework responses" });
    }
  });

  app.get("/api/compliance/responses/:id", async (req, res) => {
    try {
      const response = await storage.getComplianceResponse(req.params.id);
      if (!response) {
        return res.status(404).json({ error: "Response not found" });
      }
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch response" });
    }
  });

  app.post("/api/compliance/responses", async (req, res) => {
    try {
      const data = insertComplianceResponseSchema.parse(req.body);
      const response = await storage.upsertComplianceResponse(data);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ error: "Invalid response data" });
    }
  });

  app.patch("/api/compliance/responses/:id", async (req, res) => {
    try {
      const response = await storage.updateComplianceResponse(req.params.id, req.body);
      if (!response) {
        return res.status(404).json({ error: "Response not found" });
      }
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to update response" });
    }
  });

  // Update Compliance Control
  app.patch("/api/compliance/controls/:id", async (req, res) => {
    try {
      const control = await storage.updateComplianceControl(req.params.id, req.body);
      if (!control) {
        return res.status(404).json({ error: "Control not found" });
      }
      res.json(control);
    } catch (error) {
      res.status(500).json({ error: "Failed to update control" });
    }
  });

  // Update Compliance Framework
  app.patch("/api/compliance/frameworks/:id", async (req, res) => {
    try {
      const framework = await storage.updateComplianceFramework(req.params.id, req.body);
      if (!framework) {
        return res.status(404).json({ error: "Framework not found" });
      }
      res.json(framework);
    } catch (error) {
      res.status(500).json({ error: "Failed to update framework" });
    }
  });

  // AI Analysis Sessions
  app.get("/api/ai/sessions", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessions = await storage.getAiAnalysisSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching AI sessions:", error);
      res.status(500).json({ error: "Failed to fetch AI sessions" });
    }
  });

  app.get("/api/ai/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getAiAnalysisSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/ai/sessions", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const session = await storage.createAiAnalysisSession({
        userId: userId || null,
        title: req.body.title || "New Analysis Session",
        status: "active",
      });
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating AI session:", error);
      res.status(500).json({ error: "Failed to create AI session" });
    }
  });

  // AI Chat Messages
  app.get("/api/ai/sessions/:sessionId/messages", async (req, res) => {
    try {
      const messages = await storage.getAiChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // AI Chat Analysis Endpoint
  app.post("/api/ai/analyze", async (req: any, res) => {
    try {
      // Check if AI is configured
      const client = getOpenAiClient();
      if (!client) {
        return res.status(503).json({ 
          error: "AI service unavailable",
          message: "The AI integration is not configured. Please ensure OpenAI API credentials are set up in Replit's AI Integrations."
        });
      }

      const { sessionId, message, eventIds, filters } = req.body;
      const userId = req.user?.claims?.sub;

      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      // Get relevant security events for context
      const allEvents = await storage.getSecurityEvents();
      let contextEvents: SecurityEvent[] = [];

      if (eventIds && eventIds.length > 0) {
        contextEvents = allEvents.filter((e) => eventIds.includes(e.id));
      } else if (filters) {
        contextEvents = allEvents.filter((e) => {
          if (filters.severity && e.severity !== filters.severity) return false;
          if (filters.eventType && e.eventType !== filters.eventType) return false;
          if (filters.source && e.source !== filters.source) return false;
          if (filters.category && e.category !== filters.category) return false;
          return true;
        });
        // Limit to most recent 20 for context
        contextEvents = contextEvents.slice(0, 20);
      } else {
        // Get most recent 15 events by default
        contextEvents = allEvents.slice(0, 15);
      }

      // Build context for the AI
      const eventContext = contextEvents.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        eventType: e.eventType,
        severity: e.severity,
        source: e.source,
        destination: e.destination,
        user: e.user,
        description: e.description,
        action: e.action,
        status: e.status,
        category: e.category,
        tactic: e.tactic,
        technique: e.technique,
        ruleName: e.ruleName,
        metadata: e.metadata,
        rawLog: e.rawLog,
      }));

      // Store user message
      await storage.createAiChatMessage({
        sessionId,
        userId: userId || null,
        role: "user",
        content: message,
        context: { eventIds: contextEvents.map((e) => e.id), filters },
      });

      // Build the system prompt for security analysis
      const systemPrompt = `You are an expert SIEM security analyst AI assistant. You help security operations center (SOC) analysts understand and investigate security events, alerts, and incidents.

Your capabilities:
- Analyze security event patterns and identify potential threats
- Explain MITRE ATT&CK tactics and techniques
- Correlate events across different sources to identify attack chains
- Provide threat intelligence insights and recommended response actions
- Explain the significance of specific log entries and network traffic patterns
- Identify false positives and help prioritize alerts
- Suggest investigation steps and remediation strategies

When analyzing events, consider:
- Temporal patterns (timing of events)
- Source/destination relationships
- User behavior anomalies
- Known attack patterns and TTPs
- Network protocol analysis
- Threat severity and business impact

Format your responses clearly with:
- Key findings highlighted
- Risk assessment when relevant
- Actionable recommendations
- References to MITRE ATT&CK when applicable

Current security event context (${contextEvents.length} events):
${JSON.stringify(eventContext, null, 2)}`;

      // Get previous messages for conversation context
      const previousMessages = await storage.getAiChatMessages(sessionId);
      const conversationHistory = previousMessages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Call OpenAI for analysis
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const completion = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message },
        ],
        max_completion_tokens: 4096,
      });

      // Sanitize the AI response to prevent XSS and limit length
      const assistantResponse = sanitizeAiResponse(completion.choices[0]?.message?.content);

      // Store assistant response
      const savedMessage = await storage.createAiChatMessage({
        sessionId,
        userId: userId || null,
        role: "assistant",
        content: assistantResponse,
        context: { eventIds: contextEvents.map((e) => e.id) },
        tokenCount: completion.usage?.total_tokens || 0,
      });

      // Update session title if first message
      if (previousMessages.length === 0) {
        const titleWords = message.split(" ").slice(0, 5).join(" ");
        await storage.updateAiAnalysisSession(sessionId, {
          title: titleWords.length > 30 ? titleWords.substring(0, 30) + "..." : titleWords,
        });
      }

      res.json({
        message: savedMessage,
        eventsAnalyzed: contextEvents.length,
        tokensUsed: completion.usage?.total_tokens || 0,
      });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze security events",
        details: error.message || "Unknown error occurred"
      });
    }
  });

  // Quick AI analysis without session (for one-off questions)
  app.post("/api/ai/quick-analyze", async (req, res) => {
    try {
      // Check if AI is configured
      const client = getOpenAiClient();
      if (!client) {
        return res.status(503).json({ 
          error: "AI service unavailable",
          message: "The AI integration is not configured. Please ensure OpenAI API credentials are set up in Replit's AI Integrations."
        });
      }

      const { question, eventIds } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      // Get relevant security events
      const allEvents = await storage.getSecurityEvents();
      let contextEvents: SecurityEvent[] = [];

      if (eventIds && eventIds.length > 0) {
        contextEvents = allEvents.filter((e) => eventIds.includes(e.id));
      } else {
        // Get most recent 10 events
        contextEvents = allEvents.slice(0, 10);
      }

      const eventContext = contextEvents.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        eventType: e.eventType,
        severity: e.severity,
        source: e.source,
        destination: e.destination,
        description: e.description,
        action: e.action,
        tactic: e.tactic,
        technique: e.technique,
        metadata: e.metadata,
      }));

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const completion = await client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an expert SIEM security analyst. Provide concise, actionable analysis of security events. Current events context:\n${JSON.stringify(eventContext, null, 2)}`,
          },
          { role: "user", content: question },
        ],
        max_completion_tokens: 2048,
      });

      // Sanitize the AI response
      const answer = sanitizeAiResponse(completion.choices[0]?.message?.content);

      res.json({
        answer,
        eventsAnalyzed: contextEvents.length,
      });
    } catch (error: any) {
      console.error("Quick analysis error:", error);
      res.status(500).json({ error: "Failed to analyze", details: error.message });
    }
  });

  return httpServer;
}
