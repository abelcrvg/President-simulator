import type {AgendaItem,Candidate} from './types';
const outlets=['GloboNews','CNN Brasil','Folha de S.Paulo','Estadão','UOL','BandNews'];
export function agendaForDay(day:number,candidates:Candidate[]):AgendaItem[]{const rival=candidates.find(c=>c.id!=='you')!;const second=candidates.find(c=>c.id!==rival.id&&c.id!=='you')!;return[
{id:`${day}-1`,day,time:'08:00',type:'interview',title:`Entrevista — ${outlets[day%outlets.length]}`,description:'Entrevista exclusiva sobre as principais propostas da campanha.',participants:['Você'],outlet:outlets[day%outlets.length],status:'available'},
{id:`${day}-2`,day,time:'11:30',type:'debate_one',title:`Confronto com ${rival.name}`,description:'Debate individual com perguntas, réplica e tréplica.',participants:['Você',rival.name],targetCandidate:rival.id,status:'available'},
{id:`${day}-3`,day,time:'15:00',type:'press_conference',title:'Coletiva de imprensa',description:'Jornalistas fazem perguntas sobre acontecimentos recentes.',participants:['Você','Jornalistas'],status:'available'},
{id:`${day}-4`,day,time:'20:30',type:'debate_all',title:'Debate presidencial na TV',description:'Debate ao vivo com todos os candidatos e blocos temáticos.',participants:candidates.map(c=>c.name),status:'available'},
{id:`${day}-5`,day,time:'22:30',type:'interview',title:`Entrevista pós-debate — ${second.name}`,description:'Comentário pós-debate e reação às declarações dos candidatos.',participants:['Você'],outlet:'TV Nacional',status:'available'}
]}
