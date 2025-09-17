import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Worm,
  Plus,
  Search,
  AlertTriangle,
  Calendar,
  User,
  MapPin,
  TrendingUp,
  Activity,
  Loader2,
  Eye,
  Edit
} from "lucide-react";

interface Disease {
  id: string;
  name: string;
  type: "infectious" | "non_infectious" | "chronic" | "acute";
  description?: string;
  infectious: boolean;
  reportable: boolean;
}

interface DiseaseCase {
  id: string;
  patientId: string;
  diseaseId: string;
  diagnosisDate: string;
  status: string;
  severity: string;
  notes?: string;
  reportedAt: string;
  patientName?: string;
  patientDistrict?: string;
  diseaseName?: string;
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
  district: string;
}

interface HealthAlert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  district?: string;
  diseaseId?: string;
  affectedCount: number;
  isActive: boolean;
  createdAt: string;
}

const diseaseCaseSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  diseaseId: z.string().min(1, "Disease is required"),
  diagnosisDate: z.string().min(1, "Diagnosis date is required"),
  status: z.enum(["active", "recovered", "chronic"]).default("active"),
  severity: z.enum(["mild", "moderate", "severe"]).default("mild"),
  notes: z.string().optional(),
});

const healthAlertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  district: z.string().optional(),
  diseaseId: z.string().optional(),
  affectedCount: z.number().min(0).default(1),
});

type DiseaseCaseForm = z.infer<typeof diseaseCaseSchema>;
type HealthAlertForm = z.infer<typeof healthAlertSchema>;

