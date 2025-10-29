import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255).optional().or(z.literal('')),
  phone_whatsapp: z.string().min(10, 'Telefone inválido').max(20),
  city: z.string().min(2).max(100).optional().or(z.literal('')),
  budget_range: z.string().optional(),
  message: z.string().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

const Orcamento = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const { error } = await supabase.from('leads').insert([
      {
        name: data.name,
        email: data.email || null,
        phone_whatsapp: data.phone_whatsapp,
        city: data.city || null,
        budget_range: data.budget_range || null,
        message: data.message || null,
        source: 'website_orcamento',
      },
    ]);

    if (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente ou entre em contato pelo WhatsApp',
        variant: 'destructive',
      });
    } else {
      setSubmitted(true);
      reset();
      toast({
        title: 'Orçamento solicitado!',
        description: 'Entraremos em contato em breve.',
      });
    }

    setLoading(false);
  };

  const whatsappMessage = encodeURIComponent(
    'Olá! Gostaria de solicitar um orçamento para móveis planejados.'
  );
  const whatsappLink = `https://wa.me/5511987654321?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
              Solicite seu Orçamento
            </h1>
            <p className="text-muted-foreground text-lg">
              Preencha o formulário abaixo e receba uma proposta personalizada em até 24 horas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-secondary text-3xl">✓</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-2">Obrigado!</h3>
                  <p className="text-muted-foreground mb-6">
                    Recebemos sua solicitação e entraremos em contato em breve.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Enviar outro orçamento
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Seu nome"
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone_whatsapp">WhatsApp *</Label>
                    <Input
                      id="phone_whatsapp"
                      {...register('phone_whatsapp')}
                      placeholder="(11) 98765-4321"
                      className="mt-1"
                    />
                    {errors.phone_whatsapp && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.phone_whatsapp.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="São Paulo"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget_range">Faixa de Investimento</Label>
                    <select
                      id="budget_range"
                      {...register('budget_range')}
                      className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                    >
                      <option value="">Selecione...</option>
                      <option value="ate-15k">Até R$ 15.000</option>
                      <option value="15k-30k">R$ 15.000 - R$ 30.000</option>
                      <option value="30k-50k">R$ 30.000 - R$ 50.000</option>
                      <option value="acima-50k">Acima de R$ 50.000</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="Descreva o que você precisa..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Solicitar Orçamento'}
                  </Button>
                </form>
              )}
            </Card>

            {/* WhatsApp CTA */}
            <div className="space-y-6">
              <Card className="p-8 bg-gradient-brass text-secondary-foreground">
                <Phone size={48} className="mb-4" />
                <h3 className="font-heading text-2xl font-bold mb-2">
                  Prefere falar pelo WhatsApp?
                </h3>
                <p className="mb-6 opacity-90">
                  Converse diretamente com nossa equipe e tire todas as suas dúvidas
                </p>
                <Button
                  asChild
                  className="w-full bg-background text-foreground hover:bg-background/90"
                >
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    Abrir WhatsApp
                  </a>
                </Button>
              </Card>

              <Card className="p-8">
                <h3 className="font-heading text-xl font-bold mb-4">
                  Como funciona?
                </h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex">
                    <span className="text-secondary font-bold mr-2">1.</span>
                    <span>Você preenche o formulário com seus dados</span>
                  </li>
                  <li className="flex">
                    <span className="text-secondary font-bold mr-2">2.</span>
                    <span>Nossa equipe analisa sua solicitação</span>
                  </li>
                  <li className="flex">
                    <span className="text-secondary font-bold mr-2">3.</span>
                    <span>Entramos em contato em até 24h</span>
                  </li>
                  <li className="flex">
                    <span className="text-secondary font-bold mr-2">4.</span>
                    <span>Agendamos uma visita técnica</span>
                  </li>
                  <li className="flex">
                    <span className="text-secondary font-bold mr-2">5.</span>
                    <span>Elaboramos projeto 3D e orçamento detalhado</span>
                  </li>
                </ol>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Orcamento;
