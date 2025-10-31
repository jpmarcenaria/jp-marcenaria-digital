export const extractDigits = (input: string) => (input || '').replace(/\D+/g, '');

export const formatBRPhone = (input: string) => {
  const digits = extractDigits(input);
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const first = digits.slice(2, 7);
    const last = digits.slice(7);
    return `(${ddd}) ${first}-${last}`;
  }
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const first = digits.slice(2, 6);
    const last = digits.slice(6);
    return `(${ddd}) ${first}-${last}`;
  }
  return input;
};

export const toIntlPhoneDigits = (phoneInput: string) => {
  const digits = extractDigits(phoneInput);
  if (digits.startsWith('55')) return digits;
  if (digits.length === 11 || digits.length === 10) return `55${digits}`;
  return `55${digits}`; // tenta prefixar caso venha sem DDI
};

export const toWhatsAppAppUrl = (phoneInput: string, message?: string) => {
  const intl = toIntlPhoneDigits(phoneInput);
  const base = `whatsapp://send?phone=${intl}`;
  const text = message ? `&text=${encodeURIComponent(message)}` : '';
  return `${base}${text}`;
};

export const toWhatsAppWebUrl = (phoneInput: string, message?: string) => {
  const intl = toIntlPhoneDigits(phoneInput);
  const base = `https://api.whatsapp.com/send?phone=${intl}`;
  const text = message ? `&text=${encodeURIComponent(message)}` : '';
  return `${base}${text}`;
};

export const openWhatsApp = (phoneInput: string, message?: string) => {
  const appUrl = toWhatsAppAppUrl(phoneInput, message);
  const webUrl = toWhatsAppWebUrl(phoneInput, message);
  const ua = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const storeUrl = isAndroid
    ? 'https://play.google.com/store/apps/details?id=com.whatsapp'
    : 'https://apps.apple.com/app/whatsapp-messenger/id310633997';

  if (isMobile) {
    const start = Date.now();
    try {
      // Tenta abrir o app
      window.location.href = appUrl;
    } catch {}
    // Se não abrir (app não instalado), redireciona para loja após timeout curto
    setTimeout(() => {
      const elapsed = Date.now() - start;
      // Se ainda estamos na mesma página, tenta loja
      try {
        window.location.href = storeUrl;
      } catch {
        // Fallback final: web
        window.location.href = webUrl;
      }
    }, 1500);
  } else {
    // Desktop: abre web.whatsapp.com
    window.open(webUrl, '_blank');
  }
};
