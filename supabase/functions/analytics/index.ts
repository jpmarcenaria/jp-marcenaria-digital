// Edge Function para Analytics e Tracking
// JP Marcenaria Digital

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface AnalyticsEvent {
  event_name: string;
  page_url: string;
  user_agent?: string;
  referrer?: string;
  session_id?: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse do body
    const eventData: AnalyticsEvent = await req.json();

    // Validação básica
    if (!eventData.event_name || !eventData.page_url) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios: event_name e page_url' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair informações do request
    const userAgent = req.headers.get('user-agent') || eventData.user_agent;
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Processar dados do evento
    const processedEvent = {
      event_name: eventData.event_name,
      page_url: eventData.page_url,
      user_agent: userAgent,
      referrer: eventData.referrer,
      session_id: eventData.session_id,
      user_id: eventData.user_id,
      client_ip: clientIP,
      properties: eventData.properties || {},
      timestamp: eventData.timestamp || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Salvar evento no banco
    const { error: dbError } = await supabase
      .from('analytics_events')
      .insert([processedEvent]);

    if (dbError) {
      console.error('Erro ao salvar evento:', dbError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Processar eventos especiais
    await processSpecialEvents(eventData, supabase);

    // Resposta de sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Evento registrado com sucesso'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function de Analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Processar eventos especiais (conversões, metas, etc.)
async function processSpecialEvents(eventData: AnalyticsEvent, supabase: any) {
  const { event_name, properties } = eventData;

  // Eventos de conversão
  const conversionEvents = [
    'contact_form_submit',
    'phone_click',
    'whatsapp_click',
    'email_click',
    'quote_request'
  ];

  if (conversionEvents.includes(event_name)) {
    await supabase
      .from('conversions')
      .insert([{
        event_name,
        conversion_type: getConversionType(event_name),
        properties,
        timestamp: new Date().toISOString()
      }]);
  }

  // Eventos de engajamento
  const engagementEvents = [
    'page_view',
    'scroll_depth',
    'time_on_page',
    'gallery_view',
    'service_view'
  ];

  if (engagementEvents.includes(event_name)) {
    await updateEngagementMetrics(eventData, supabase);
  }
}

// Determinar tipo de conversão
function getConversionType(eventName: string): string {
  const typeMap: Record<string, string> = {
    'contact_form_submit': 'lead',
    'phone_click': 'contact',
    'whatsapp_click': 'contact',
    'email_click': 'contact',
    'quote_request': 'quote'
  };

  return typeMap[eventName] || 'other';
}

// Atualizar métricas de engajamento
async function updateEngagementMetrics(eventData: AnalyticsEvent, supabase: any) {
  const { page_url, session_id, properties } = eventData;

  if (!session_id) return;

  // Atualizar ou criar sessão
  const { data: existingSession } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_id', session_id)
    .single();

  if (existingSession) {
    // Atualizar sessão existente
    await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString(),
        page_views: existingSession.page_views + 1,
        total_time: properties?.timeOnPage ? 
          existingSession.total_time + properties.timeOnPage : 
          existingSession.total_time
      })
      .eq('session_id', session_id);
  } else {
    // Criar nova sessão
    await supabase
      .from('user_sessions')
      .insert([{
        session_id,
        first_page: page_url,
        last_activity: new Date().toISOString(),
        page_views: 1,
        total_time: properties?.timeOnPage || 0,
        created_at: new Date().toISOString()
      }]);
  }
}