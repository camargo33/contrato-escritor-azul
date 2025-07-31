import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DebugOpenRouter = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSupabaseFunction = async () => {
    setIsLoading(true);
    try {
      console.log("=== TESTE DE CONFIGURAÇÃO OPENROUTER ===");
      
      const response = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText: "TESTE DE CONFIGURAÇÃO - Este é um contrato de teste para verificar se a API do OpenRouter está funcionando corretamente. CIABRASNET - Valor: R$ 129,99 - Plano: 2024 Combo 600Mbps",
          filename: "teste_configuracao.pdf"
        }
      });

      console.log("📊 Resposta completa:", response);
      
      setDebugInfo({
        success: !response.error,
        data: response.data,
        error: response.error,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("❌ Erro no teste:", error);
      setDebugInfo({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          name: error instanceof Error ? error.name : 'UnknownError'
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    if (!debugInfo) return <AlertCircle className="h-5 w-5 text-gray-500" />;
    if (debugInfo.success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (debugInfo?.success) return "border-green-200 bg-green-50";
    if (debugInfo && !debugInfo.success) return "border-red-200 bg-red-50";
    return "border-yellow-200 bg-yellow-50";
  };

  return (
    <Card className={`mb-4 ${getStatusColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          🔧 Debug OpenRouter - Teste de Configuração
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={testSupabaseFunction} 
            disabled={isLoading}
            className="w-full"
            variant={debugInfo?.success ? "outline" : "default"}
          >
            {isLoading ? "Testando Configuração..." : "🧪 Testar OpenRouter"}
          </Button>
          
          {debugInfo && (
            <div className="space-y-3">
              {/* Status Geral */}
              <div className={`p-3 rounded-lg ${debugInfo.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <h4 className="font-bold text-sm">
                  {debugInfo.success ? '✅ CONFIGURAÇÃO OK' : '❌ CONFIGURAÇÃO COM PROBLEMA'}
                </h4>
              </div>

              {/* Detalhes do Erro */}
              {debugInfo.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-semibold text-red-800 text-sm mb-2">❌ Erro Detectado:</h5>
                  <p className="text-red-700 text-sm mb-2">
                    <strong>Mensagem:</strong> {debugInfo.error.message || 'Erro desconhecido'}
                  </p>
                  {debugInfo.error.debug && (
                    <div className="text-xs text-red-600">
                      <strong>Debug Info:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {JSON.stringify(debugInfo.error.debug, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Detalhes do Sucesso */}
              {debugInfo.success && debugInfo.data && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-semibold text-green-800 text-sm mb-2">✅ Teste Bem-sucedido:</h5>
                  <p className="text-green-700 text-sm">
                    OpenRouter está funcionando! Análise foi concluída com sucesso.
                  </p>
                  {debugInfo.data.debug && (
                    <div className="text-xs text-green-600 mt-2">
                      <strong>Variável usada:</strong> {debugInfo.data.debug.used_variable || 'unknown'}
                    </div>
                  )}
                </div>
              )}

              {/* Informações Técnicas */}
              <details className="text-xs">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  🔍 Ver Detalhes Técnicos Completos
                </summary>
                <div className="p-3 bg-gray-100 rounded text-xs font-mono">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-64">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </details>

              {/* Instruções baseadas no resultado */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-800 text-sm mb-2">📋 Próximos Passos:</h5>
                {debugInfo.success ? (
                  <p className="text-blue-700 text-sm">
                    ✅ Configuração OpenRouter OK! Se a análise ainda não funciona, o problema pode estar no:
                    <br />• Upload/extração de PDF
                    <br />• Fluxo de análise automática
                    <br />• Interface do usuário
                  </p>
                ) : (
                  <div className="text-blue-700 text-sm space-y-1">
                    <p>❌ Problemas detectados na configuração OpenRouter:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Verificar se API key OPEN_ROUTER ou OpenRouter está configurada no Supabase</li>
                      <li>Confirmar que a chave começa com "sk-or-"</li>
                      <li>Verificar se há créditos na conta OpenRouter</li>
                      <li>Testar a chave diretamente no site OpenRouter.ai</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugOpenRouter;