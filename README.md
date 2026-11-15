# Pulso — front-end

Dashboard de BI da Fábrica de Software: **projetos**, **vendas** e **custo de IA**, com atualização em tempo real.

O front é genérico e dirigido por dados: a lista de cards, os títulos, as descrições e os tipos vêm da API. Há **uma** tela de dashboard que serve às três áreas, e **um componente por tipo de card** (8 tipos). O front não calcula nada: só formata e desenha o que a API envia.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · shadcn/ui (Radix) · Recharts (via `chart` do shadcn) · TanStack Query · React Router · react-hook-form + zod · date-fns · lucide-react · sonner · Vitest + Testing Library.

## Como rodar

Pré-requisitos: Node 20.19+ (ou 22+) e a API (`pulso-api`) rodando em `http://localhost:8080`.

```bash
npm install
cp .env.example .env      # ajuste VITE_API_URL se preciso
npm run dev               # http://localhost:3000
```

A porta **3000** é a origem que a API aceita por padrão no CORS (`CORS_ORIGINS`) e no WebSocket.

### Scripts

| Comando                           | O que faz                                |
| --------------------------------- | ---------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento (porta 3000) |
| `npm run build`                   | Typecheck + build de produção em `dist/` |
| `npm run preview`                 | Serve o build localmente (porta 3000)    |
| `npm run typecheck`               | `tsc --noEmit`                           |
| `npm run lint`                    | ESLint                                   |
| `npm run format` / `format:check` | Prettier                                 |
| `npm test`                        | Testes (Vitest)                          |
| `npm run check`                   | typecheck + lint + testes                |

## Variáveis de ambiente

| Variável       | Padrão                  | Descrição                                                                |
| -------------- | ----------------------- | ------------------------------------------------------------------------ |
| `VITE_API_URL` | `http://localhost:8080` | URL da API (sem barra no final)                                          |
| `VITE_WS_URL`  | derivada                | Opcional. Por padrão: `VITE_API_URL` com `http→ws` / `https→wss` + `/ws` |

Nenhum segredo fica no front. O único dado sensível é o token do usuário, obtido no login.

## Docker (somente o front)

A imagem tem só o front (build com Node + nginx servindo os estáticos). A API e o banco continuam no compose do `pulso-api`.

```bash
docker compose up -d --build        # http://localhost:3000
```

Ou sem compose:

```bash
docker build -t pulso-app .
docker run -d -p 3000:80 -e API_URL=http://localhost:8080 pulso-app
```

- `API_URL` (e opcionalmente `WS_URL`) são lidas **na subida do container** e gravadas em `/config.js`. A mesma imagem serve a qualquer ambiente, sem rebuild.
- `API_URL` é a URL que o **navegador** usa para chegar na API (não a rede interna do Docker).
- Publique o container na porta 3000 do host, ou inclua a origem usada no `CORS_ORIGINS` da API.
- O nginx faz o fallback da SPA (qualquer rota → `index.html`), cache longo em `/assets/`, `no-store` em `/config.js` e expõe `/healthz` para o healthcheck.

## Imagem do login

Coloque a imagem em **`public/imagens/login.jpg`**. O caminho está na constante `IMAGEM_LOGIN` em [src/components/login/PainelImagem.tsx](src/components/login/PainelImagem.tsx); para usar outro nome ou formato (`.png`, `.webp`), troque só essa constante. Enquanto o arquivo não existir, aparece um fundo decorativo original (grade + onda de pulso). A frase "Operação, vendas e IA em um só pulso." fica sobre a imagem com um degradê para garantir a leitura.

## Estrutura

```
src/
├── main.tsx · App.tsx · rotas.tsx · index.css
├── types/api.ts              contrato da API (conferido contra a API real)
├── lib/
│   ├── api.ts                cliente HTTP + ApiError (401 global)
│   ├── auth.ts               sessão (localStorage), expiração, iniciais, perfil
│   ├── cards.ts              regras de exibição comuns (vazio, subtítulo, badge)
│   ├── cache-cards.ts        substitui um card no cache do React Query
│   ├── config.ts             URLs da API/WS (runtime > .env > padrão)
│   ├── cores.ts              cor por dashboard, por série e por fatia
│   ├── dashboards.ts         ícones e ordem dos dashboards
│   ├── filtros.ts            filtros ↔ URL ↔ API ↔ WebSocket
│   ├── filtros-config.ts     quais filtros cada dashboard mostra
│   ├── formatadores.ts       moeda, número, %, datas e unidades (pt-BR)
│   ├── layout-cards.ts       spans e montarLinhas (grade de 12 colunas)
│   ├── periodos.ts           atalhos de período e sprint padrão
│   ├── query.ts              QueryClient e chaves de cache
│   ├── realce.ts             realce do card atualizado
│   └── tempo-real.ts         conexão WebSocket (assinatura, backoff)
├── hooks/                    useAuth, useTema, useDashboards, useDashboard, useFiltros,
│                             useOpcoesFiltros, useTempoReal, useAtualizarCard, useRealce...
├── components/
│   ├── ui/                   componentes do shadcn
│   ├── layout/               AuthProvider, TemaProvider, TempoRealProvider, CabecalhoApp,
│   │                         Logo, TemaToggle, MenuUsuario, SeletorDashboard, RotaProtegida
│   ├── cards/                CardShell, CardInfoDialog, CardRenderer, estados, registro
│   │   ├── tipos/            NumeroCard, RadialCard, LinhasCard/AreaCard, BarrasCard,
│   │   │                     BarrasAgrupadasCard, DonutCard, ListaCard
│   │   └── graficos/         peças comuns dos gráficos (eixos, legenda, hachura, tooltip)
│   ├── filtros/              BarraFiltros, FiltroSelect, FiltroPeriodo, FiltroEscopo
│   ├── dashboard/            GradeCards, DashboardTile, StatusAoVivo, IconeDashboard
│   └── login/                PainelImagem
└── pages/                    Login, Home, Dashboard (lazy), NaoEncontrado
docker/                       nginx.conf e script de config em runtime
```

