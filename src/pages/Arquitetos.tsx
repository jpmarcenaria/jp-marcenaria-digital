import { Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Ruler, 
  Wrench, 
  Package, 
  CheckCircle, 
  Calendar,
  Download,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Arquitetos = () => {
  const process = [
    {
      icon: ClipboardCheck,
      step: '1',
      title: 'Briefing Técnico',
      description: 'Recebemos plantas, elevações e especificações de materiais e acabamentos.',
    },
    {
      icon: Ruler,
      step: '2',
      title: 'Orçamento Detalhado',
      description: 'SLA de 48h úteis. Planilha com metragens, materiais, ferragens e prazos.',
    },
    {
      icon: Calendar,
      step: '3',
      title: 'Cronograma Aprovado',
      description: 'Timeline visual com marcos de produção, instalação e ajustes finais.',
    },
    {
      icon: Wrench,
      step: '4',
      title: 'Produção CNC',
      description: 'Corte de precisão, furação automática e montagem com ferramental profissional.',
    },
    {
      icon: Package,
      step: '5',
      title: 'Entrega e Instalação',
      description: 'Equipe especializada, proteção do ambiente e limpeza pós-instalação.',
    },
    {
      icon: CheckCircle,
      step: '6',
      title: 'Garantia e Suporte',
      description: '12 meses de garantia. Ajustes e assistência técnica sem burocracia.',
    },
  ];

  const materials = [
    { brand: 'Arauco', lines: ['MDP Melaminizado', 'MDF Laqueado'] },
    { brand: 'Duratex', lines: ['Duratree', 'BP Preto Absoluto'] },
    { brand: 'Masisa', lines: ['MDP', 'Perfis'] },
    { brand: 'Blum', lines: ['Dobradiças', 'Corrediças Tandem'] },
    { brand: 'Hettich', lines: ['Corrediças QuadroV6', 'Movento'] },
  ];

  const faqs = [
    {
      question: 'Qual o prazo médio de execução?',
      answer: 'Para projetos residenciais padrão (cozinha + home office), o prazo médio é de 15 a 20 dias úteis após aprovação do orçamento. Projetos maiores ou com acabamentos especiais podem levar de 25 a 30 dias.',
    },
    {
      question: 'Vocês trabalham com que tipo de marcenaria?',
      answer: 'Especializados em marcenaria planejada: cozinhas, home offices, closets, painéis ripados com LED, áreas gourmet e móveis sob medida. Não trabalhamos com reformas estruturais ou alvenaria.',
    },
    {
      question: 'Quais marcas de acabamento vocês utilizam?',
      answer: 'Trabalhamos com as principais marcas do mercado: Arauco, Duratex e Masisa para chapas. Ferragens Blum e Hettich. Também aceitamos especificações de outras marcas mediante consulta.',
    },
    {
      question: 'Como funciona a garantia?',
      answer: '12 meses de garantia para todos os móveis. Cobertura inclui defeitos de fabricação, ferragens e acabamentos. Ajustes naturais de adaptação são atendidos sem custo nos primeiros 30 dias.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-secondary/20 rounded-full">
            <span className="text-secondary text-sm font-medium">Parceria Técnica</span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6">
            Para Arquitetos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Executamos seus projetos com precisão técnica, prazos previsíveis e comunicação transparente. 
            Entendemos a linguagem do projeto e as exigências da obra.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/briefing">Enviar Briefing Técnico</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/portfolio">Ver Cases Técnicos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Como trabalhamos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Processo transparente em 6 etapas, do briefing à entrega
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {process.map((item, index) => (
              <Card key={index} className="p-8 bg-card">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary font-bold text-xl">{item.step}</span>
                    </div>
                  </div>
                  <div>
                    <item.icon className="text-secondary mb-3" size={32} />
                    <h3 className="font-heading text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SLA and Standards */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-card">
              <Clock className="text-secondary mb-4" size={40} />
              <h3 className="font-heading text-2xl font-bold mb-3">SLA de Orçamento</h3>
              <p className="text-muted-foreground mb-4">
                Retorno em até 48 horas úteis com orçamento detalhado, cronograma e lista de materiais.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Planilha técnica completa</li>
                <li>• Especificação de marcas</li>
                <li>• Timeline visual</li>
              </ul>
            </Card>

            <Card className="p-8 bg-card">
              <Ruler className="text-secondary mb-4" size={40} />
              <h3 className="font-heading text-2xl font-bold mb-3">Tolerâncias</h3>
              <p className="text-muted-foreground mb-4">
                Trabalhamos com tolerâncias de ±2mm em cortes CNC e ±1mm em furação.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Nivelamento a laser</li>
                <li>• Ajustes no local</li>
                <li>• Conferência pré-entrega</li>
              </ul>
            </Card>

            <Card className="p-8 bg-card">
              <Shield className="text-secondary mb-4" size={40} />
              <h3 className="font-heading text-2xl font-bold mb-3">Garantias</h3>
              <p className="text-muted-foreground mb-4">
                12 meses de garantia total. Ajustes naturais sem custo nos primeiros 30 dias.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Ferragens originais</li>
                <li>• Acabamentos certificados</li>
                <li>• Suporte técnico dedicado</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Materials and Brands */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Marcas e Acabamentos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trabalhamos com as principais marcas do mercado. Também aceitamos suas especificações.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {materials.map((material, index) => (
              <Card key={index} className="p-6 bg-card text-center">
                <h3 className="font-heading font-bold text-lg mb-2 text-secondary">{material.brand}</h3>
                <div className="space-y-1">
                  {material.lines.map((line, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{line}</p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                Downloads Técnicos
              </h2>
              <p className="text-muted-foreground text-lg">
                Materiais de apoio para seu projeto
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 bg-card">
                <Download className="text-secondary mb-4" size={32} />
                <h3 className="font-heading text-xl font-bold mb-2">Catálogo de Acabamentos</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  PDF com todas as opções de MDF, MDP e acabamentos disponíveis com códigos de referência.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/materiais">Ver Biblioteca</Link>
                </Button>
              </Card>

              <Card className="p-8 bg-card">
                <Download className="text-secondary mb-4" size={32} />
                <h3 className="font-heading text-xl font-bold mb-2">Template de Briefing</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Modelo de ficha técnica para facilitar o envio de especificações do projeto.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/briefing">Preencher Online</Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                Perguntas Frequentes
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card px-6 rounded-lg border border-border">
                  <AccordionTrigger className="font-heading font-semibold text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-brass">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-secondary-foreground">
            Vamos trabalhar juntos?
          </h2>
          <p className="text-lg mb-8 text-secondary-foreground/90 max-w-2xl mx-auto">
            Envie o briefing técnico do seu projeto e receba orçamento detalhado em até 48 horas.
          </p>
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
            <Link to="/briefing">Enviar Briefing Agora</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Arquitetos;