export default function DiseaseTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: diseaseCases, isLoading: casesLoading } = useQuery<DiseaseCase[]>({
    queryKey: ["/api/disease-cases", selectedDistrict, selectedStatus],
    queryFn: async () => {
      let url = "/api/disease-cases?";
      const params = new URLSearchParams();
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (selectedStatus) params.append("status", selectedStatus);
      
      const response = await fetch(`/api/disease-cases?${params}`);
      if (!response.ok) throw new Error("Failed to fetch disease cases");
      return response.json();
    },
  });

  const { data: diseases, isLoading: diseasesLoading } = useQuery<Disease[]>({
    queryKey: ["/api/diseases"],
  });

  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: healthAlerts, isLoading: alertsLoading } = useQuery<HealthAlert[]>({
    queryKey: ["/api/health-alerts"],
    queryFn: async () => {
      const response = await fetch("/api/health-alerts?activeOnly=true");
      if (!response.ok) throw new Error("Failed to fetch health alerts");
      return response.json();
    },
  });

  const caseForm = useForm<DiseaseCaseForm>({
    resolver: zodResolver(diseaseCaseSchema),
    defaultValues: {
      patientId: "",
      diseaseId: "",
      diagnosisDate: new Date().toISOString().split('T')[0],
      status: "active",
      severity: "mild",
      notes: "",
    },
  });

  const alertForm = useForm<HealthAlertForm>({
    resolver: zodResolver(healthAlertSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "medium",
      district: "",
      diseaseId: "",
      affectedCount: 1,
    },
  });

  const createDiseaseCaseMutation = useMutation({
    mutationFn: async (data: DiseaseCaseForm) => {
      const response = await apiRequest("POST", "/api/disease-cases", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Disease case reported successfully",
      });
      caseForm.reset();
      setIsCaseDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/disease-cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to report disease case",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const createHealthAlertMutation = useMutation({
    mutationFn: async (data: HealthAlertForm) => {
      const response = await apiRequest("POST", "/api/health-alerts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health alert created successfully",
      });
      alertForm.reset();
      setIsAlertDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/health-alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create health alert",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmitCase = async (data: DiseaseCaseForm) => {
    setIsSubmitting(true);
    createDiseaseCaseMutation.mutate(data);
  };

  const onSubmitAlert = async (data: HealthAlertForm) => {
    setIsSubmitting(true);
    createHealthAlertMutation.mutate(data);
  };

  const filteredCases = diseaseCases?.filter(diseaseCase => {
    if (!searchTerm) return true;
    return (
      diseaseCase.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diseaseCase.diseaseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diseaseCase.patientDistrict?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "severe":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
      case "moderate":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "medium":
      case "mild":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "low":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-destructive/10 text-destructive";
      case "recovered":
        return "bg-accent/10 text-accent";
      case "chronic":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const districts = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center" data-testid="text-page-title">
          <Worm className="w-7 h-7 mr-3 text-primary" />
          Disease Tracking
        </h1>
        <p className="text-muted-foreground">Monitor and track infectious diseases among migrant workers</p>
      </div>

      {/* Active Alerts */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
              Active Health Alerts ({healthAlerts?.length || 0})
            </CardTitle>
            <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" data-testid="button-create-alert">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Health Alert</DialogTitle>
                </DialogHeader>
                <Form {...alertForm}>
                  <form onSubmit={alertForm.handleSubmit(onSubmitAlert)} className="space-y-4">
                    <FormField
                      control={alertForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alert Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter alert title" {...field} data-testid="input-alert-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={alertForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the health alert..."
                              className="resize-none"
                              {...field}
                              data-testid="input-alert-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={alertForm.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-alert-severity">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={alertForm.control}
                        name="affectedCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Affected Count</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                data-testid="input-affected-count"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={alertForm.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-alert-district">
                                  <SelectValue placeholder="Select district" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">All Districts</SelectItem>
                                {districts.map((district) => (
                                  <SelectItem key={district} value={district.toLowerCase()}>
                                    {district}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={alertForm.control}
                        name="diseaseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Disease</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-alert-disease">
                                  <SelectValue placeholder="Select disease" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No specific disease</SelectItem>
                                {diseases?.map((disease) => (
                                  <SelectItem key={disease.id} value={disease.id}>
                                    {disease.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAlertDialogOpen(false)}
                        disabled={isSubmitting}
                        data-testid="button-cancel-alert"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="destructive"
                        className="min-w-32"
                        data-testid="button-save-alert"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Create Alert
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : healthAlerts && healthAlerts.length > 0 ? (
            <div className="space-y-4">
              {healthAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-4 p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                  data-testid={`alert-${alert.severity}-${alert.id}`}
                >
                  <div className="w-10 h-10 bg-current/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm mt-1 opacity-80">{alert.description}</p>
                    <div className="flex items-center mt-2 text-xs opacity-70">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(alert.createdAt)}</span>
                      {alert.district && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{alert.district}</span>
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <span>{alert.affectedCount} affected</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No active health alerts</p>
          )}
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Disease Cases Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by patient name, disease, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-cases"
              />
            </div>
            <Select onValueChange={setSelectedDistrict} value={selectedDistrict}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-district-filter">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district.toLowerCase()}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedStatus} value={selectedStatus}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="recovered">Recovered</SelectItem>
                <SelectItem value="chronic">Chronic</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-report-case">
                  <Plus className="w-4 h-4 mr-2" />
                  Report Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Report Disease Case</DialogTitle>
                </DialogHeader>
                <Form {...caseForm}>
                  <form onSubmit={caseForm.handleSubmit(onSubmitCase)} className="space-y-4">
                    <FormField
                      control={caseForm.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-case-patient">
                                <SelectValue placeholder="Select patient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patientsLoading ? (
                                <SelectItem value="" disabled>Loading patients...</SelectItem>
                              ) : (
                                patients?.map((patient) => (
                                  <SelectItem key={patient.id} value={patient.id}>
                                    {patient.name} ({patient.patientId}) - {patient.district}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={caseForm.control}
                      name="diseaseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disease *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-case-disease">
                                <SelectValue placeholder="Select disease" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {diseasesLoading ? (
                                <SelectItem value="" disabled>Loading diseases...</SelectItem>
                              ) : (
                                diseases?.map((disease) => (
                                  <SelectItem key={disease.id} value={disease.id}>
                                    {disease.name} {disease.infectious && "(Infectious)"}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={caseForm.control}
                      name="diagnosisDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-diagnosis-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={caseForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-case-status">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="recovered">Recovered</SelectItem>
                                <SelectItem value="chronic">Chronic</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={caseForm.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-case-severity">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mild">Mild</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="severe">Severe</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={caseForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about the case..."
                              className="resize-none"
                              {...field}
                              data-testid="input-case-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCaseDialogOpen(false)}
                        disabled={isSubmitting}
                        data-testid="button-cancel-case"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-32"
                        data-testid="button-save-case"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Reporting...
                          </>
                        ) : (
                          <>
                            <Worm className="w-4 h-4 mr-2" />
                            Report Case
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Disease Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Disease Cases ({filteredCases?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {casesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCases && filteredCases.length > 0 ? (
            <div className="space-y-4">
              {filteredCases.map((diseaseCase) => (
                <Card key={diseaseCase.id} className="border-l-4 border-l-destructive" data-testid={`disease-case-${diseaseCase.id}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center">
                          <User className="w-4 h-4 mr-2 text-primary" />
                          {diseaseCase.patientName || "Unknown Patient"}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Worm className="w-4 h-4 mr-2 text-destructive" />
                          {diseaseCase.diseaseName || "Unknown Disease"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(diseaseCase.status)} text-xs`}>
                          {diseaseCase.status}
                        </Badge>
                        <Badge className={`${getSeverityColor(diseaseCase.severity)} text-xs`}>
                          {diseaseCase.severity}
                        </Badge>
                        <Button variant="ghost" size="sm" data-testid={`button-view-case-${diseaseCase.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-edit-case-${diseaseCase.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-muted-foreground">District:</label>
                        <p className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-primary" />
                          {diseaseCase.patientDistrict || "Unknown"}
                        </p>
                      </div>

                      <div>
                        <label className="font-medium text-muted-foreground">Diagnosis Date:</label>
                        <p className="flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1 text-primary" />
                          {formatDate(diseaseCase.diagnosisDate)}
                        </p>
                      </div>

                      <div>
                        <label className="font-medium text-muted-foreground">Reported:</label>
                        <p className="flex items-center mt-1">
                          <Activity className="w-4 h-4 mr-1 text-primary" />
                          {formatDate(diseaseCase.reportedAt)}
                        </p>
                      </div>

                      <div>
                        <label className="font-medium text-muted-foreground">Status:</label>
                        <p className="mt-1">
                          <Badge className={`${getStatusColor(diseaseCase.status)} text-xs`}>
                            {diseaseCase.status}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    {diseaseCase.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <label className="font-medium text-muted-foreground">Notes:</label>
                        <p className="mt-1 text-foreground">{diseaseCase.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Worm className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Disease Cases Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedDistrict || selectedStatus 
                  ? "No cases match your current filters." 
                  : "Start by reporting the first disease case."}
              </p>
              <Button onClick={() => setIsCaseDialogOpen(true)} data-testid="button-report-first-case">
                <Plus className="w-4 h-4 mr-2" />
                Report Disease Case
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
