import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileText,
  Users,
  Worm,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Printer,
  Mail,
  Share2,
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "health" | "surveillance" | "administrative";
  fields: string[];
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  status: "completed" | "pending" | "failed";
  downloadUrl?: string;
  recipients: string[];
}

export default function Reports() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("monthly");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includePatientData, setIncludePatientData] = useState<boolean>(false);

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: diseaseStats, isLoading: diseaseStatsLoading } = useQuery({
    queryKey: ["/api/disease-cases/stats"],
  });

  const reportTemplates: ReportTemplate[] = [
    {
      id: "health-summary",
      name: "Health Summary Report",
      description: "Comprehensive overview of health metrics and trends",
      category: "health",
      fields: ["patient_count", "health_status", "screenings", "vaccinations"],
      frequency: "monthly",
    },
    {
      id: "disease-surveillance",
      name: "Disease Surveillance Report",
      description: "Disease tracking and outbreak monitoring",
      category: "surveillance",
      fields: ["disease_cases", "outbreak_alerts", "contact_tracing", "prevention_measures"],
      frequency: "weekly",
    },
    {
      id: "district-analysis",
      name: "District-wise Analysis",
      description: "Detailed analysis by geographic region",
      category: "administrative",
      fields: ["district_stats", "risk_assessment", "resource_allocation", "workforce_distribution"],
      frequency: "quarterly",
    },
    {
      id: "compliance-audit",
      name: "Compliance & Audit Report",
      description: "Regulatory compliance and audit findings",
      category: "administrative",
      fields: ["compliance_metrics", "audit_findings", "corrective_actions", "quality_indicators"],
      frequency: "monthly",
    },
    {
      id: "outbreak-investigation",
      name: "Outbreak Investigation Report",
      description: "Detailed investigation of disease outbreaks",
      category: "surveillance",
      fields: ["outbreak_timeline", "case_analysis", "epidemiological_curve", "control_measures"],
      frequency: "daily",
    },
  ];

  const recentReports: GeneratedReport[] = [
    {
      id: "1",
      name: "Monthly Health Summary - December 2024",
      type: "Health Summary Report",
      generatedDate: "2024-01-02",
      status: "completed",
      downloadUrl: "/reports/health-summary-dec-2024.pdf",
      recipients: ["health.minister@kerala.gov.in", "director@keralaphc.gov.in"],
    },
    {
      id: "2",
      name: "Weekly Disease Surveillance - Week 52",
      type: "Disease Surveillance Report",
      generatedDate: "2024-12-28",
      status: "completed",
      downloadUrl: "/reports/surveillance-week-52.pdf",
      recipients: ["surveillance@keralaphc.gov.in"],
    },
    {
      id: "3",
      name: "Quarterly District Analysis - Q4 2024",
      type: "District-wise Analysis",
      generatedDate: "2024-12-31",
      status: "pending",
      recipients: ["admin@keralaphc.gov.in", "stats@keralaphc.gov.in"],
    },
  ];

  const districts = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ];

  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const handleGenerateReport = () => {
    console.log("Generating report with parameters:", {
      template: selectedTemplate,
      period: selectedPeriod,
      districts: selectedDistricts,
      startDate,
      endDate,
      includeCharts,
      includePatientData,
    });
    // This would trigger the report generation API call
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent/10 text-accent";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health":
        return <Users className="w-4 h-4" />;
      case "surveillance":
        return <AlertTriangle className="w-4 h-4" />;
      case "administrative":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center" data-testid="text-page-title">
          <BarChart3 className="w-7 h-7 mr-3 text-primary" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">Generate and manage health surveillance reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-workers-report">
                    {dashboardStats?.totalPatients?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <Users className="w-8 h-8 text-primary" />
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
                  <p className="text-2xl font-bold text-destructive" data-testid="text-active-cases-report">
                    {dashboardStats?.totalDiseaseCases || 0}
                  </p>
                )}
              </div>
              <Worm className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Districts Covered</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-districts-covered">14</p>
              </div>
              <MapPin className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-reports-generated">127</p>
              </div>
              <FileText className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Generate New Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Select Report Template</label>
                <div className="grid grid-cols-1 gap-3">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/30"
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                      data-testid={`template-${template.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getCategoryIcon(template.category)}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {template.frequency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedTemplate === template.id 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground"
                        }`}>
                          {selectedTemplate === template.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Period and Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Report Period</label>
                  <Select onValueChange={setSelectedPeriod} value={selectedPeriod}>
                    <SelectTrigger data-testid="select-report-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              {/* District Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Select Districts</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                  {districts.map((district) => (
                    <div key={district} className="flex items-center space-x-2">
                      <Checkbox
                        id={district}
                        checked={selectedDistricts.includes(district)}
                        onCheckedChange={() => handleDistrictToggle(district)}
                        data-testid={`checkbox-district-${district.toLowerCase()}`}
                      />
                      <label
                        htmlFor={district}
                        className="text-sm text-foreground cursor-pointer"
                      >
                        {district}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDistricts(districts)}
                    data-testid="button-select-all-districts"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDistricts([])}
                    data-testid="button-clear-districts"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Report Options */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Report Options</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                      data-testid="checkbox-include-charts"
                    />
                    <label htmlFor="include-charts" className="text-sm text-foreground cursor-pointer">
                      Include charts and visualizations
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-patient-data"
                      checked={includePatientData}
                      onCheckedChange={(checked) => setIncludePatientData(checked === true)}
                      data-testid="checkbox-include-patient-data"
                    />
                    <label htmlFor="include-patient-data" className="text-sm text-foreground cursor-pointer">
                      Include detailed patient data (requires authorization)
                    </label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedTemplate}
                  className="min-w-40"
                  data-testid="button-generate-report"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" data-testid="button-daily-summary">
              <FileText className="w-4 h-4 mr-2" />
              Daily Summary
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-weekly-surveillance">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Weekly Surveillance
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-monthly-health">
              <TrendingUp className="w-4 h-4 mr-2" />
              Monthly Health Report
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-emergency-report">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Reports</span>
            <Button variant="outline" size="sm" data-testid="button-view-all-reports">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                data-testid={`recent-report-${report.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.type}</p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Generated on {formatDate(report.generatedDate)}</span>
                      <span className="mx-2">•</span>
                      <span>{report.recipients.length} recipients</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(report.status)} text-xs`}>
                    {report.status}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {report.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-download-${report.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-print-${report.id}`}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-share-${report.id}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
