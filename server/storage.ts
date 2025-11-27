import {
  SecurityEvent,
  InsertSecurityEvent,
  Alert,
  InsertAlert,
  Incident,
  InsertIncident,
  ComplianceFramework,
  InsertComplianceFramework,
  ComplianceControl,
  InsertComplianceControl,
  RiskAssessment,
  InsertRiskAssessment,
  ZapScan,
  InsertZapScan,
  Vulnerability,
  InsertVulnerability,
  User,
  UpsertUser,
  users,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Security Events
  getSecurityEvents(): Promise<SecurityEvent[]>;
  getSecurityEvent(id: string): Promise<SecurityEvent | undefined>;
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined>;

  // Incidents
  getIncidents(): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined>;

  // Compliance Frameworks
  getComplianceFrameworks(): Promise<ComplianceFramework[]>;
  getComplianceFramework(id: string): Promise<ComplianceFramework | undefined>;
  createComplianceFramework(framework: InsertComplianceFramework): Promise<ComplianceFramework>;

  // Compliance Controls
  getComplianceControls(): Promise<ComplianceControl[]>;
  getComplianceControl(id: string): Promise<ComplianceControl | undefined>;
  createComplianceControl(control: InsertComplianceControl): Promise<ComplianceControl>;

  // Risk Assessments
  getRiskAssessments(): Promise<RiskAssessment[]>;
  getRiskAssessment(id: string): Promise<RiskAssessment | undefined>;
  createRiskAssessment(risk: InsertRiskAssessment): Promise<RiskAssessment>;

  // ZAP Scans
  getZapScans(): Promise<ZapScan[]>;
  getZapScan(id: string): Promise<ZapScan | undefined>;
  createZapScan(scan: InsertZapScan): Promise<ZapScan>;

  // Vulnerabilities
  getVulnerabilities(): Promise<Vulnerability[]>;
  getVulnerability(id: string): Promise<Vulnerability | undefined>;
  createVulnerability(vuln: InsertVulnerability): Promise<Vulnerability>;
}

export class MemStorage implements IStorage {
  private securityEvents: Map<string, SecurityEvent>;
  private alerts: Map<string, Alert>;
  private incidents: Map<string, Incident>;
  private complianceFrameworks: Map<string, ComplianceFramework>;
  private complianceControls: Map<string, ComplianceControl>;
  private riskAssessments: Map<string, RiskAssessment>;
  private zapScans: Map<string, ZapScan>;
  private vulnerabilities: Map<string, Vulnerability>;

  constructor() {
    this.securityEvents = new Map();
    this.alerts = new Map();
    this.incidents = new Map();
    this.complianceFrameworks = new Map();
    this.complianceControls = new Map();
    this.riskAssessments = new Map();
    this.zapScans = new Map();
    this.vulnerabilities = new Map();

    this.seedDemoData();
  }

  // User operations (using PostgreSQL database for auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  private seedDemoData() {
    // Security Events
    const eventTypes = [
      "Intrusion Attempt",
      "Authentication Failure",
      "Malware Detected",
      "Data Exfiltration",
      "Unauthorized Access",
      "Port Scan",
      "DDoS Attack",
      "SQL Injection",
    ];
    const severities = ["Critical", "High", "Medium", "Low", "Info"];
    const sources = [
      "192.168.1.100",
      "10.0.0.50",
      "172.16.0.25",
      "192.168.1.200",
      "10.0.1.75",
    ];

    for (let i = 0; i < 50; i++) {
      const id = randomUUID();
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      this.securityEvents.set(id, {
        id,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        eventType,
        severity,
        source,
        destination: "192.168.1.1",
        user: Math.random() > 0.5 ? `user${Math.floor(Math.random() * 10)}` : null,
        description: `${eventType} detected from ${source}`,
        ipAddress: source,
        details: `Detailed information about ${eventType.toLowerCase()}`,
      });
    }

    // Alerts
    const alertCategories = [
      "Network Security",
      "Access Control",
      "Malware",
      "Data Loss Prevention",
      "Compliance",
    ];

