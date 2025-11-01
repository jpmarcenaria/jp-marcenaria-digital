# Contribuindo para JP Marcenaria Digital

Obrigado por considerar contribuir! Este guia descreve como configurar o ambiente, padrões de código e fluxo de trabalho.

## Pré-requisitos
- Node.js 20.x
- npm ou pnpm
- Git

## Como começar
1. Faça um fork do repositório e clone localmente.
2. Crie uma branch a partir de `develop`:
   - `feature/<descricao-curta>` para novas features
   - `fix/<descricao-curta>` para correções
   - `docs/<descricao-curta>` para documentação
3. Instale dependências: `npm ci`
4. Configure `.env` a partir de `.env.example`.

## Padrões de código
- Linguagem: TypeScript + React (hooks, FC).
- Estilo: ESLint (execute `npm run lint`).
- UI: Tailwind + shadcn-ui; manter acessibilidade (ARIA, contraste, foco).
- Imports organizados e nomes descritivos; evite abreviações obscuras.

## Commits e mensagens
- Use Conventional Commits:
  - `feat: descrição`
  - `fix: descrição`
  - `docs: descrição`
  - `chore: descrição`
  - `refactor: descrição`
  - `test: descrição`
- Mensagens curtas (máx. 72 chars) com contexto claro.

## Testes
- E2E com Playwright:
  - `npm run test:e2e`
  - `npm run test:e2e:report`
- Inclua cenários de acessibilidade quando aplicável.

## Pull Requests
- Abra PR contra `develop`.
- Checklist antes do PR:
  - Lint sem erros: `npm run lint`
  - Build passa: `npm run build`
  - Testes E2E passam: `npm run test:e2e`
  - Descrição clara do impacto e screenshots quando UI muda.

## Releases
- Merges em `main` representam releases.
- Atualize `CHANGELOG.md` para cada release.

## Segurança
- Nunca commitar segredos. Use `.env` e GitHub Secrets.
- Reporte vulnerabilidades via Issues com a tag `security`.

## Suporte
- Dúvidas gerais: abra uma Issue.
- Sugestões de roadmap: use a tag `enhancement`.

