import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Helmet } from 'react-helmet';

interface CaseData {
  id: string;
  slug: string;
  titulo: string;
  arquiteto: string | null;
  cidade: string | null;
  resumo: string | null;
  capa_url: string | null;
  ficha_pdf_url: string | null;
  materiais_principais: string[] | null;
  acabamento: string | null;
  area_m2: number | null;
  prazo_dias: number | null;
  categoria: string | null;
}

interface CaseMedia {
  id: string;
  url: string;
  alt: string | null;
  tipo: 'foto' | 'planta' | 'elevacao';
  ordem: number;
}

const Case = () => {
  const { slug } = useParams();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [media, setMedia] = useState<CaseMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCase();
    }
  }, [slug]);

  const fetchCase = async () => {
    setLoading(true);
    setError(false);

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (caseError || !caseData) {
      setError(true);
      setLoading(false);
      return;
    }

    setCaseData(caseData);

    const { data: mediaData } = await supabase
      .from('case_media')
      .select('*')
      .eq('case_id', caseData.id)
      .order('ordem', { ascending: true });

    if (mediaData) {
      setMedia(mediaData as CaseMedia[]);
    }

    setLoading(false);
  };

  const handleWhatsApp = () => {
    const message = `Olá! Gostaria de solicitar um orçamento para um projeto similar ao case "${caseData?.titulo}". Link: ${window.location.href}`;
    const whatsappLink = `https://api.whatsapp.com/send?phone=5511999999999&text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  const fotos = media.filter(m => m.tipo === 'foto');
  const plantas = media.filter(m => m.tipo === 'planta');
  const elevacoes = media.filter(m => m.tipo === 'elevacao');

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

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <ErrorState
            title="Case não encontrado"
            message="O case que você procura não existe ou foi removido."
            onRetry={fetchCase}
          />
          <div className="text-center mt-6">
            <Button asChild variant="outline">
              <Link to="/portfolio">Voltar ao Portfólio</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": caseData.titulo,
    "description": caseData.resumo || caseData.titulo,
    "creator": {
      "@type": "Organization",
      "name": caseData.arquiteto || "JP Marcenaria Digital"
    },
    "material": caseData.materiais_principais?.join(', '),
    "image": fotos.map(f => f.url),
    "areaServed": caseData.cidade,
    "url": window.location.href
  };

  return (
    <>
      <Helmet>
        <title>{caseData.titulo} | JP Marcenaria Digital</title>
        <meta name="description" content={caseData.resumo || `Projeto ${caseData.titulo} executado pela JP Marcenaria Digital`} />
        <meta property="og:title" content={`${caseData.titulo} | JP Marcenaria Digital`} />
        <meta property="og:description" content={caseData.resumo || caseData.titulo} />
        <meta property="og:image" content={caseData.capa_url || ''} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

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

            {/* Header */}
            <div className="mb-12">
              <div className="flex flex-wrap gap-2 mb-4">
                {caseData.categoria && (
                  <Badge className="bg-secondary/20 text-secondary capitalize">
                    {caseData.categoria}
                  </Badge>
                )}
                {caseData.slug.endsWith('-exemplo') && (
                  <Badge variant="outline">Exemplo</Badge>
                )}
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                {caseData.titulo}
              </h1>
              {caseData.resumo && (
                <p className="text-lg text-muted-foreground mb-4">
                  {caseData.resumo}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {caseData.arquiteto && <span>Arq. {caseData.arquiteto}</span>}
                {caseData.cidade && <span>• {caseData.cidade}</span>}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button onClick={handleWhatsApp} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <MessageCircle size={16} className="mr-2" />
                  Solicitar Orçamento deste Case
                </Button>
                {caseData.ficha_pdf_url && (
                  <Button variant="outline" asChild>
                    <a href={caseData.ficha_pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download size={16} className="mr-2" />
                      Baixar Ficha PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="fotos" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fotos">Fotos ({fotos.length})</TabsTrigger>
                    <TabsTrigger value="plantas">Plantas ({plantas.length})</TabsTrigger>
                    <TabsTrigger value="elevacoes">Elevações ({elevacoes.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="fotos" className="mt-6">
                    {fotos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fotos.map((foto, idx) => (
                          <div key={foto.id} className="aspect-video overflow-hidden rounded-lg glow-warm-hover">
                            <img
                              src={foto.url}
                              alt={foto.alt || `${caseData.titulo} - Foto ${idx + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                              loading={idx < 2 ? 'eager' : 'lazy'}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Nenhuma foto disponível</p>
                    )}
                  </TabsContent>

                  <TabsContent value="plantas" className="mt-6">
                    {plantas.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {plantas.map((planta, idx) => (
                          <div key={planta.id} className="overflow-hidden rounded-lg border border-border bg-card">
                            <img
                              src={planta.url}
                              alt={planta.alt || `${caseData.titulo} - Planta ${idx + 1}`}
                              className="w-full h-auto"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Nenhuma planta disponível</p>
                    )}
                  </TabsContent>

                  <TabsContent value="elevacoes" className="mt-6">
                    {elevacoes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {elevacoes.map((elevacao, idx) => (
                          <div key={elevacao.id} className="overflow-hidden rounded-lg border border-border bg-card">
                            <img
                              src={elevacao.url}
                              alt={elevacao.alt || `${caseData.titulo} - Elevação ${idx + 1}`}
                              className="w-full h-auto"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Nenhuma elevação disponível</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar - Ficha Técnica */}
              <div className="lg:col-span-1">
                <div className="bg-card p-6 rounded-lg border border-border sticky top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-secondary" />
                    <h3 className="font-heading font-semibold text-lg">Ficha Técnica</h3>
                  </div>
                  <div className="space-y-4 text-sm">
                    {caseData.area_m2 && (
                      <div>
                        <span className="text-muted-foreground">Área:</span>
                        <span className="ml-2 font-medium">{caseData.area_m2}m²</span>
                      </div>
                    )}
                    {caseData.prazo_dias && (
                      <div>
                        <span className="text-muted-foreground">Prazo:</span>
                        <span className="ml-2 font-medium">{caseData.prazo_dias} dias</span>
                      </div>
                    )}
                    {caseData.acabamento && (
                      <div>
                        <span className="text-muted-foreground">Acabamento:</span>
                        <span className="ml-2 font-medium">{caseData.acabamento}</span>
                      </div>
                    )}
                    {caseData.materiais_principais && caseData.materiais_principais.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Materiais:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {caseData.materiais_principais.map((mat, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {mat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 text-center bg-card p-12 rounded-lg border border-border">
              <h2 className="font-heading text-3xl font-bold mb-4">
                Interessado neste projeto?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Entre em contato e crie algo único para seu espaço
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handleWhatsApp} size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <MessageCircle size={16} className="mr-2" />
                  Falar no WhatsApp
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/briefing">Enviar Briefing Completo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Case;
