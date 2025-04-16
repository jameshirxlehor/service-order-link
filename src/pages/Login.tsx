
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
  const [loginSuccess, setLoginSuccess] = useState(false);

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
    console.log("Login page - Auth state:", { isAuthenticated, authLoading, loginSuccess });
    
    if (isAuthenticated && !authLoading) {
      console.log("User is authenticated, redirecting to:", from);
      // Use the navigate function directly instead of setTimeout
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from, loginSuccess]);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting login form with:", data);
      
      const result = await login(data.email, data.password);
      console.log("Login result:", result);
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao Sistema de Gestão de Ordens de Serviço",
      });
      
      // Force a state update to trigger the useEffect for navigation
      setLoginSuccess(true);
      
      // Force navigation if the effect doesn't trigger
      setTimeout(() => {
        console.log("Forcing navigation to:", from);
        navigate(from, { replace: true });
      }, 500);
      
    } catch (error) {
      console.error("Login form submission error:", error);
      setLoginSuccess(false);
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
