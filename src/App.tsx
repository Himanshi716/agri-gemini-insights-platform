import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { PerformanceMonitor } from "./hooks/usePerformanceMonitoring";
import { GDPRCompliance } from "./components/security/GDPRCompliance";
import { AppLayout } from "./components/layout/AppLayout";
import { Skeleton } from "./components/ui/skeleton";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FarmManagement = lazy(() => import("./pages/FarmManagement"));
const IoTMonitoring = lazy(() => import("./pages/IoTMonitoring"));
const Compliance = lazy(() => import("./pages/Compliance"));
const ExportDocuments = lazy(() => import("./pages/ExportDocuments"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
    },
  },
});

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <PerformanceMonitor>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/farms" element={<FarmManagement />} />
                  <Route path="/iot" element={<IoTMonitoring />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/export" element={<ExportDocuments />} />
                  <Route path="/assistant" element={<AIAssistant />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <GDPRCompliance />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PerformanceMonitor>
  </ErrorBoundary>
);

export default App;
