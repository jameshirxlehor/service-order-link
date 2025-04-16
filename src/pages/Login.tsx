
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z
    .string()
    .email("Digite um e-mail válido")
    .min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || "/dashboard";

  // Check authentication status and redirect if authenticated
  useEffect(() => {
    console.log("Login page - Auth state check:", { isAuthenticated, authLoading });
    
    if (isAuthenticated && !authLoading) {
      console.log("Login page - User is authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Login page - Submitting login form with:", data);
      
      const result = await login(data.email, data.password);
      console.log("Login page - Login result:", result);
      
      if (result.success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao Sistema de Gestão de Ordens de Serviço",
        });
        
        // After a successful login, the isAuthenticated state should be updated in AuthContext
        // which will trigger the useEffect above to handle the redirection
        console.log("Login page - Login success, waiting for auth state update");
      } else {
        toast({
          title: "Falha no login",
          description: "Verifique suas credenciais e tente novamente",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login page - Login form submission error:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao processar seu login",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Entrar</CardTitle>
          <CardDescription>
            Acesse o Sistema de Gestão de Ordens de Serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Este sistema é protegido. Acesso apenas para usuários autorizados.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
