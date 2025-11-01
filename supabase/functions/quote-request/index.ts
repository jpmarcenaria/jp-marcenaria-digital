// Edge Function para Solicitações de Orçamento
// JP Marcenaria Digital

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface QuoteRequest {
  name: string;
  email: string;
  phone: string;
  project_type: string;
  description: string;
  budget_range?: string;
  timeline?: string;
  location?: string;
  attachments?: string[];
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
    const quoteData: QuoteRequest = await req.json();

    // Validação dos campos obrigatórios
    const requiredFields = ['name', 'email', 'phone', 'project_type', 'description'];
    const missingFields = requiredFields.filter(field => !quoteData[field as keyof QuoteRequest]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(quoteData.email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
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

    // Gerar ID único para o orçamento
    const quoteId = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Preparar dados para inserção
    const quoteRecord = {
      quote_id: quoteId,
      name: quoteData.name.trim(),
      email: quoteData.email.toLowerCase().trim(),
      phone: quoteData.phone.trim(),
      project_type: quoteData.project_type,
      description: quoteData.description.trim(),
      budget_range: quoteData.budget_range,
      timeline: quoteData.timeline,
      location: quoteData.location,
      attachments: quoteData.attachments || [],
      status: 'pending',
      priority: calculatePriority(quoteData),
      estimated_value: estimateProjectValue(quoteData),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Salvar solicitação no banco
    const { data: savedQuote, error: dbError } = await supabase
      .from('quote_requests')
      .insert([quoteRecord])
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar solicitação:', dbError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Enviar notificações
    await Promise.all([
      sendCustomerConfirmation(quoteData, quoteId),
      sendInternalNotification(savedQuote),
      logAnalyticsEvent(quoteData, quoteId, supabase)
    ]);

    // Resposta de sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Solicitação de orçamento enviada com sucesso',
        quote_id: quoteId,
        estimated_response_time: '24-48 horas'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function de Orçamento:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Calcular prioridade baseada nos dados do projeto
function calculatePriority(quoteData: QuoteRequest): 'low' | 'medium' | 'high' | 'urgent' {
  let score = 0;

  // Tipo de projeto (peso: 3)
  const highValueProjects = ['cozinha_completa', 'casa_completa', 'comercial'];
  if (highValueProjects.includes(quoteData.project_type)) {
    score += 3;
  }

  // Orçamento (peso: 2)
  if (quoteData.budget_range) {
    const budgetRanges = {
      'acima_50k': 3,
      '30k_50k': 2,
      '15k_30k': 1,
      'ate_15k': 0
    };
    score += (budgetRanges[quoteData.budget_range as keyof typeof budgetRanges] || 0) * 2;
  }

  // Timeline urgente (peso: 2)
  if (quoteData.timeline === 'urgente' || quoteData.timeline === '1_mes') {
    score += 2;
  }

  // Determinar prioridade
  if (score >= 8) return 'urgent';
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

// Estimar valor do projeto
function estimateProjectValue(quoteData: QuoteRequest): number {
  const baseValues: Record<string, number> = {
    'cozinha_completa': 35000,
    'dormitorio': 15000,
    'sala_estar': 20000,
    'escritorio': 12000,
    'banheiro': 8000,
    'area_gourmet': 25000,
    'closet': 18000,
    'comercial': 50000,
    'outros': 10000
  };

  let baseValue = baseValues[quoteData.project_type] || 10000;

  // Ajustar baseado no orçamento informado
  if (quoteData.budget_range) {
    const budgetMultipliers: Record<string, number> = {
      'ate_15k': 0.7,
      '15k_30k': 1.0,
      '30k_50k': 1.3,
      'acima_50k': 1.8
    };
    baseValue *= (budgetMultipliers[quoteData.budget_range] || 1.0);
  }

  return Math.round(baseValue);
}

// Enviar confirmação para o cliente
async function sendCustomerConfirmation(quoteData: QuoteRequest, quoteId: string) {
  try {
    const emailContent = `
      Olá ${quoteData.name},

      Recebemos sua solicitação de orçamento para ${quoteData.project_type}.
      
      Número do pedido: ${quoteId}
      
      Nossa equipe analisará sua solicitação e retornará em até 48 horas com um orçamento detalhado.
      
      Detalhes da solicitação:
      - Tipo de projeto: ${quoteData.project_type}
      - Descrição: ${quoteData.description}
      ${quoteData.budget_range ? `- Faixa de orçamento: ${quoteData.budget_range}` : ''}
      ${quoteData.timeline ? `- Prazo desejado: ${quoteData.timeline}` : ''}
      
      Atenciosamente,
      Equipe JP Marcenaria Digital
    `;

    // Aqui você integraria com seu provedor de email
    console.log('Email de confirmação enviado para:', quoteData.email);
    
  } catch (error) {
    console.error('Erro ao enviar confirmação:', error);
  }
}

// Enviar notificação interna
async function sendInternalNotification(quoteData: any) {
  try {
    // Integração com Slack, Discord ou email interno
    const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    
    if (webhookUrl) {
      const slackMessage = {
        text: `🔨 Nova solicitação de orçamento!`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Nova solicitação de orçamento recebida*\n\n*Cliente:* ${quoteData.name}\n*Email:* ${quoteData.email}\n*Telefone:* ${quoteData.phone}\n*Projeto:* ${quoteData.project_type}\n*Prioridade:* ${quoteData.priority}\n*Valor estimado:* R$ ${quoteData.estimated_value?.toLocaleString('pt-BR')}`
            }
          }
        ]
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });
    }
    
  } catch (error) {
    console.error('Erro ao enviar notificação interna:', error);
  }
}

// Registrar evento de analytics
async function logAnalyticsEvent(quoteData: QuoteRequest, quoteId: string, supabase: any) {
  try {
    await supabase
      .from('analytics_events')
      .insert([{
        event_name: 'quote_request',
        page_url: '/orcamento',
        properties: {
          quote_id: quoteId,
          project_type: quoteData.project_type,
          budget_range: quoteData.budget_range,
          timeline: quoteData.timeline,
          estimated_value: estimateProjectValue(quoteData)
        },
        timestamp: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Erro ao registrar analytics:', error);
  }
}