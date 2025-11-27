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
} from "@shared/schema";

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

  return httpServer;
}
