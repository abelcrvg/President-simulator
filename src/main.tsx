import React,{useEffect,useState} from 'react';
import {BarChart3,CalendarDays,Flag,MessageSquare,Newspaper,Send,RefreshCcw,Target,Wallet,Landmark} from 'lucide-react';
import {createRoot} from 'react-dom/client';
import './styles.css';

type State=any;
const api=async(path:string,body?:any)=>{const r=await fetch(`/api${path}`,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);return r.json()};
const brl=(n:number)=>`R$ ${Number(n||0).toLocaleString('pt-BR',{maximumFractionDigits:0})}`;

function App(){
 const [s,setS]=useState<State>(null),[text,setText]=useState(''),[mode,setMode]=useState('debate'),[busy,setBusy]=useState(false);
 const refresh=async()=>setS(await api('/state')); useEffect(()=>{refresh()},[]);
 if(!s)return <main className="loading">Carregando campanha...</main>;
 const act=async(type:string)=>{if(!text.trim()&&type!=='day')return;setBusy(true);setS(await api('/action',{type,text}));setText('');setBusy(false)};
 const recurring=s.promises.reduce((n:number,p:any)=>n+(p.estimate?.annualCost||0),0);
 return <div className="app">
  <header><div className="brand"><Flag/><div><b>President Simulator</b><span>Campanha presidencial • Dia {s.day}</span></div></div><button className="ghost" onClick={async()=>setS(await api('/reset'))}><RefreshCcw size={16}/> Reiniciar</button></header>
  <section className="hero"><div><span className="eyebrow">SIMULAÇÃO POLÍTICA FICTÍCIA</span><h1>Você está na corrida pela Presidência.</h1><p>Cada discurso, promessa, debate e notícia altera a percepção dos eleitores. Promessas também passam por uma análise fiscal antes de produzir efeito político.</p></div><div className="approval"><span>Aprovação</span><strong>{s.approval.toFixed(1)}%</strong><div className="meter"><i style={{width:`${s.approval}%`}}/></div></div></section>
  <div className="grid">
   <aside className="panel"><h3><BarChart3 size={17}/> Pesquisas</h3>{[['Você','you'],...s.opponents.map((o:any)=>[o.name,o.id])].map(([n,k]:any)=><div className="poll" key={k}><span>{n}</span><b>{s.polling[k]||0}%</b><div><i style={{width:`${s.polling[k]||0}%`}}/></div></div>)}<hr/><h3><Target size={17}/> Temas</h3>{Object.entries(s.issues).map(([k,v]:any)=><div className="issue" key={k}><span>{({economy:'Economia',health:'Saúde',security:'Segurança',education:'Educação',environment:'Meio ambiente'} as any)[k]}</span><span>{v}/100</span></div>)}<button className="next" onClick={()=>act('day')} disabled={busy}><CalendarDays size={17}/> Avançar um dia</button></aside>
   <section className="center"><div className="panel chat"><div className="tabs"><button className={mode==='debate'?'active':''} onClick={()=>setMode('debate')}><MessageSquare/> Debate</button><button className={mode==='statement'?'active':''} onClick={()=>setMode('statement')}><Newspaper/> Declaração</button><button className={mode==='promise'?'active':''} onClick={()=>setMode('promise')}><Flag/> Promessa</button></div><div className="messages">{s.chat.length===0?<div className="empty"><MessageSquare size={30}/><h2>Primeiro debate</h2><p>Escolha uma posição, responda ao adversário e veja como a IA reage.</p></div>:s.chat.map((m:any,i:number)=><article className="bubble" key={i}><small>{m.name}</small><p>{m.text}</p></article>)}</div><div className="composer"><textarea value={text} onChange={e=>setText(e.target.value)} placeholder={mode==='debate'?'Escreva sua resposta ao adversário...':mode==='promise'?'Ex.: pagar R$ 2.000 mensais para 10 milhões de famílias e explique o financiamento...':'Faça uma declaração pública para a imprensa...'} /><button onClick={()=>act(mode)} disabled={busy||!text.trim()}><Send size={18}/></button></div><div className="hint">A IA narra debates e repercussões. O motor do jogo calcula os efeitos fiscais, econômicos e eleitorais.</div></div></section>
   <aside className="panel news"><h3><Landmark size={17}/> Economia</h3><div className="economy"><div><span>Inflação</span><b>{s.economy.inflation.toFixed(1)}%</b></div><div><span>Desemprego</span><b>{s.economy.unemployment.toFixed(1)}%</b></div><div><span>Déficit</span><b>{brl(s.economy.deficit)}</b></div><div><span>Dívida</span><b>{brl(s.economy.debt)}</b></div><div><span>Custo anual das promessas</span><b>{brl(recurring)}</b></div><div><span>Espaço fiscal restante</span><b>{brl(s.economy.fiscalHeadroom)}</b></div></div><hr/><h3><Newspaper size={17}/> Central de notícias</h3>{s.events.slice(0,7).map((e:any,i:number)=><article key={i}><span>{e.title}</span><p>{e.text}</p><small>Dia {e.day||s.day}</small></article>)}</aside>
  </div>
  <footer><span><Wallet size={15}/> Caixa de campanha: {brl(s.candidate.funds)}</span><span>Motor: {import.meta.env.VITE_AI_LABEL||'Ollama / compatível'}</span></footer>
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