    for (let i = 0; i < 20; i++) {
      const id = randomUUID();
      const severity = severities[Math.floor(Math.random() * 4)];
      const category = alertCategories[Math.floor(Math.random() * alertCategories.length)];
      const statuses = ["Open", "In Progress", "Resolved", "Closed"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      this.alerts.set(id, {
        id,
        title: `${severity} ${category} Alert`,
        severity,
        status,
        category,
        description: `Suspicious activity detected in ${category.toLowerCase()}`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        assignedTo: Math.random() > 0.5 ? "SOC Analyst" : null,
        relatedEventId: null,
      });
    }

    // Incidents
    const incidentCategories = ["Security Breach", "Malware Outbreak", "Data Leak", "Insider Threat"];
    const impactLevels = ["Critical", "High", "Medium", "Low"];

    for (let i = 0; i < 10; i++) {
      const id = randomUUID();
      const severity = severities[Math.floor(Math.random() * 3)];
      const category = incidentCategories[Math.floor(Math.random() * incidentCategories.length)];
      const impactLevel = impactLevels[Math.floor(Math.random() * impactLevels.length)];
      const statuses = ["Open", "In Progress", "Resolved", "Closed"];

      this.incidents.set(id, {
        id,
        title: `${category} - ${severity} Severity`,
        severity,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        category,
        description: `Investigation of ${category.toLowerCase()} incident`,
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        assignedTo: `Incident Response Team ${Math.floor(Math.random() * 3) + 1}`,
        resolvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
        impactLevel,
      });
    }

    // Compliance Frameworks
    const frameworks = [
      {
        name: "NIST Cybersecurity Framework",
        description: "Framework for improving critical infrastructure cybersecurity",
        version: "1.1",
        totalControls: 108,
        implementedControls: 85,
      },
      {
        name: "ISO 27001",
        description: "International standard for information security management systems",
        version: "2013",
        totalControls: 114,
        implementedControls: 95,
      },
      {
        name: "SOC 2",
        description: "Security and availability controls for service organizations",
        version: "Type II",
        totalControls: 64,
        implementedControls: 58,
      },
    ];

    frameworks.forEach((fw) => {
      const id = randomUUID();
      this.complianceFrameworks.set(id, {
        id,
        ...fw,
        lastAuditDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      });
    });

    // Compliance Controls
    const frameworkIds = Array.from(this.complianceFrameworks.keys());
    const controlStatuses = ["Implemented", "In Progress", "Not Started", "Not Applicable"];

    frameworkIds.forEach((frameworkId, idx) => {
      const controlCount = idx === 0 ? 10 : idx === 1 ? 8 : 6;
      for (let i = 0; i < controlCount; i++) {
        const id = randomUUID();
        const status = controlStatuses[Math.floor(Math.random() * controlStatuses.length)];
        
        this.complianceControls.set(id, {
          id,
          frameworkId,
          controlId: `${idx === 0 ? "NIST" : idx === 1 ? "ISO" : "SOC"}-${i + 1}.${Math.floor(Math.random() * 10)}`,
          title: `Control ${i + 1}: Security ${["Policy", "Procedure", "Technical", "Administrative"][Math.floor(Math.random() * 4)]}`,
          description: `Detailed requirements for implementing security control ${i + 1}`,
          status,
          implementationDate: status === "Implemented" ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) : null,
          evidence: status === "Implemented" ? "Security policy documentation, audit logs, configuration files" : null,
          owner: `Security Team ${Math.floor(Math.random() * 3) + 1}`,
        });
      }
    });

    // Risk Assessments
    const riskCategories = [
      "Cybersecurity",
      "Data Privacy",
      "Physical Security",
      "Business Continuity",
      "Third Party",
    ];

