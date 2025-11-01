// Middleware de autenticação e autorização para JP Marcenaria Digital
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para autenticação
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Rate limiting em memória (para desenvolvimento)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class SecurityService {
  // Rate limiting
  static checkRateLimit(identifier: string, maxRequests = 100, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const key = identifier;
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  // Sanitização de input
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validação de email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validação de senha forte
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Verificação de permissões
  static hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    return user.permissions.includes(permission) || user.role === 'admin';
  }

  // Middleware de autenticação
  static async requireAuth(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados adicionais do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        role: profile?.role || 'user',
        permissions: profile?.permissions || []
      };
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return null;
    }
  }

  // Middleware de autorização
  static requirePermission(permission: string) {
    return async (user: User | null) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      if (!this.hasPermission(user, permission)) {
        throw new Error('Permissão insuficiente');
      }

      return user;
    };
  }

  // Logging de segurança
  static logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Em produção, enviar para serviço de logging
    if (import.meta.env.PROD) {
      // Enviar para Sentry, LogRocket, etc.
      console.warn('Security Event:', logEntry);
    } else {
      console.log('Security Event:', logEntry);
    }
  }

  // Detecção de ataques
  static detectSuspiciousActivity(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /document\.cookie/i,
      /window\.location/i,
      /'.*or.*'.*=/i, // SQL injection básico
      /union.*select/i,
      /drop.*table/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Criptografia de dados sensíveis (lado cliente)
  static async encryptSensitiveData(data: string): Promise<string> {
    if (!crypto.subtle) {
      throw new Error('Web Crypto API não disponível');
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
}

// Hook React para autenticação
export function useAuth(): AuthContext {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Verificar sessão atual
    SecurityService.requireAuth().then(user => {
      setUser(user);
      setIsLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = await SecurityService.requireAuth();
          setUser(user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading
  };
}