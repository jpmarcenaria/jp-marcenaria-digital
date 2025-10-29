import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const Project = () => {
  const { slug } = useParams();
  const [project, setProject] = useState<any>(null);
  const [finish, setFinish] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const fetchProject = async () => {
    const { data: projectData, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'publicado')
      .maybeSingle();

    if (!error && projectData) {
      setProject(projectData);
      
      if (projectData.mdf_finish_id) {
        const { data: finishData } = await supabase
          .from('finishes')
          .select('*')
          .eq('id', projectData.mdf_finish_id)
          .maybeSingle();
        
        if (finishData) setFinish(finishData);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-4xl font-bold mb-4">Projeto não encontrado</h1>
          <Button asChild>
            <Link to="/portfolio">Voltar ao Portfólio</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Button asChild variant="outline" className="mb-8">
            <Link to="/portfolio">
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao Portfólio
            </Link>
          </Button>

          {/* Hero Image */}
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8 glow-warm">
            <img
              src={project.hero_image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600'}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Project Info */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <Badge className="mb-4 bg-secondary/20 text-secondary">
                {project.environment}
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                {project.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {project.description}
              </p>
            </div>

            {/* Technical Details */}
            <div className="bg-card p-6 rounded-lg border border-border h-fit">
              <h3 className="font-heading font-semibold mb-4">Ficha Técnica</h3>
              <div className="space-y-3 text-sm">
                {project.size_m2 && (
                  <div>
                    <span className="text-muted-foreground">Tamanho:</span>
                    <span className="ml-2 font-medium">{project.size_m2}m²</span>
                  </div>
                )}
                {project.environment && (
                  <div>
                    <span className="text-muted-foreground">Ambiente:</span>
                    <span className="ml-2 font-medium capitalize">{project.environment}</span>
                  </div>
                )}
                {finish && (
                  <div>
                    <span className="text-muted-foreground">Acabamento:</span>
                    <span className="ml-2 font-medium">{finish.name}</span>
                    {finish.brand && (
                      <span className="text-muted-foreground text-xs block mt-1">
                        {finish.brand} {finish.collection && `- ${finish.collection}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div>
              <h2 className="font-heading text-3xl font-bold mb-6">Galeria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.gallery.map((image: string, index: number) => (
                  <div key={index} className="aspect-video overflow-hidden rounded-lg glow-warm-hover">
                    <img
                      src={image}
                      alt={`${project.title} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center bg-card p-12 rounded-lg">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Gostou deste projeto?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Podemos criar algo único e personalizado para você
            </p>
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/orcamento">Solicitar Orçamento</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Project;
