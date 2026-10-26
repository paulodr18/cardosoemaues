# Design System — Cardoso & Maués (MASTER)

> **Regra de leitura:** antes de alterar uma seção, verifique se existe
> `design-system/cardoso-e-maues/pages/<secao>.md`. Se existir, as regras dele
> sobrescrevem este arquivo. Caso contrário, siga estritamente o que está aqui.

**Projeto:** Landing page Cardoso & Maués Advocacia (Belém/PA)
**Gerado em:** 23/10/2026 — **revisado em 23/10/2026** (tipografia Lora + Inter, 6 cards em Situações) — base: `ui-ux-pro-max --design-system` (padrão "Trust & Authority",
variance 3, motion 3, density 3) **ajustada à identidade já existente no site**.
A ferramenta sugeriu EB Garamond + Lato e azul `#1E3A8A`; isso foi descartado para manter o
navy/dourado atual. A tipografia original (Cinzel + Cormorant + Montserrat, caixa alta espaçada)
foi trocada por Lora + Inter por pedido de leitura mais limpa.
**Status:** proposta para aprovação antes da refatoração dos componentes.

---

## 1. Direção visual

**Hero:** degradê suave só em navy (`navy-light → navy → navy-deep`, 160°), sem brilho dourado; a foto em `/hero`,
quando existir, fica por cima com o overlay navy.

**Estilo:** Minimalismo clássico, sóbrio e elegante. Muito espaço em branco, contraste
alto, poucos elementos por tela, tipografia como protagonista, dourado usado com parcimônia
(detalhes, linhas, ícones, CTA), nunca como cor de fundo em áreas grandes.

**Padrão de página:** Trust & Authority + Conversão
Hero (credibilidade) → Situações (dor do cliente) → Serviços → Sobre (equipe) → Contato/CTA → Rodapé.
CTA primário sempre leva ao WhatsApp; CTA secundário ao formulário/chat.

**Palavras-chave:** autoridade, tradição, clareza, serenidade, acessível.

**Evitar:** gradientes roxo/rosa, sombras coloridas fortes, ícones emoji, cantos muito
arredondados, animações chamativas, mais de uma fonte de destaque por seção.

---

## 2. Cores

Definir uma única vez em `src/styles.scss` dentro de `:root`. Componentes consomem
`var(--...)`; nenhum `#hex` novo em `src/shared/**/*.scss`. As variáveis SCSS locais
(`$navy`, `$gold`, `$white`…) repetidas em cada componente devem ser removidas.

| Papel | Hex | Variável | Uso |
|---|---|---|---|
| Navy (primária) | `#0f172a` | `--color-navy` | Texto principal, fundos escuros, botão primário |
| Navy claro | `#1e293b` | `--color-navy-light` | Superfícies secundárias em fundo escuro, hover |
| Navy profundo | `#0a0f1c` | `--color-navy-deep` | Rodapé, overlay do hero |
| Dourado (acento) | `#c5a059` | `--color-gold` | Linhas, ícones, eyebrow, bordas de CTA, títulos grandes |
| Dourado texto | `#8c6d33` | `--color-gold-text` | Texto dourado **pequeno** sobre fundo claro (ver contraste) |
| Branco | `#ffffff` | `--color-white` | Cards, texto sobre navy |
| Papel | `#f9f9f7` | `--color-paper` | Fundo de seções claras (tom "papel de carta") |
| Cinza texto | `#64748b` | `--color-muted` | Texto de apoio, legendas, horários |
| Borda | `#e2e8f0` | `--color-border` | Divisores, bordas de input e card |
| WhatsApp | `#25d366` | `--color-whatsapp` | **Somente** botão/ícone de WhatsApp |
| Erro | `#dc2626` | `--color-error` | Validação de formulário e chat |

**Contraste (WCAG 4.5:1 para texto corrido):**
- `--color-gold` sobre branco/papel = **2,5:1 → não usar em texto menor que 24px**. Usar `--color-gold-text` (4,8:1) ou navy.
- `--color-gold` sobre navy = 7,3:1 ✔
- `--color-muted` sobre branco = 4,8:1 ✔ (limite; não clarear)
- Branco sobre navy = 17:1 ✔

**Remover do código:** `#38bdf8` (azul céu, fora da identidade), `#555/#666/#777/#999/#444`
(cinzas soltos → `--color-muted` ou navy), `#fdfdfd` e `#f8fafc` (→ `--color-white`/`--color-paper`),
`#0a2157`, `#10b981/#059669` (→ `--color-whatsapp` só onde for WhatsApp).

**Angular Material:** o tema em `styles.scss` usa `mat.$azure-palette`; os componentes Material
(inputs do chat, dialog, toolbar) herdam azul. Alinhar criando paleta a partir do navy/dourado
ou sobrescrevendo os tokens `--mat-sys-*` relevantes. Fica para a etapa 3.

---

## 3. Tipografia

