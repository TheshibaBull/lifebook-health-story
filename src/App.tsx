import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UploadRecord = lazy(() => import("./pages/UploadRecord"));
const Search = lazy(() => import("./pages/Search"));
const Family = lazy(() => import("./pages/Family"));
const Settings = lazy(() => import("./pages/Settings"));
const Scanning = lazy(() => import("./pages/Scanning"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Auth = lazy(() => import("./pages/Auth"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HealthScore = lazy(() => import("./pages/HealthScore"));
const ScheduleAppointment = lazy(() => import("./pages/ScheduleAppointment"));
const BookTest = lazy(() => import("./pages/BookTest"));

const queryClient = new QueryClient();

// Loading component for better UX

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// Public Route Component  
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

const App = () => {
  useEffect(() => {
    console.log('Lifebook Health App initialized with Supabase authentication');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes - Accessible only when not authenticated */}
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
              
              {/* Protected Routes - Require authentication */}
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
              <Route path="/schedule-appointment" element={
                <ProtectedRoute>
                  <ScheduleAppointment />
                </ProtectedRoute>
              } />
              <Route path="/book-test" element={
                <ProtectedRoute>
                  <BookTest />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
