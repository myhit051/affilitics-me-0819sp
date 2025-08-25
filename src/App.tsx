import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import Layout from "./components/Layout";
import * as HomeModule from "./pages/Home";
const Home = HomeModule.default;
import Dashboard from "./pages/Dashboard";
import ShopeeAffiliate from "./pages/ShopeeAffiliate";
import LazadaAffiliate from "./pages/LazadaAffiliate";
import FacebookAdsFile from "./pages/FacebookAdsFile";
import AdPlanningPage from "./pages/AdPlanning";
import Workspace from "./pages/Workspace";
import DataImportPage from "./pages/DataImport";
import ConnectAPIs from "./pages/ConnectAPIs";
import Update from "./pages/Update";
import NotFound from "./pages/NotFound";
import FacebookCallback from "./pages/FacebookCallback";
import CloudSync from "./pages/CloudSync";
import FacebookAdsAPI from "./pages/FacebookAdsAPI";
import FacebookTest from "./pages/FacebookTest";
import AIOptimization from "./pages/AIOptimization";
import { getProductionConfig } from "./config/production";
import { analytics } from "./lib/analytics";

// Production-ready QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error boundary for production
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      analytics.track({
        name: 'global_error',
        properties: {
          message: event.error?.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      analytics.track({
        name: 'unhandled_rejection',
        properties: {
          reason: String(event.reason),
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
};

const App = () => {
  const config = getProductionConfig();

  useEffect(() => {
    // Track app initialization
    analytics.track({
      name: 'app_initialized',
      properties: {
        environment: import.meta.env.MODE,
        timestamp: new Date().toISOString(),
      },
    });

    // Track page views
    analytics.pageView(window.location.pathname);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme={config.UI.THEME}
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Routes>
                {/* Main App Routes with Layout */}
                <Route path="/home" element={<Layout><Home /></Layout>} />
                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="/shopee" element={<Layout><ShopeeAffiliate /></Layout>} />
                <Route path="/lazada" element={<Layout><LazadaAffiliate /></Layout>} />
                <Route path="/facebook-file" element={<Layout><FacebookAdsFile /></Layout>} />
                <Route path="/facebook-live" element={<Layout><FacebookAdsAPI /></Layout>} />
                <Route path="/planning" element={<Layout><AdPlanningPage /></Layout>} />
                <Route path="/workspace" element={<Layout><Workspace /></Layout>} />
                <Route path="/import" element={<Layout><DataImportPage /></Layout>} />
                <Route path="/connect" element={<Layout><ConnectAPIs /></Layout>} />
                <Route path="/cloud-sync" element={<Layout><CloudSync /></Layout>} />
                <Route path="/ai-optimization" element={<Layout><AIOptimization /></Layout>} />

                {/* Header Navigation Routes */}
                <Route path="/update-history" element={<Layout><Update /></Layout>} />
                <Route path="/settings" element={<Layout><div className="text-center p-12"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Coming Soon</p></div></Layout>} />

                {/* Legacy Routes (without Layout for special pages) */}
                <Route path="/auth/facebook/callback" element={<FacebookCallback />} />
                <Route path="/facebook-ads-api" element={<Layout><FacebookAdsAPI /></Layout>} />
                <Route path="/facebook-test" element={<FacebookTest />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
