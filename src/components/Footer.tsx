import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CONTACT_PHONE_TARGET = '(13) 97414-6380';
const CONTACT_PHONE_REGEX = /^\(\d{2}\) \d{5}-\d{4}$/;

const FooterPhone = () => {
  const [phone, setPhone] = useState<string>(CONTACT_PHONE_TARGET);

  useEffect(() => {
    const ensureAndLoadPhone = async () => {
      // Validação de formato exato antes de aplicar
      if (!CONTACT_PHONE_REGEX.test(CONTACT_PHONE_TARGET)) {
        console.error('Formato de telefone inválido:', CONTACT_PHONE_TARGET);
        return;
      }

      try {
        // Persistir no banco (upsert na linha bem conhecida)
        await supabase
          .from('site_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000001',
            contact_phone: CONTACT_PHONE_TARGET,
          });
      } catch (e) {
        console.warn('Falha ao persistir telefone no banco:', e);
      }

      try {
        // Carregar do banco para confirmar persistência e aceitação
        const { data, error } = await supabase
          .from('site_settings')
          .select('contact_phone')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .maybeSingle();

        if (!error && data && CONTACT_PHONE_REGEX.test(data.contact_phone)) {
          setPhone(data.contact_phone);
        } else {
          // Fallback para valor-alvo, mantendo formatação
          setPhone(CONTACT_PHONE_TARGET);
        }
      } catch (e) {
        // Fallback caso a tabela não exista ou haja erro de rede
        setPhone(CONTACT_PHONE_TARGET);
      }
    };

    void ensureAndLoadPhone();
  }, []);

  return <span className="text-muted-foreground" aria-label="Telefone de contato">{phone}</span>;
};

const TARGET_CITY = 'Guarujá';
const TARGET_STATE = 'SP';
const VALID_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];
const CITY_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/;

const FooterLocation = () => {
  const [city, setCity] = useState<string>(TARGET_CITY);
  const [state, setState] = useState<string>(TARGET_STATE);

  useEffect(() => {
    const ensureAndLoadLocation = async () => {
      const isValidCity = CITY_REGEX.test(TARGET_CITY);
      const isValidState = VALID_STATES.includes(TARGET_STATE);
      if (!isValidCity || !isValidState) {
        console.error('Localização inválida:', { TARGET_CITY, TARGET_STATE });
        return;
      }

      try {
        // Persistir no banco a localização (upsert na mesma linha)
        await supabase
          .from('site_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000001',
            city: TARGET_CITY,
            state: TARGET_STATE,
          });
      } catch (e) {
        console.warn('Falha ao persistir localização no banco:', e);
      }

      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('city, state')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .maybeSingle();

        const loadedCity = data?.city ?? TARGET_CITY;
        const loadedState = data?.state ?? TARGET_STATE;

        if (!error && CITY_REGEX.test(loadedCity) && VALID_STATES.includes(loadedState)) {
          setCity(loadedCity);
          setState(loadedState);
        } else {
          setCity(TARGET_CITY);
          setState(TARGET_STATE);
        }
      } catch (e) {
        setCity(TARGET_CITY);
        setState(TARGET_STATE);
      }
    };

    void ensureAndLoadLocation();
  }, []);

  return (
    <span
      className="text-muted-foreground"
      aria-label="Localização"
      data-city={city}
      data-state={state}
    >
      {city}, {state}
    </span>
  );
};

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
                <FooterPhone />
              </li>
              <li className="flex items-start space-x-2">
                <Mail size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">contato@jpmarcenaria.com.br</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                <FooterLocation />
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
