import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Activity } from 'lucide-react';
import { checkSupabaseConnection, checkEdgeFunctionHealth } from '@/integrations/supabase/client';

interface DiagnosticResult {
  status: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  details?: any;
  timestamp: string;
}

export const SystemDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addDiagnostic = (result: Omit<DiagnosticResult, 'timestamp'>) => {
    setDiagnostics(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    }]);
  };

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    // 1. Testar variáveis de ambiente
    addDiagnostic({
      status: 'success',
      title: '🔐 Variáveis de Ambiente',
      message: 'Verificando configuração...'
    });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      addDiagnostic({
        status: 'error',
        title: '❌ Variáveis de Ambiente',
        message: 'VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas',
        details: {
          supabase_url_exists: !!supabaseUrl,
          supabase_key_exists: !!supabaseKey,
          solution: 'Configure as variáveis no arquivo .env.local'
        }
      });
    } else {
      addDiagnostic({
        status: 'success',
        title: '✅ Variáveis de Ambiente',
        message: 'Configuração encontrada',
        details: {
          supabase_url: supabaseUrl.substring(0, 30) + '...',
          supabase_key_prefix: supabaseKey.substring(0, 20) + '...'
        }
      });
    }

    // 2. Testar conexão com Supabase
    addDiagnostic({
      status: 'warning',
      title: '🔄 Testando Supabase',
      message: 'Verificando conexão com banco...'
    });

    try {
      const supabaseHealthy = await checkSupabaseConnection();
      if (supabaseHealthy) {
        addDiagnostic({
          status: 'success',
          title: '✅ Supabase Conectado',
          message: 'Conexão com banco de dados OK'
        });
      } else {
        addDiagnostic({
          status: 'error',
          title: '❌ Supabase Falhou',
          message: 'Erro na conexão com banco de dados',
          details: {
            possible_causes: ['RLS bloqueando acesso', 'Tabelas não criadas', 'Credenciais inválidas']
          }
        });
      }
    } catch (error: any) {
      addDiagnostic({
        status: 'error',
        title: '❌ Supabase Erro',
        message: `Erro na conexão: ${error.message}`,
        details: { error: error.message }
      });
    }

    // 3. Testar Edge Function
    addDiagnostic({
      status: 'warning',
      title: '🔄 Testando Edge Function',
      message: 'Verificando analyze-contract...'
    });

    try {
      const edgeFunctionHealthy = await checkEdgeFunctionHealth();
      if (edgeFunctionHealthy) {
        addDiagnostic({
          status: 'success',
          title: '✅ Edge Function OK',
          message: 'analyze-contract respondendo normalmente'
        });
      } else {
        addDiagnostic({
          status: 'error',
          title: '❌ Edge Function Falhou',
          message: 'Edge Function não está respondendo',
          details: {
            possible_causes: [
              'Function não deployada',
              'Erro de CORS',
              'API key não configurada',
              'Timeout na requisição'
            ],
            solution: 'Verifique se a function foi deployada no Supabase'
          }
        });
      }
    } catch (error: any) {
      addDiagnostic({
        status: 'error',
        title: '❌ Edge Function Erro',
        message: `Erro na Edge Function: ${error.message}`,
        details: { 
          error: error.message,
          possible_solutions: [
            'Deploy da function: supabase functions deploy analyze-contract',
            'Verificar logs: supabase functions logs',
            'Verificar secrets: supabase secrets list'
          ]
        }
      });
    }

    // 4. Testar navegador
    addDiagnostic({
      status: 'success',
      title: '🌐 Navegador',
      message: `${navigator.userAgent.split(' ').slice(-2).join(' ')}`,
      details: {
        supports_fetch: typeof fetch !== 'undefined',
        supports_local_storage: typeof localStorage !== 'undefined',
        supports_file_api: typeof FileReader !== 'undefined'
      }
    });

    // 5. Testar conectividade geral
    addDiagnostic({
      status: 'warning',
      title: '🔄 Testando Internet',
      message: 'Verificando conectividade...'
    });

    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        addDiagnostic({
          status: 'success',
          title: '✅ Internet Conectada',
          message: 'Conectividade externa OK'
        });
      } else {
        addDiagnostic({
          status: 'warning',
          title: '⚠️ Internet Limitada',
          message: 'Conectividade com limitações'
        });
      }
    } catch (error) {
      addDiagnostic({
        status: 'error',
        title: '❌ Internet Falhou',
        message: 'Problema de conectividade',
        details: { error: 'Sem acesso à internet ou firewall bloqueando' }
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">ERRO</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">TESTANDO</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Diagnóstico do Sistema
        </CardTitle>
        <CardDescription>
          Verificar conectividade e configuração do sistema de análise de contratos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runFullDiagnostic} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>
          
          {diagnostics.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setDiagnostics([])}
            >
              Limpar
            </Button>
          )}
        </div>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h3 className="font-semibold">Resultados do Diagnóstico:</h3>
            
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.status)}
                    <span className="font-medium">{diagnostic.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(diagnostic.status)}
                    <span className="text-xs text-gray-500">{diagnostic.timestamp}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{diagnostic.message}</p>
                
                {diagnostic.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Ver detalhes técnicos
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnostic.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {/* Resumo final */}
            {!isRunning && diagnostics.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Resumo:</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-bold text-lg">
                      {diagnostics.filter(d => d.status === 'success').length}
                    </div>
                    <div>Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-600 font-bold text-lg">
                      {diagnostics.filter(d => d.status === 'warning').length}
                    </div>
                    <div>Avisos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-bold text-lg">
                      {diagnostics.filter(d => d.status === 'error').length}
                    </div>
                    <div>Erros</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instruções de troubleshooting */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">🔧 Troubleshooting:</h4>
          <ul className="space-y-1 text-gray-600">
            <li>• <strong>Edge Function não responde:</strong> Verifique se foi deployada no Supabase</li>
            <li>• <strong>Erro CORS:</strong> Headers podem estar bloqueando a requisição</li>
            <li>• <strong>Supabase falha:</strong> Verifique RLS e credenciais no .env.local</li>
            <li>• <strong>API Key:</strong> Configure OPEN_ROUTER ou OPENAI_API_KEY nos secrets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemDiagnostic;
