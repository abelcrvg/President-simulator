import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);
const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama';
const AI_URL = process.env.AI_URL || 'http://127.0.0.1:11434/api/chat';
const AI_MODEL = process.env.AI_MODEL || 'qwen3:8b';

const initial = {
  day: 1,
  candidate: { name: 'Você', party: 'Partido da Mudança', funds: 1000000 },
  opponents: [
    { id:'ana', name:'Ana Martins', party:'Partido Social', ideology:'centro-esquerda', support:25 },
    { id:'bruno', name:'Bruno Costa', party:'Partido Liberal', ideology:'centro-direita', support:22 },
    { id:'carla', name:'Carla Mendes', party:'Partido Verde', ideology:'ecologista', support:15 }
  ],
  issues: { economy:50, health:50, security:50, education:50, environment:50 },
  approval:50,
  polling: { you:38, ana:25, bruno:22, carla:15 },
  promises: [] as any[],
  events: [{type:'system', title:'Campanha iniciada', text:'A eleição começou. Suas decisões, debates, promessas e crises vão alterar a opinião dos eleitores.'}],
  chat: [] as any[]
};

let state = structuredClone(initial);

function impactFromText(text:string){
  const t=text.toLowerCase();
  const impact:any={economy:0,health:0,security:0,education:0,environment:0};
  if(/emprego|econom|imposto|salário|renda|indústria/.test(t)) impact.economy=4;
  if(/saúde|hospital|sus|médic/.test(t)) impact.health=4;
  if(/segurança|polícia|crime|violência/.test(t)) impact.security=4;
  if(/educa|escola|professor|universidade/.test(t)) impact.education=4;
  if(/clima|ambient|floresta|energia limpa/.test(t)) impact.environment=4;
  return impact;
}

function localAi(prompt:string){
  const lower=prompt.toLowerCase();
  if(lower.includes('debate')) return 'Você fala primeiro. Seu adversário reage com uma pergunta direta sobre sua proposta e tenta explorar qualquer contradição do seu discurso.';
  if(lower.includes('reportagem')) return 'URGENTE — A campanha ganhou repercussão. Analistas destacam que sua última declaração será debatida nas redes e pode mudar a percepção de eleitores indecisos.';
  return 'A campanha continua. Uma decisão sua pode gerar efeitos positivos em um grupo de eleitores e custos políticos em outro.';
}

async function ai(prompt:string){
  try {
    const headers:any={'Content-Type':'application/json'};
    if(process.env.AI_API_KEY) headers.Authorization=`Bearer ${process.env.AI_API_KEY}`;
    const body={model:AI_MODEL,messages:[{role:'system',content:'Você é o motor narrativo de um simulador eleitoral fictício. Seja imparcial, trate todos os candidatos como personagens fictícios, crie consequências coerentes e nunca diga ao jogador em quem votar. Responda em português do Brasil.'},{role:'user',content:prompt}],stream:false};
    const r=await fetch(AI_URL,{method:'POST',headers,body:JSON.stringify(body)});
    if(!r.ok) throw new Error(`AI ${r.status}`);
    const data:any=await r.json();
    return data.message?.content || data.choices?.[0]?.message?.content || localAi(prompt);
  } catch { return localAi(prompt); }
}

app.get('/api/state',(_,res)=>res.json(state));
app.post('/api/reset',(_,res)=>{ state=structuredClone(initial); res.json(state); });

app.post('/api/action', async (req,res)=>{
  const {type,text}=req.body || {};
  if(type==='promise'){
    const impact=impactFromText(text||'');
    state.promises.push({text,day:state.day,impact});
    Object.keys(impact).forEach(k=>state.issues[k as keyof typeof state.issues]=Math.min(100,Math.max(0,state.issues[k as keyof typeof state.issues]+impact[k])));
    state.approval=Math.min(100,Math.max(0,state.approval+1));
    state.events.unshift({type:'promise',title:'Nova promessa',text});
  }
  if(type==='day'){
    state.day++;
    const volatility=(Math.random()-.5)*6;
    state.approval=Math.min(100,Math.max(0,Math.round(state.approval+volatility)));
    const p=Math.round(state.approval*.55+20);
    const remainder=100-p;
    const others=state.opponents.reduce((s:any,o:any)=>s+o.support,0);
    state.polling.you=p;
    state.opponents.forEach((o:any)=>state.polling[o.id]=Math.max(1,Math.round(o.support*remainder/others)));
    const report=await ai(`Crie uma reportagem curta para o dia ${state.day} de uma eleição presidencial fictícia. Contexto: aprovação ${state.approval}; promessas recentes: ${state.promises.slice(-3).map((p:any)=>p.text).join(' | ')}. Mostre reações de candidatos, imprensa e eleitores sem favorecer ninguém.`);
    state.events.unshift({type:'news',title:`Boletim eleitoral — Dia ${state.day}`,text:report});
  }
  if(type==='debate'){
    const reply=await ai(`Simule um debate presidencial fictício. O jogador acabou de dizer: "${text}". Responda como ${state.opponents[0].name}, que é uma candidata fictícia. Faça uma réplica de até 120 palavras, ataque ideias e peça detalhes verificáveis, sem insultos pessoais. Termine com uma pergunta.`);
    state.chat.push({role:'opponent',name:state.opponents[0].name,text:reply,day:state.day});
  }
  if(type==='statement'){
    const reply=await ai(`Analise esta declaração de campanha fictícia: "${text}". Gere uma reação de jornalistas, eleitores favoráveis, críticos e indecisos. Explique possíveis efeitos na campanha sem prever um resultado eleitoral real.`);
    state.events.unshift({type:'news',title:'Repercussão da declaração',text:reply});
  }
  res.json(state);
});

app.listen(PORT,()=>console.log(`President Simulator API: http://localhost:${PORT}`));
