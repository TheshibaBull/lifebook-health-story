
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import UploadRecord from "./pages/UploadRecord";
import Search from "./pages/Search";
import Family from "./pages/Family";
import Settings from "./pages/Settings";
import Scanning from "./pages/Scanning";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import CreateProfile from "./pages/CreateProfile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import HealthScore from "./pages/HealthScore";

const queryClient = new QueryClient();

// Protected Route Component - BYPASSED FOR TESTING
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Authentication bypassed for testing
  return <>{children}</>;
};

// Public Route Component - BYPASSED FOR TESTING
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // Authentication bypass - no redirects
  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    // Initialize any app-wide services here
    console.log('Lifebook Health App initialized - Authentication bypassed for testing');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Authentication bypassed */}
            <Route path="/" element={
              <PublicRoute>
                <Index />
              </PublicRoute>
            } />
            <Route path="/onboarding" element={
              <PublicRoute>
                <Welcome />
              </PublicRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            
            {/* Protected Routes - Authentication bypassed */}
            <Route path="/create-profile" element={
              <ProtectedRoute>
                <CreateProfile />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/health-score" element={
              <ProtectedRoute>
                <HealthScore />
              </ProtectedRoute>
            } />
            <Route path="/upload-record" element={
              <ProtectedRoute>
                <UploadRecord />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/family" element={
              <ProtectedRoute>
                <Family />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/scanning" element={
              <ProtectedRoute>
                <Scanning />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
