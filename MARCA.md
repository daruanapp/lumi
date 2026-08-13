# Lumi — a marca na web

A parte do kit da marca que este repositório executa. O kit completo — o
personagem, a voz, as peças, as escalas de cor do conteúdo — está no
repositório do app, em
[`daruanapp/exploraBiblia` → `MARCA.md`](https://github.com/daruanapp/exploraBiblia/blob/main/MARCA.md).
Divergiu dele, o errado é aqui.

Este arquivo existe porque o site é o único lugar da marca que roda fora do
app: ele tem tipografia própria, uma ilustração própria do personagem e uma
palheta em `:root` que ninguém sincroniza automaticamente com o
`src/global/styles/paleta.ts` do app.

---

## As páginas

| Página | Caminho | Fontes | Papel |
|---|---|---|---|
| Landing | `/` | Playfair Display + Poppins | vende o app |
| Teste fechado | `/teste/` | do sistema | recruta testador |
| Convite de plano | `/plano/` | do sistema | abre o app com um plano |
| Convite de esboço | `/esboco/` | do sistema | abre o app com um esboço |
| Privacidade | `/privacidade/` | do sistema | exigência da Play Store |
| Exclusão de conta | `/exclusao-de-conta/` | do sistema | exigência da Play Store |

Só a landing carrega as fontes da marca. As outras usam a pilha do sistema, de
propósito: são páginas que alguém abre por um link no WhatsApp, muitas vezes
no 3G da rua, e esperar duas fontes do Google antes de mostrar o botão custa
mais do que a serifada entrega ali. Elas mantêm a marca pelo **fundo, pelo
âmbar e pelo texto** — que é o suficiente.

Não converta as páginas de convite para Playfair. Se uma página nova precisar
da tipografia completa, ela é uma página de venda, não de convite.

---

## As cores

Fonte: `style.css`, bloco `:root`. Espelham a paleta do app.

```css
--bg-1: #0D0D1A;   --bg-2: #1A1000;   --bg-3: #0D0D0D;
--accent: #F39C12; --accent-2: #E67E22;
--card-bg: rgba(255,255,255,0.06);
--border:  rgba(255,255,255,0.1);
--text-primary:   #FFFFFF;
--text-secondary: rgba(255,255,255,0.65);
--text-muted:     rgba(255,255,255,0.42);
```

Duas diferenças em relação ao app, ambas propositais:

- **O texto secundário é alfa, não hex.** O app usa `#AAAAAA` sobre um fundo
  chapado; aqui o texto passa por cima de um degradê de 100 vh e de uma seção
  `--alt` translúcida. `rgba(255,255,255,0.65)` resolve em `#AAAAAF` sobre o
  `--bg-1`, praticamente o `#AAAAAA` do app, e continua correto quando o fundo
  muda embaixo dele.
- **As páginas de privacidade e exclusão usam `#C77400` nos links**, não o
  `--accent`. Elas são as únicas do site que têm tema claro (`#FAFBFF`), e o
  `#F39C12` ali dá 2,12:1 — ilegível. O `#C77400` chega a 3,43:1, e o valor do
  kit para esse caso (`AMBAR_NO_CLARO`, `#A65E14`, 4,80:1) é o alvo quando
  essas páginas forem revisitadas. No `prefers-color-scheme: dark` delas o link
  volta a ser `#F39C12`, que ali está correto.

O `--accent` sobre o fundo escuro dá 8,79:1 — em tela escura ele é uma cor de
texto perfeitamente boa, e é assim que a landing o usa nos links.

O `.skip-link` escreve `#1a1000` sobre o âmbar em vez de branco. **Esse é o
padrão certo** e o app ainda não o segue: branco sobre `#F39C12` dá 2,19:1.
Qualquer botão âmbar novo neste repositório escreve em `#1A1000`.

---

## Tipografia

```css
--font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
--font-sans:  'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Serifada só para o nome da marca e para título de seção. Poppins para todo o
resto. O `<link>` do Google Fonts carrega **Playfair Display 600, 700 e
itálico 500** e **Poppins 400, 500, 600 e 700** — pedir no CSS um peso fora
dessa lista faz o navegador falsificar o negrito, que fica visivelmente pior
que o desenhado. O app carrega só Poppins 400/500/700; 600 é exclusivo da web.

O nome "Lumi" é sempre serifada 700 com `letter-spacing` folgado.

---

## O personagem

`assets/images/lumi.webp` — ilustração, não o SVG do app. O app desenha a Lumi
em tempo real porque ela muda de expressão; aqui ela é estática e no auge do
brilho, que é o estado que uma peça de divulgação mostra.

Regras que valem na web:

- Ela flutua num ciclo de 6 s (`lumi-float`) e leva um `drop-shadow` âmbar.
  A flutuação é o único movimento contínuo do site.
- Ela sempre tem escuro em volta. Não coloque a Lumi sobre uma seção clara.
- `prefers-reduced-motion` desliga as animações de entrada. Qualquer animação
  nova entra sob a mesma media query.

`assets/images/og-image.png` (1200×630) é a prévia de link de todas as
páginas. **A URL dele precisa ser absoluta** em toda página nova — o robô do
WhatsApp e do Facebook não resolve caminho relativo, e sem isso a prévia cai
no formato sem imagem.

---

## Checklist de página nova

- [ ] `theme-color` = `#0D0D1A`
- [ ] Fundo no degradê `#0D0D1A → #1A1000 → #0D0D0D`
- [ ] `og:image` com URL **absoluta**, `og:locale` = `pt_BR`, `og:site_name` = `Lumi`
- [ ] `<link rel="canonical">` apontando para a própria URL
- [ ] Favicon `assets/images/icon.png`
- [ ] Texto sobre âmbar em `#1A1000`, nunca branco
- [ ] Página de convite ou legal → fonte do sistema; página de venda → fontes da marca
- [ ] `lang="pt-BR"` e um `skip-link` se a página tiver navegação
