
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ServiceOrders from "./pages/ServiceOrders";
import ServiceOrderForm from "./pages/ServiceOrderForm";
import ServiceOrderDetail from "./pages/ServiceOrderDetail";
import ServiceOrderQuotes from "./pages/ServiceOrderQuotes";
import MyQuotes from "./pages/MyQuotes";
import QuoteForm from "./pages/QuoteForm";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { UserType } from "./types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/service-orders" element={<ProtectedRoute><ServiceOrders /></ProtectedRoute>} />
            <Route path="/service-orders/:id" element={<ProtectedRoute><ServiceOrderDetail /></ProtectedRoute>} />
            <Route path="/service-orders/:id/quotes" element={<ProtectedRoute><ServiceOrderQuotes /></ProtectedRoute>} />
            <Route path="/my-quotes" element={<ProtectedRoute><MyQuotes /></ProtectedRoute>} />
            
            {/* Workshop Routes */}
            <Route path="/service-orders/:id/quote/new" element={<ProtectedRoute allowedRoles={[UserType.WORKSHOP]}><QuoteForm /></ProtectedRoute>} />
            
            {/* City Hall Only Routes */}
            <Route path="/service-orders/new" element={<ProtectedRoute allowedRoles={[UserType.CITY_HALL]}><ServiceOrderForm /></ProtectedRoute>} />
            <Route path="/service-orders/:id/edit" element={<ProtectedRoute allowedRoles={[UserType.CITY_HALL]}><ServiceOrderForm /></ProtectedRoute>} />
            
            {/* Admin Only Routes */}
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[UserType.GENERAL_ADMIN]}><AdminUsers /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
