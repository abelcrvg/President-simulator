# President Simulator 🇧🇷

Simulador de campanha presidencial fictícia inspirado na arquitetura conversacional do Tribunal Virtual.

## Conceito

Você controla um candidato durante uma eleição. A campanha acontece em ciclos de dias e é conduzida em chat. A IA interpreta adversários, imprensa e repercussões; o motor do jogo transforma decisões em efeitos persistentes sobre aprovação, temas, economia e pesquisas.

## Regra central: promessa tem custo

O jogador **não ganha votos simplesmente prometendo benefícios maiores**. Toda promessa passa pelo motor econômico antes de afetar a campanha.

O simulador calcula, quando possível:

- valor mensal/anual da promessa;
- quantidade de beneficiários ou população afetada;
- custo bruto anual;
- receitas explicitamente indicadas para financiar a medida;
- custo fiscal líquido;
- pressão sobre receita e déficit;
- impacto acumulado sobre dívida e inflação;
- efeito estimado sobre emprego/crescimento para investimentos;
- benefício social e repercussão política;
- pressão fiscal que pode gerar reação negativa.

Exemplo: uma promessa fictícia de **R$ 2.000 mensais para 20 milhões de beneficiários** não é tratada como uma frase que simplesmente aumenta a aprovação. O motor calcula aproximadamente **R$ 480 bilhões por ano** de despesa bruta antes de qualquer fonte de financiamento. A escala da medida, portanto, entra na economia da campanha e pode produzir efeitos políticos e macroeconômicos adversos.

Medidas de financiamento também são contabilizadas quando a própria promessa fornece um valor explícito de arrecadação. Isso permite propostas do tipo "gastar X financiado por Y" sem apagar o custo econômico de X.

> Os valores macroeconômicos da primeira versão são deliberadamente fictícios e servem para manter a simulação internamente consistente. Eles não representam uma previsão ou orçamento de um país real.

## Sistemas da primeira versão

- 🗳️ **Pesquisas dinâmicas** — intenção de voto muda conforme o estado acumulado da campanha.
- 💬 **Debates com IA** — adversários respondem às falas e questionam números, financiamento e contradições.
- 📰 **Central de notícias** — acontecimentos e repercussões narrativas são gerados durante a campanha.
- 📢 **Declarações públicas** — falas geram reações de jornalistas, apoiadores, críticos e indecisos.
- 📋 **Promessas com cálculo fiscal** — propostas são registradas com custo e efeitos econômicos persistentes.
- 📊 **Temas de campanha** — economia, saúde, segurança, educação e meio ambiente.
- 💰 **Orçamento da campanha e economia nacional fictícia** — caixa eleitoral é separado das contas públicas.
- ⏱️ **Passagem de tempo** — avançar o dia recalcula a economia e cria novos acontecimentos.
- 🤖 **Ollama por padrão** — fallback local caso a IA não esteja disponível.

## Arquitetura

A IA é o **motor narrativo**, não o árbitro da economia nem o calculador do resultado. Ela cria diálogos, reportagens e reações. O código mantém estado, calcula custos, atualiza indicadores e determina as consequências numéricas.

Isso evita que o modelo simplesmente "decida" que uma promessa foi boa ou ruim sem considerar seus custos.

## Rodando no Termux

```bash
pkg install nodejs
cd ~/projetos
git clone https://github.com/abelcrvg/President-simulator.git
cd President-simulator
cp .env.example .env
npm install
npm run dev:server
```

Em outro terminal:

```bash
cd ~/projetos/President-simulator
npm run dev:client
```

Abra `http://localhost:5173`.

Para Ollama, ajuste `AI_MODEL` no `.env` para um modelo instalado. A API esperada é a compatível com `/api/chat`.

## Próxima evolução

A base está preparada para uma simulação mais profunda: sistema de partidos e alianças, estados/regiões, eleitores por segmento, eventos inesperados, fact-checking, financiamento detalhado, marqueteiro, agenda de campanha, entrevistas, comícios, crises, segundo turno, histórico de promessas, propostas alternativas de financiamento e um motor de votação calculado a partir do estado acumulado da campanha.