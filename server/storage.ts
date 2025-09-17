import { 
  users, 
  patients,
  healthRecords,
  diseases,
  diseaseCases,
  healthAlerts,
  type User, 
  type InsertUser,
  type Patient,
  type InsertPatient,
  type HealthRecord,
  type InsertHealthRecord,
  type Disease,
  type InsertDisease,
  type DiseaseCase,
  type InsertDiseaseCase,
  type HealthAlert,
  type InsertHealthAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, desc, count, sql } from "drizzle-orm";

// Storage interface definition
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalPatients: number;
    activeAlerts: number;
    totalScreenings: number;
    totalDiseaseCases: number;
  }>;

  // Patients
  getPatients(filters?: {
    district?: string;
    healthStatus?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Patient[]>;
  getPatientsCount(): Promise<number>;
  getPatientById(id: string): Promise<Patient | undefined>;
  createPatient(insertPatient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<Patient>): Promise<Patient>;

  // Health Records
  getHealthRecords(patientId?: string): Promise<HealthRecord[]>;
  getHealthRecordById(id: string): Promise<HealthRecord | undefined>;
  createHealthRecord(insertRecord: InsertHealthRecord): Promise<HealthRecord>;

  // Diseases
  getDiseases(): Promise<Disease[]>;
  createDisease(insertDisease: InsertDisease): Promise<Disease>;

  // Disease Cases
  getDiseaseCases(filters?: {
    patientId?: string;
    diseaseId?: string;
    district?: string;
    status?: string;
  }): Promise<DiseaseCase[]>;
  createDiseaseCase(insertCase: InsertDiseaseCase): Promise<DiseaseCase>;
  getDiseaseStats(): Promise<{ name: string; count: number }[]>;

  // Health Alerts
  getHealthAlerts(activeOnly?: boolean): Promise<HealthAlert[]>;
  createHealthAlert(insertAlert: InsertHealthAlert): Promise<HealthAlert>;
  updateHealthAlert(id: string, updates: Partial<HealthAlert>): Promise<HealthAlert>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Dashboard
  async getDashboardStats() {
    const [patientsCount] = await db.select({ count: count() }).from(patients);
    const [alertsCount] = await db.select({ count: count() }).from(healthAlerts).where(eq(healthAlerts.isActive, true));
    const [recordsCount] = await db.select({ count: count() }).from(healthRecords);
    const [casesCount] = await db.select({ count: count() }).from(diseaseCases);

    return {
      totalPatients: patientsCount.count,
      activeAlerts: alertsCount.count,
      totalScreenings: recordsCount.count,
      totalDiseaseCases: casesCount.count,
    };
  }

  // Patients
  async getPatients(filters: {
    district?: string;
    healthStatus?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Patient[]> {
    let query = db.select().from(patients);
    const conditions = [];

    if (filters.district) {
      conditions.push(like(patients.district, `%${filters.district}%`));
    }
    if (filters.healthStatus) {
      conditions.push(eq(patients.healthStatus, filters.healthStatus as any));
    }
    if (filters.search) {
      conditions.push(
        sql`(${patients.name} ILIKE ${`%${filters.search}%`} OR ${patients.patientId} ILIKE ${`%${filters.search}%`})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(patients.registeredAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getPatientsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(patients);
    return result.count;
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    // Generate a unique patient ID
    const patientCount = await this.getPatientsCount();
    const patientId = `MW${(patientCount + 1).toString().padStart(6, '0')}`;
    
    const [patient] = await db
      .insert(patients)
      .values({ ...insertPatient, patientId })
      .returning();
    return patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  // Health Records
  async getHealthRecords(patientId?: string): Promise<HealthRecord[]> {
    let query = db.select().from(healthRecords);
    
    if (patientId) {
      query = query.where(eq(healthRecords.patientId, patientId));
    }
    
    return await query.orderBy(desc(healthRecords.checkupDate));
  }

  async getHealthRecordById(id: string): Promise<HealthRecord | undefined> {
    const [record] = await db.select().from(healthRecords).where(eq(healthRecords.id, id));
    return record || undefined;
  }

  async createHealthRecord(insertRecord: InsertHealthRecord): Promise<HealthRecord> {
    const [record] = await db
      .insert(healthRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  // Diseases
  async getDiseases(): Promise<Disease[]> {
    return await db.select().from(diseases).orderBy(diseases.name);
  }

  async createDisease(insertDisease: InsertDisease): Promise<Disease> {
    const [disease] = await db
      .insert(diseases)
      .values(insertDisease)
      .returning();
    return disease;
  }

  // Disease Cases
  async getDiseaseCases(filters = {}) {
    let query = db
      .select({
        id: diseaseCases.id,
        patientId: diseaseCases.patientId,
        diseaseId: diseaseCases.diseaseId,
        diagnosisDate: diseaseCases.diagnosisDate,
        status: diseaseCases.status,
        severity: diseaseCases.severity,
        notes: diseaseCases.notes,
        reportedAt: diseaseCases.reportedAt,
        patientName: patients.name,
        patientDistrict: patients.district,
        diseaseName: diseases.name,
      })
      .from(diseaseCases)
      .leftJoin(patients, eq(diseaseCases.patientId, patients.id))
      .leftJoin(diseases, eq(diseaseCases.diseaseId, diseases.id));

    const conditions = [];

    if (filters.patientId) {
      conditions.push(eq(diseaseCases.patientId, filters.patientId));
    }
    if (filters.diseaseId) {
      conditions.push(eq(diseaseCases.diseaseId, filters.diseaseId));
    }
    if (filters.district) {
      conditions.push(like(patients.district, `%${filters.district}%`));
    }
    if (filters.status) {
      conditions.push(eq(diseaseCases.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(diseaseCases.reportedAt));
  }

  async createDiseaseCase(insertCase: InsertDiseaseCase): Promise<DiseaseCase> {
    const [diseaseCase] = await db
      .insert(diseaseCases)
      .values(insertCase)
      .returning();
    return diseaseCase;
  }

  async getDiseaseStats(): Promise<{ name: string; count: number }[]> {
    return await db
      .select({
        name: diseases.name,
        count: count(diseaseCases.id),
      })
      .from(diseases)
      .leftJoin(diseaseCases, eq(diseases.id, diseaseCases.diseaseId))
      .groupBy(diseases.id, diseases.name)
      .orderBy(desc(count(diseaseCases.id)));
  }

  // Health Alerts
  async getHealthAlerts(activeOnly = false): Promise<HealthAlert[]> {
    let query = db.select().from(healthAlerts);
    
    if (activeOnly) {
      query = query.where(eq(healthAlerts.isActive, true));
    }
    
    return await query.orderBy(desc(healthAlerts.createdAt));
  }

  async createHealthAlert(insertAlert: InsertHealthAlert): Promise<HealthAlert> {
    const [alert] = await db
      .insert(healthAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async updateHealthAlert(id: string, updates: Partial<HealthAlert>): Promise<HealthAlert> {
    const [alert] = await db
      .update(healthAlerts)
      .set(updates)
      .where(eq(healthAlerts.id, id))
      .returning();
    return alert;
  }
}

export const storage = new DatabaseStorage();