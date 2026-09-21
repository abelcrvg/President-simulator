# President Simulator 🇧🇷

Simulador de campanha presidencial fictícia inspirado na arquitetura conversacional do Tribunal Virtual.

## Conceito

Você controla um candidato durante uma eleição. A campanha acontece em ciclos de dias e é conduzida em chat. A IA interpreta adversários, imprensa e repercussões; o motor do jogo transforma decisões em efeitos persistentes sobre aprovação, temas e pesquisas.

### Sistemas da primeira versão

- 🗳️ **Pesquisas dinâmicas** — intenção de voto muda ao longo da campanha.
- 💬 **Debates com IA** — adversários respondem às suas falas e fazem perguntas.
- 📰 **Central de notícias** — acontecimentos e repercussões narrativas são gerados durante a campanha.
- 📢 **Declarações públicas** — falas podem gerar reação de jornalistas, apoiadores, críticos e indecisos.
- 📋 **Promessas** — propostas ficam registradas e alteram indicadores temáticos.
- 📊 **Temas de campanha** — economia, saúde, segurança, educação e meio ambiente.
- ⏱️ **Passagem de tempo** — avançar o dia cria volatilidade e novos acontecimentos.
- 🤖 **Ollama por padrão** — fallback local caso a IA não esteja disponível.

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

A base foi deixada preparada para uma simulação muito mais profunda: sistema de partidos e alianças, estados/regiões, eleitores por segmento, eventos inesperados, fact-checking, financiamento, marqueteiro, agenda de campanha, entrevistas, comícios, crises, segundo turno, histórico de promessas e um motor de votação que calcula o resultado a partir do estado acumulado da campanha.
