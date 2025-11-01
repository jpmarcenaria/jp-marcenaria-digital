# Arquitetura

## Stack
- Vite + React + TypeScript
- Tailwind CSS + shadcn-ui + Radix UI
- React Router DOM
- Supabase (dados)
- Playwright (E2E)

## Estrutura
```
src/
  components/       # UI reutilizável
  pages/            # Páginas e rotas
  lib/              # Helpers, configs
  styles/           # Tailwind config e estilos globais
tests/              # E2E (Playwright)
docs/               # Documentação
public/             # Assets estáticos
```

## Fluxo de Renderização
- SPA com roteamento pelo `react-router-dom`.
- UI com shadcn-ui e Tailwind (tema claro/escuro, acessibilidade).
- Dados externos via Supabase (`@supabase/supabase-js`).

## Considerações de Acessibilidade
- Contraste padrão `text-foreground` e `text-muted-foreground`.
- Estados `hover`, `active`, `focus` padronizados.
- Componentes interativos com atributos ARIA quando necessário.

## Diagrama (alto nível)
```
 [Browser]
     │
     ▼
  React + Vite (SPA)
     │           
     ├── UI (shadcn + Tailwind)
     │
     └── Supabase SDK ──► Supabase (DB/Auth/Storage)
```

