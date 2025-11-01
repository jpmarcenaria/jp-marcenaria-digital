// Edge Function para processamento do formulário de contato
// JP Marcenaria Digital

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  service?: string;
  budget?: string;
  timeline?: string;
  source?: string;
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
    const formData: ContactFormData = await req.json();

    // Validação básica
    const { name, email, subject, message } = formData;
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios: nome, email, assunto e mensagem' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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

    // Salvar no banco de dados
    const { data: contact, error: dbError } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email,
          phone: formData.phone,
          subject,
          message,
          service: formData.service,
          budget: formData.budget,
          timeline: formData.timeline,
          source: formData.source || 'website',
          status: 'new',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar contato:', dbError);
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Enviar email de notificação (opcional)
    try {
      await sendNotificationEmail(formData);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Não falhar a requisição por causa do email
    }

    // Resposta de sucesso
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso!',
        id: contact.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Função para enviar email de notificação
async function sendNotificationEmail(formData: ContactFormData) {
  const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL');
  const emailApiKey = Deno.env.get('EMAIL_API_KEY');

  if (!emailServiceUrl || !emailApiKey) {
    console.log('Serviço de email não configurado');
    return;
  }

  const emailPayload = {
    to: 'contato@jpmarcenaria.com',
    subject: `Novo contato: ${formData.subject}`,
    html: `
      <h2>Novo contato recebido</h2>
      <p><strong>Nome:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      ${formData.phone ? `<p><strong>Telefone:</strong> ${formData.phone}</p>` : ''}
      <p><strong>Assunto:</strong> ${formData.subject}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${formData.message}</p>
      ${formData.service ? `<p><strong>Serviço:</strong> ${formData.service}</p>` : ''}
      ${formData.budget ? `<p><strong>Orçamento:</strong> ${formData.budget}</p>` : ''}
      ${formData.timeline ? `<p><strong>Prazo:</strong> ${formData.timeline}</p>` : ''}
    `
  };

  await fetch(emailServiceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${emailApiKey}`
    },
    body: JSON.stringify(emailPayload)
  });
}