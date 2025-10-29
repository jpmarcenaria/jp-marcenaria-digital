import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const Portfolio = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');

  const environments = [
    { value: 'all', label: 'Todos' },
    { value: 'cozinha', label: 'Cozinha' },
    { value: 'sala', label: 'Sala' },
    { value: 'quarto', label: 'Quarto' },
    { value: 'gourmet', label: 'Gourmet' },
    { value: 'escritorio', label: 'Escritório' },
  ];

  useEffect(() => {
    fetchProjects();
  }, [selectedEnvironment]);

  const fetchProjects = async () => {
    setLoading(true);
    let query = supabase
      .from('projects')
      .select('*')
      .eq('status', 'publicado');

    if (selectedEnvironment !== 'all') {
      query = query.eq('environment', selectedEnvironment as any);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
              Nosso Portfólio
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conheça alguns dos projetos que realizamos com excelência
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {environments.map((env) => (
              <Badge
                key={env.value}
                variant={selectedEnvironment === env.value ? 'default' : 'outline'}
                className={`cursor-pointer px-4 py-2 transition-all ${
                  selectedEnvironment === env.value
                    ? 'bg-secondary text-secondary-foreground'
                    : 'hover:bg-secondary/20'
                }`}
                onClick={() => setSelectedEnvironment(env.value)}
              >
                {env.label}
              </Badge>
            ))}
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Nenhum projeto encontrado nesta categoria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Link key={project.id} to={`/projeto/${project.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all glow-warm-hover cursor-pointer h-full">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.hero_image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <Badge className="mb-2 bg-secondary/20 text-secondary">
                        {project.environment}
                      </Badge>
                      <h3 className="font-heading text-xl font-semibold mb-2">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                      {project.size_m2 && (
                        <p className="text-sm text-secondary mt-2">
                          {project.size_m2}m²
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
