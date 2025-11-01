# Variáveis de Ambiente

Este documento lista e explica as variáveis de ambiente usadas no projeto, com recomendações de configuração para desenvolvimento, preview e produção.

## Como configurar
- Copie `.env.example` para `.env` e preencha os valores reais.
- Para desenvolvimento local, você pode usar `.env.development` como referência.
- Na Vercel, configure as variáveis em `Project Settings > Environment Variables` para cada ambiente.

## Variáveis Principais
- `VITE_SUPABASE_URL`: URL do projeto Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Chave pública (anon) do Supabase.
- `VITE_API_BASE_URL`: Base URL da API (ex.: `https://api.jpmarcenaria.com`).
- `VITE_APP_ENV`: Ambiente de execução (`development`, `staging`, `production`).
- `VITE_APP_VERSION`: Versão semântica da aplicação.

## Segurança
- `JWT_SECRET`: Use apenas em ambientes controlados; não exponha em frontend.
- `RATE_LIMIT_*`: Parâmetros para rate limiting em camadas de API/edge.
- `CORS_ORIGINS`: Lista de origens permitidas.

## Monitoramento e Analytics
- `VITE_GA_TRACKING_ID`: Google Analytics (opcional, use opt-in com consentimento).
- `VITE_SENTRY_DSN`: DSN do Sentry para rastreamento de erros.

## Serviços Terceiros (opcionais)
- SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- WhatsApp Business (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`).
- AWS S3 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`).

## Ferramentas de Desenvolvimento
- `PLAYWRIGHT_BROWSERS_PATH`: Caminho de instalação de browsers.
- `PLAYWRIGHT_BASE_URL`: Base para testes E2E.

## Dicas
- Nunca commitar segredos. Use `.env` local e GitHub Secrets para CI/CD.
- Revise `vercel.json` para garantir que o build use `dist` como output.

