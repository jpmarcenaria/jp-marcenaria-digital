import { MapPin, Phone, Mail, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card/50 text-card-foreground border-t border-border shadow-inner">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Coluna 1: Sobre */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-semibold text-secondary">JP Marcenaria</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Excelência em marcenaria sob medida para projetos arquitetônicos premium.
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Navegação</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 focus-ring">
                Início
              </Link>
              <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 focus-ring">
                Portfólio
              </Link>
              <Link to="/arquitetos" className="text-sm text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 focus-ring">
                Para Arquitetos
              </Link>
              <Link to="/materiais" className="text-sm text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 focus-ring">
                Materiais
              </Link>
              <Link to="/briefing" className="text-sm text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 focus-ring">
                Enviar Briefing
              </Link>
            </nav>
          </div>

          {/* Coluna 3: Contato */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Contato</h4>
            <div className="flex flex-col space-y-3">
              <a 
                href="tel:+5511999999999" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
              >
                <Phone className="h-4 w-4" />
                (11) 99999-9999
              </a>
              <a 
                href="mailto:contato@jpmarcenaria.com.br" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
              >
                <Mail className="h-4 w-4" />
                contato@jpmarcenaria.com.br
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Coluna 4: Redes Sociais */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Redes Sociais</h4>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-secondary transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Linha de copyright */}
        <div className="pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} JP Marcenaria. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
