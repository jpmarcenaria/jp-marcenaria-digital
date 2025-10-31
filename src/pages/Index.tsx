import { Link } from 'react-router-dom';
import { ArrowRight, Award, Clock, Shield, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import heroImage from '@/assets/hero-ripado-led.jpg';
import ripadoDetail from '@/assets/ripado-detail.jpg';

const Index = () => {
  const highlights = [
    {
      icon: Clock,
      title: 'Prazo Previsível',
      description: 'SLA de 48h para orçamento. Cronograma detalhado desde o primeiro dia.',
    },
    {
      icon: Award,
      title: 'Execução Premium',
      description: 'CNC de precisão, marcas especificadas (Arauco, Duratex, Blum, Hettich).',
    },
    {
      icon: Shield,
      title: 'Assistência Pós-Obra',
      description: 'Garantia de 12 meses e suporte técnico para ajustes.',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      city: 'São Paulo',
      text: 'Trabalho impecável! O painel ripado com LED transformou nossa sala.',
      rating: 5,
    },
    {
      name: 'João Oliveira',
      city: 'Campinas',
      text: 'Móveis de altíssima qualidade. O acabamento MDF é perfeito.',
      rating: 5,
    },
    {
      name: 'Ana Costa',
      city: 'São José dos Campos',
      text: 'Projeto 3D muito realista, entrega no prazo e pós-venda excelente.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Execução técnica para projetos de arquitetura
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Prazos previsíveis, execução premium e assistência pós-obra. Sua especificação, nossa precisão.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-warm-hover"
              >
                <Link to="/portfolio">
                  Ver Portfólio Técnico
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Link to="/orcamento">
                  Solicitar Orçamento Grátis
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="mt-12 flex items-center gap-8 flex-wrap">
              <div className="text-sm text-muted-foreground">
                <div className="text-2xl font-bold text-foreground mb-1">200+</div>
                <div>Projetos executados</div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="text-2xl font-bold text-foreground mb-1">15 dias</div>
                <div>Prazo médio</div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="text-2xl font-bold text-foreground mb-1">95%</div>
                <div>Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Por que arquitetos nos escolhem</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Entendemos as exigências técnicas e prazos de projetos profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <Card 
                key={index} 
                className="p-8 bg-card hover:bg-card/80 transition-all glow-warm-hover"
              >
                <highlight.icon className="text-secondary mb-4" size={40} />
                <h3 className="font-heading text-2xl font-semibold mb-3">{highlight.title}</h3>
                <p className="text-muted-foreground">{highlight.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ripado Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                Painéis Ripados com LED Quente
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Nossa especialidade: painéis ripados em MDF premium com iluminação LED 2700K que 
                cria um brilho dourado acolhedor, perfeito para salas, quartos e home offices.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-secondary mr-2">✓</span>
                  <span>Corte de precisão CNC</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">✓</span>
                  <span>LED 2700K - 3000K (tom quente)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">✓</span>
                  <span>Acabamentos premium Arauco, Duratex e Masisa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary mr-2">✓</span>
                  <span>Projeto 3D incluído</span>
                </li>
              </ul>
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link to="/portfolio">Ver Projetos com Ripado</Link>
              </Button>
            </div>
            <div className="relative">
              <img 
                src={ripadoDetail} 
                alt="Detalhe painel ripado com LED quente" 
                className="rounded-lg shadow-2xl glow-warm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-card">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-secondary">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.city}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-brass">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-secondary-foreground">
            Pronto para transformar seu ambiente?
          </h2>
          <p className="text-lg mb-8 text-secondary-foreground/90 max-w-2xl mx-auto">
            Receba um orçamento personalizado em até 24 horas. Nossa equipe está pronta para 
            transformar suas ideias em realidade.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-background text-foreground hover:bg-background/90"
          >
            <Link to="/orcamento">
              Solicitar Orçamento Grátis
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
