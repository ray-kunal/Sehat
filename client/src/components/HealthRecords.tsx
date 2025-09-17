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
import { FileText, Plus, Search, Eye, Edit, Calendar, User, Stethoscope, Loader2 } from "lucide-react";

interface HealthRecord {
  id: string;
  patientId: string;
  checkupDate: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  notes?: string;
  followupRequired: boolean;
  followupDate?: string;
  createdAt: string;
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  district: string;
  healthStatus: string;
}

const healthRecordSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  checkupDate: z.string().min(1, "Checkup date is required"),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
  followupRequired: z.boolean().default(false),
  followupDate: z.string().optional(),
});

type HealthRecordForm = z.infer<typeof healthRecordSchema>;

export default function HealthRecords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: healthRecords, isLoading: recordsLoading } = useQuery<HealthRecord[]>({
    queryKey: ["/api/health-records", selectedPatientId],
    queryFn: async () => {
      const url = selectedPatientId 
        ? `/api/health-records?patientId=${selectedPatientId}` 
        : "/api/health-records";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch health records");
      return response.json();
    },
  });

  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const response = await fetch("/api/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json();
    },
  });

  const form = useForm<HealthRecordForm>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      patientId: "",
      checkupDate: new Date().toISOString().split('T')[0],
      symptoms: "",
      diagnosis: "",
      treatment: "",
      medications: "",
      notes: "",
      followupRequired: false,
      followupDate: "",
    },
  });

  const createHealthRecordMutation = useMutation({
    mutationFn: async (data: HealthRecordForm) => {
      const response = await apiRequest("POST", "/api/health-records", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health record created successfully",
      });
      form.reset();
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/health-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create health record",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: HealthRecordForm) => {
    setIsSubmitting(true);
    createHealthRecordMutation.mutate(data);
  };

  const filteredRecords = healthRecords?.filter(record => {
    if (!searchTerm) return true;
    const patient = patients?.find(p => p.id === record.patientId);
    return (
      patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getPatientInfo = (patientId: string) => {
    return patients?.find(p => p.id === patientId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-accent/10 text-accent";
      case "under_treatment":
        return "bg-amber-100 text-amber-800";
      case "critical":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center" data-testid="text-page-title">
          <FileText className="w-7 h-7 mr-3 text-primary" />
          Health Records
        </h1>
        <p className="text-muted-foreground">Manage patient health records and medical history</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by patient name, ID, diagnosis, or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-records"
              />
            </div>
            <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
              <SelectTrigger className="w-full sm:w-64" data-testid="select-patient-filter">
                <SelectValue placeholder="Filter by patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Patients</SelectItem>
                {patients?.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.patientId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-record">
                  <Plus className="w-4 h-4 mr-2" />
                  New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Health Record</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-patient">
                                  <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {patientsLoading ? (
                                  <SelectItem value="" disabled>Loading patients...</SelectItem>
                                ) : (
                                  patients?.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                      {patient.name} ({patient.patientId})
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
                        control={form.control}
                        name="checkupDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Checkup Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-checkup-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="symptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symptoms</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe symptoms..."
                              className="resize-none"
                              {...field}
                              data-testid="input-symptoms"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter diagnosis..."
                              className="resize-none"
                              {...field}
                              data-testid="input-diagnosis"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe treatment..."
                              className="resize-none"
                              {...field}
                              data-testid="input-treatment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medications</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List medications..."
                              className="resize-none"
                              {...field}
                              data-testid="input-medications"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes..."
                              className="resize-none"
                              {...field}
                              data-testid="input-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="followupRequired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Required</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-followup">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="true">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("followupRequired") && (
                        <FormField
                          control={form.control}
                          name="followupDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Follow-up Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-followup-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isSubmitting}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-32"
                        data-testid="button-save-record"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Save Record
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

      {/* Health Records List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Health Records ({filteredRecords?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
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
          ) : filteredRecords && filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((record) => {
                const patient = getPatientInfo(record.patientId);
                return (
                  <Card key={record.id} className="border-l-4 border-l-primary" data-testid={`health-record-${record.id}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center">
                            <User className="w-4 h-4 mr-2 text-primary" />
                            {patient?.name || "Unknown Patient"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {patient?.patientId} • {patient?.district}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {patient && (
                            <Badge className={`${getHealthStatusColor(patient.healthStatus)} text-xs`}>
                              {patient.healthStatus.replace("_", " ")}
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" data-testid={`button-view-record-${record.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-record-${record.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-muted-foreground">Checkup Date:</label>
                          <p className="flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1 text-primary" />
                            {formatDate(record.checkupDate)}
                          </p>
                        </div>

                        {record.symptoms && (
                          <div className="md:col-span-2">
                            <label className="font-medium text-muted-foreground">Symptoms:</label>
                            <p className="mt-1 text-foreground">{record.symptoms}</p>
                          </div>
                        )}

                        {record.diagnosis && (
                          <div className="md:col-span-2">
                            <label className="font-medium text-muted-foreground">Diagnosis:</label>
                            <p className="mt-1 text-foreground font-medium">{record.diagnosis}</p>
                          </div>
                        )}

                        {record.treatment && (
                          <div className="md:col-span-2">
                            <label className="font-medium text-muted-foreground">Treatment:</label>
                            <p className="mt-1 text-foreground">{record.treatment}</p>
                          </div>
                        )}

                        {record.medications && (
                          <div className="md:col-span-2">
                            <label className="font-medium text-muted-foreground">Medications:</label>
                            <p className="mt-1 text-foreground">{record.medications}</p>
                          </div>
                        )}

                        {record.followupRequired && (
                          <div>
                            <label className="font-medium text-muted-foreground">Follow-up:</label>
                            <p className="mt-1 text-amber-600 font-medium">
                              {record.followupDate ? `Due: ${formatDate(record.followupDate)}` : "Required"}
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="font-medium text-muted-foreground">Recorded:</label>
                          <p className="mt-1 text-muted-foreground">
                            {formatDate(record.createdAt)}
                          </p>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <label className="font-medium text-muted-foreground">Notes:</label>
                          <p className="mt-1 text-foreground">{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Health Records Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedPatientId 
                  ? "No records match your current filters." 
                  : "Start by creating the first health record."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-record">
                <Plus className="w-4 h-4 mr-2" />
                Create Health Record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
