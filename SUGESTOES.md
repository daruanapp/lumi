# Sugestões dos testadores

O que o pessoal do teste fechado pede, anotado à medida que chega. Uma seção
aqui é um **pedido registrado**, não uma promessa de entrega: o que for feito
sai daqui e vira trabalho no repositório do app,
[`daruanapp/exploraBiblia`](https://github.com/daruanapp/exploraBiblia). Este
arquivo mora neste repositório porque é o site que recruta o testador
(`/teste/`) e é no `biblia.lumi@gmail.com` que o retorno dele chega — o
registro fica onde a conversa começa.

Nenhuma linha deste arquivo implementa nada. Ele existe para que um pedido não
se perca entre uma mensagem de WhatsApp e uma caixa de entrada, e para que,
quando alguém pedir a mesma coisa pela terceira vez, dê para ver que já foram
três.

---

## Como anotar

Sugestão nova é seção nova **no fim da lista**, numerada na sequência. Não
reordene as que já existem: o número é como um pedido é citado numa conversa,
e renumerar quebra a referência.

```markdown
## N. Título curto, no jeito que a pessoa pediu

**O pedido.** Uma ou duas frases, com o exemplo que a pessoa deu.

**De onde veio.** Teste fechado, mês/ano. Quantas vezes já pediram.

**Situação.** anotada

**Em aberto.** As perguntas que precisam de resposta antes de virar trabalho.
```

Quatro regras que evitam o desgaste deste arquivo:

- **Anote com as palavras de quem pediu.** Se o testador falou "aquele negócio
  do YouVersion que mostra versículo parecido", isso vai escrito. Traduzir o
  pedido para o vocabulário do projeto já é uma decisão de produto, e ela não
  se toma na hora de anotar.
- **Não resolva a sugestão aqui.** O campo *Em aberto* é para perguntas, não
  para respostas — no dia em que virar trabalho, a discussão acontece na issue
  do app, com o código na frente.
- **Pedido repetido não vira seção nova.** Some ao *De onde veio* da seção que
  já existe. A contagem é o sinal mais honesto de prioridade que este arquivo
  produz.
- **Sem nome e sem e-mail de testador.** Este repositório é público e é
  publicado no GitHub Pages. Quem se inscreveu no teste deu o e-mail para
  receber convite da Play Store, não para aparecer num arquivo do repositório.
  "Um testador", "três testadores" — é o suficiente.

**Situação** é sempre uma destas: `anotada` (registrada, ninguém olhou ainda),
`em estudo` (alguém está respondendo o *Em aberto*), `em andamento` (virou
trabalho no repositório do app), `entregue` (com a versão em que saiu) ou
`descartada` (**com o motivo escrito** — sugestão descartada sem motivo volta
a ser pedida daqui a dois meses e ninguém lembra por que caiu).

---

## Situação de cada uma

| # | Sugestão | Situação |
|---|---|---|
| 1 | Conteúdo relacionado no versículo | anotada |
| 2 | Skins do Lumi liberadas pela leitura | anotada |
| 3 | Figurinha nova de livro concluído a cada ano | anotada |
| 4 | Visão geral do livro | anotada |
| 5 | Oração guiada e explicação do versículo do dia | anotada |

---

## 1. Conteúdo relacionado no versículo

**O pedido.** Que o versículo mostre os conteúdos ligados a ele, como o
YouVersion faz: lá, os versículos que têm conexões trazem essa parte de
conteúdo relacionado.

**De onde veio.** Teste fechado, ago/2026. Pedido uma vez.

**Situação.** anotada

**Em aberto.**
- De onde sai a relação entre um versículo e outro? É referência cruzada de
  base pronta, é curadoria manual, é os dois?
- Se depender de base de terceiro: qual, e com que licença. Conteúdo bíblico
  de domínio público e conteúdo com direitos são coisas diferentes, e essa
  resposta muda o tamanho do trabalho.
- O app funciona offline na leitura. O conteúdo relacionado também precisa
  funcionar, ou pode exigir conexão?
- Onde ele aparece: um indicador no próprio versículo, uma aba, ou dentro do
  menu que já abre ao tocar no versículo?

---

## 2. Skins do Lumi liberadas pela leitura

**O pedido.** Roupas para o Lumi, liberadas conforme a pessoa lê determinados
capítulos — a túnica de José, a armadura de Efésios 6, e coisas nessa linha.

**De onde veio.** Teste fechado, ago/2026. Pedido uma vez.

**Situação.** anotada

**Em aberto.**
- O que libera: terminar o capítulo, terminar o livro, ou uma marca de leitura
  qualquer? A túnica sai de Gênesis 37 e a armadura de Efésios 6:10-18 — um é
  capítulo inteiro, o outro é um trecho.
- O Lumi é desenhado em tempo real no app justamente porque muda de expressão.
  Skin é uma camada por cima desse desenho, um conjunto de desenhos novos, ou
  outra coisa? Isso é decisão do kit da marca, no repositório do app — não se
  resolve por este arquivo.
- A skin vale no app inteiro ou só na tela de leitura?
- O Lumi tem regra de marca (ele sempre aparece sobre escuro, no auge do
  brilho). Skin nova passa por essa régua antes de existir.
- O que acontece com quem já leu esses capítulos antes da funcionalidade
  existir: libera retroativo pelo histórico ou começa do zero?

---

## 3. Figurinha nova de livro concluído a cada ano

**O pedido.** Que a figurinha de livro concluído não se repita: a cada ano, um
desenho novo para o mesmo livro.

**De onde veio.** Teste fechado, ago/2026. Pedido uma vez.

**Situação.** anotada

**Em aberto.**
- Confirmar como a figurinha de livro concluído funciona hoje no app, antes de
  desenhar qualquer coisa.
- "A cada ano" é ano de calendário ou um ano contado desde a conclusão
  anterior daquele livro?
- Quantas variações antes de começar a repetir? São 66 livros — cada ano novo
  é uma leva inteira de arte, e é bom saber disso antes de prometer.
- Onde a coleção fica visível? Uma figurinha que só aparece no instante em que
  o livro termina não é coleção.

---

## 4. Visão geral do livro

**O pedido.** Uma visão geral de cada livro: contexto, histórico, autor, e
coisas assim.

**De onde veio.** Teste fechado, ago/2026. Pedido uma vez.

**Situação.** anotada

**Em aberto.**
- De onde vem o texto: escrito por nós, fonte de domínio público, ou
  licenciado? Introdução de livro é o tipo de conteúdo que costuma ter dono, e
  isso precisa estar resolvido antes da primeira linha de código.
- Que tamanho: um parágrafo que cabe antes do capítulo 1, ou uma tela própria?
- Onde entra: antes do primeiro capítulo, num botão no cabeçalho do livro, ou
  nos dois lugares?
- Precisa funcionar offline, como o resto da leitura?
- Tem posição sobre autoria e datação que é assunto em disputa entre tradições
  (autor de Hebreus, por exemplo). Quem escreve decide o tom antes, não no meio
  do texto.

---

## 5. Oração guiada e explicação do versículo do dia

**O pedido.** Que o versículo do dia venha com uma explicação breve e uma
oração guiada.

**De onde veio.** Teste fechado, ago/2026. Pedido uma vez.

**Situação.** anotada

**Em aberto.**
- Escrito com antecedência para cada versículo da lista, ou gerado na hora? Um
  é trabalho de redação, o outro é custo por uso e não funciona offline.
- Quem revisa. Explicação curta de versículo erra fácil para o lado de uma
  tradição só, e o app é para leitor de qualquer igreja.
- "Breve" é quantas linhas? E a oração, quantas?
- Onde aparece: no cartão do versículo do dia, numa tela própria, ou também na
  notificação?
- É a mesma peça para os dois, ou explicação e oração são coisas separadas que
  a pessoa abre quando quiser?
