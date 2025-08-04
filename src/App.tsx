
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
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/service-orders" element={<ServiceOrders />} />
              
              {/* City Hall Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserType.CITY_HALL]} />}>
                <Route path="/service-orders/new" element={<ServiceOrderForm />} />
                <Route path="/service-orders/:id/edit" element={<ServiceOrderForm />} />
              </Route>
              
              {/* Routes for viewing service orders and quotes */}
              <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
              <Route path="/service-orders/:id/quotes" element={<ServiceOrderQuotes />} />
              <Route path="/my-quotes" element={<MyQuotes />} />
              
              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserType.GENERAL_ADMIN]} />}>
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
