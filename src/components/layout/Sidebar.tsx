
import { useState, Dispatch, SetStateAction } from "react";
import { Link, useLocation } from "react-router-dom";
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
}

const NavItem = ({ href, icon: Icon, title, active, collapsed }: NavItemProps) => {
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
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isCityHall = user.role === UserRole.CITY_HALL;
  const isWorkshop = user.role === UserRole.WORKSHOP;
  const isQueryAdmin = user.role === UserRole.QUERY_ADMIN;
  const isGeneralAdmin = user.role === UserRole.GENERAL_ADMIN;

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
            />

            {/* City Hall specific navigation */}
            {isCityHall && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={FileText}
                  title="Service Orders"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/quotes"
                  icon={Calculator}
                  title="Quotes"
                  active={location.pathname.startsWith("/quotes")}
                  collapsed={collapsed}
                />
              </>
            )}

            {/* Workshop specific navigation */}
            {isWorkshop && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={ClipboardList}
                  title="Service Orders"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/my-quotes"
                  icon={Calculator}
                  title="My Quotes"
                  active={location.pathname.startsWith("/my-quotes")}
                  collapsed={collapsed}
                />
              </>
            )}

            {/* Query Admin specific navigation */}
            {isQueryAdmin && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={FileText}
                  title="Service Orders"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/quotes"
                  icon={Calculator}
                  title="Quotes"
                  active={location.pathname.startsWith("/quotes")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/reports"
                  icon={BarChart2}
                  title="Reports"
                  active={location.pathname.startsWith("/reports")}
                  collapsed={collapsed}
                />
              </>
            )}

            {/* General Admin specific navigation */}
            {isGeneralAdmin && (
              <>
                <NavItem
                  href="/service-orders"
                  icon={FileText}
                  title="Service Orders"
                  active={location.pathname.startsWith("/service-orders")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/quotes"
                  icon={Calculator}
                  title="Quotes"
                  active={location.pathname.startsWith("/quotes")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/city-halls"
                  icon={Building}
                  title="City Halls"
                  active={location.pathname.startsWith("/city-halls")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/workshops"
                  icon={Wrench}
                  title="Workshops"
                  active={location.pathname.startsWith("/workshops")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/users"
                  icon={Users}
                  title="Users"
                  active={location.pathname.startsWith("/users")}
                  collapsed={collapsed}
                />
                <NavItem
                  href="/reports"
                  icon={BarChart2}
                  title="Reports"
                  active={location.pathname.startsWith("/reports")}
                  collapsed={collapsed}
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
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
