import people from '@/content/data/people-display.json';
export const lordFiles:Record<string,string>={kai:'cai',dietrich:'dietrich',theodora:'theodora',leda:'leda',part3:'cai'};
const names:Record<string,keyof typeof people>={kai:'카이',dietrich:'디트리히',theodora:'세오도라',leda:'레다'};
export function lordPortrait(route:string,part:string,hero=false){
  if(part==='3')return `/assets/portraits/post-timeskip/large/${lordFiles[route]}.png`;
  return hero?`/assets/portraits/pre-timeskip/large/${lordFiles[route]}.webp`:`/${people[names[route]].portrait}`;
}
