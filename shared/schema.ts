import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique(),
  password: varchar("password"),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Security Events
export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  eventType: text("event_type").notNull(),
  severity: text("severity").notNull(),
  source: text("source").notNull(),
  destination: text("destination"),
  user: text("user"),
  description: text("description").notNull(),
  ipAddress: text("ip_address"),
  details: text("details"),
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({ id: true });
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;

// Alerts
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  assignedTo: text("assigned_to"),
  relatedEventId: text("related_event_id"),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Incidents
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  assignedTo: text("assigned_to"),
  resolvedAt: timestamp("resolved_at"),
  impactLevel: text("impact_level").notNull(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// Compliance Frameworks
export const complianceFrameworks = pgTable("compliance_frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  version: text("version"),
  totalControls: integer("total_controls").notNull(),
  implementedControls: integer("implemented_controls").notNull(),
  lastAuditDate: timestamp("last_audit_date"),
});

export const insertComplianceFrameworkSchema = createInsertSchema(complianceFrameworks).omit({ id: true });
export type InsertComplianceFramework = z.infer<typeof insertComplianceFrameworkSchema>;
export type ComplianceFramework = typeof complianceFrameworks.$inferSelect;

// Compliance Controls
export const complianceControls = pgTable("compliance_controls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkId: text("framework_id").notNull(),
  controlId: text("control_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  implementationDate: timestamp("implementation_date"),
  evidence: text("evidence"),
  owner: text("owner"),
});

export const insertComplianceControlSchema = createInsertSchema(complianceControls).omit({ id: true });
export type InsertComplianceControl = z.infer<typeof insertComplianceControlSchema>;
export type ComplianceControl = typeof complianceControls.$inferSelect;

// Risk Assessments
export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  riskName: text("risk_name").notNull(),
  category: text("category").notNull(),
  likelihood: integer("likelihood").notNull(),
  impact: integer("impact").notNull(),
  riskScore: integer("risk_score").notNull(),
  status: text("status").notNull(),
  owner: text("owner"),
  mitigationPlan: text("mitigation_plan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;

// ZAP Scans
export const zapScans = pgTable("zap_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetUrl: text("target_url").notNull(),
  scanType: text("scan_type").notNull(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  totalVulnerabilities: integer("total_vulnerabilities").notNull().default(0),
  criticalCount: integer("critical_count").notNull().default(0),
  highCount: integer("high_count").notNull().default(0),
  mediumCount: integer("medium_count").notNull().default(0),
  lowCount: integer("low_count").notNull().default(0),
  infoCount: integer("info_count").notNull().default(0),
});

export const insertZapScanSchema = createInsertSchema(zapScans).omit({ id: true, startedAt: true });
export type InsertZapScan = z.infer<typeof insertZapScanSchema>;
export type ZapScan = typeof zapScans.$inferSelect;

// Vulnerabilities
export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: text("scan_id").notNull(),
  name: text("name").notNull(),
  severity: text("severity").notNull(),
  riskRating: text("risk_rating").notNull(),
  cvssScore: text("cvss_score"),
  url: text("url").notNull(),
  parameter: text("parameter"),
  description: text("description").notNull(),
  solution: text("solution"),
  cweId: text("cwe_id"),
  reference: text("reference"),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({ id: true });
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;

// Compliance Questions
export const complianceQuestions = pgTable("compliance_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  frameworkId: text("framework_id").notNull(),
  controlId: text("control_id").notNull(),
  questionNumber: integer("question_number").notNull(),
  question: text("question").notNull(),
  category: text("category").notNull(),
  guidance: text("guidance"),
  evidenceRequired: boolean("evidence_required").notNull().default(true),
});

export const insertComplianceQuestionSchema = createInsertSchema(complianceQuestions).omit({ id: true });
export type InsertComplianceQuestion = z.infer<typeof insertComplianceQuestionSchema>;
export type ComplianceQuestion = typeof complianceQuestions.$inferSelect;

// Compliance Responses (user answers to questions)
export const complianceResponses = pgTable("compliance_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: text("question_id").notNull(),
  frameworkId: text("framework_id").notNull(),
  controlId: text("control_id").notNull(),
  status: text("status").notNull(), // "Compliant", "Partially Compliant", "Non-Compliant", "Not Applicable"
  response: text("response"),
  evidence: text("evidence"),
  evidenceFiles: text("evidence_files"),
  reviewer: text("reviewer"),
  reviewDate: timestamp("review_date"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertComplianceResponseSchema = createInsertSchema(complianceResponses).omit({ id: true, updatedAt: true });
export type InsertComplianceResponse = z.infer<typeof insertComplianceResponseSchema>;
export type ComplianceResponse = typeof complianceResponses.$inferSelect;
