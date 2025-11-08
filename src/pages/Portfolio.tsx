import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import SmartPortfolio from '@/components/SmartPortfolio';
import RealPortfolio from '@/components/RealPortfolio';
import FurniturePortfolio from '@/components/FurniturePortfolio';
import SimplifiedFurniturePortfolio from '@/components/SimplifiedFurniturePortfolio';
import ProfessionalPortfolio from '@/components/ProfessionalPortfolio';
import { Search, Package, Sparkles, Grid, Star } from 'lucide-react';

interface Case {
  id: string;
  slug: string;
  titulo: string;
  arquiteto: string | null;
  cidade: string | null;
  capa_url: string | null;
  resumo: string | null;
  categoria: string | null;
  materiais_principais: string[] | null;
}

const Portfolio = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');

  const categorias = Array.from(new Set(cases.map(c => c.categoria).filter(Boolean))) as string[];

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCases(data);
    }
    setLoading(false);
  };

  const addExamples = async () => {
    const exampleCases = [
      {
        slug: 'cozinha-compacta-exemplo',
        titulo: 'Cozinha Compacta',
        arquiteto: 'Exemplo Studio',
        cidade: 'São Paulo',
        resumo: 'Projeto exemplo de cozinha planejada com acabamento premium',
        categoria: 'cozinha',
        materiais_principais: ['MDF', 'Quartzo'],
        area_m2: 12,
        prazo_dias: 30,
        capa_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
      },
      {
        slug: 'home-office-madeira-exemplo',
        titulo: 'Home Office Madeira',
        arquiteto: 'Exemplo Design',
        cidade: 'Rio de Janeiro',
        resumo: 'Ambiente de trabalho acolhedor com ripado iluminado',
        categoria: 'escritorio',
        materiais_principais: ['Freijó', 'LED'],
        area_m2: 9,
        prazo_dias: 20,
        capa_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
      },
      {
        slug: 'estar-planejado-exemplo',
        titulo: 'Estar Planejado',
        arquiteto: 'Exemplo Arquitetura',
        cidade: 'Curitiba',
        resumo: 'Sala de estar integrada com marcenaria sob medida',
        categoria: 'sala',
        materiais_principais: ['Nogueira', 'Laca'],
        area_m2: 20,
        prazo_dias: 45,
        capa_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'
      }
    ];

    for (const caseData of exampleCases) {
      const { data: insertedCase } = await supabase
        .from('cases')
        .insert(caseData)
        .select()
        .single();

      if (insertedCase) {
        const mediaUrls = [
          { tipo: 'foto', url: caseData.capa_url, ordem: 0 },
          { tipo: 'foto', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800', ordem: 1 },
          { tipo: 'foto', url: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800', ordem: 2 },
          { tipo: 'planta', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', ordem: 3 },
          { tipo: 'elevacao', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', ordem: 4 }
        ];

        for (const media of mediaUrls) {
          await supabase.from('case_media').insert({
            case_id: insertedCase.id,
            url: media.url,
            tipo: media.tipo,
            ordem: media.ordem,
            alt: `${caseData.titulo} - ${media.tipo}`
          });
        }
      }
    }

    fetchCases();
  };

  const removeExamples = async () => {
    const exampleSlugs = ['cozinha-compacta-exemplo', 'home-office-madeira-exemplo', 'estar-planejado-exemplo'];
    
    for (const slug of exampleSlugs) {
      await supabase.from('cases').delete().eq('slug', slug);
    }

    fetchCases();
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.arquiteto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || c.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
            Portfólio Técnico
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conheça projetos executados com precisão e acabamento premium
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card/50 sticky top-20 z-40 border-b border-border">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="professional" className="w-full">

          <TabsContent value="professional" className="space-y-6">
            <ProfessionalPortfolio />
          </TabsContent>

            <TabsContent value="cases" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="Buscar por título, arquiteto ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {categorias.length > 0 && (
                  <select
                    value={selectedCategoria}
                    onChange={(e) => setSelectedCategoria(e.target.value)}
                    className="px-4 py-2 bg-background border border-input rounded-md min-w-[200px]"
                  >
                    <option value="">Todas categorias</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                {(searchTerm || selectedCategoria) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategoria('');
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </div>

              {/* Cases Grid */}
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
                ) : filteredCases.length === 0 ? (
                  <EmptyState
                    icon={<Package size={64} />}
                    title={cases.length === 0 ? "Nenhum case disponível" : "Nenhum case encontrado"}
                    description={
                      cases.length === 0
                        ? "Adicione cases de exemplo para visualizar o portfólio"
                        : "Tente ajustar os filtros ou fazer uma nova busca"
                    }
                    action={
                      cases.length === 0
                        ? {
                            label: "Adicionar Exemplos",
                            onClick: addExamples
                          }
                        : undefined
                    }
                  />
                ) : (
                  <>
                    {cases.length > 0 && cases.some(c => c.slug.endsWith('-exemplo')) && (
                      <div className="mb-6 flex justify-end">
                        <Button variant="outline" size="sm" onClick={removeExamples}>
                          Remover Exemplos
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredCases.map((caseItem, index) => (
                        <Link key={caseItem.id} to={`/portfolio/${caseItem.slug}`}>
                          <Card 
                            className="overflow-hidden hover:shadow-xl transition-all glow-warm-hover cursor-pointer h-full hover-lift border-border hover:border-secondary/30 animate-in fade-in slide-in-from-bottom-4 duration-700"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="aspect-video overflow-hidden relative group">
                              <img
                                src={caseItem.capa_url || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'}
                                alt={caseItem.titulo}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                              />
                              {caseItem.slug.endsWith('-exemplo') && (
                                <Badge className="absolute top-3 right-3 bg-secondary/90 text-secondary-foreground">
                                  Exemplo
                                </Badge>
                              )}
                            </div>
                            <div className="p-6">
                              {caseItem.categoria && (
                                <Badge className="mb-2 bg-secondary/20 text-secondary capitalize">
                                  {caseItem.categoria}
                                </Badge>
                              )}
                              <h3 className="font-heading text-xl font-semibold mb-2">
                                {caseItem.titulo}
                              </h3>
                              {caseItem.resumo && (
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                  {caseItem.resumo}
                                </p>
                              )}
                              {caseItem.arquiteto && (
                                <p className="text-sm text-muted-foreground">
                                  Arq. {caseItem.arquiteto}
                                </p>
                              )}
                              {caseItem.cidade && (
                                <p className="text-sm text-secondary">
                                  {caseItem.cidade}
                                </p>
                              )}
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
                </TabsContent>

            <TabsContent value="smart">
              <SimplifiedFurniturePortfolio />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
