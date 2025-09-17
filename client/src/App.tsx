import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/dashboard";
import PatientRegistration from "@/pages/patient-registration";
import HealthRecords from "@/pages/health-records";
import DiseaseTracking from "@/pages/disease-tracking";
import Surveillance from "@/pages/surveillance";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/patient-registration" component={PatientRegistration} />
        <Route path="/health-records" component={HealthRecords} />
        <Route path="/disease-tracking" component={DiseaseTracking} />
        <Route path="/surveillance" component={Surveillance} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
