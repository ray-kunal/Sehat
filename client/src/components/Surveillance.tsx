import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Activity,
  AlertTriangle,
  Shield,
  Stethoscope,
  Eye,
} from "lucide-react";

interface SurveillanceData {
  totalPatients: number;
  activeAlerts: number;
  totalScreenings: number;
  totalDiseaseCases: number;
  monthlyTrends: {
    month: string;
    patients: number;
    cases: number;
    screenings: number;
  }[];
}

interface DistrictStats {
  district: string;
  patientCount: number;
  activeCases: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

interface DiseaseStats {
  name: string;
  count: number;
  trend: "increasing" | "stable" | "decreasing";
  infectiousRate: number;
}

interface HealthAlert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  district?: string;
  affectedCount: number;
  createdAt: string;
}

export default function Surveillance() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const { data: dashboardStats, isLoading: statsLoading } = useQuery<SurveillanceData>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: diseaseStats, isLoading: diseaseStatsLoading } = useQuery<DiseaseStats[]>({
    queryKey: ["/api/disease-cases/stats"],
    queryFn: async () => {
      const response = await fetch("/api/disease-cases/stats");
      if (!response.ok) throw new Error("Failed to fetch disease stats");
      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        trend: "stable" as const,
        infectiousRate: Math.floor(Math.random() * 40) + 10, // This would come from actual data analysis
      }));
    },
  });

  const { data: healthAlerts, isLoading: alertsLoading } = useQuery<HealthAlert[]>({
    queryKey: ["/api/health-alerts"],
    queryFn: async () => {
      const response = await fetch("/api/health-alerts?activeOnly=true");
      if (!response.ok) throw new Error("Failed to fetch health alerts");
      return response.json();
    },
  });

  // Mock district data - in real app, this would come from API
  const districtStats: DistrictStats[] = [
    { district: "Ernakulam", patientCount: 2847, activeCases: 23, riskLevel: "high" },
    { district: "Thrissur", patientCount: 1965, activeCases: 15, riskLevel: "medium" },
    { district: "Kozhikode", patientCount: 1543, activeCases: 8, riskLevel: "low" },
    { district: "Thiruvananthapuram", patientCount: 1289, activeCases: 12, riskLevel: "medium" },
    { district: "Kottayam", patientCount: 876, activeCases: 3, riskLevel: "low" },
    { district: "Palakkad", patientCount: 654, activeCases: 7, riskLevel: "medium" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-amber-500 text-white";
      case "low":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-destructive" />;
      case "decreasing":
        return <TrendingUp className="w-4 h-4 text-accent rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
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
          <Shield className="w-7 h-7 mr-3 text-primary" />
          Health Surveillance
        </h1>
        <p className="text-muted-foreground">Monitor public health trends and disease surveillance metrics</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select onValueChange={setSelectedTimeRange} value={selectedTimeRange}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedDistrict} value={selectedDistrict}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-district-surveillance">
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
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Monitored</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-monitored">
                    {dashboardStats?.totalPatients?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="text-primary text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-accent mr-1" />
              <span className="text-accent">+5.2%</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-destructive" data-testid="text-active-cases">
                    {dashboardStats?.totalDiseaseCases || 0}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-destructive text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-destructive">+8</span>
              <span className="text-muted-foreground ml-1">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Screenings Done</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-screenings-done">
                    {dashboardStats?.totalScreenings?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Stethoscope className="text-accent text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent">92.5%</span>
              <span className="text-muted-foreground ml-1">completion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Areas</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-high-risk-areas">
                  {districtStats.filter(d => d.riskLevel === "high" || d.riskLevel === "critical").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <MapPin className="text-amber-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">of 14 districts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              District Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {districtStats
                .sort((a, b) => b.activeCases - a.activeCases)
                .map((district, index) => (
                  <div
                    key={district.district}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    data-testid={`district-risk-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{district.district}</h4>
                        <p className="text-sm text-muted-foreground">
                          {district.patientCount.toLocaleString()} workers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{district.activeCases} cases</p>
                        <p className="text-xs text-muted-foreground">
                          {((district.activeCases / district.patientCount) * 100).toFixed(2)}% rate
                        </p>
                      </div>
                      <Badge className={`${getRiskLevelColor(district.riskLevel)} text-xs`}>
                        {district.riskLevel} risk
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Disease Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diseaseStatsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : diseaseStats && diseaseStats.length > 0 ? (
              <div className="space-y-4">
                {diseaseStats.slice(0, 6).map((disease, index) => (
                  <div
                    key={disease.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`disease-trend-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{disease.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {disease.infectiousRate}% infectious rate
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">{disease.count}</span>
                      {getTrendIcon(disease.trend)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No disease trend data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts and Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                Recent Health Alerts
              </CardTitle>
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
                  {healthAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start space-x-4 p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                      data-testid={`surveillance-alert-${alert.id}`}
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
                <p className="text-muted-foreground text-center py-8">No recent health alerts</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2 text-primary" />
              Surveillance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Coverage Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Health Screening</span>
                    <span className="text-sm font-medium text-accent">94.2%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{width: '94.2%'}}></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Response Time</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Alert Response</span>
                    <span className="text-sm font-medium text-primary">2.4 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Case Investigation</span>
                    <span className="text-sm font-medium text-primary">8.1 hours</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Data Quality</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completeness</span>
                    <span className="text-sm font-medium text-accent">96.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Timeliness</span>
                    <span className="text-sm font-medium text-accent">89.3%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Risk Assessment</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Critical Risk</span>
                    <Badge className="bg-destructive text-destructive-foreground text-xs">1 district</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">High Risk</span>
                    <Badge className="bg-destructive text-destructive-foreground text-xs">2 districts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Medium Risk</span>
                    <Badge className="bg-amber-500 text-white text-xs">6 districts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Low Risk</span>
                    <Badge className="bg-accent text-accent-foreground text-xs">5 districts</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
