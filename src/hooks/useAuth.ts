
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cleanupAuthState = () => {
    // Remover tokens padrão
    localStorage.removeItem('supabase.auth.token');
    
    // Remover todas as chaves de auth do Supabase
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar sessionStorage se estiver sendo usado
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const signOut = async () => {
    try {
      // Limpar estado primeiro
      cleanupAuthState();
      
      // Tentar logout global
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignorar erros de logout
      }
      
      // Force page reload para estado limpo
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro no logout:', error);
      // Force reload mesmo com erro
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Atualizar estado sincronamente
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Se user foi deslogado, redirecionar
        if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            window.location.href = '/auth';
          }, 0);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    isLoading,
    signOut,
    cleanupAuthState,
    isAuthenticated: !!user
  };
};
