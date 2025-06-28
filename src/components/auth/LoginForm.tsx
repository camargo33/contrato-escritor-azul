
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import InteractiveButton from "../InteractiveButton";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cleanupAuthState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Limpar estado anterior
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continuar mesmo se falhar
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        // Force page reload para garantir estado limpo
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      if (error.message?.includes("Invalid login credentials")) {
        setError("Email ou senha incorretos. Verifique suas credenciais.");
      } else if (error.message?.includes("Email not confirmed")) {
        setError("Por favor, confirme seu email antes de fazer login.");
      } else {
        setError(error.message || "Erro ao fazer login. Tente novamente.");
      }
      
      toast.error("Erro no login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-label text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 focus-ring hover:border-primary/50 transition-colors"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-label text-foreground">
          Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 focus-ring hover:border-primary/50 transition-colors"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <InteractiveButton
        type="submit"
        className="w-full bg-gradient-orange hover:opacity-90 text-white font-medium shadow-colored"
        loading={isLoading}
        loadingText="Entrando..."
        interactive={true}
        glowEffect={true}
        disabled={isLoading}
      >
        {!isLoading && "Entrar"}
      </InteractiveButton>
    </form>
  );
};

export default LoginForm;
