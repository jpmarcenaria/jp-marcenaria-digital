import { Link } from 'react-router-dom';
import { ArrowRight, Award, Clock, Shield, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import heroImage from '@/assets/hero-ripado-led.jpg';
import ripadoDetail from '@/assets/ripado-detail.jpg';

const Index = () => {
  // Função para gerar link do WhatsApp
  const getWhatsAppLink = () => {
    const phoneNumber = "5513974146380"; // Número real da JP Marcenaria
    const message = "Vim através do seu site, quero um orçamento!";
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // Componente do ícone WhatsApp SVG com cores originais
  const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className="transition-transform duration-200 group-hover:scale-110"
    >
      <path 
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" 
        fill="#25D366"
      />
    </svg>
  );

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
              Marcenaria sob medida que transforma ambientes
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Planejamos, fabricamos e instalamos com precisão, conforto e estética. Do projeto ao pós-obra, cada detalhe reflete o seu padrão.
            </p>
            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <Button 
                asChild 
                size="lg" 
                variant="premium"
                className="glow-warm-hover hover-lift"
              >
                <Link to="/portfolio">
                  Ver Portfólio Técnico
                  <ArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" size={20} />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="group hover-lift"
              >
                <a 
                  href={getWhatsAppLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3"
                  aria-label="Solicitar orçamento via WhatsApp"
                >
                  <WhatsAppIcon size={22} />
                  <span className="font-medium">Solicitar Orçamento</span>
                  <ArrowRight className="ml-1 transition-transform duration-200 group-hover:translate-x-1" size={16} />
                </a>
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
                className="p-8 bg-card hover:bg-card/80 transition-all glow-warm-hover hover-lift group border-border hover:border-secondary/30 animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <highlight.icon className="text-secondary mb-4 transition-transform duration-200 group-hover:scale-110" size={40} />
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
              <Button asChild variant="premium" className="hover-lift">
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
              <Card 
                key={index} 
                className="p-6 bg-card hover-lift border-border hover:border-secondary/30 animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-secondary transition-transform duration-200 hover:scale-125 inline-block">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
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
            variant="outline"
            className="group hover-lift bg-background/80"
          >
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3"
              aria-label="Solicitar orçamento via WhatsApp"
            >
              <WhatsAppIcon size={22} />
              <span className="font-medium">Solicitar Orçamento</span>
              <ArrowRight className="ml-1 transition-transform duration-200 group-hover:translate-x-1" size={16} />
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
