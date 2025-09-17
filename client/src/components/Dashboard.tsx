import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  AlertTriangle,
  Stethoscope,
  Worm,
  Clock,
  Eye,
  Edit,
  Download,
  TrendingUp,
} from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  activeAlerts: number;
  totalScreenings: number;
  totalDiseaseCases: number;
}

interface HealthAlert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  district?: string;
}

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  district: string;
  lastCheckup: string;
  healthStatus: "healthy" | "under_treatment" | "critical";
}

interface DiseaseStats {
  name: string;
  count: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<HealthAlert[]>({
    queryKey: ["/api/health-alerts"],
    queryFn: async () => {
      const response = await fetch("/api/health-alerts?activeOnly=true");
      if (!response.ok) throw new Error("Failed to fetch alerts");
      return response.json();
    },
  });

  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const response = await fetch("/api/patients?limit=5");
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json();
    },
  });

  const { data: diseaseStats, isLoading: diseaseStatsLoading } = useQuery<DiseaseStats[]>({
    queryKey: ["/api/disease-cases/stats"],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-muted text-muted-foreground";
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      {/* Dashboard Header */}
      <div className="p-6 bg-muted/30">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            Health Surveillance Dashboard
          </h1>
          <p className="text-muted-foreground">Migrant Worker Health Record Management System</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-patients">
                      {stats?.totalPatients?.toLocaleString() || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="text-primary text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent mr-1" />
                <span className="text-accent">+2.5%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-destructive" data-testid="text-active-alerts">
                      {stats?.activeAlerts || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-destructive text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-destructive">+12</span>
                <span className="text-muted-foreground ml-1">new this week</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Health Screenings</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-screenings">
                      {stats?.totalScreenings?.toLocaleString() || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Stethoscope className="text-accent text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-accent">+18.2%</span>
                <span className="text-muted-foreground ml-1">completion rate</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disease Cases</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-disease-cases">
                      {stats?.totalDiseaseCases || 0}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Worm className="text-secondary text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">Tracking</span>
                <span className="text-accent ml-1">8 conditions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6">
        {/* Alerts and Disease Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Urgent Alerts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Urgent Health Alerts</CardTitle>
                  <Button variant="outline" size="sm" data-testid="button-view-all-alerts">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : alerts && alerts.length > 0 ? (
                  <div className="space-y-4">
                    {alerts.slice(0, 3).map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-start space-x-4 p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                        data-testid={`alert-${alert.severity}`}
                      >
                        <div className="w-10 h-10 bg-current/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{alert.title}</h3>
                          <p className="text-sm mt-1 opacity-80">{alert.description}</p>
                          <div className="flex items-center mt-2 text-xs opacity-70">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(alert.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{alert.severity} Priority</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No active alerts</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Disease Distribution */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Disease Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {diseaseStatsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-3 h-3 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                ) : diseaseStats && diseaseStats.length > 0 ? (
                  <div className="space-y-4">
                    {diseaseStats.slice(0, 6).map((disease, index) => {
                      const colors = ["bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500"];
                      return (
                        <div key={disease.name} className="flex items-center justify-between" data-testid={`disease-stat-${index}`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-sm text-foreground">{disease.name}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{disease.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No disease data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Health Records */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <CardTitle>Recent Health Records</CardTitle>
              <div className="flex items-center space-x-3">
                <Select>
                  <SelectTrigger className="w-40" data-testid="select-district">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="thiruvananthapuram">Thiruvananthapuram</SelectItem>
                    <SelectItem value="kochi">Kochi</SelectItem>
                    <SelectItem value="thrissur">Thrissur</SelectItem>
                    <SelectItem value="kozhikode">Kozhikode</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40" data-testid="select-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="under_treatment">Under Treatment</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient ID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Age</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">District</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Checkup</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Health Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </td>
                        <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="w-6 h-6" />
                            <Skeleton className="w-6 h-6" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : patients && patients.length > 0 ? (
                    patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-border hover:bg-muted/30 transition-colors" data-testid={`patient-row-${patient.id}`}>
                        <td className="p-4 text-sm text-foreground font-mono">{patient.patientId}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">{getInitials(patient.name)}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{patient.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-foreground">{patient.age}</td>
                        <td className="p-4 text-sm text-foreground">{patient.district}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {patient.lastCheckup ? formatDate(patient.lastCheckup) : "No checkup"}
                        </td>
                        <td className="p-4">
                          <Badge className={`${getHealthStatusColor(patient.healthStatus)} text-xs`}>
                            {patient.healthStatus.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-view-${patient.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${patient.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No patient records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing 1-{patients?.length || 0} of {patients?.length || 0} records
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled data-testid="button-previous">
                  Previous
                </Button>
                <Button size="sm" data-testid="button-page-1">1</Button>
                <Button variant="outline" size="sm" data-testid="button-next">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
