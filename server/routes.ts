import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertHealthRecordSchema, 
  insertDiseaseSchema,
  insertDiseaseCaseSchema,
  insertHealthAlertSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Patients routes
  app.get("/api/patients", async (req, res) => {
    try {
      const { district, healthStatus, search, limit, offset } = req.query;
      const patients = await storage.getPatients({
        district: district as string,
        healthStatus: healthStatus as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/count", async (req, res) => {
    try {
      const count = await storage.getPatientsCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients count" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatientById(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.updatePatient(req.params.id, req.body);
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Health Records routes
  app.get("/api/health-records", async (req, res) => {
    try {
      const { patientId } = req.query;
      const records = await storage.getHealthRecords(patientId as string);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health records" });
    }
  });

  app.get("/api/health-records/:id", async (req, res) => {
    try {
      const record = await storage.getHealthRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Health record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health record" });
    }
  });

  app.post("/api/health-records", async (req, res) => {
    try {
      const recordData = insertHealthRecordSchema.parse(req.body);
      const record = await storage.createHealthRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid health record data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create health record" });
    }
  });

  // Diseases routes
  app.get("/api/diseases", async (req, res) => {
    try {
      const diseases = await storage.getDiseases();
      res.json(diseases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diseases" });
    }
  });

  app.post("/api/diseases", async (req, res) => {
    try {
      const diseaseData = insertDiseaseSchema.parse(req.body);
      const disease = await storage.createDisease(diseaseData);
      res.status(201).json(disease);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid disease data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create disease" });
    }
  });

  // Disease Cases routes
  app.get("/api/disease-cases", async (req, res) => {
    try {
      const { patientId, diseaseId, district, status } = req.query;
      const cases = await storage.getDiseaseCases({
        patientId: patientId as string,
        diseaseId: diseaseId as string,
        district: district as string,
        status: status as string,
      });
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disease cases" });
    }
  });

  app.post("/api/disease-cases", async (req, res) => {
    try {
      const caseData = insertDiseaseCaseSchema.parse(req.body);
      const diseaseCase = await storage.createDiseaseCase(caseData);
      res.status(201).json(diseaseCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid disease case data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create disease case" });
    }
  });

  app.get("/api/disease-cases/stats", async (req, res) => {
    try {
      const stats = await storage.getDiseaseStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disease stats" });
    }
  });

  // Health Alerts routes
  app.get("/api/health-alerts", async (req, res) => {
    try {
      const { activeOnly } = req.query;
      const alerts = await storage.getHealthAlerts(activeOnly === 'true');
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health alerts" });
    }
  });

  app.post("/api/health-alerts", async (req, res) => {
    try {
      const alertData = insertHealthAlertSchema.parse(req.body);
      const alert = await storage.createHealthAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create health alert" });
    }
  });

  app.put("/api/health-alerts/:id", async (req, res) => {
    try {
      const alert = await storage.updateHealthAlert(req.params.id, req.body);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to update health alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
