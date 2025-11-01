# 🚀 Configuração do Vercel - Deploy Automático

## ✅ Variáveis de Ambiente Obrigatórias

Configure estas variáveis no painel do Vercel:

### 📊 **Supabase (Obrigatórias)**
```
VITE_SUPABASE_PROJECT_ID=mlvwuhwoccgdnwdkucxx
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdnd1aHdvY2NnZG53ZGt1Y3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDkxNTAsImV4cCI6MjA3NzMyNTE1MH0.dY4snsHu5D0b1NDJJvNtkIqcmaygUkH2jrJUNG9_fUg
VITE_SUPABASE_URL=https://mlvwuhwoccgdnwdkucxx.supabase.co
```

### 🌍 **Ambiente (Recomendadas)**
```
NODE_ENV=production
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

## 🔧 Como Configurar no Vercel

### 1. **Acesse o Dashboard**
- Vá para: https://vercel.com/dashboard
- Selecione seu projeto: `jp-marcenaria-digital`

### 2. **Configure as Variáveis**
- Clique em **Settings** → **Environment Variables**
- Adicione cada variável:
  - **Name:** Nome da variável (ex: `VITE_SUPABASE_URL`)
  - **Value:** Valor da variável
  - **Environment:** Selecione `Production`, `Preview`, e `Development`

### 3. **Redeploy**
- Após adicionar as variáveis, clique em **Deployments**
- Clique nos 3 pontos do último deploy → **Redeploy**

## 🚀 Deploy Automático Configurado

✅ **Triggers automáticos:**
- Push para `main` → Deploy de produção
- Pull Request → Deploy de preview
- Merge → Deploy automático

✅ **Configurações otimizadas:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 🔗 URLs do Projeto

- **Produção:** https://jp-marcenaria-digital.vercel.app
- **Preview:** URLs geradas automaticamente para PRs

## 📱 Teste do WhatsApp

Após o deploy, teste:
- Número: `5513974146380`
- Mensagem: "Vim através do seu site, quero um orçamento!"

---

**✨ Pronto! Seu deploy automático está configurado!**