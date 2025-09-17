import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const healthStatusEnum = pgEnum("health_status", ["healthy", "under_treatment", "critical", "recovered"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const alertSeverityEnum = pgEnum("alert_severity", ["low", "medium", "high", "critical"]);
export const diseaseTypeEnum = pgEnum("disease_type", ["infectious", "non_infectious", "chronic", "acute"]);

// Users table (healthcare workers)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("health_worker"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Migrant Workers/Patients table
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  phone: text("phone"),
  address: text("address"),
  district: text("district").notNull(),
  workplace: text("workplace"),
  employerName: text("employer_name"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  healthStatus: healthStatusEnum("health_status").notNull().default("healthy"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  lastCheckup: date("last_checkup"),
  registeredBy: varchar("registered_by").references(() => users.id),
});

// Health Records table
export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  checkupDate: date("checkup_date").notNull(),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  medications: text("medications"),
  notes: text("notes"),
  followupRequired: boolean("followup_required").default(false),
  followupDate: date("followup_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Diseases table
export const diseases = pgTable("diseases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  type: diseaseTypeEnum("type").notNull(),
  description: text("description"),
  symptoms: text("symptoms"),
  infectious: boolean("infectious").default(false),
  reportable: boolean("reportable").default(false),
});

// Disease Cases table
export const diseaseCases = pgTable("disease_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  diseaseId: varchar("disease_id").references(() => diseases.id).notNull(),
  diagnosisDate: date("diagnosis_date").notNull(),
  status: text("status").notNull().default("active"), // active, recovered, chronic
  severity: text("severity").notNull().default("mild"), // mild, moderate, severe
  notes: text("notes"),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
  reportedBy: varchar("reported_by").references(() => users.id),
});

// Health Alerts table
export const healthAlerts = pgTable("health_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  district: text("district"),
  diseaseId: varchar("disease_id").references(() => diseases.id),
  affectedCount: integer("affected_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Relations
export const patientsRelations = relations(patients, ({ one, many }) => ({
  registeredBy: one(users, {
    fields: [patients.registeredBy],
    references: [users.id],
  }),
  healthRecords: many(healthRecords),
  diseaseCases: many(diseaseCases),
}));

export const usersRelations = relations(users, ({ many }) => ({
  registeredPatients: many(patients),
  healthRecords: many(healthRecords),
  diseaseCases: many(diseaseCases),
  alerts: many(healthAlerts),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  patient: one(patients, {
    fields: [healthRecords.patientId],
    references: [patients.id],
  }),
  createdBy: one(users, {
    fields: [healthRecords.createdBy],
    references: [users.id],
  }),
}));

export const diseasesRelations = relations(diseases, ({ many }) => ({
  cases: many(diseaseCases),
  alerts: many(healthAlerts),
}));

export const diseaseCasesRelations = relations(diseaseCases, ({ one }) => ({
  patient: one(patients, {
    fields: [diseaseCases.patientId],
    references: [patients.id],
  }),
  disease: one(diseases, {
    fields: [diseaseCases.diseaseId],
    references: [diseases.id],
  }),
  reportedBy: one(users, {
    fields: [diseaseCases.reportedBy],
    references: [users.id],
  }),
}));

export const healthAlertsRelations = relations(healthAlerts, ({ one }) => ({
  disease: one(diseases, {
    fields: [healthAlerts.diseaseId],
    references: [diseases.id],
  }),
  createdBy: one(users, {
    fields: [healthAlerts.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  patientId: true,
  registeredAt: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertDiseaseSchema = createInsertSchema(diseases).omit({
  id: true,
});

export const insertDiseaseCaseSchema = createInsertSchema(diseaseCases).omit({
  id: true,
  reportedAt: true,
});

export const insertHealthAlertSchema = createInsertSchema(healthAlerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;

export type Disease = typeof diseases.$inferSelect;
export type InsertDisease = z.infer<typeof insertDiseaseSchema>;

export type DiseaseCase = typeof diseaseCases.$inferSelect;
export type InsertDiseaseCase = z.infer<typeof insertDiseaseCaseSchema>;

export type HealthAlert = typeof healthAlerts.$inferSelect;
export type InsertHealthAlert = z.infer<typeof insertHealthAlertSchema>;
