import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="font-heading text-8xl font-bold mb-4 text-secondary">404</h1>
        <h2 className="font-heading text-2xl font-semibold mb-2">Página não encontrada</h2>
        <p className="mb-8 text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="/" 
            className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground px-6 py-3 font-medium hover:bg-secondary/90 transition-colors"
          >
            Voltar ao Início
          </a>
          <a 
            href="/portfolio" 
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Ver Portfólio
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
