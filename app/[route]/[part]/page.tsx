import { notFound } from 'next/navigation';
import { Guide } from '@/components/guide';
import { chaptersForRoute, groupsFor, peopleFor, routes, routeParams, validScope, type Part } from '@/lib/content';
import manifest from '@/assets/classes/manifest.json';
import { secondaryFor } from '@/lib/secondary';
import { documentsFor } from '@/lib/documents';
export const dynamicParams = false;
export function generateStaticParams() { return routeParams(); }
export default async function Page({params}:{params:Promise<{route:string;part:string}>}) {
  const {route,part}=await params;
  if(!validScope(route,part)) notFound();
  return <Guide route={route} label={routes.find(r=>r.id===route)!.label} part={part} chapters={chaptersForRoute(route,part as Part)} groups={groupsFor(route,part as Part)} people={peopleFor(route,part as Part)} classes={manifest.classes} secondary={secondaryFor(route,part as Part)} docs={documentsFor(route,part as Part)}/>;
}
