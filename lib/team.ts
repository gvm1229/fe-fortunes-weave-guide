import { json, type Tree } from './content';
export type Scenario={id:string;title:string;description:string;swaps:Record<string,string>};
export type TeamUnit={name:string;role:string;class:string;classSlug:string;classTier:string;portrait:string;female:boolean;favorite?:boolean;reviewUrl:string;classReason:string;overviewReason:string;growthGoal:string|null;displayGroupRank:number;displayPriority:number;loss?:string;weapons:{label:string;icon:string}[];usableWeapons?:{label:string;icon:string}[];specialtyIcons:{skill:string;icon:string}[];signatureWeapons:{name:string;icon:string;rank:string;note:string}[]};
type Section={tree:Tree[]};
type TeamSource={team:{baseline:string[];units:Record<string,TeamUnit>;proposal:{scenarios:Scenario[];trials:{id:string;outgoing:string;incoming:string;label:string}[];roleTradeoffs:Record<string,string>}};teamSections:Record<'spells'|'routes'|'details',Section>;teamWhite:Record<string,Section>;routeTeams:Record<string,{intro:Section;parts:Record<string,Section>}>};
export function teamData(){
  const source=json<{parity:TeamSource}>('derived/presentation').parity;
  const origins=Object.values(json<{routes:Record<string,Record<string,{baseRoute?:string}>>}>('data/unit-readiness').routes);
  const units=Object.fromEntries(Object.entries(source.team.units).map(([name,unit])=>[name,{...unit,route:origins.map(p=>p[name]?.baseRoute).find(Boolean)}]));
  return {...source.team,units,sections:source.teamSections,white:source.teamWhite,routeTeams:source.routeTeams};
}
