
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light via-slate-50 to-slate-100 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 stagger-item">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center shadow-colored">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-title text-foreground mb-2 font-bold">
            Analisador de Contratos
          </h1>
          <p className="text-body text-muted-foreground">
            Faça login para acessar suas análises
          </p>
        </div>

        <Card className="shadow-lift border-0 hover-lift transition-all duration-300 stagger-item">
          <CardHeader className="bg-gradient-orange text-white rounded-t-lg">
            <CardTitle className="text-center text-lg font-semibold">
              Acesso ao Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="animate-fade-in">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="signup" className="animate-fade-in">
                <SignUpForm onSignUpSuccess={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 stagger-item">
          <p className="text-caption text-muted-foreground">
            © 2024 Analisador de Contratos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
