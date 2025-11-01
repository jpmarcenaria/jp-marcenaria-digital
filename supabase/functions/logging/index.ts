// Edge Function para Logging Centralizado
// JP Marcenaria Digital

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  environment?: string;
}

interface LogBatch {
  logs: LogEntry[];
  session_id: string;
  user_id?: string;
  environment: string;
  timestamp: string;
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
    const logData: LogBatch = await req.json();

    // Validação básica
    if (!logData.logs || !Array.isArray(logData.logs) || logData.logs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Logs são obrigatórios e devem ser um array não vazio' }),
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

    // Processar logs
    const processedLogs = logData.logs.map(log => ({
      ...log,
      session_id: logData.session_id,
      user_id: logData.user_id,
      environment: logData.environment || 'unknown',
      client_ip: req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown',
      created_at: new Date().toISOString()
    }));

    // Salvar logs no banco
    const { error: dbError } = await supabase
      .from('application_logs')
      .insert(processedLogs);

    if (dbError) {
      console.error('Erro ao salvar logs:', dbError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Processar logs críticos
    const criticalLogs = processedLogs.filter(log => log.level === 'critical' || log.level === 'error');
    if (criticalLogs.length > 0) {
      await processCriticalLogs(criticalLogs);
    }

    // Atualizar métricas
    await updateLogMetrics(processedLogs, supabase);

    // Resposta de sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${processedLogs.length} logs processados com sucesso`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function de Logging:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Processar logs críticos (alertas, notificações)
async function processCriticalLogs(criticalLogs: any[]) {
  try {
    for (const log of criticalLogs) {
      // Enviar alerta para Slack/Discord
      await sendCriticalAlert(log);
      
      // Criar incident se necessário
      if (log.level === 'critical') {
        await createIncident(log);
      }
    }
  } catch (error) {
    console.error('Erro ao processar logs críticos:', error);
  }
}

// Enviar alerta crítico
async function sendCriticalAlert(log: any) {
  try {
    const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    
    if (webhookUrl) {
      const color = log.level === 'critical' ? '#ff0000' : '#ff9900';
      const emoji = log.level === 'critical' ? '🚨' : '⚠️';
      
      const slackMessage = {
        text: `${emoji} ${log.level.toUpperCase()}: ${log.message}`,
        attachments: [
          {
            color: color,
            fields: [
              {
                title: "Nível",
                value: log.level.toUpperCase(),
                short: true
              },
              {
                title: "Ambiente",
                value: log.environment,
                short: true
              },
              {
                title: "URL",
                value: log.url || 'N/A',
                short: true
              },
              {
                title: "Sessão",
                value: log.session_id,
                short: true
              },
              {
                title: "Timestamp",
                value: log.timestamp,
                short: false
              },
              {
                title: "Contexto",
                value: log.context ? JSON.stringify(log.context, null, 2) : 'N/A',
                short: false
              }
            ]
          }
        ]
      };

      if (log.stack) {
        slackMessage.attachments[0].fields.push({
          title: "Stack Trace",
          value: `\`\`\`${log.stack.substring(0, 1000)}\`\`\``,
          short: false
        });
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });
    }
  } catch (error) {
    console.error('Erro ao enviar alerta crítico:', error);
  }
}

// Criar incident para logs críticos
async function createIncident(log: any) {
  try {
    // Aqui você pode integrar com ferramentas como PagerDuty, Opsgenie, etc.
    console.log('Incident criado para log crítico:', log.message);
    
    // Exemplo de integração com PagerDuty
    const pagerDutyKey = Deno.env.get('PAGERDUTY_INTEGRATION_KEY');
    
    if (pagerDutyKey) {
      const incident = {
        routing_key: pagerDutyKey,
        event_action: 'trigger',
        payload: {
          summary: `[JP Marcenaria] ${log.message}`,
          source: 'jp-marcenaria-logging',
          severity: 'critical',
          component: log.context?.component || 'frontend',
          group: 'jp-marcenaria',
          class: log.level,
          custom_details: {
            environment: log.environment,
            url: log.url,
            session_id: log.session_id,
            user_id: log.user_id,
            context: log.context,
            stack: log.stack
          }
        }
      };

      await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
    }
  } catch (error) {
    console.error('Erro ao criar incident:', error);
  }
}

// Atualizar métricas de log
async function updateLogMetrics(logs: any[], supabase: any) {
  try {
    const logCounts = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const metrics = Object.entries(logCounts).map(([level, count]) => ({
      metric_name: `logs_${level}_total`,
      metric_value: count,
      labels: {
        environment: logs[0]?.environment || 'unknown',
        level: level
      },
      timestamp: new Date().toISOString()
    }));

    await supabase
      .from('metrics')
      .insert(metrics);

  } catch (error) {
    console.error('Erro ao atualizar métricas:', error);
  }
}

// Função para limpeza de logs antigos (executar periodicamente)
export async function cleanupOldLogs() {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Manter logs por 30 dias (debug/info) e 90 dias (warn/error/critical)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Deletar logs debug/info antigos
    await supabase
      .from('application_logs')
      .delete()
      .in('level', ['debug', 'info'])
      .lt('created_at', thirtyDaysAgo);

    // Deletar logs warn/error/critical muito antigos
    await supabase
      .from('application_logs')
      .delete()
      .in('level', ['warn', 'error', 'critical'])
      .lt('created_at', ninetyDaysAgo);

    console.log('Limpeza de logs antigos concluída');
  } catch (error) {
    console.error('Erro na limpeza de logs:', error);
  }
}