Duas famílias, carregadas **uma única vez** em `src/index.html`. Critério: limpa e fácil de ler,
sem ar de template. Títulos em **caixa normal** (nunca `text-transform: uppercase` em h1/h2/h3).

| Papel | Família | Variável | Pesos |
|---|---|---|---|
| Títulos (h1, h2, h3, nome dos sócios, cabeçalho do chat) | Lora | `--font-title` | 400, 500, 600, 700, 400i |
| Destaque itálico (o "&" e a palavra dourada do título de contato) | Lora itálico | `--font-display` (alias de Lora) | 400i |
| Corpo e UI (parágrafos, botões, menu, inputs, chat) | Inter | `--font-body` | 300, 400, 500, 600 |

**Exceção única:** o nome "Cardoso & Maués" no hero usa `--font-brand` (Cinzel, caixa alta,
`--text-brand` até 4,5rem), por decisão da cliente em 23/10/2026. Não usar Cinzel em mais nada.

**Proibidas (fora da exceção acima):** Cormorant Garamond, Montserrat, Poppins, Playfair Display, Roboto.
Caixa alta só em rótulos pequenos (eyebrow, legendas, rótulos de input), com `--tracking-md`.

**Escala (desktop → mobile via `clamp`):**

| Token | Tamanho | Fonte | Observações |
|---|---|---|---|
| `--text-eyebrow` | 0.8rem | body | uppercase, `--tracking-md`, cor gold-text (ou gold sobre navy) |
| `--text-h1` | clamp(2.4rem, 5vw, 3.75rem) | title | peso 500, caixa normal, line-height 1.15 |
| `--text-h2` | clamp(1.9rem, 3.5vw, 2.6rem) | title | peso 500–600, line-height 1.2 |
| `--text-h3` | 1.3rem | title | peso 600 (cards, perguntas) |
| `--text-lead` | clamp(1.1rem, 1.8vw, 1.35rem) | body | peso 300, line-height 1.55 |
| `--text-body` | 1rem | body | line-height 1.6, peso 400 |
| `--text-small` | 0.85rem | body | legendas, horários, rodapé |

**Letter-spacing:** `--tracking-sm` 0.5px, `--tracking-md` 1px, `--tracking-lg` 1.5px, só em rótulos
em caixa alta. Títulos usam `-0.01em`; corpo e botões, 0 a 0.2px.
**Uppercase:** apenas eyebrow e rótulos pequenos. Menu, botões, títulos e parágrafos em caixa normal.
**Órfãs:** `text-wrap: balance` em títulos e leads (já no `styles.scss`).

---

## 4. Espaçamento e grid

| Token | Valor | Uso |
|---|---|---|
| `--space-xs` | 0.5rem | gaps internos pequenos |
| `--space-sm` | 1rem | padding de inputs, gap de ícone+texto |
| `--space-md` | 2rem | gap entre cards, padding de card |
| `--space-lg` | 4rem | padding vertical de seção no mobile |
| `--space-xl` | 7rem | padding vertical de seção no desktop |
| `--container` | 1200px | largura máxima de seção |
| `--container-narrow` | 720px | textos corridos, subtítulos, formulário |

Padrão de seção: `padding: var(--space-xl) var(--space-md)` no desktop e
`padding: var(--space-lg) 1.25rem` no mobile. Hoje há 6rem, 7rem, 8rem e 120px misturados;
unificar em `--space-xl`.

**Breakpoints (max-width):** `480px` (celular), `768px` (tablet), `992px` (notebook).
Remover o `600px` isolado.

---

## 5. Raios, bordas e sombras

| Token | Valor | Uso |
|---|---|---|
| `--radius-none` | 0 | **Botões** (linha clássica, sem arredondar) |
| `--radius-sm` | 4px | Cards, inputs, chips |
| `--radius-md` | 12px | Janela do chat, modal, balões |
| `--radius-full` | 50% | Avatares, botão flutuante do chat |

| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0 4px 15px rgba(15,23,42,.08)` | Card em repouso |
| `--shadow-md` | `0 10px 30px rgba(15,23,42,.12)` | Card em hover, navbar sólida |
| `--shadow-lg` | `0 20px 50px rgba(15,23,42,.30)` | Chat aberto, modal |
| `--shadow-gold` | `0 6px 15px rgba(197,160,89,.30)` | Hover do CTA dourado |

Bordas sempre `1px solid var(--color-border)` em fundo claro ou
`1px solid rgba(255,255,255,.25)` em fundo navy. Linha decorativa dourada: `2px`, largura 60px.

---

## 6. Movimento

- Transição padrão: `transition: <propriedade> 0.3s ease` (nunca `all`, listar a propriedade).
- Cards e elementos com elevação: `0.4s cubic-bezier(0.25, 1, 0.5, 1)`.
- Hover de card: `translateY(-4px)` + `--shadow-md`. Nada de `scale` que desloque layout.
- Reveal ao rolar: opacidade + `translateY(12px)`, 350ms, só CSS/IntersectionObserver. Não adicionar GSAP.
- Obrigatório: `@media (prefers-reduced-motion: reduce)` desliga translações e reveals.

---

## 7. Componentes

### Botões
```scss
.btn {
  font-family: var(--font-body); font-size: 0.95rem; font-weight: 500;
  letter-spacing: 0.2px; // caixa normal: "Ver se tenho direito", "Enviar solicitação"
  padding: 0.9rem 2.5rem; border-radius: var(--radius-none);
  cursor: pointer; transition: background-color .3s ease, color .3s ease, box-shadow .3s ease;
  min-height: 44px; // alvo de toque
}
.btn--primary  { background: var(--color-gold); color: var(--color-navy); border: 1px solid var(--color-gold); }
.btn--primary:hover { box-shadow: var(--shadow-gold); background: #d4b06a; }
.btn--outline  { background: transparent; color: var(--color-gold); border: 1px solid var(--color-gold); }
.btn--outline:hover { background: var(--color-gold); color: var(--color-navy); }
.btn--outline-light { color: var(--color-white); border-color: rgba(255,255,255,.4); } // sobre o hero
.btn--whatsapp { background: var(--color-whatsapp); color: #fff; border-color: var(--color-whatsapp); }
.btn:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 3px; }
```

### Cards (situações, serviços, equipe)
Fundo `--color-white` sobre seção `--color-paper` (ou o inverso), borda `--color-border`,
`--radius-sm`, padding `--space-md`, `--shadow-sm` → hover `--shadow-md` + `translateY(-4px)`.
Ícone Material Icons em `--color-gold`, 2.2rem. Título em `--font-title` 1.35rem navy.

### Eyebrow + título de seção
```html
<span class="eyebrow">Áreas de atuação</span>
<h2>Como podemos ajudar</h2>
<span class="divider-gold"></span>
```
Eyebrow 0.8rem uppercase `--tracking-md` em `--color-gold-text`; linha dourada 60×2px abaixo do h2.

### Seção Situações (regra editorial)
No máximo **6 cards** (3×2). Pergunta com até 8 palavras, em Lora 1.3rem; resposta em **uma frase**
(Inter 0.95rem). Situações além das 6 entram no **card de fechamento** (largura total, navy fixo,
título "Não encontrou a sua situação?", lista em uma frase e botão dourado "Conte sua situação"
para o WhatsApp geral), nunca em novos cards individuais. CTA do card em caixa normal: "Falar com um advogado →".

### Inputs (contato e chat)
Borda `1px solid var(--color-border)`, `--radius-sm`, padding `0.75rem 1rem`, fonte body 1rem.
Foco: `border-color: var(--color-gold)` + `box-shadow: 0 0 0 3px rgba(197,160,89,.25)`.
Label sempre visível (não só placeholder). Erro: texto `--color-error` logo abaixo do campo.

### Navbar
Transparente sobre o hero, sólida navy com `--shadow-md` após rolagem. Itens em body 0.95rem,
caixa normal, peso 500, branco → hover dourado com underline 2px. Altura 70px. Logo em imagem (SVG/PNG).

### Chat flutuante
Botão `--radius-full` navy com ícone dourado; janela `--radius-md`, `--shadow-lg`; cabeçalho navy
com título em `--font-display`; balões do bot em `--color-paper`, do usuário em navy.

---

## 8. Conteúdo e conformidade

- Redação conforme **Provimento 205/2021 da OAB**: informativa, sem promessa de resultado,
  sem valores, sem apelo de urgência, sem "o melhor escritório".
- Tom: cordial, direto, na segunda pessoa ("você"). Sem gírias.
- Ícones: Material Icons (já carregado). Não misturar com FontAwesome em uma mesma seção;
  avaliar remover o FontAwesome do `index.html` se não houver uso.
- Imagens: WebP, `loading="lazy"` fora do hero, `alt` descritivo (ou vazio se decorativa).

---

## 9. Checklist antes de entregar qualquer alteração visual

- [ ] Nenhum `#hex` novo em `src/shared/**/*.scss`; tudo via `var(--...)`.
- [ ] Só Lora e Inter; nenhuma outra `font-family`; nenhum `uppercase` em título, menu ou botão.
- [ ] Contraste ≥ 4,5:1 em texto corrido (dourado pequeno só com `--color-gold-text`).
- [ ] Botões e links com `cursor: pointer`, `min-height: 44px` e `:focus-visible` visível.
- [ ] Transições 150–400ms nomeando a propriedade; `prefers-reduced-motion` respeitado.
- [ ] Testado em 375px, 768px, 1024px e 1440px; sem scroll horizontal.
- [ ] Conteúdo não fica escondido atrás da navbar fixa (âncoras com `scroll-margin-top: 70px`).
- [ ] SSR: nenhum acesso a `window`/`document` fora de `afterRenderEffect`/guards de plataforma.
- [ ] Zoneless: estado que muda após evento assíncrono é `signal()`.
- [ ] Texto revisado contra o Provimento 205/2021.
