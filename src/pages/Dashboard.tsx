
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { UserType } from "@/types";
import { dashboardService } from "@/services/dashboardService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  ClipboardList,
  Users,
  Wrench,
  Building,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  const isCityHall = user.user_type === UserType.CITY_HALL;
  const isWorkshop = user.user_type === UserType.WORKSHOP;
  const isQueryAdmin = user.user_type === UserType.QUERY_ADMIN;
  const isGeneralAdmin = user.user_type === UserType.GENERAL_ADMIN;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let result;
        if (isCityHall) {
          result = await dashboardService.getCityHallStats(user.id);
        } else if (isWorkshop) {
          result = await dashboardService.getWorkshopStats(user.id);
        } else if (isQueryAdmin) {
          result = await dashboardService.getQueryAdminStats();
        } else if (isGeneralAdmin) {
          result = await dashboardService.getGeneralAdminStats();
        }
        
        if (result?.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id, user.user_type, isCityHall, isWorkshop, isQueryAdmin, isGeneralAdmin]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your service order management system.
          </p>
        </div>

        {/* Quick stats section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in [animation-delay:200ms]">
          {(isCityHall || isQueryAdmin || isGeneralAdmin) && (
            <>
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Service Orders
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.activeServiceOrders || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Current active orders
                   </p>
                 </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Quotes
                  </CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.pendingQuotes || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Awaiting review
                   </p>
                 </CardContent>
              </Card>
            </>
          )}

          {isWorkshop && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Available Orders
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.availableOrders || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Available for quotes
                   </p>
                 </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Submitted Quotes
                  </CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.submittedQuotes || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     {loading ? "..." : stats?.acceptedQuotes || 0} accepted
                   </p>
                 </CardContent>
              </Card>
            </>
          )}

          {isGeneralAdmin && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    City Halls
                  </CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.cityHallsCount || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Active accounts
                   </p>
                 </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Workshops
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.workshopsCount || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Active workshops
                   </p>
                 </CardContent>
              </Card>
            </>
          )}

          {isQueryAdmin && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Service Orders
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.totalServiceOrders || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     All time
                   </p>
                 </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Orders
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                   <div className="text-2xl font-bold">
                     {loading ? "..." : stats?.completedOrders || 0}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     {loading ? "..." : stats?.totalServiceOrders ? Math.round((stats.completedOrders / stats.totalServiceOrders) * 100) : 0}% completion rate
                   </p>
                 </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main content area */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent/Pending items - wider card */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>
                {isCityHall && "Recent Service Orders"}
                {isWorkshop && "Available Service Orders"}
                {isQueryAdmin && "Recent Activity"}
                {isGeneralAdmin && "Recent Service Orders"}
              </CardTitle>
              <CardDescription>
                {isCityHall && "Your recently created service orders"}
                {isWorkshop && "Orders available for quoting"}
                {isQueryAdmin && "Recent changes across the system"}
                {isGeneralAdmin && "Recently created service orders"}
              </CardDescription>
            </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {loading ? (
                   <div className="text-center py-4">Loading...</div>
                 ) : (
                   stats?.recentServiceOrders?.length > 0 || stats?.recentOrders?.length > 0 || stats?.recentActivity?.length > 0 ? (
                     (stats?.recentServiceOrders || stats?.recentOrders || stats?.recentActivity || []).slice(0, 5).map((item: any, i: number) => (
                       <div
                         key={item.id || i}
                         className="flex items-center justify-between border-b pb-2"
                       >
                         <div className="flex items-center gap-2">
                           <div className="rounded-full p-1 bg-primary/10">
                             {isCityHall || isGeneralAdmin || isQueryAdmin ? (
                               <FileText className="h-4 w-4 text-primary" />
                             ) : (
                               <ClipboardList className="h-4 w-4 text-primary" />
                             )}
                           </div>
                           <div>
                             <p className="text-sm font-medium">
                               Service Order #{item.number || item.id?.slice(-6) || 'N/A'}
                             </p>
                             <p className="text-xs text-muted-foreground">
                               Status: {item.status || 'Unknown'}
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-muted-foreground">
                             {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                           </span>
                           <Button variant="ghost" size="sm">
                             View
                           </Button>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-4 text-muted-foreground">
                       No recent items
                     </div>
                   )
                 )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/service-orders")}
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional content - narrow column */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>
                {isCityHall && "Pending Quotes"}
                {isWorkshop && "Quote Status"}
                {isQueryAdmin && "Status Overview"}
                {isGeneralAdmin && "System Overview"}
              </CardTitle>
              <CardDescription>
                {isCityHall && "Quotes waiting for your review"}
                {isWorkshop && "Status of your submitted quotes"}
                {isQueryAdmin && "Current system status"}
                {isGeneralAdmin && "Overall system metrics"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isCityHall && (
                  <>
                     {loading ? (
                       <div className="text-center py-4">Loading...</div>
                     ) : (
                       <div className="text-center py-4 text-muted-foreground">
                         No pending quotes
                       </div>
                     )}
                  </>
                )}

                {isWorkshop && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                       <div>
                         <p className="text-sm font-medium">Accepted</p>
                         <p className="text-2xl font-bold">
                           {loading ? "..." : stats?.acceptedQuotes || 0}
                         </p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                       <div>
                         <p className="text-sm font-medium">Pending</p>
                         <p className="text-2xl font-bold">
                           {loading ? "..." : (stats?.submittedQuotes - stats?.acceptedQuotes) || 0}
                         </p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                       <div>
                         <p className="text-sm font-medium">Total Submitted</p>
                         <p className="text-2xl font-bold">
                           {loading ? "..." : stats?.submittedQuotes || 0}
                         </p>
                       </div>
                    </div>
                  </div>
                )}

                {(isQueryAdmin || isGeneralAdmin) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                       <div>
                         <p className="text-sm font-medium">Total Orders</p>
                         <p className="text-2xl font-bold">
                           {loading ? "..." : stats?.totalServiceOrders || 0}
                         </p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                       <div>
                         <p className="text-sm font-medium">Completed</p>
                         <p className="text-2xl font-bold">
                           {loading ? "..." : stats?.completedOrders || 0}
                         </p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                       <div>
                         <p className="text-sm font-medium">Active</p>
                         <p className="text-2xl font-bold">
                           {loading ? "..." : (stats?.totalServiceOrders - stats?.completedOrders) || 0}
                         </p>
                       </div>
                    </div>

                    {isGeneralAdmin && (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                            <Users className="h-5 w-5 text-amber-600" />
                          </div>
                           <div>
                             <p className="text-sm font-medium">Total Users</p>
                             <p className="text-2xl font-bold">
                               {loading ? "..." : stats?.totalUsers || 0}
                             </p>
                           </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate(
                      isWorkshop
                        ? "/my-quotes"
                        : "/service-orders"
                    )
                  }
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
