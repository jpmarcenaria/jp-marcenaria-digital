import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="font-heading text-2xl font-bold mb-4">
              <span className="text-secondary">JP</span>
              <span className="text-foreground ml-1">MARCENARIA</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              30 anos construindo sonhos com móveis planejados de alta qualidade.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-secondary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-secondary transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/portfolio" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                  Portfólio
                </Link>
              </li>
              <li>
                <Link to="/tecnologia" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-secondary transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Serviços</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Cozinhas Planejadas</li>
              <li>Painéis Ripados com LED</li>
              <li>Home Office</li>
              <li>Área Gourmet</li>
              <li>Quartos e Closets</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Phone size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">(11) 98765-4321</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">contato@jpmarcenaria.com.br</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JP Marcenaria. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs">Se for madeira, deixe conosco.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
