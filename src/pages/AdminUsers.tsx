
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { supabase, safeQuery } from "@/lib/supabase";
import { UserRole } from "@/types";
import {
  Users,
  User,
  Building,
  Wrench,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const navigate = useNavigate();
  
  // Query to fetch all users with error handling
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_profiles')
        .select('*');
      
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      const { data, error } = await safeQuery(() => 
        query.order('created_at', { ascending: false })
      );
        
      if (error) throw error;
      return data || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Function to filter users based on search term
  const filteredUsers = (users || []).filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (user.name || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.login || '').toLowerCase().includes(searchLower) ||
      (user.phone || '').toLowerCase().includes(searchLower)
    );
  });
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.CITY_HALL:
        return (
          <Badge className="bg-blue-500">
            <Building className="mr-1 h-3 w-3" />
            Prefeitura
          </Badge>
        );
      case UserRole.WORKSHOP:
        return (
          <Badge className="bg-amber-500">
            <Wrench className="mr-1 h-3 w-3" />
            Oficina
          </Badge>
        );
      case UserRole.QUERY_ADMIN:
        return (
          <Badge className="bg-purple-500">
            <Shield className="mr-1 h-3 w-3" />
            Admin. de Consulta
          </Badge>
        );
      case UserRole.GENERAL_ADMIN:
        return (
          <Badge className="bg-red-500">
            <Shield className="mr-1 h-3 w-3" />
            Admin. Geral
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const handleCreateUser = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A criação de usuários será implementada em breve.",
    });
    // For the future: navigate("/admin/users/new");
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerenciar usuários do sistema
            </p>
          </div>
          <Button 
            className="sm:w-auto w-full"
            onClick={handleCreateUser}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card className="overflow-hidden animate-scale-in">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar usuários..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Perfis</SelectItem>
                    <SelectItem value={UserRole.CITY_HALL}>Prefeitura</SelectItem>
                    <SelectItem value={UserRole.WORKSHOP}>Oficina</SelectItem>
                    <SelectItem value={UserRole.QUERY_ADMIN}>Admin. de Consulta</SelectItem>
                    <SelectItem value={UserRole.GENERAL_ADMIN}>Admin. Geral</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => refetch()}
                >
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold">Erro ao carregar usuários</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    Ocorreu um erro ao buscar os dados. Verifique sua conexão e tente novamente.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => refetch()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Login</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!users || filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {users && users.length > 0 
                            ? "Nenhum usuário encontrado com os filtros atuais" 
                            : "Nenhum usuário cadastrado"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.login || "—"}</TableCell>
                          <TableCell>{user.name || "—"}</TableCell>
                          <TableCell>{user.email || "—"}</TableCell>
                          <TableCell>{user.phone || "—"}</TableCell>
                          <TableCell>{user.role ? getRoleBadge(user.role) : "—"}</TableCell>
                          <TableCell>
                            {user.created_at 
                              ? new Date(user.created_at).toLocaleDateString('pt-BR')
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  toast({
                                    title: "Funcionalidade em desenvolvimento",
                                    description: "A visualização de detalhes será implementada em breve.",
                                  });
                                }}>
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  toast({
                                    title: "Funcionalidade em desenvolvimento",
                                    description: "A edição de usuários será implementada em breve.",
                                  });
                                }}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    toast({
                                      title: "Funcionalidade em desenvolvimento",
                                      description: "A exclusão de usuários será implementada em breve.",
                                    });
                                  }}
                                >
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminUsers;