    for (let i = 0; i < 15; i++) {
      const id = randomUUID();
      const likelihood = Math.floor(Math.random() * 5) + 1;
      const impact = Math.floor(Math.random() * 5) + 1;
      const riskScore = likelihood * impact;
      const category = riskCategories[Math.floor(Math.random() * riskCategories.length)];

      this.riskAssessments.set(id, {
        id,
        riskName: `${category} Risk ${i + 1}`,
        category,
        likelihood,
        impact,
        riskScore,
        status: riskScore >= 15 ? "Critical" : riskScore >= 10 ? "High" : riskScore >= 6 ? "Medium" : "Low",
        owner: `Risk Manager ${Math.floor(Math.random() * 2) + 1}`,
        mitigationPlan: `Mitigation strategy for ${category.toLowerCase()} risk`,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    // ZAP Scans
    const scanUrls = [
      "https://example.com",
      "https://api.example.com",
      "https://app.example.com",
      "https://admin.example.com",
    ];

    for (let i = 0; i < 8; i++) {
      const id = randomUUID();
      const status = ["Completed", "Running", "Pending"][Math.floor(Math.random() * 3)];
      const criticalCount = Math.floor(Math.random() * 3);
      const highCount = Math.floor(Math.random() * 8);
      const mediumCount = Math.floor(Math.random() * 15);
      const lowCount = Math.floor(Math.random() * 20);
      const infoCount = Math.floor(Math.random() * 30);

      const scan: ZapScan = {
        id,
        targetUrl: scanUrls[Math.floor(Math.random() * scanUrls.length)],
        scanType: ["Quick", "Full", "API"][Math.floor(Math.random() * 3)],
        status,
        startedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        completedAt: status === "Completed" ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        totalVulnerabilities: criticalCount + highCount + mediumCount + lowCount + infoCount,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        infoCount,
      };

      this.zapScans.set(id, scan);

      // Create vulnerabilities for completed scans
      if (status === "Completed") {
        const vulnNames = [
          "SQL Injection",
          "Cross-Site Scripting (XSS)",
          "Insecure Direct Object Reference",
          "Security Misconfiguration",
          "Sensitive Data Exposure",
          "Missing Function Level Access Control",
          "Cross-Site Request Forgery (CSRF)",
          "Using Components with Known Vulnerabilities",
        ];

        const totalVulns = criticalCount + highCount + mediumCount + lowCount;
        for (let j = 0; j < totalVulns; j++) {
          const vulnId = randomUUID();
          let severity: string;
          if (j < criticalCount) severity = "Critical";
          else if (j < criticalCount + highCount) severity = "High";
          else if (j < criticalCount + highCount + mediumCount) severity = "Medium";
          else severity = "Low";

          this.vulnerabilities.set(vulnId, {
            id: vulnId,
            scanId: id,
            name: vulnNames[Math.floor(Math.random() * vulnNames.length)],
            severity,
            riskRating: severity === "Critical" ? "Critical" : severity === "High" ? "High" : "Medium",
            cvssScore: (Math.random() * 4 + (severity === "Critical" ? 7 : severity === "High" ? 5 : 3)).toFixed(1),
            url: `${scan.targetUrl}/endpoint/${Math.floor(Math.random() * 100)}`,
            parameter: Math.random() > 0.5 ? `param${Math.floor(Math.random() * 10)}` : null,
            description: `Vulnerability found in application that could lead to security breach`,
            solution: `Apply security patch and implement input validation`,
            cweId: `CWE-${Math.floor(Math.random() * 900) + 100}`,
            reference: "https://owasp.org/www-community/vulnerabilities/",
          });
        }
      }
    }
  }

  // Security Events
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getSecurityEvent(id: string): Promise<SecurityEvent | undefined> {
    return this.securityEvents.get(id);
  }

  async createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent> {
    const id = randomUUID();
    const newEvent: SecurityEvent = {
      id,
      ...event,
      timestamp: event.timestamp || new Date(),
    };
    this.securityEvents.set(id, newEvent);
    return newEvent;
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const now = new Date();
    const newAlert: Alert = {
      id,
      ...alert,
      createdAt: now,
      updatedAt: now,
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updated = {
      ...alert,
      ...updates,
      updatedAt: new Date(),
    };
    this.alerts.set(id, updated);
    return updated;
  }

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const id = randomUUID();
    const now = new Date();
    const newIncident: Incident = {
      id,
      ...incident,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;

    const updated = {
      ...incident,
      ...updates,
      updatedAt: new Date(),
    };
    this.incidents.set(id, updated);
    return updated;
  }

  // Compliance Frameworks
  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    return Array.from(this.complianceFrameworks.values());
  }

  async getComplianceFramework(id: string): Promise<ComplianceFramework | undefined> {
    return this.complianceFrameworks.get(id);
  }

  async createComplianceFramework(framework: InsertComplianceFramework): Promise<ComplianceFramework> {
    const id = randomUUID();
    const newFramework: ComplianceFramework = { id, ...framework };
    this.complianceFrameworks.set(id, newFramework);
    return newFramework;
  }

  // Compliance Controls
  async getComplianceControls(): Promise<ComplianceControl[]> {
    return Array.from(this.complianceControls.values());
  }

  async getComplianceControl(id: string): Promise<ComplianceControl | undefined> {
    return this.complianceControls.get(id);
  }

  async createComplianceControl(control: InsertComplianceControl): Promise<ComplianceControl> {
    const id = randomUUID();
    const newControl: ComplianceControl = { id, ...control };
    this.complianceControls.set(id, newControl);
    return newControl;
  }

  // Risk Assessments
  async getRiskAssessments(): Promise<RiskAssessment[]> {
    return Array.from(this.riskAssessments.values()).sort(
      (a, b) => b.riskScore - a.riskScore
    );
  }

  async getRiskAssessment(id: string): Promise<RiskAssessment | undefined> {
    return this.riskAssessments.get(id);
  }

  async createRiskAssessment(risk: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = randomUUID();
    const now = new Date();
    const newRisk: RiskAssessment = {
      id,
      ...risk,
      createdAt: now,
      updatedAt: now,
    };
    this.riskAssessments.set(id, newRisk);
    return newRisk;
  }

  // ZAP Scans
  async getZapScans(): Promise<ZapScan[]> {
    return Array.from(this.zapScans.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async getZapScan(id: string): Promise<ZapScan | undefined> {
    return this.zapScans.get(id);
  }

  async createZapScan(scan: InsertZapScan): Promise<ZapScan> {
    const id = randomUUID();
    const newScan: ZapScan = {
      id,
      ...scan,
      startedAt: new Date(),
      completedAt: null,
      totalVulnerabilities: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      infoCount: 0,
    };
    this.zapScans.set(id, newScan);
    return newScan;
  }

  // Vulnerabilities
  async getVulnerabilities(): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values());
  }

  async getVulnerability(id: string): Promise<Vulnerability | undefined> {
    return this.vulnerabilities.get(id);
  }

  async createVulnerability(vuln: InsertVulnerability): Promise<Vulnerability> {
    const id = randomUUID();
    const newVuln: Vulnerability = { id, ...vuln };
    this.vulnerabilities.set(id, newVuln);
    return newVuln;
  }
}

export const storage = new MemStorage();