### Onde ajustar

| Quero mudar…                     | Arquivo                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Tamanho/ordem dos cards na grade | `src/lib/layout-cards.ts` (`SPAN_POR_TIPO`, `SPAN_POR_CARD`)                           |
| Filtros de cada dashboard        | `src/lib/filtros-config.ts`                                                            |
| Cor de um dashboard / nova cor   | `src/lib/cores.ts` + um bloco `[data-cor]` em `src/index.css`                          |
| Ícone ou ordem dos dashboards    | `src/lib/dashboards.ts`                                                                |
| Visual do seletor de filtro      | `src/components/filtros/FiltroSelect.tsx` (único lugar)                                |
| Novo tipo de card                | um componente em `components/cards/tipos/` + entrada em `components/cards/registro.ts` |

## Decisões de implementação

- **Precedência entre os documentos.** Onde o `CLAUDE.md` e o `DESIGN_SYSTEM.md` divergem em visual ou estrutura (pastas, Home com tiles, ordem vendas/projetos/ia, URL do WS derivada, grade), vale o `DESIGN_SYSTEM.md`. Em dados e rotas, vale a API real.
- **Componentes do shadcn escritos a partir do código da CLI.** O registro `ui.shadcn.com` não estava acessível no ambiente de desenvolvimento; os componentes de `components/ui/` seguem o código gerado pela CLI (estilo new-york, Radix). O `components.json` está pronto, então `npx shadcn add <componente>` funciona normalmente. Ajustes de tema: o `sonner` usa o `TemaProvider` em vez de `next-themes`; o `chart` foi adaptado ao Recharts 3.
- **`react-day-picker` v9** (e não a v10) para manter a compatibilidade com o `calendar` do shadcn.
- **Tooltip e legenda dos gráficos.** Os gráficos usam o `ChartContainer` do shadcn; o tooltip (`CaixaTooltip`) e a legenda (`Legenda`) são HTML com o mesmo visual do `ChartTooltipContent`, para mostrar o segundo código visual (tracejado, hachura e ícones de estado), as chaves extras e as notas de amostra pequena.
- **Cards especiais dirigidos pelos dados, não pelo código.** Os ajustes da seção 9.2 do `CLAUDE.md` são ativados pelas chaves que a API envia: `x` numérico com `data` (proj-04), `extra.sprint` (proj-06), `extra` em objeto (proj-12), `destaque` (proj-13), `extra.projecao` (ia-05), `dados.referencia` e `amostra_minima` com `n_*` (ia-10) e coluna "Alerta" (ia-12). Um card novo com o mesmo formato herda o comportamento.
- **Unidade do donut.** A API não envia `unidade` no donut; o ia-07 (R$) está mapeado em `lib/cards.ts`. Se a API passar a enviar `dados.unidade`, ela tem prioridade.
- **Percentual da legenda do donut.** O DESIGN_SYSTEM pede "valor e percentual" na legenda; o percentual (fatia ÷ total) é a única conta feita no front, apenas para exibição.
- **"Tentar novamente" de um card** usa `GET /cards/:codigo/dados` e troca só aquele card no cache.
- **Sessão.** `localStorage` (`pulso-token`) guarda `{ token, expiraEm }`; a expiração vem de `expira_em` do login (com o `exp` do JWT como reserva). O logout chama `POST /auth/logout` em melhor esforço e sempre limpa tudo localmente.
- **Tempo real.** Uma conexão por aba, reaproveitada numa troca rápida de dashboard e fechada ao sair da tela (após 3 s sem nova assinatura). Mensagens `card_atualizado` só são aplicadas depois do `assinado` da assinatura atual. Reconexão com backoff 1 s → 30 s; depois de 10 falhas seguidas o indicador mostra "Offline", mas continua tentando a cada 30 s (e na hora, quando o navegador volta a ficar online). Como o handshake recusado (token inválido) é indistinguível de API fora do ar, uma falha ao conectar dispara uma conferência de `GET /auth/me` (no máximo a cada 15 s); um 401 ali faz o logout.
- **Período.** Sem período escolhido, o front não envia `de`/`ate` e mostra o período efetivo de `filtros_aplicados`. No escopo Sprint, o seletor de período fica desabilitado com as datas da sprint.
- **Filtro inválido (400).** A mensagem da API aparece acima da grade; os últimos dados válidos continuam na tela.
- **Rótulos das origens de lead** (`indicacao` → "Indicação") são só de exibição, em `BarraFiltros.tsx`.
- **Configuração em runtime no Docker.** `public/config.js` (vazio no desenvolvimento) é regenerado na subida do container a partir de `API_URL`/`WS_URL`.
