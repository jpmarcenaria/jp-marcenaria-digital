import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Search, Package, Filter, GitCompare, Info, Clipboard, Phone } from 'lucide-react';
import mdfSwatches from '@/data/mdf-swatches.json';

type Swatch = {
  brand: 'Duratex' | 'Eucatex' | 'Arauco' | 'Guararapes';
  line: string;
  finish: string;
  pattern_id: string;
  pattern_name: string;
  hydro: boolean;
  swatch_url: string;
  catalog_url: string;
  notes?: string;
};

const WHATSAPP_NUMBER = '5513974146380';
const LOCAL_STORAGE_KEY = 'mdf-showroom-state-v1';

const Materiais = () => {
  const [brand, setBrand] = useState<string>('');
  const [line, setLine] = useState<string>('');
  const [finish, setFinish] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [hydroOnly, setHydroOnly] = useState<boolean>(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const allSwatches = (mdfSwatches as Swatch[]).map(s => ({
    ...s,
    hydro: s.brand === 'Duratex' && s.line.toLowerCase().includes('ultra') ? true : s.hydro,
  }));

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setBrand(state.brand || '');
        setLine(state.line || '');
        setFinish(state.finish || '');
        setQuery(state.query || '');
        setHydroOnly(!!state.hydroOnly);
        setCompareIds(Array.isArray(state.compareIds) ? state.compareIds : []);
        setNotes(state.notes || '');
        setName(state.name || '');
        setCity(state.city || '');
        setPhone(state.phone || '');
      } catch {}
    }
  }, []);

  useEffect(() => {
    const state = { brand, line, finish, query, hydroOnly, compareIds, notes, name, city, phone };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [brand, line, finish, query, hydroOnly, compareIds, notes, name, city, phone]);

  const brandOptions = useMemo(() => Array.from(new Set(allSwatches.map(s => s.brand))), [allSwatches]);
  const lineOptions = useMemo(() => Array.from(new Set(allSwatches.filter(s => !brand || s.brand === brand).map(s => s.line))), [allSwatches, brand]);
  const finishOptions = useMemo(() => Array.from(new Set(allSwatches.filter(s => (!brand || s.brand === brand) && (!line || s.line === line)).map(s => s.finish))), [allSwatches, brand, line]);

  const filtered = useMemo(() => {
    let list = allSwatches.filter(s => {
      const matchesBrand = !brand || s.brand === brand;
      const matchesLine = !line || s.line === line;
      const matchesFinish = !finish || s.finish === finish;
      const matchesQuery = !query || s.pattern_name.toLowerCase().includes(query.toLowerCase());
      const matchesHydro = !hydroOnly || s.hydro;
      return matchesBrand && matchesLine && matchesFinish && matchesQuery && matchesHydro;
    });
    if (hydroOnly) {
      list = list.sort((a, b) => {
        const aScore = (a.brand === 'Duratex' && a.line.toLowerCase().includes('ultra')) ? 1 : 0;
        const bScore = (b.brand === 'Duratex' && b.line.toLowerCase().includes('ultra')) ? 1 : 0;
        return bScore - aScore;
      });
    }
    return list;
  }, [allSwatches, brand, line, finish, query, hydroOnly]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev; // limita 3
      return [...prev, id];
    });
  };

  const selectedForCompare = filtered.filter(s => compareIds.includes(s.pattern_id));

  const buildPrompt = (patternName: string, swatchUrl: string) => (
    `Enhance interior design product photo from ${swatchUrl}. ` +
    `Keep true-to-life MDF color and texture. Modern cabinetry context. Soft global light. ` +
    `Correct white balance. Remove noise. Sharpen edges of grain. Keep realistic reflections. ` +
    `Output 4k, print-ready, neutral background variant and in-situ variant. ` +
    `Style: contemporary Brazilian high-end residential. Tag: ${patternName}.`
  );

  const sendWhatsApp = () => {
    const itens = selectedForCompare.length > 0 ? selectedForCompare : filtered.slice(0, Math.min(3, filtered.length));
    const payload = {
      itens: itens.map(i => ({
        brand: i.brand,
        line: i.line,
        finish: i.finish,
        pattern_id: i.pattern_id,
        pattern_name: i.pattern_name,
        hydro: i.hydro,
      })),
      notes,
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const message = `Olá,%20gostaria%20de%20um%20orçamento%20de%20marcenaria.%0A%0AMeu%20mostruário:%0A${encoded}%0A%0AMeu%20nome:%20${encodeURIComponent(name)}%0ACidade:%20${encodeURIComponent(city)}%0ATelefone:%20${encodeURIComponent(phone)}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">Mostruário de MDF</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Prazos claros, execução premium, assistência pós-obra. Você escolhe as cores do MDF no nosso mostruário interativo e recebe o orçamento no WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-6 bg-card/50 sticky top-20 z-40 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            <div className="md:col-span-2">
              <label htmlFor="search" className="sr-only">Buscar padrão</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input id="search" placeholder="Buscar por cor/padrão..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <label htmlFor="brand" className="sr-only">Marca</label>
              <select id="brand" aria-label="Marca" value={brand} onChange={(e) => { setBrand(e.target.value); setLine(''); setFinish(''); }} className="px-3 py-2 bg-background border border-input rounded-md w-full">
                <option value="">Todas marcas</option>
                {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="line" className="sr-only">Linha</label>
              <select id="line" aria-label="Linha" value={line} onChange={(e) => { setLine(e.target.value); setFinish(''); }} className="px-3 py-2 bg-background border border-input rounded-md w-full">
                <option value="">Todas linhas</option>
                {lineOptions.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="finish" className="sr-only">Textura/Acabamento</label>
              <select id="finish" aria-label="Textura/Acabamento" value={finish} onChange={(e) => setFinish(e.target.value)} className="px-3 py-2 bg-background border border-input rounded-md w-full">
                <option value="">Todas texturas</option>
                {finishOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="hydro" type="checkbox" checked={hydroOnly} onChange={(e) => setHydroOnly(e.target.checked)} className="h-4 w-4" />
              <label htmlFor="hydro" className="text-sm">Resistente à umidade (HIDRO)</label>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2"><Filter size={16} /> {filtered.length} padrões</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2"><GitCompare size={16} /> Comparar até 3</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filtered.map((s) => (
              <Card key={s.pattern_id} className="p-3">
                <div className="relative w-full h-[120px] rounded-md bg-muted overflow-hidden">
                  {s.swatch_url ? (
                    <img src={s.swatch_url} alt={`Amostra MDF ${s.pattern_name}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted"><Package className="text-secondary/40" /></div>
                  )}
                  {s.hydro && (
                    <Badge className="absolute top-2 left-2 bg-secondary/90 text-secondary-foreground">HIDRO</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground">{s.brand} • {s.line}</div>
                  <div className="font-medium" aria-label={`Padrão ${s.pattern_name}`}>{s.pattern_name}</div>
                  <div className="text-xs text-muted-foreground">{s.finish}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant={compareIds.includes(s.pattern_id) ? 'default' : 'outline'} size="sm" onClick={() => toggleCompare(s.pattern_id)} aria-label="Adicionar à comparação">
                    + Comparar
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Ver catálogo"><Info size={14} className="mr-2" />Catálogo</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{s.pattern_name}</DialogTitle>
                        <DialogDescription>{s.brand} • {s.line} • {s.finish}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="w-full h-48 bg-muted rounded-md overflow-hidden">
                          {s.swatch_url ? <img src={s.swatch_url} alt={`Amostra ${s.pattern_name}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package /></div>}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="secondary"><a href={s.catalog_url} target="_blank" rel="noopener noreferrer">Abrir link oficial</a></Button>
                          <Button variant="outline" onClick={() => navigator.clipboard.writeText(buildPrompt(s.pattern_name, s.swatch_url))}><Clipboard size={14} className="mr-2" />Copiar Prompt</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>

          {compareIds.length > 0 && (
            <div className="mt-8">
              <h3 className="font-heading text-xl font-bold mb-3">Comparação</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selectedForCompare.map((s) => (
                  <Card key={`cmp-${s.pattern_id}`} className="p-4">
                    <div className="w-full h-32 bg-muted rounded-md overflow-hidden mb-3">
                      {s.swatch_url ? <img src={s.swatch_url} alt={`Comparação ${s.pattern_name}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package /></div>}
                    </div>
                    <div className="text-sm text-muted-foreground">{s.brand} • {s.line} • {s.finish}</div>
                    <div className="font-medium">{s.pattern_name} {s.hydro && <Badge className="ml-2">HIDRO</Badge>}</div>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => toggleCompare(s.pattern_id)}>Remover</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h4 className="font-heading font-bold mb-2">Observações</h4>
              <textarea aria-label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full rounded-md bg-background border border-input p-2" placeholder="Ex.: integrar puxadores discretos, fita de borda premium, etc." />
            </Card>
            <Card className="p-4">
              <h4 className="font-heading font-bold mb-2">Seus dados</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input aria-label="Nome" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
                <Input aria-label="Cidade" placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input aria-label="Telefone" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="bg-secondary text-secondary-foreground" onClick={sendWhatsApp}><Phone size={14} className="mr-2" />Enviar WhatsApp</Button>
                <Button variant="outline" onClick={() => { setBrand(''); setLine(''); setFinish(''); setQuery(''); setHydroOnly(false); setCompareIds([]); setNotes(''); }}>Limpar</Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Envio via wa.me com JSON url-encoded do seu mostruário. Até 3 itens no comparativo.</div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Materiais;
