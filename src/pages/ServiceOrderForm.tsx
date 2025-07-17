
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  VehicleType,
  FuelType,
  TransmissionType,
  ServiceType,
  ServiceCategory,
} from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Car,
  Wrench,
  Save,
  Send,
  FileText,
  ArrowLeft,
  SquareAsterisk,
} from "lucide-react";

// Form schema
const serviceOrderSchema = z.object({
  // Vehicle details
  vehicleType: z.string().min(1, "Vehicle type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  fuel: z.string().min(1, "Fuel type is required"),
  year: z.string().min(1, "Year is required"),
  engine: z.string().min(1, "Engine details are required"),
  color: z.string().min(1, "Color is required"),
  transmission: z.string().min(1, "Transmission type is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  chassis: z.string().min(1, "Chassis number is required"),
  km: z.string().min(1, "Kilometers are required"),
  marketValue: z.string().min(1, "Market value is required"),
  registration: z.string(),
  tankCapacity: z.string(),

  // Service details
  city: z.string().min(1, "City is required"),
  serviceType: z.string().min(1, "Service type is required"),
  serviceCategory: z.string().min(1, "Service category is required"),
  location: z.string().min(1, "Vehicle location is required"),
  notes: z.string(),
});

const ServiceOrderForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("vehicle");

  // Form setup
  const form = useForm<z.infer<typeof serviceOrderSchema>>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      vehicleType: "",
      brand: "",
      model: "",
      fuel: "",
      year: "",
      engine: "",
      color: "",
      transmission: "",
      licensePlate: "",
      chassis: "",
      km: "",
      marketValue: "",
      registration: "",
      tankCapacity: "",
      city: "",
      serviceType: "",
      serviceCategory: "",
      location: "",
      notes: "",
    },
  });

  // Form submission
  const onSubmit = (values: z.infer<typeof serviceOrderSchema>, action: "save" | "send") => {
    console.log(values, action);
    
    if (action === "save") {
      toast({
        title: "Service Order Saved",
        description: "The service order has been saved as a draft.",
      });
      navigate("/service-orders");
    } else {
      toast({
        title: "Service Order Created",
        description: "The service order is ready to be sent to workshops.",
      });
      navigate("/service-orders");
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/service-orders")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create Service Order
              </h1>
              <p className="text-muted-foreground">
                Fill in the details to create a new service order
              </p>
            </div>
          </div>
        </div>

        <Card className="animate-enter">
          <CardHeader>
            <CardTitle>Service Order Details</CardTitle>
            <CardDescription>
              Enter all required information for this service order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => onSubmit(values, "save"))}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="vehicle" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Vehicle Details
                      </TabsTrigger>
                      <TabsTrigger value="service" className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Service Details
                      </TabsTrigger>
                    </TabsList>

                    {/* Vehicle Details Tab */}
                    <TabsContent value="vehicle" className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vehicleType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Vehicle Type <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Vehicle Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={VehicleType.CAR}>Car</SelectItem>
                                  <SelectItem value={VehicleType.TRUCK}>Truck</SelectItem>
                                  <SelectItem value={VehicleType.VAN}>Van</SelectItem>
                                  <SelectItem value={VehicleType.MOTORCYCLE}>Motorcycle</SelectItem>
                                  <SelectItem value={VehicleType.BUS}>Bus</SelectItem>
                                  <SelectItem value={VehicleType.OTHER}>Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Brand <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter vehicle brand" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Model <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter vehicle model" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fuel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Fuel Type <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Fuel Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={FuelType.GASOLINE}>Gasoline</SelectItem>
                                  <SelectItem value={FuelType.DIESEL}>Diesel</SelectItem>
                                  <SelectItem value={FuelType.ETHANOL}>Ethanol</SelectItem>
                                  <SelectItem value={FuelType.FLEX}>Flex</SelectItem>
                                  <SelectItem value={FuelType.ELECTRIC}>Electric</SelectItem>
                                  <SelectItem value={FuelType.HYBRID}>Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Year <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter vehicle year" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="engine"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Engine <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter engine details" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Color <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter vehicle color" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="transmission"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Transmission <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Transmission Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={TransmissionType.MANUAL}>Manual</SelectItem>
                                  <SelectItem value={TransmissionType.AUTOMATIC}>Automatic</SelectItem>
                                  <SelectItem value={TransmissionType.SEMI_AUTOMATIC}>Semi-Automatic</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="licensePlate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                License Plate <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter license plate" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="chassis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Chassis <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter chassis number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="km"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Kilometers <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter current km" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="marketValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Market Value <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter market value" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="registration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter registration info" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tankCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tank Capacity</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter tank capacity" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/service-orders")}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("service")}
                        >
                          Continue
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Service Details Tab */}
                    <TabsContent value="service" className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                City <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Service Type <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Service Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={ServiceType.MAINTENANCE}>Manutenção</SelectItem>
                                  <SelectItem value={ServiceType.REPAIR}>Reparo</SelectItem>
                                  <SelectItem value={ServiceType.INSPECTION}>Inspeção</SelectItem>
                                  <SelectItem value={ServiceType.OTHER}>Outros</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Service Category <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Service Category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={ServiceCategory.MECHANICAL}>Mechanical</SelectItem>
                                  <SelectItem value={ServiceCategory.ELECTRICAL}>Electrical</SelectItem>
                                  <SelectItem value={ServiceCategory.BODY_WORK}>Body Work</SelectItem>
                                  <SelectItem value={ServiceCategory.PAINTING}>Painting</SelectItem>
                                  <SelectItem value={ServiceCategory.TIRE}>Tire</SelectItem>
                                  <SelectItem value={ServiceCategory.GLASS}>Glass</SelectItem>
                                  <SelectItem value={ServiceCategory.OTHER}>Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Vehicle Location <SquareAsterisk className="h-2 w-2 text-destructive inline" />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter vehicle location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter any additional notes or instructions"
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("vehicle")}
                        >
                          Back
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            variant="outline"
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Draft
                          </Button>
                          <Button
                            type="button"
                            className="gap-2"
                            onClick={() => {
                              const isValid = form.trigger();
                              if (isValid) {
                                const values = form.getValues();
                                onSubmit(values, "send");
                              }
                            }}
                          >
                            <Send className="h-4 w-4" />
                            Create Order
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ServiceOrderForm;
