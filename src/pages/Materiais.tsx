import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Material {
  id: string;
  nome: string;
  acabamento: string | null;
  cor: string | null;
  espessura: string | null;
  fornecedor: string | null;
  ficha_url: string | null;
  imagem_url: string | null;
}

const Materiais = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcabamento, setSelectedAcabamento] = useState<string>('');
  const [selectedFornecedor, setSelectedFornecedor] = useState<string>('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('nome');

    if (!error && data) {
      setMaterials(data);
    }
    setLoading(false);
  };

  const acabamentos = Array.from(new Set(materials.map(m => m.acabamento).filter(Boolean))) as string[];
  const fornecedores = Array.from(new Set(materials.map(m => m.fornecedor).filter(Boolean))) as string[];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.cor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAcabamento = !selectedAcabamento || material.acabamento === selectedAcabamento;
    const matchesFornecedor = !selectedFornecedor || material.fornecedor === selectedFornecedor;
    
    return matchesSearch && matchesAcabamento && matchesFornecedor;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <Package className="mx-auto mb-4 text-secondary" size={48} />
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6">
            Biblioteca de Materiais
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Catálogo completo de acabamentos, cores e fornecedores disponíveis para seus projetos
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card/50 sticky top-20 z-40 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Buscar por nome ou cor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Acabamento Filter */}
            <select
              value={selectedAcabamento}
              onChange={(e) => setSelectedAcabamento(e.target.value)}
              className="px-4 py-2 bg-background border border-input rounded-md min-w-[200px]"
            >
              <option value="">Todos acabamentos</option>
              {acabamentos.map(acabamento => (
                <option key={acabamento} value={acabamento}>{acabamento}</option>
              ))}
            </select>

            {/* Fornecedor Filter */}
            <select
              value={selectedFornecedor}
              onChange={(e) => setSelectedFornecedor(e.target.value)}
              className="px-4 py-2 bg-background border border-input rounded-md min-w-[200px]"
            >
              <option value="">Todos fornecedores</option>
              {fornecedores.map(fornecedor => (
                <option key={fornecedor} value={fornecedor}>{fornecedor}</option>
              ))}
            </select>

            {(searchTerm || selectedAcabamento || selectedFornecedor) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAcabamento('');
                  setSelectedFornecedor('');
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20">
              <Package className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="font-heading text-2xl font-bold mb-2">Nenhum material encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAcabamento('');
                  setSelectedFornecedor('');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                Mostrando {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materiais'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMaterials.map((material) => (
                  <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {material.imagem_url ? (
                      <div className="h-48 bg-muted relative overflow-hidden">
                        <img
                          src={material.imagem_url}
                          alt={material.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-walnut flex items-center justify-center">
                        <Package className="text-secondary/40" size={64} />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-lg mb-2">{material.nome}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {material.acabamento && (
                          <Badge variant="secondary" className="text-xs">{material.acabamento}</Badge>
                        )}
                        {material.cor && (
                          <Badge variant="outline" className="text-xs">{material.cor}</Badge>
                        )}
                        {material.espessura && (
                          <Badge variant="outline" className="text-xs">{material.espessura}</Badge>
                        )}
                      </div>
                      {material.fornecedor && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Fornecedor: <span className="font-medium">{material.fornecedor}</span>
                        </p>
                      )}
                      <div className="flex gap-2">
                        {material.ficha_url && (
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <a href={material.ficha_url} target="_blank" rel="noopener noreferrer">
                              Ficha Técnica
                            </a>
                          </Button>
                        )}
                        <Button size="sm" className="flex-1 bg-secondary text-secondary-foreground" asChild>
                          <Link to={`/briefing?material=${material.id}`}>
                            Adicionar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Materiais;
