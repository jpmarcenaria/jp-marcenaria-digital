# Deploy na Vercel

Guia para configurar e operar deploy contínuo na Vercel.

## Configuração Básica
- `vercel.json`:
  - `buildCommand: npm run build`
  - `outputDirectory: dist`
  - `framework: vite`
  - `rewrites` para SPA (fallback para `index.html`)
  - `headers` de segurança

## Passos
1. Conecte o repositório GitHub no dashboard da Vercel.
2. Configure variáveis de ambiente para `Production`, `Preview` e `Development`.
3. Verifique permissões de deploy e logs do build.
4. Cada push em `main` cria deploy de produção; PRs criam deploys de preview.

## Integração com CI/CD
- O workflow `.github/workflows/ci-cd.yml` valida lint, build, testes e segurança.
- Após sucesso, o deploy pode ser disparado manualmente (se necessário) ou pelo próprio Vercel.

## Boas Práticas
- Use `npm ci` no build para reprodutibilidade.
- Acompanhe erros com Sentry (opcional) e métricas com Lighthouse CI.
- Evite expor segredos no frontend; use chaves públicas (anon) quando aplicável.

## Referências
- `VERCEL_SETUP.md` — guia detalhado de setup
- `VERCEL_DEPLOY_ANALYSIS.md` — análise de deploys e troubleshooting

