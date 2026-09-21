import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);
const AI_URL = process.env.AI_URL || 'http://127.0.0.1:11434/api/chat';
const AI_MODEL = process.env.AI_MODEL || 'qwen3:8b';

// Fictional baseline: internal game economy, not a real-world forecast.
const BASE_ECONOMY = { gdp:10_000_000_000_000, revenue:3_200_000_000_000, expenditure:3_300_000_000_000, debt:7_500_000_000_000, inflation:4.5, unemployment:7.0, interest:10.0 };
const initial = {
  day:1, candidate:{name:'Você',party:'Partido da Mudança',funds:1_000_000},
  opponents:[
    {id:'ana',name:'Ana Martins',party:'Partido Social',ideology:'centro-esquerda',support:25},
    {id:'bruno',name:'Bruno Costa',party:'Partido Liberal',ideology:'centro-direita',support:22},
    {id:'carla',name:'Carla Mendes',party:'Partido Verde',ideology:'ecologista',support:15}
  ],
  issues:{economy:50,health:50,security:50,education:50,environment:50}, approval:50,
  polling:{you:38,ana:25,bruno:22,carla:15}, promises:[] as any[],
  economy:{...BASE_ECONOMY,deficit:BASE_ECONOMY.expenditure-BASE_ECONOMY.revenue,fiscalHeadroom:100_000_000_000},
  events:[{type:'system',title:'Campanha iniciada',text:'A eleição começou. Promessas serão avaliadas pelo impacto fiscal, econômico, social e político. O benefício eleitoral nunca é calculado isoladamente.'}], chat:[] as any[]
};
let state=structuredClone(initial);
const clamp=(n:number,min=0,max=100)=>Math.min(max,Math.max(min,n));
const money=(n:number)=>Math.round(n/1_000_000)*1_000_000;

