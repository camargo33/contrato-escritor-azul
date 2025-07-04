
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Filter, Search, Calendar, FileText, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const navigate = useNavigate();

  // Buscar histórico completo de análises
  const { data: analysisHistory, isLoading } = useQuery({
    queryKey: ['analysis-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  // Filtrar dados baseado na pesquisa e período
  const filteredData = analysisHistory?.filter(item => {
    const matchesSearch = item.analyzed_filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterPeriod === "all") return matchesSearch;
    
    const itemDate = new Date(item.created_at);
    const now = new Date();
    
    switch (filterPeriod) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return matchesSearch && itemDate > weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return matchesSearch && itemDate > monthAgo;
      case "quarter":
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return matchesSearch && itemDate > quarterAgo;
      default:
        return matchesSearch;
    }
  }) || [];

  // Estatísticas simplificadas
  const totalAnalyses = filteredData.length;
  const totalErrors = filteredData.reduce((sum, item) => sum + (item.errors_found || 0), 0);
  const avgErrors = totalAnalyses > 0 ? (totalErrors / totalAnalyses).toFixed(1) : 0;

  // Dados simplificados para gráfico de barras (análises e erros por dia)
  const dailyData = filteredData.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString('pt-BR');
    const existing = acc.find(d => d.date === date);
    
    if (existing) {
      existing.analyses += 1;
      existing.errors += item.errors_found || 0;
    } else {
      acc.push({ 
        date, 
        analyses: 1,
        errors: item.errors_found || 0
      });
    }
    return acc;
  }, [] as Array<{ 
    date: string; 
    analyses: number;
    errors: number;
  }>).sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

  // Dados para gráfico de pizza (distribuição de erros)
  const errorDistribution = [
    { name: 'Sem erros', value: filteredData.filter(item => (item.errors_found || 0) === 0).length, color: '#10b981' },
    { name: 'Com erros', value: filteredData.filter(item => (item.errors_found || 0) > 0).length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada e estatísticas do sistema</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalAnalyses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{totalErrors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Erros</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{avgErrors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Análises e Erros por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="analyses" fill="#3b82f6" name="Análises" />
                  <Bar dataKey="errors" fill="#ef4444" name="Erros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Análises</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={errorDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {errorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Detalhado de Análises</CardTitle>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome do arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Erros</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => navigate(`/relatorios/analise/${item.id}`)}
                  >
                    <TableCell className="font-medium">
                      {item.analyzed_filename}
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.errors_found === 0 ? "default" : "destructive"}>
                        {item.errors_found || 0} erros
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.analysis_duration_ms ? `${Math.round(item.analysis_duration_ms / 1000)}s` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-success border-success">
                        Concluída
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma análise encontrada com os filtros aplicados
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
