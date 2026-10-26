---
name: padrao-visual
description: Padrão visual da landing page Cardoso & Maués. Use SEMPRE que a tarefa alterar algo que o visitante vê — SCSS, templates HTML, cores, fontes, espaçamento, botões, cards, navbar, chat, animações, responsivo, acessibilidade — ou quando o usuário pedir para deixar o site mais elegante, bonito, consistente ou "no padrão". Garante que toda mudança siga o design system do projeto e a identidade navy + dourado com Lora (títulos) e Inter (corpo), limpa e legível.
---

# Padrão visual — Cardoso & Maués

Esta skill existe para que qualquer alteração de UI neste repositório siga **um único padrão**,
independentemente da sessão. Ela não substitui a `ui-ux-pro-max`; ela a direciona.

## Fonte de verdade

1. Leia `design-system/cardoso-e-maues/MASTER.md` **antes** de editar qualquer `.scss` ou `.html`.
2. Verifique se existe `design-system/cardoso-e-maues/pages/<secao>.md` para a seção em questão
   (`hero`, `situacoes`, `servicos`, `sobre`, `contato`, `footer`, `navbar`, `chatbox`).
   Se existir, ele sobrescreve o MASTER para aquela seção.
3. Os tokens (`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`) vivem em
   `src/styles.scss` dentro de `:root`. Se um token necessário ainda não existe lá, crie-o no
   `:root` **e** documente no MASTER na mesma alteração. Nunca crie variável SCSS local
   (`$gold`, `$navy`…) nem `#hex` novo dentro de `src/shared/**`.

## Como trabalhar

- **Uma seção por vez.** Refatore e entregue `hero`, depois `situacoes`, etc., para que o usuário
  valide visualmente cada passo. Não reescreva várias seções num único commit.
- **Preserve estrutura e comportamento.** A refatoração é de estilo: não mude a ordem das seções,
  os textos, a lógica do chat nem os ids de âncora (`#inicio`, `#situacoes`, `#servicos`,
  `#sobre`, `#contato`), que a navbar usa.
- **Consulte a `ui-ux-pro-max` para dúvidas pontuais**, sempre com stack explícita:
  ```bash
  python3 "$HOME/.claude/skills/ui-ux-pro-max/scripts/search.py" "<2 a 5 termos>" --stack angular
  python3 "$HOME/.claude/skills/ui-ux-pro-max/scripts/search.py" "<2 a 5 termos>" --domain ux
  ```
  Não rode `--design-system --persist` neste projeto: o MASTER já existe e foi ajustado à mão;
  `--force` só com autorização explícita do usuário.
- **Não adicione dependências** (Tailwind, GSAP, bibliotecas de ícones, fontes novas). O site usa
  Angular Material + SCSS + Material Icons e só as duas fontes do `index.html` (Lora e Inter).
- **Textos curtos.** Cards e leads seguem os limites editoriais do MASTER (seção 7, "Situações");
  menos blocos e uma frase por bloco valem mais do que cobertura completa.
- **Angular específico:** SSR com prerender (sem `window`/`document` fora de
  `afterRenderEffect` ou guard de plataforma) e zoneless (estado assíncrono em `signal()`).
  Ver `CLAUDE.md`.
- **Textos:** qualquer copy nova ou alterada segue o Provimento 205/2021 da OAB
  (informativa, sem promessa de resultado, valores ou urgência).

## Antes de encerrar a tarefa

Passe pelo checklist da seção 9 do MASTER e liste no resumo final:
- arquivos alterados;
- tokens criados (se houver);
- itens do checklist que **não** puderam ser verificados (ex.: não testou em 375px).

Para conferir rapidamente se sobrou valor fora do padrão na seção editada:
```bash
grep -nE '#[0-9a-fA-F]{3,8}\b|font-family:|\$[a-z-]+:' src/shared/<secao>/<secao>.scss
```
O resultado esperado é vazio (fontes e cores só via `var(--...)`).
