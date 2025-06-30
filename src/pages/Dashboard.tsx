
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { contractService } from "@/services/contractService";
import { supabase } from "@/integrations/supabase/client";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  // Buscar estatísticas dos contratos base
  const { data: baseContracts, isLoading: loadingBase } = useQuery({
    queryKey: ['base-contracts-stats'],
    queryFn: () => contractService.getUserBaseContracts(),
  });

  // Buscar histórico de análises
  const { data: analysisHistory, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['analysis-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (loadingBase || loadingAnalysis) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  const totalContratos = baseContracts?.length || 0;
  const totalAnalises = analysisHistory?.length || 0;
  const contratosRecentes = baseContracts?.filter(contract => {
    const created = new Date(contract.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }).length || 0;

  // Calcular total de erros das análises
  const totalErros = analysisHistory?.reduce((sum, analysis) => sum + (analysis.errors_found || 0), 0) || 0;

  // Dados para gráfico - últimas 7 análises
  const chartData = analysisHistory?.slice(0, 7).reverse().map((analysis, index) => ({
    name: `Análise ${index + 1}`,
    erros: analysis.errors_found || 0,
    data: new Date(analysis.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de análise de contratos</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contratos Base</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalContratos}</div>
              <p className="text-xs text-muted-foreground">
                +{contratosRecentes} esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Análises Realizadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{totalAnalises}</div>
              <p className="text-xs text-muted-foreground">
                Total de análises
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totalErros}</div>
              <p className="text-xs text-muted-foreground">
                Erros detectados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">Online</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Funcionando normalmente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Atividades Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Erros por Análise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Erros Detectados (Últimas Análises)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="erros" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisHistory?.slice(0, 5).map((analysis) => (
                  <div key={analysis.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className={`h-2 w-2 rounded-full ${
                      (analysis.errors_found || 0) === 0 ? 'bg-success' : 'bg-destructive'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Análise de {analysis.analyzed_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.errors_found || 0} erros encontrados • {' '}
                        {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhuma atividade recente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