function impactFromText(text:string){
  const t=text.toLowerCase(); const impact:any={economy:0,health:0,security:0,education:0,environment:0};
  if(/emprego|econom|imposto|salário|renda|indústria/.test(t))impact.economy=4;
  if(/saúde|hospital|sus|médic/.test(t))impact.health=4;
  if(/segurança|polícia|crime|violência/.test(t))impact.security=4;
  if(/educa|escola|professor|universidade/.test(t))impact.education=4;
  if(/clima|ambient|floresta|energia limpa/.test(t))impact.environment=4;
  return impact;
}
function extractAmount(text:string){
  const t=text.toLowerCase().replace(/\./g,'').replace(/,/g,'.');
  const matches=[...t.matchAll(/r\$\s*(\d+(?:\.\d+)?)\s*(milh(?:ão|ões)|bilh(?:ão|ões)|mil)?/gi)]; if(!matches.length)return null;
  let total=0; for(const m of matches){const n=Number(m[1]);const unit=m[2]||'';total+=unit.startsWith('bilh')?n*1e9:unit.startsWith('milh')?n*1e6:unit==='mil'?n*1e3:n;} return total;
}
function estimatePromise(text:string){
  const t=text.toLowerCase(); const explicit=extractAmount(text); let annualCost=0,beneficiaries=0,confidence='estimativa';
  if(/bolsa|auxílio|benefício|renda mínima/.test(t)){
    const monthly=explicit||2_000;
    const people=Number((t.match(/(\d+(?:[.,]\d+)?)\s*(?:milh(?:ão|ões)|mil|pessoas|famílias)/)?.[1]||'10').replace(',','.'));
    const rawUnit=(t.match(/\d+(?:[.,]\d+)?\s*(milh(?:ão|ões)|mil|pessoas|famílias)/)?.[1]||'mil');
    beneficiaries=rawUnit.startsWith('milh')?people*1e6:rawUnit==='mil'?people*1e3:people; annualCost=monthly*12*beneficiaries; confidence='estimativa por benefício mensal';
  } else if(explicit){annualCost=explicit;confidence='valor explícito da promessa';}
  else if(/construir|construção|hospital|escola|ferrovia|rodovia|creche|universidade/.test(t)){annualCost=200_000_000;confidence='estimativa por programa de investimento';}
  else if(/aumentar|criar|reduzir|isentar|subsidiar|gratuit/.test(t)){annualCost=100_000_000;confidence='estimativa preliminar';}
  annualCost=money(annualCost);
  const fiscalRatio=annualCost/BASE_ECONOMY.revenue, debtImpact=annualCost;
  const inflationRisk=clamp(fiscalRatio*120,0,12);
  const growthEffect=/investimento|infraestrutura|emprego|produtiv/.test(t)?clamp(annualCost/BASE_ECONOMY.gdp*180,0,4):0;
  const socialBenefit=/bolsa|auxílio|saúde|hospital|educa|escola|creche|salário|renda/.test(t)?clamp(annualCost/BASE_ECONOMY.gdp*80,0,8):2;
  const fiscalStress=clamp(fiscalRatio*100,0,100);
  const politicalAppeal=clamp(socialBenefit-fiscalStress*.35+growthEffect*.5,-15,12);
  return {annualCost,beneficiaries,confidence,fiscalRatio,debtImpact,inflationRisk,growthEffect,socialBenefit,fiscalStress,politicalAppeal};
}
function recalculateEconomy(){
  const recurring=state.promises.reduce((sum:number,p:any)=>sum+(p.estimate?.annualCost||0),0);
  const deficit=BASE_ECONOMY.expenditure+recurring-BASE_ECONOMY.revenue;
  const debt=BASE_ECONOMY.debt+Math.max(0,deficit)*Math.max(1,state.day/30);
  const fiscalRatio=recurring/BASE_ECONOMY.revenue;
  const inflationRisk=state.promises.reduce((s:number,p:any)=>s+(p.estimate?.inflationRisk||0),0);
  state.economy={...state.economy,revenue:BASE_ECONOMY.revenue,expenditure:BASE_ECONOMY.expenditure+recurring,deficit,debt,
    inflation:clamp(BASE_ECONOMY.inflation+fiscalRatio*18+inflationRisk*.15,0,30),
    unemployment:clamp(BASE_ECONOMY.unemployment-state.promises.reduce((s:number,p:any)=>s+(p.estimate?.growthEffect||0)*.15,0),2,25),
    fiscalHeadroom:Math.max(0,BASE_ECONOMY.revenue-BASE_ECONOMY.expenditure-recurring)};
}
function recalculatePolitics(){
  const promiseAppeal=state.promises.reduce((s:number,p:any)=>s+(p.estimate?.politicalAppeal||0),0);
  const fiscalPenalty=state.promises.reduce((s:number,p:any)=>s+Math.max(0,(p.estimate?.fiscalStress||0)-3)*.18,0);
  const economyPenalty=Math.max(0,state.economy.inflation-BASE_ECONOMY.inflation)*.7;
  state.approval=clamp(50+promiseAppeal-fiscalPenalty-economyPenalty,0,100);
  const p=clamp(state.approval*.55+20,1,70),remainder=100-p,others=state.opponents.reduce((s:any,o:any)=>s+o.support,0);
  state.polling.you=Math.round(p*10)/10; state.opponents.forEach((o:any)=>state.polling[o.id]=Math.max(.5,Math.round(o.support*remainder/others*10)/10));
}
function localAi(prompt:string){const lower=prompt.toLowerCase();if(lower.includes('debate'))return'Você fala primeiro. Seu adversário reage com uma pergunta direta sobre sua proposta e tenta explorar qualquer contradição do seu discurso.';if(lower.includes('reportagem'))return'BOLETIM — A campanha ganhou repercussão. Analistas discutem custos, viabilidade e efeitos das propostas apresentadas.';return'A campanha continua. Uma decisão pode gerar benefícios para determinados grupos e custos econômicos ou políticos para outros.';}
async function ai(prompt:string){try{const headers:any={'Content-Type':'application/json'};if(process.env.AI_API_KEY)headers.Authorization=`Bearer ${process.env.AI_API_KEY}`;const body={model:AI_MODEL,messages:[{role:'system',content:'Você é o motor narrativo de um simulador eleitoral fictício. Seja imparcial, trate todos os candidatos como personagens fictícios, crie consequências coerentes e nunca diga ao jogador em quem votar. Responda em português do Brasil.'},{role:'user',content:prompt}],stream:false};const r=await fetch(AI_URL,{method:'POST',headers,body:JSON.stringify(body)});if(!r.ok)throw new Error(`AI ${r.status}`);const data:any=await r.json();return data.message?.content||data.choices?.[0]?.message?.content||localAi(prompt);}catch{return localAi(prompt);}}
app.get('/api/state',(_,res)=>res.json(state));
app.post('/api/reset',(_,res)=>{state=structuredClone(initial);res.json(state);});
app.post('/api/action',async(req,res)=>{
  const {type,text}=req.body||{};
  if(type==='promise'){
    const estimate=estimatePromise(text||''),impact=impactFromText(text||''); state.promises.push({text,day:state.day,impact,estimate});
    Object.keys(impact).forEach(k=>state.issues[k as keyof typeof state.issues]=clamp(state.issues[k as keyof typeof state.issues]+impact[k]));
    state.events.unshift({type:'promise',title:'Nova promessa — análise fiscal',text:`${text} | Custo anual estimado: R$ ${estimate.annualCost.toLocaleString('pt-BR')}. Pressão fiscal: ${estimate.fiscalStress.toFixed(1)}%. ${estimate.confidence}.`});
    recalculateEconomy();recalculatePolitics();
  }
  if(type==='day'){
    state.day++;recalculateEconomy();state.approval=clamp(state.approval+(Math.random()-.5)*6);recalculatePolitics();
    const report=await ai(`Crie uma reportagem curta para o dia ${state.day} de uma eleição presidencial fictícia. Economia: inflação ${state.economy.inflation.toFixed(1)}%, déficit R$ ${state.economy.deficit.toLocaleString('pt-BR')}, dívida R$ ${state.economy.debt.toLocaleString('pt-BR')}. Últimas promessas e custos: ${state.promises.slice(-3).map((p:any)=>`${p.text} (R$ ${p.estimate?.annualCost?.toLocaleString('pt-BR')||0}/ano)`).join(' | ')}. Mostre reações e questionamentos sobre viabilidade sem favorecer ninguém.`);
    state.events.unshift({type:'news',title:`Boletim eleitoral — Dia ${state.day}`,text:report});
  }
  if(type==='debate'){
    const reply=await ai(`Simule um debate presidencial fictício. O jogador acabou de dizer: "${text}". Dados fiscais atuais: déficit R$ ${state.economy.deficit.toLocaleString('pt-BR')}; inflação ${state.economy.inflation.toFixed(1)}%; custo anual acumulado das promessas R$ ${state.promises.reduce((n:number,p:any)=>n+(p.estimate?.annualCost||0),0).toLocaleString('pt-BR')}. Responda como ${state.opponents[0].name}, candidata fictícia. Questione números, financiamento e efeitos das propostas, sem insultos pessoais. Termine com uma pergunta.`);
    state.chat.push({role:'opponent',name:state.opponents[0].name,text:reply,day:state.day});
  }
  if(type==='statement'){
    const reply=await ai(`Analise esta declaração de campanha fictícia: "${text}". Considere também a situação fiscal: déficit R$ ${state.economy.deficit.toLocaleString('pt-BR')}, inflação ${state.economy.inflation.toFixed(1)}% e custo anual das promessas R$ ${state.promises.reduce((n:number,p:any)=>n+(p.estimate?.annualCost||0),0).toLocaleString('pt-BR')}. Gere reação de jornalistas, eleitores favoráveis, críticos e indecisos. Não preveja resultado eleitoral real.`);
    state.events.unshift({type:'news',title:'Repercussão da declaração',text:reply});
  }
  res.json(state);
});
app.listen(PORT,()=>console.log(`President Simulator API: http://localhost:${PORT}`));