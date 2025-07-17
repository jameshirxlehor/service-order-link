
import { useState, Dispatch, SetStateAction } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import {
  Home,
  FileText,
  ClipboardList,
  Users,
  Settings,
  BarChart2,
  Calculator,
  Building,
  Wrench,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  title: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, title, active, collapsed, onClick }: NavItemProps) => {
  return (
    <li>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10 text-foreground"
              )}
              onClick={onClick}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{title}</span>}
            </Link>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{title}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </li>
  );
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isCityHall = user.user_type === UserRole.CITY_HALL;
  const isWorkshop = user.user_type === UserRole.WORKSHOP;
  const isQueryAdmin = user.user_type === UserRole.QUERY_ADMIN;
  const isGeneralAdmin = user.user_type === UserRole.GENERAL_ADMIN;

  const handleNavigation = (href: string, implemented: boolean = true) => {
    if (implemented) {
      navigate(href);
      setOpen(false); // Close sidebar on mobile after navigation
    } else {
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "Esta página será implementada em breve.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside
      className={cn(
        "bg-card z-30 flex h-screen flex-col border-r transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64",
        !open && "hidden md:flex"
      )}
    >
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 overflow-hidden">
          {!collapsed && <h1 className="text-xl font-bold">Service OS</h1>}
          {collapsed && <span className="font-bold text-lg">SOS</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <ul className="grid gap-1">
            <NavItem
              href="/dashboard"
              icon={Home}
              title="Dashboard"
              active={location.pathname === "/dashboard"}
              collapsed={collapsed}
              onClick={() => handleNavigation("/dashboard")}
            />

            {/* City Hall specific navigation */}
            {isCityHall && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={FileText}
                  title="Ordens de Serviço"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/service-orders")}
                />
                <NavItem
                  href="/quotes"
                  icon={Calculator}
                  title="Cotações"
                  active={location.pathname.startsWith("/quotes")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/quotes", false)}
                />
              </>
            )}

            {/* Workshop specific navigation */}
            {isWorkshop && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={ClipboardList}
                  title="Ordens de Serviço"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/service-orders")}
                />
                <NavItem
                  href="/my-quotes"
                  icon={Calculator}
                  title="Minhas Cotações"
                  active={location.pathname.startsWith("/my-quotes")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/my-quotes", false)}
                />
              </>
            )}

            {/* Query Admin specific navigation */}
            {isQueryAdmin && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={FileText}
                  title="Ordens de Serviço"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/service-orders")}
                />
                <NavItem
                  href="/quotes"
                  icon={Calculator}
                  title="Cotações"
                  active={location.pathname.startsWith("/quotes")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/quotes", false)}
                />
                <NavItem
                  href="/reports"
                  icon={BarChart2}
                  title="Relatórios"
                  active={location.pathname.startsWith("/reports")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/reports", false)}
                />
              </>
            )}

            {/* General Admin specific navigation */}
            {isGeneralAdmin && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={FileText}
                  title="Ordens de Serviço"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/service-orders")}
                />
                <NavItem
                  href="/quotes"
                  icon={Calculator}
                  title="Cotações"
                  active={location.pathname.startsWith("/quotes")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/quotes", false)}
                />
                <NavItem
                  href="/city-halls"
                  icon={Building}
                  title="Prefeituras"
                  active={location.pathname.startsWith("/city-halls")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/city-halls", false)}
                />
                <NavItem
                  href="/workshops"
                  icon={Wrench}
                  title="Oficinas"
                  active={location.pathname.startsWith("/workshops")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/workshops", false)}
                />
                <NavItem
                  href="/admin/users"
                  icon={Users}
                  title="Usuários"
                  active={location.pathname.startsWith("/admin/users")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/admin/users")}
                />
                <NavItem
                  href="/reports"
                  icon={BarChart2}
                  title="Relatórios"
                  active={location.pathname.startsWith("/reports")}
                  collapsed={collapsed}
                  onClick={() => handleNavigation("/reports", false)}
                />
              </>
            )}
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            collapsed && "justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
