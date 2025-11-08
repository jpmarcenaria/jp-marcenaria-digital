import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Portfólio', href: '/portfolio' },
    { label: 'Para Arquitetos', href: '/arquitetos' },
    { label: 'Materiais', href: '/materiais' },
    { label: 'FOTO MAGIA IA', href: '/foto-magia-ia' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="font-heading text-2xl font-bold tracking-tight transition-transform duration-200 group-hover:scale-105">
              <span className="text-secondary">JP</span>
              <span className="text-foreground ml-1">MARCENARIA</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-wrap gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative inline-flex items-center px-3 py-2 rounded-md bg-card text-foreground hover:text-secondary transition-all duration-200 font-medium border border-border hover:border-secondary/30 hover:bg-card/80 focus-ring group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
            <Button asChild variant="premium" className="flex-shrink-0">
              <Link to="/briefing">Enviar Briefing</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="inline-flex items-center px-3 py-2 rounded-md bg-card text-foreground hover:text-secondary transition-all duration-200 font-medium border border-border hover:border-secondary/30 hover:bg-card/80 focus-ring"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild variant="premium">
                <Link to="/briefing" onClick={() => setIsOpen(false)}>
                  Enviar Briefing
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
