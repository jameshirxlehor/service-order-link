
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Wrench,
  Calendar,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

// Mock data for service orders
const mockServiceOrders = Array.from({ length: 10 }, (_, i) => ({
  id: `so-${i + 1}`,
  number: `SO-${1000 + i}`,
  cityHall: `City Hall ${i % 3 + 1}`,
  vehicle: {
    type: i % 2 === 0 ? "Car" : "Truck",
    brand: i % 3 === 0 ? "Toyota" : i % 3 === 1 ? "Ford" : "Chevrolet",
    model: i % 3 === 0 ? "Corolla" : i % 3 === 1 ? "Ranger" : "S10",
    year: `20${20 + i % 4}`,
    licensePlate: `ABC-${1000 + i}`,
  },
  serviceType: i % 3 === 0 ? "Preventive" : i % 3 === 1 ? "Corrective" : "Emergency",
  createdAt: new Date(2023, i % 12, i + 1),
  status:
    i % 4 === 0
      ? "DRAFT"
      : i % 4 === 1
      ? "SENT"
      : i % 4 === 2
      ? "QUOTED"
      : "COMPLETED",
  quotes: i % 4 === 0 ? 0 : i % 4 === 1 ? 2 : i % 4 === 2 ? 4 : 3,
}));

const ServiceOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityHallFilter, setCityHallFilter] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(mockServiceOrders);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  if (!user) return null;

  const isCityHall = user.role === UserRole.CITY_HALL;
  const isWorkshop = user.role === UserRole.WORKSHOP;
  const isQueryAdmin = user.role === UserRole.QUERY_ADMIN;
  const isGeneralAdmin = user.role === UserRole.GENERAL_ADMIN;

  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="bg-muted/50">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case "SENT":
        return (
          <Badge className="bg-blue-500">
            <FileText className="mr-1 h-3 w-3" />
            Sent
          </Badge>
        );
      case "QUOTED":
        return (
          <Badge className="bg-yellow-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Quoted
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter function
  const applyFilters = () => {
    let filtered = mockServiceOrders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.vehicle.licensePlate
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (cityHallFilter) {
      filtered = filtered.filter(
        (order) => order.cityHall === cityHallFilter
      );
    }

    setFilteredOrders(filtered);
  };

  // Handle opening the send dialog
  const handleSendDialogOpen = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowSendDialog(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all service orders
            </p>
          </div>
          {isCityHall && (
            <Button
              className="sm:w-auto w-full"
              onClick={() => navigate("/service-orders/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Service Order
            </Button>
          )}
        </div>

        <Card className="overflow-hidden animate-scale-in">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search service orders..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="QUOTED">Quoted</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {(isQueryAdmin || isGeneralAdmin) && (
                  <Select
                    value={cityHallFilter}
                    onValueChange={setCityHallFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="City Hall" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All City Halls</SelectItem>
                      <SelectItem value="City Hall 1">City Hall 1</SelectItem>
                      <SelectItem value="City Hall 2">City Hall 2</SelectItem>
                      <SelectItem value="City Hall 3">City Hall 3</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={applyFilters}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Order</TableHead>
                    {(isQueryAdmin || isGeneralAdmin) && (
                      <TableHead>City Hall</TableHead>
                    )}
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quotes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.number}</TableCell>
                      {(isQueryAdmin || isGeneralAdmin) && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{order.cityHall}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {order.vehicle.brand} {order.vehicle.model}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {order.vehicle.licensePlate} · {order.vehicle.year}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{order.serviceType}</TableCell>
                      <TableCell>
                        {order.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {order.quotes > 0 ? (
                          <Badge variant="outline" className="bg-secondary/50">
                            {order.quotes} Quote{order.quotes !== 1 && "s"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/service-orders/${order.id}`)
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                            
                            {isCityHall && order.status === "DRAFT" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/service-orders/${order.id}/edit`)
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSendDialogOpen(order.id)}
                                >
                                  Send to Workshops
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {(isCityHall || isGeneralAdmin) && order.quotes > 0 && (
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/service-orders/${order.id}/quotes`)
                                }
                              >
                                View Quotes
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for sending service order to workshops */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Service Order to Workshops</DialogTitle>
            <DialogDescription>
              Select which accredited workshops should receive this service order
              for quotation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-2">
                <Checkbox id={`workshop-${i}`} />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={`workshop-${i}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Workshop {i}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {i % 2 === 0
                      ? "Mechanical Services Specialist"
                      : "Auto Body and Paint Shop"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSendDialog(false)}>
              Send Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ServiceOrders;
