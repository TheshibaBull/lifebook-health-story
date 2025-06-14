
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-record" element={<UploadRecord />} />
          <Route path="/search" element={<Search />} />
          <Route path="/family" element={<Family />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/scanning" element={<Scanning />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
