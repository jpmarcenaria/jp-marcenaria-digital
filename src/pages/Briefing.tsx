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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSitePhone } from '@/hooks/useSitePhone';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').max(255).optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido').max(20),
  obra: z.string().max(200).optional().or(z.literal('')),
  medidas: z.string().max(500).optional().or(z.literal('')),
  prazo: z.string().max(100).optional().or(z.literal('')),
  observacoes: z.string().max(2000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

const Briefing = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedAmbientes, setSelectedAmbientes] = useState<string[]>([]);
  const [selectedMateriais, setSelectedMateriais] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const ambientes = [
    'Cozinha',
    'Home Office',
    'Closet',
    'Quarto',
    'Área Gourmet',
    'Lavanderia',
    'Banheiro',
    'Sala',
  ];

  const materiais = [
    'MDF Branco',
    'MDF Amadeirado',
    'MDF Laqueado',
    'MDP Melamínico',
    'Painel Ripado',
    'LED Integrado',
    'Blum / Hettich',
  ];

  const toggleAmbiente = (ambiente: string) => {
    setSelectedAmbientes(prev =>
      prev.includes(ambiente)
        ? prev.filter(a => a !== ambiente)
        : [...prev, ambiente]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMateriais(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const { buildWhatsAppWebUrl, buildWhatsAppAppUrl, openWhatsAppWithFallback } = useSitePhone();

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const whatsappMessage = `Olá! Enviei um briefing técnico pelo site.\n\nNome: ${data.nome}\nTelefone: ${data.telefone}\nAmbientes: ${selectedAmbientes.join(', ')}\nMateriais: ${selectedMateriais.join(', ')}`;
    const whatsappLink = buildWhatsAppWebUrl(whatsappMessage);

    const { error } = await supabase.from('briefings').insert([
      {
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone,
        obra: data.obra || null,
        ambientes: selectedAmbientes,
        medidas: data.medidas || null,
        materiais_desejados: selectedMateriais,
        prazo: data.prazo || null,
        observacoes: data.observacoes || null,
        whatsapp_link: whatsappLink,
      },
    ]);

    if (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente ou entre em contato pelo WhatsApp',
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      setSubmitted(true);
      reset();
      setSelectedAmbientes([]);
      setSelectedMateriais([]);
      toast({
        title: 'Briefing enviado!',
        description: 'Retornaremos em até 48 horas com orçamento detalhado.',
      });
      
      // Abrir WhatsApp com o link dinâmico
      window.open(whatsappLink, '_blank');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <ClipboardCheck className="mx-auto mb-4 text-secondary" size={48} />
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
              Briefing Técnico
            </h1>
            <p className="text-muted-foreground text-lg">
              Preencha as informações do projeto para receber orçamento detalhado em até 48 horas úteis
            </p>
          </div>

          {submitted ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-secondary text-4xl">✓</span>
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">Briefing Recebido!</h2>
              <p className="text-muted-foreground mb-2">
                Obrigado! Seu briefing foi enviado com sucesso.
              </p>
              <p className="text-muted-foreground mb-8">
                Retornaremos em até 48 horas úteis com orçamento detalhado e cronograma.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Enviar Outro Briefing
                </Button>
                <Button asChild className="bg-secondary text-secondary-foreground">
                  <a
                    href={buildWhatsAppWebUrl('vim através do Seu web site!')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.preventDefault(); openWhatsAppWithFallback('vim através do Seu web site!'); }}
                    data-whatsapp-web-url={buildWhatsAppWebUrl('vim através do Seu web site!')}
                    data-whatsapp-app-url={buildWhatsAppAppUrl('vim através do Seu web site!')}
                    aria-label="Abrir conversa no WhatsApp"
                  >
                    Abrir WhatsApp
                  </a>
                </Button>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-8">
                {/* Contact Info */}
                <Card className="p-8">
                  <h2 className="font-heading text-2xl font-bold mb-6">Dados de Contato</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        {...register('nome')}
                        placeholder="Seu nome"
                        className="mt-1"
                      />
                      {errors.nome && (
                        <p className="text-destructive text-sm mt-1">{errors.nome.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="telefone">WhatsApp *</Label>
                      <Input
                        id="telefone"
                        {...register('telefone')}
                        placeholder="(11) 98765-4321"
                        className="mt-1"
                      />
                      {errors.telefone && (
                        <p className="text-destructive text-sm mt-1">{errors.telefone.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
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
                  </div>
                </Card>

                {/* Project Details */}
                <Card className="p-8">
                  <h2 className="font-heading text-2xl font-bold mb-6">Detalhes do Projeto</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="obra">Nome da Obra / Projeto</Label>
                      <Input
                        id="obra"
                        {...register('obra')}
                        placeholder="Ex: Apartamento Perdizes"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Ambientes a executar</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ambientes.map((ambiente) => (
                          <div key={ambiente} className="flex items-center space-x-2">
                            <Checkbox
                              id={ambiente}
                              checked={selectedAmbientes.includes(ambiente)}
                              onCheckedChange={() => toggleAmbiente(ambiente)}
                            />
                            <label
                              htmlFor={ambiente}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {ambiente}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="medidas">Medidas Aproximadas</Label>
                      <Textarea
                        id="medidas"
                        {...register('medidas')}
                        placeholder="Ex: Cozinha 3m x 4m, Home Office 2,5m x 3m"
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>

                {/* Materials */}
                <Card className="p-8">
                  <h2 className="font-heading text-2xl font-bold mb-6">Materiais e Acabamentos</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-3 block">Materiais desejados</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {materiais.map((material) => (
                          <div key={material} className="flex items-center space-x-2">
                            <Checkbox
                              id={material}
                              checked={selectedMateriais.includes(material)}
                              onCheckedChange={() => toggleMaterial(material)}
                            />
                            <label
                              htmlFor={material}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {material}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="prazo">Prazo Desejado</Label>
                      <Input
                        id="prazo"
                        {...register('prazo')}
                        placeholder="Ex: 30 dias, Urgente, Sem pressa"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>

                {/* Additional Info */}
                <Card className="p-8">
                  <h2 className="font-heading text-2xl font-bold mb-6">Informações Adicionais</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="observacoes">Observações e Requisitos Especiais</Label>
                      <Textarea
                        id="observacoes"
                        {...register('observacoes')}
                        placeholder="Ex: Preciso de gavetas especiais para utensílios, LED com controle dimmer, etc."
                        rows={5}
                        className="mt-1"
                      />
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                      <p className="text-sm text-muted-foreground mb-2">
                        Tem plantas, referências ou fotos do local?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Envie pelo WhatsApp após o preenchimento do briefing
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Submit */}
                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setSelectedAmbientes([]);
                      setSelectedMateriais([]);
                    }}
                  >
                    Limpar Formulário
                  </Button>
                  <Button
                    type="submit"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Enviando...' : 'Enviar Briefing'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Briefing;
