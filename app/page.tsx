import { Home } from '@/components/home';
import { routes, groupsFor, type Part } from '@/lib/content';
export default function Page() { return <Home routes={routes.map(r=>({...r,parts:(r.id==='part3'?['3']:['1','2']).map(part=>({part,groups:groupsFor(r.id,part as Part)}))}))}/>; }
