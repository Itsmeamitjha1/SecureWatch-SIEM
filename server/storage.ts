import {
  SecurityEvent,
  InsertSecurityEvent,
  SecurityEventMetadata,
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
  ComplianceQuestion,
  InsertComplianceQuestion,
  ComplianceResponse,
  InsertComplianceResponse,
  AiChatMessage,
  InsertAiChatMessage,
  AiAnalysisSession,
  InsertAiAnalysisSession,
  User,
  UpsertUser,
  users,
  aiChatMessages,
  aiAnalysisSessions,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
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

  // Compliance Questions
  getComplianceQuestions(): Promise<ComplianceQuestion[]>;
  getComplianceQuestionsByFramework(frameworkId: string): Promise<ComplianceQuestion[]>;
  getComplianceQuestion(id: string): Promise<ComplianceQuestion | undefined>;
  createComplianceQuestion(question: InsertComplianceQuestion): Promise<ComplianceQuestion>;

  // Compliance Responses
  getComplianceResponses(): Promise<ComplianceResponse[]>;
  getComplianceResponsesByFramework(frameworkId: string): Promise<ComplianceResponse[]>;
  getComplianceResponse(id: string): Promise<ComplianceResponse | undefined>;
  createComplianceResponse(response: InsertComplianceResponse): Promise<ComplianceResponse>;
  updateComplianceResponse(id: string, updates: Partial<ComplianceResponse>): Promise<ComplianceResponse | undefined>;
  upsertComplianceResponse(response: InsertComplianceResponse): Promise<ComplianceResponse>;

  // Control update
  updateComplianceControl(id: string, updates: Partial<ComplianceControl>): Promise<ComplianceControl | undefined>;
  updateComplianceFramework(id: string, updates: Partial<ComplianceFramework>): Promise<ComplianceFramework | undefined>;

  // AI Chat
  getAiChatMessages(sessionId: string): Promise<AiChatMessage[]>;
  createAiChatMessage(message: InsertAiChatMessage): Promise<AiChatMessage>;
  getAiAnalysisSessions(userId?: string): Promise<AiAnalysisSession[]>;
  getAiAnalysisSession(id: string): Promise<AiAnalysisSession | undefined>;
  createAiAnalysisSession(session: InsertAiAnalysisSession): Promise<AiAnalysisSession>;
  updateAiAnalysisSession(id: string, updates: Partial<AiAnalysisSession>): Promise<AiAnalysisSession | undefined>;
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
  private complianceQuestions: Map<string, ComplianceQuestion>;
  private complianceResponses: Map<string, ComplianceResponse>;
  private aiChatMessagesMap: Map<string, AiChatMessage>;
  private aiAnalysisSessionsMap: Map<string, AiAnalysisSession>;

  constructor() {
    this.securityEvents = new Map();
    this.alerts = new Map();
    this.incidents = new Map();
    this.complianceFrameworks = new Map();
    this.complianceControls = new Map();
    this.riskAssessments = new Map();
    this.zapScans = new Map();
    this.vulnerabilities = new Map();
    this.complianceQuestions = new Map();
    this.complianceResponses = new Map();
    this.aiChatMessagesMap = new Map();
    this.aiAnalysisSessionsMap = new Map();

    this.seedDemoData();
  }

  // User operations (using PostgreSQL database for auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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
    // Security Events with enhanced detailed logging
    const eventTypes = [
      "Intrusion Attempt",
      "Authentication Failure",
      "Malware Detected",
      "Data Exfiltration",
      "Unauthorized Access",
      "Port Scan",
      "DDoS Attack",
      "SQL Injection",
      "Brute Force Attack",
      "Privilege Escalation",
      "Lateral Movement",
      "Command and Control",
    ];
    const severities = ["Critical", "High", "Medium", "Low", "Info"];
    const sources = [
      "192.168.1.100",
      "10.0.0.50",
      "172.16.0.25",
      "192.168.1.200",
      "10.0.1.75",
      "203.0.113.42",
      "198.51.100.78",
    ];
    const destinations = [
      "192.168.1.1",
      "10.0.0.1",
      "172.16.0.1",
      "192.168.1.50",
    ];
    const categories = ["Network", "Authentication", "Malware", "Data Security", "Access Control", "Application"];
    const actions = ["Block", "Allow", "Alert", "Quarantine", "Deny", "Drop"];
    const statuses = ["Success", "Failure", "Pending", "Blocked"];
    const tactics = ["Initial Access", "Execution", "Persistence", "Privilege Escalation", "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement", "Collection", "Exfiltration", "Command and Control"];
    const techniques = ["T1566", "T1059", "T1053", "T1055", "T1027", "T1110", "T1083", "T1021", "T1119", "T1048", "T1071"];
    const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "SSH", "FTP", "DNS", "SMTP", "RDP"];
    const countries = ["United States", "Russia", "China", "Germany", "Brazil", "United Kingdom", "Netherlands", "France"];
    const cities = ["New York", "Moscow", "Beijing", "Berlin", "Sao Paulo", "London", "Amsterdam", "Paris"];
    const hostnames = ["web-server-01", "db-server-02", "app-server-03", "mail-server-01", "file-server-02", "workstation-045", "workstation-089"];
    const osTypes = ["Windows Server 2019", "Ubuntu 22.04", "CentOS 8", "Windows 10", "macOS Ventura"];
    const ruleNames = ["Suspicious Outbound Traffic", "Failed Login Threshold", "Malware Signature Match", "Data Loss Prevention", "Anomalous Network Activity", "Unauthorized Access Attempt"];

    for (let i = 0; i < 75; i++) {
      const id = randomUUID();
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const tactic = tactics[Math.floor(Math.random() * tactics.length)];
      const technique = techniques[Math.floor(Math.random() * techniques.length)];
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const ruleName = ruleNames[Math.floor(Math.random() * ruleNames.length)];
      const hostname = hostnames[Math.floor(Math.random() * hostnames.length)];
      const os = osTypes[Math.floor(Math.random() * osTypes.length)];

      // Build enhanced metadata
      const metadata: SecurityEventMetadata = {
        protocol,
        sourcePort: Math.floor(Math.random() * 65535),
        destinationPort: [22, 80, 443, 3389, 445, 21, 25, 53, 3306, 5432][Math.floor(Math.random() * 10)],
        bytesIn: Math.floor(Math.random() * 100000),
        bytesOut: Math.floor(Math.random() * 50000),
        packetsIn: Math.floor(Math.random() * 1000),
        packetsOut: Math.floor(Math.random() * 500),
        duration: Math.floor(Math.random() * 3600),
        threatScore: severity === "Critical" ? 90 + Math.floor(Math.random() * 10) : 
                     severity === "High" ? 70 + Math.floor(Math.random() * 20) :
                     severity === "Medium" ? 40 + Math.floor(Math.random() * 30) :
                     Math.floor(Math.random() * 40),
        threatCategory: eventType.includes("Malware") ? "Malware" : 
                       eventType.includes("Injection") ? "Web Attack" :
                       eventType.includes("Authentication") ? "Credential Attack" : "Suspicious Activity",
        sourceCountry: countries[Math.floor(Math.random() * countries.length)],
        sourceCity: cities[Math.floor(Math.random() * cities.length)],
        destinationCountry: "United States",
        destinationCity: "New York",
        hostName: hostname,
        hostOs: os,
        mitreTechnique: technique,
        tags: [category.toLowerCase(), severity.toLowerCase(), action.toLowerCase()],
        deviceVendor: ["Cisco", "Palo Alto", "Fortinet", "CrowdStrike", "SentinelOne"][Math.floor(Math.random() * 5)],
        deviceProduct: ["Firewall", "EDR", "IDS", "SIEM", "WAF"][Math.floor(Math.random() * 5)],
      };

      // Add auth-specific metadata for authentication events
      if (eventType.includes("Authentication") || eventType.includes("Access")) {
        metadata.authMethod = ["Password", "MFA", "SSO", "Certificate", "API Key"][Math.floor(Math.random() * 5)];
        metadata.authResult = status === "Success" ? "Success" : "Failure";
        metadata.sessionId = randomUUID().substring(0, 8);
      }

      // Add file metadata for malware events
      if (eventType.includes("Malware") || eventType.includes("Data")) {
        metadata.fileName = ["invoice.pdf.exe", "report.docx", "setup.exe", "document.js", "payload.dll"][Math.floor(Math.random() * 5)];
        metadata.filePath = `C:\\Users\\${hostname}\\Downloads\\`;
        metadata.fileHash = randomUUID().replace(/-/g, "");
        metadata.fileSize = Math.floor(Math.random() * 10000000);
      }

      // Add HTTP metadata for web attacks
      if (eventType.includes("Injection") || eventType.includes("Exfiltration")) {
        metadata.httpMethod = ["GET", "POST", "PUT", "DELETE"][Math.floor(Math.random() * 4)];
        metadata.httpStatusCode = [200, 401, 403, 404, 500][Math.floor(Math.random() * 5)];
        metadata.url = `/api/v1/${["users", "data", "admin", "config", "export"][Math.floor(Math.random() * 5)]}`;
        metadata.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
      }

      // Generate realistic raw log
      const rawLog = `${new Date().toISOString()} ${hostname} ${metadata.deviceProduct || "SIEM"}: [${severity}] ${eventType} - src=${source}:${metadata.sourcePort} dst=${destination}:${metadata.destinationPort} proto=${protocol} action=${action} rule="${ruleName}" user=${Math.random() > 0.5 ? `user${Math.floor(Math.random() * 10)}` : "-"} msg="${eventType} detected from ${source}"`;
      
      this.securityEvents.set(id, {
        id,
        timestamp: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000), // Last 3 days
        eventType,
        severity,
        source,
        destination,
        user: Math.random() > 0.5 ? `user${Math.floor(Math.random() * 10)}` : null,
        description: `${eventType} detected from ${source} targeting ${destination}`,
        ipAddress: source,
        details: `Detected ${eventType.toLowerCase()} activity. Threat score: ${metadata.threatScore}. ${metadata.threatCategory} attack pattern identified.`,
        action,
        status,
        category,
        ruleId: `RULE-${Math.floor(Math.random() * 9000) + 1000}`,
        ruleName,
        tactic,
        technique,
        rawLog,
        metadata,
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

    // Seed Compliance Questions for each framework
    this.seedComplianceQuestions();
  }

  private seedComplianceQuestions() {
    const frameworkIds = Array.from(this.complianceFrameworks.keys());
    const frameworkNames = Array.from(this.complianceFrameworks.values()).map(f => f.name);

    // NIST Cybersecurity Framework Questions
    const nistQuestions = [
      { category: "Identify", question: "Does your organization maintain an inventory of all hardware assets?", guidance: "Maintain a complete and accurate inventory of physical devices, systems, platforms, and applications." },
      { category: "Identify", question: "Is there a process for identifying and documenting data flows?", guidance: "Document how data moves through the organization, including external data sharing." },
      { category: "Identify", question: "Are asset vulnerabilities identified and documented?", guidance: "Implement vulnerability scanning and maintain vulnerability documentation." },
      { category: "Protect", question: "Is access to systems and assets managed through identity management?", guidance: "Implement identity management including unique user IDs and authentication." },
      { category: "Protect", question: "Is sensitive data encrypted at rest and in transit?", guidance: "Use encryption for data protection aligned with organizational policies." },
      { category: "Protect", question: "Are security awareness training programs implemented for all personnel?", guidance: "Conduct regular security awareness training for all employees." },
      { category: "Detect", question: "Is continuous security monitoring implemented?", guidance: "Monitor the network and physical environment to detect security events." },
      { category: "Detect", question: "Are anomalies and events detected and analyzed?", guidance: "Implement detection processes for anomalous activity." },
      { category: "Respond", question: "Is there an incident response plan in place?", guidance: "Maintain an incident response plan that is tested and updated regularly." },
      { category: "Respond", question: "Are incident response activities coordinated with stakeholders?", guidance: "Coordinate response activities with internal and external stakeholders." },
      { category: "Recover", question: "Is there a recovery plan in place for cybersecurity incidents?", guidance: "Maintain and test a recovery plan for restoring systems and data." },
      { category: "Recover", question: "Are lessons learned incorporated into future response planning?", guidance: "Incorporate lessons learned into recovery strategy improvements." },
    ];

    // ISO 27001 Questions
    const isoQuestions = [
      { category: "Information Security Policies", question: "Are information security policies defined and approved by management?", guidance: "A set of policies for information security shall be defined and approved by management." },
      { category: "Information Security Policies", question: "Are security policies reviewed at planned intervals?", guidance: "Policies shall be reviewed at planned intervals or when significant changes occur." },
      { category: "Organization of Information Security", question: "Are information security responsibilities defined and allocated?", guidance: "All information security responsibilities shall be defined and allocated." },
      { category: "Human Resource Security", question: "Are background verification checks conducted on candidates?", guidance: "Background verification checks shall be carried out on all candidates for employment." },
      { category: "Human Resource Security", question: "Do employees receive security awareness education and training?", guidance: "All employees shall receive appropriate awareness education and training." },
      { category: "Asset Management", question: "Are assets associated with information identified and inventoried?", guidance: "Assets associated with information and processing facilities shall be identified." },
      { category: "Access Control", question: "Is there an access control policy based on business requirements?", guidance: "An access control policy shall be established based on business and security requirements." },
      { category: "Access Control", question: "Is user access provisioned through a formal registration process?", guidance: "A formal user registration and de-registration process shall be implemented." },
      { category: "Cryptography", question: "Is there a policy on the use of cryptographic controls?", guidance: "A policy on the use of cryptographic controls shall be developed and implemented." },
      { category: "Operations Security", question: "Are operating procedures documented and available?", guidance: "Operating procedures shall be documented and made available to all users who need them." },
      { category: "Communications Security", question: "Are networks managed and controlled to protect information?", guidance: "Networks shall be managed and controlled to protect information in systems." },
      { category: "Incident Management", question: "Are information security events reported through appropriate channels?", guidance: "Information security events shall be reported through appropriate management channels." },
    ];

    // SOC 2 Questions
    const socQuestions = [
      { category: "Security", question: "Are logical and physical access controls implemented?", guidance: "The entity implements logical access security software, infrastructure, and architectures." },
      { category: "Security", question: "Is there a process for system account management?", guidance: "New internal and external users are registered and authorized prior to being issued system credentials." },
      { category: "Security", question: "Are system components protected against malicious software?", guidance: "The entity implements controls to prevent or detect and act upon the introduction of unauthorized software." },
      { category: "Availability", question: "Is system availability monitored against commitments?", guidance: "The entity monitors system capacity and performance against commitments." },
      { category: "Availability", question: "Are backup and recovery procedures tested?", guidance: "The entity tests backup and restoration procedures to verify they meet the entity's objectives." },
      { category: "Availability", question: "Is there a business continuity plan in place?", guidance: "The entity implements a business continuity plan to ensure continued service." },
      { category: "Processing Integrity", question: "Are data processing inputs validated for completeness?", guidance: "Data received for processing is validated to be complete and accurate." },
      { category: "Processing Integrity", question: "Is processing monitored for errors and exceptions?", guidance: "Processing is monitored to ensure operations are complete and accurate." },
      { category: "Confidentiality", question: "Is confidential information identified and classified?", guidance: "Confidential information is identified and the entity confirms the identity of users." },
      { category: "Confidentiality", question: "Is confidential information disposed of securely?", guidance: "Confidential information is disposed of securely when no longer needed." },
      { category: "Privacy", question: "Is personal information collected only for identified purposes?", guidance: "The entity collects personal information only for the purposes identified in its privacy notice." },
      { category: "Privacy", question: "Is personal information retained only as long as necessary?", guidance: "The entity retains personal information for only as long as necessary to fulfill the stated purposes." },
    ];

    // Get framework IDs by name
    const nistFrameworkId = frameworkIds[frameworkNames.findIndex(n => n.includes("NIST"))];
    const isoFrameworkId = frameworkIds[frameworkNames.findIndex(n => n.includes("ISO"))];
    const socFrameworkId = frameworkIds[frameworkNames.findIndex(n => n.includes("SOC"))];

    // Seed NIST questions
    if (nistFrameworkId) {
      nistQuestions.forEach((q, idx) => {
        const id = randomUUID();
        this.complianceQuestions.set(id, {
          id,
          frameworkId: nistFrameworkId,
          controlId: `NIST-${q.category.substring(0, 2).toUpperCase()}-${idx + 1}`,
          questionNumber: idx + 1,
          question: q.question,
          category: q.category,
          guidance: q.guidance,
          evidenceRequired: true,
        });
      });
    }

    // Seed ISO questions
    if (isoFrameworkId) {
      isoQuestions.forEach((q, idx) => {
        const id = randomUUID();
        this.complianceQuestions.set(id, {
          id,
          frameworkId: isoFrameworkId,
          controlId: `ISO-A.${Math.floor(idx / 2) + 5}.${(idx % 2) + 1}`,
          questionNumber: idx + 1,
          question: q.question,
          category: q.category,
          guidance: q.guidance,
          evidenceRequired: true,
        });
      });
    }

    // Seed SOC 2 questions
    if (socFrameworkId) {
      socQuestions.forEach((q, idx) => {
        const id = randomUUID();
        this.complianceQuestions.set(id, {
          id,
          frameworkId: socFrameworkId,
          controlId: `SOC-${q.category.substring(0, 2).toUpperCase()}-${idx + 1}`,
          questionNumber: idx + 1,
          question: q.question,
          category: q.category,
          guidance: q.guidance,
          evidenceRequired: true,
        });
      });
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

  // Compliance Questions
  async getComplianceQuestions(): Promise<ComplianceQuestion[]> {
    return Array.from(this.complianceQuestions.values()).sort(
      (a, b) => a.questionNumber - b.questionNumber
    );
  }

  async getComplianceQuestionsByFramework(frameworkId: string): Promise<ComplianceQuestion[]> {
    return Array.from(this.complianceQuestions.values())
      .filter(q => q.frameworkId === frameworkId)
      .sort((a, b) => a.questionNumber - b.questionNumber);
  }

  async getComplianceQuestion(id: string): Promise<ComplianceQuestion | undefined> {
    return this.complianceQuestions.get(id);
  }

  async createComplianceQuestion(question: InsertComplianceQuestion): Promise<ComplianceQuestion> {
    const id = randomUUID();
    const newQuestion: ComplianceQuestion = { id, ...question };
    this.complianceQuestions.set(id, newQuestion);
    return newQuestion;
  }

  // Compliance Responses
  async getComplianceResponses(): Promise<ComplianceResponse[]> {
    return Array.from(this.complianceResponses.values());
  }

  async getComplianceResponsesByFramework(frameworkId: string): Promise<ComplianceResponse[]> {
    return Array.from(this.complianceResponses.values())
      .filter(r => r.frameworkId === frameworkId);
  }

  async getComplianceResponse(id: string): Promise<ComplianceResponse | undefined> {
    return this.complianceResponses.get(id);
  }

  async createComplianceResponse(response: InsertComplianceResponse): Promise<ComplianceResponse> {
    const id = randomUUID();
    const newResponse: ComplianceResponse = {
      id,
      ...response,
      updatedAt: new Date(),
    };
    this.complianceResponses.set(id, newResponse);
    return newResponse;
  }

  async updateComplianceResponse(id: string, updates: Partial<ComplianceResponse>): Promise<ComplianceResponse | undefined> {
    const response = this.complianceResponses.get(id);
    if (!response) return undefined;

    const updated = {
      ...response,
      ...updates,
      updatedAt: new Date(),
    };
    this.complianceResponses.set(id, updated);
    return updated;
  }

  async upsertComplianceResponse(response: InsertComplianceResponse): Promise<ComplianceResponse> {
    // Find existing response by questionId
    const existing = Array.from(this.complianceResponses.values())
      .find(r => r.questionId === response.questionId);
    
    if (existing) {
      return this.updateComplianceResponse(existing.id, response) as Promise<ComplianceResponse>;
    }
    return this.createComplianceResponse(response);
  }

  // Update Compliance Control
  async updateComplianceControl(id: string, updates: Partial<ComplianceControl>): Promise<ComplianceControl | undefined> {
    const control = this.complianceControls.get(id);
    if (!control) return undefined;

    const updated = { ...control, ...updates };
    this.complianceControls.set(id, updated);
    return updated;
  }

  // Update Compliance Framework
  async updateComplianceFramework(id: string, updates: Partial<ComplianceFramework>): Promise<ComplianceFramework | undefined> {
    const framework = this.complianceFrameworks.get(id);
    if (!framework) return undefined;

    const updated = { ...framework, ...updates };
    this.complianceFrameworks.set(id, updated);
    return updated;
  }

  // AI Chat Messages - using PostgreSQL for persistence
  async getAiChatMessages(sessionId: string): Promise<AiChatMessage[]> {
    try {
      const messages = await db
        .select()
        .from(aiChatMessages)
        .where(eq(aiChatMessages.sessionId, sessionId))
        .orderBy(aiChatMessages.timestamp);
      return messages;
    } catch {
      return [];
    }
  }

  async createAiChatMessage(message: InsertAiChatMessage): Promise<AiChatMessage> {
    const [newMessage] = await db
      .insert(aiChatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // AI Analysis Sessions - using PostgreSQL for persistence
  async getAiAnalysisSessions(userId?: string): Promise<AiAnalysisSession[]> {
    try {
      if (userId) {
        const sessions = await db
          .select()
          .from(aiAnalysisSessions)
          .where(eq(aiAnalysisSessions.userId, userId))
          .orderBy(desc(aiAnalysisSessions.updatedAt));
        return sessions;
      }
      const sessions = await db
        .select()
        .from(aiAnalysisSessions)
        .orderBy(desc(aiAnalysisSessions.updatedAt));
      return sessions;
    } catch {
      return [];
    }
  }

  async getAiAnalysisSession(id: string): Promise<AiAnalysisSession | undefined> {
    try {
      const [session] = await db
        .select()
        .from(aiAnalysisSessions)
        .where(eq(aiAnalysisSessions.id, id));
      return session;
    } catch {
      return undefined;
    }
  }

  async createAiAnalysisSession(session: InsertAiAnalysisSession): Promise<AiAnalysisSession> {
    const [newSession] = await db
      .insert(aiAnalysisSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateAiAnalysisSession(id: string, updates: Partial<AiAnalysisSession>): Promise<AiAnalysisSession | undefined> {
    try {
      const [updated] = await db
        .update(aiAnalysisSessions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(aiAnalysisSessions.id, id))
        .returning();
      return updated;
    } catch {
      return undefined;
    }
  }
}

export const storage = new MemStorage();
