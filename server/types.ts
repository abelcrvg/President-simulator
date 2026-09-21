export type CandidateId='you'|'ana'|'bruno'|'carla';
export type AgendaType='debate_all'|'debate_one'|'interview'|'rally'|'press_conference'|'strategy';
export type AgendaStatus='available'|'completed'|'missed';
export interface Candidate{ id:CandidateId; name:string; party:string; ideology:string; support:number; personality:string; strengths:string[]; weaknesses:string[]; }
export interface PromiseEstimate{annualCost:number; financing:number; netCost:number; beneficiaries:number; confidence:string; fiscalRatio:number; inflationRisk:number; growthEffect:number; socialBenefit:number; fiscalStress:number; politicalAppeal:number;}
export interface PromiseRecord{text:string;day:number;estimate:PromiseEstimate;impact:Record<string,number>;}
export interface AgendaItem{id:string;day:number;time:string;type:AgendaType;title:string;description:string;participants:string[];outlet?:string;status:AgendaStatus;targetCandidate?:CandidateId;}
export interface CampaignEvent{type:string;title:string;text:string;day:number;importance?:number;}
export interface DebateMessage{eventId:string;role:'player'|'opponent'|'journalist'|'moderator';speaker:string;text:string;day:number;}
export interface Polling{you:number;ana:number;bruno:number;carla:number;}
