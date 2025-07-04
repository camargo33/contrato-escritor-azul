import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AnalysisReport from "@/components/AnalysisReport";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";

const AnalysisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis-details', id],
    queryFn: async () => {
      if (!id) throw new Error("ID da análise não fornecido");
      
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/relatorios')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Relatórios
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/relatorios')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Relatórios
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Análise não encontrada
              </h2>
              <p className="text-muted-foreground">
                A análise solicitada não foi encontrada ou você não tem permissão para visualizá-la.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/relatorios')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Relatórios
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Detalhes da Análise
                </h1>
                <p className="text-muted-foreground">
                  {analysis.analyzed_filename}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <AnalysisReport
            content={typeof analysis.analysis_content === 'string' 
              ? analysis.analysis_content 
              : JSON.stringify(analysis.analysis_content)
            }
            timestamp={analysis.analysis_timestamp}
            filename={analysis.analyzed_filename}
            onNewAnalysis={() => navigate('/analise')}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetails;