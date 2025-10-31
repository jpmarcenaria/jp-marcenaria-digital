import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatBRPhone, toWhatsAppWebUrl, toWhatsAppAppUrl, openWhatsApp } from '@/lib/phone';

const DEFAULT_PHONE_DISPLAY = '(13) 97414-6380';
const SITE_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export const useSitePhone = () => {
  const [phone, setPhone] = useState<string>(DEFAULT_PHONE_DISPLAY);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('contact_phone')
          .eq('id', SITE_SETTINGS_ID)
          .maybeSingle();
        const candidate = data?.contact_phone || DEFAULT_PHONE_DISPLAY;
        setPhone(formatBRPhone(candidate));
      } catch {
        setPhone(DEFAULT_PHONE_DISPLAY);
      }
    };
    void load();
  }, []);

  const buildWhatsAppWebUrl = (message?: string) => toWhatsAppWebUrl(phone, message);
  const buildWhatsAppAppUrl = (message?: string) => toWhatsAppAppUrl(phone, message);
  const openWhatsAppWithFallback = (message?: string) => openWhatsApp(phone, message);

  return { phone, buildWhatsAppWebUrl, buildWhatsAppAppUrl, openWhatsAppWithFallback };
};
