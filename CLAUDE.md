# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Landing page do escritório de advocacia Cardoso & Maués (Belém/PA), em Angular 20 com SSR/prerender.
É o frontend do projeto **push**: o backend Spring Boot (repositório separado) expõe
`GET /cnj/processo/{numero}` (consulta DataJud/CNJ) e `POST /contato`. Código, comentários e
mensagens de commit são em português.

## Comandos

```bash
npm start                      # ng serve (dev, backend em http://localhost:8080)
npm run start:ec2              # ng serve contra o backend real na EC2 (environment.ec2.ts)
npm run build                  # build de produção (padrão) -> dist/landing-page/{browser,server}
npm run watch                  # build incremental em development
npm test                       # Karma + Jasmine (abre Chrome)
npx ng test --watch=false      # rodada única (CI)
npx ng test --include='src/shared/chatbox/**/*.spec.ts'   # um único spec
npm run serve:ssr:landing-page # sobe o Express SSR a partir do dist (PORT, padrão 4000)
python3 scripts/gerar-hero-bg.py foto.jpg   # gera public/hero/hero-{1920,2560,3840}.webp (Pillow)
```

Não há lint configurado. Prettier: `printWidth: 100`, `singleQuote`, parser `angular` para HTML.

## Arquitetura

**Página única, sem rotas.** `app.routes.ts` é vazio; `app.html` empilha as seções na ordem
navbar → hero (`#inicio`) → situacoes → service → about → contact → footer → chatbox flutuante.
A navegação da navbar é por âncora (`#situacoes`, `#servicos`...). `app.routes.server.ts`
prerenderiza tudo (`RenderMode.Prerender`); o `src/server.ts` Express só serve estáticos e
delega ao `AngularNodeAppEngine`.

**Zoneless + signals.** `app.config.ts` usa `provideZonelessChangeDetection()`. Estado que
muda após eventos assíncronos deve ser `signal()`; mutar campos simples não re-renderiza.
Os specs precisam prover `provideZonelessChangeDetection()` no TestBed (ver `chatbox.spec.ts`,
que também usa `provideHttpClientTesting` + `HttpTestingController`).

**Componentes ficam em `src/shared/<nome>/`** (não em `src/app/`), standalone, SCSS por
componente, Angular Material (tema `mat.theme()` em `styles.scss`). Fontes globais: Lora
(títulos) e Inter (corpo), carregadas no `index.html`; todos os tokens visuais ficam no `:root`
de `styles.scss` e os componentes só usam `var(--...)`.

**Ambientes** (`src/environments/`): `environment.ts` (local), `.prod.ts` (build padrão) e
`.ec2.ts` (configuração `ec2`), trocados por `fileReplacements` no `angular.json`. Todos
expõem `apiUrl`, `whatsapp.{geral,trabalhista}` e `contingencia.{url,inicioHora,fimHora}`.
Ao mudar a forma desse objeto, atualizar os três arquivos. A `apiUrl` de produção é HTTP puro;
o comentário em `environment.prod.ts` explica a restrição de mixed content.

### Chatbot (`src/shared/chatbox/`)

Máquina de estados em `ChatboxComponent` (`ChatState`: `menu`, `aguardando_numero`,
`consultando`, `lead_*`, `enviando_lead`), sem LLM. Fluxos:

- **Consulta processual**: `ProcessoService.extrairNumeroProcesso` aceita número CNJ com ou
  sem máscara; `consultarProcesso` chama o backend com timeout de 30 s. Se
  `environment.contingencia.url` estiver preenchida, usa a Lambda de contingência diretamente
  na janela em que a EC2 fica desligada (hora de Belém, janela que cruza meia-noite) e como
  fallback quando o backend não responde (status 0 ou timeout, com timeout reduzido a 10 s).
- **Handoff WhatsApp**: `montarUrlWhatsapp()` escolhe `whatsapp.trabalhista` quando o
  contexto é trabalhista (dígito J = 5 do número CNJ, tribunal TRT/TST na resposta, ou termos
  em `REGEX_TRABALHISTA` no texto livre); caso contrário `whatsapp.geral`. O contexto zera ao
  voltar ao menu.
- **Lead**: coleta nome → e-mail → telefone (ou "pular") → mensagem e envia `POST /contato`;
  erros 400 com `campos` são mostrados ao usuário.

Autoscroll é feito em `afterRenderEffect` reagindo a `messages`/`isTyping` (não usar
`ngAfterViewChecked`); mensagens mais altas que a área alinham pelo topo via `offsetTop`.

`api.models.ts` espelha os DTOs do backend (`CnjProcessoDTO`, `ContatoDTO`); alterar os dois
lados em conjunto.

### Seção "Situações" (`src/shared/situacoes/`)

Cards de dor do cliente com CTA para WhatsApp; o campo `area` só define o número de destino.
A redação segue o Provimento 205/2021 da OAB: tom informativo, sem promessa de resultado,
valores ou apelo de urgência. Manter esse critério ao editar textos de marketing.

## Padrão visual

O design system do site está em `design-system/cardoso-e-maues/MASTER.md` (tokens, tipografia,
componentes, checklist). A skill do projeto `.claude/skills/padrao-visual` deve ser usada em
qualquer alteração de UI e direciona o uso da skill global `ui-ux-pro-max` (`--stack angular`).

## Observações

- `public/hero/` não está versionado; o hero cai num gradiente SCSS quando a imagem falha
  (`imagemIndisponivel` signal). Gerar com `scripts/gerar-hero-bg.py`.
- Vídeos (`*.mp4`, `*.mov`, `public/video/`) estão no `.gitignore`.
- `src/shared/header/` e `src/shared/parceria/` existem mas não são usados em nenhum template
  (`Parceria` é apenas importada em `app.ts`). `partner-modal` é aberto pela navbar via
  `MatDialog`. `src/assets/partner-modal/` é uma cópia antiga do componente, não a usar.
