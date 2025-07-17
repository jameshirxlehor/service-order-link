import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Plus, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const ServiceOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isCityHall = user.user_type === UserRole.CITY_HALL;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todas as ordens de serviço
            </p>
          </div>
          {isCityHall && (
            <Button
              className="sm:w-auto w-full"
              onClick={() => navigate("/service-orders/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem de Serviço
            </Button>
          )}
        </div>

        <Card className="animate-enter">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Construction className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle>Página em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Esta página está sendo reconstruída para trabalhar com o novo sistema de banco de dados. 
              Em breve estará disponível com todas as funcionalidades de gestão de ordens de serviço.
            </p>
            {isCityHall && (
              <Button onClick={() => navigate("/service-orders/new")}>
                Criar Nova Ordem de Serviço
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ServiceOrders;