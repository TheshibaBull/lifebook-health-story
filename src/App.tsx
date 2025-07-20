
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider, QueryClientConfig } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { PWAService } from '@/services/pwaService';
import { EnhancedPushNotificationService } from '@/services/enhancedPushNotificationService';
import { OfflineDataSyncService } from '@/services/offlineDataSyncService';

import Index from "./pages/Index";
import UploadRecord from "./pages/UploadRecord";
import Search from "./pages/Search";
import Family from "./pages/Family";
import Settings from "./pages/Settings";
import Scanning from "./pages/Scanning";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Notifications from "./pages/Notifications";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import NotFound from "./pages/NotFound";
import HealthScore from "./pages/HealthScore";
import ScheduleAppointment from "./pages/ScheduleAppointment";
import BookTest from "./pages/BookTest";
import RecordsList from "./pages/RecordsList";

// Configure React Query with optimized settings
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
};
const queryClient = new QueryClient(queryClientConfig);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }
  
  if (!user) {
    // If user is not authenticated, redirect to auth page
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Public Route Component  
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }
  
  if (user) {
    // If user is authenticated, redirect to home
    return <Navigate to="/" replace />;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

function App() {
  useEffect(() => {
    // Initialize all services
    const initializeServices = async () => {
      try {
        console.log('Initializing enhanced services...');
        
        // Initialize PWA features
        await PWAService.initialize();
        
        // Initialize push notifications
        await EnhancedPushNotificationService.initialize();
        
        // Initialize offline sync
        OfflineDataSyncService.initialize();
        
        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - Accessible only when not authenticated */}
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
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={
              <PublicRoute>
                <EmailVerification />
              </PublicRoute>
            } />
            
            {/* Protected Routes - Require authentication */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
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
            <Route path="/records" element={
              <ProtectedRoute>
                <RecordsList />
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
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
