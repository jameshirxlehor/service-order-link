
import { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { UserRole } from "@/types";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  let roleText = "";
  switch (user.role) {
    case UserRole.CITY_HALL:
      roleText = "City Hall";
      break;
    case UserRole.WORKSHOP:
      roleText = "Workshop";
      break;
    case UserRole.QUERY_ADMIN:
      roleText = "Query Administrator";
      break;
    case UserRole.GENERAL_ADMIN:
      roleText = "General Administrator";
      break;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          userRole={roleText}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
