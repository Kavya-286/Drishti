import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import StartupDetails from "./pages/StartupDetails";
import InvestmentAction from "./pages/InvestmentAction";
import InvestorAcknowledgment from "./pages/InvestorAcknowledgment";
import Watchlist from "./pages/Watchlist";
import Validate from "./pages/Validate";
import Results from "./pages/Results";
import FounderReadiness from "./pages/FounderReadiness";
import Auth from "./pages/Auth";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/investor-dashboard" element={<InvestorDashboard />} />
          <Route path="/startup-details/:id" element={<StartupDetails />} />
          <Route path="/investment-action/:id" element={<InvestmentAction />} />
          <Route path="/investor-acknowledgment/:id" element={<InvestorAcknowledgment />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/validate" element={<Validate />} />
          <Route path="/results" element={<Results />} />
          <Route path="/founder-readiness" element={<FounderReadiness />} />
          <Route path="/auth" element={<Auth />} />

          {/* Placeholder pages */}
          <Route
            path="/features"
            element={
              <Placeholder
                title="Features Overview"
                description="Comprehensive list of all validation features and capabilities"
                suggestedAction="Check out our validation tool to see features in action!"
              />
            }
          />
          <Route
            path="/pricing"
            element={
              <Placeholder
                title="Pricing Plans"
                description="Detailed pricing information for all subscription tiers"
                suggestedAction="Start with our free validation to experience the value."
              />
            }
          />
          <Route
            path="/about"
            element={
              <Placeholder
                title="About StartupValidator"
                description="Learn about our mission to help entrepreneurs validate their ideas"
                suggestedAction="Get started by validating your first startup idea!"
              />
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")).render(<App />);
