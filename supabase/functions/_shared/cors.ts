// Configurações CORS compartilhadas para Edge Functions
// JP Marcenaria Digital

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// CORS mais restritivo para produção
export const productionCorsHeaders = {
  'Access-Control-Allow-Origin': 'https://jpmarcenaria.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// Função para obter headers CORS baseado no ambiente
export function getCorsHeaders(origin?: string) {
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';
  
  if (isDevelopment) {
    return corsHeaders;
  }

  // Em produção, verificar origem
  const allowedOrigins = [
    'https://jpmarcenaria.com',
    'https://www.jpmarcenaria.com',
    'https://jp-marcenaria-digital.vercel.app'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return {
      ...productionCorsHeaders,
      'Access-Control-Allow-Origin': origin
    };
  }

  return productionCorsHeaders;
}