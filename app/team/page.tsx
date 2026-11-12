import { Team } from '@/components/team';
import { teamData } from '@/lib/team';
import { documentsFor } from '@/lib/documents';
import classes from '@/assets/classes/manifest.json';
export default function Page(){return <Team data={teamData()} docs={documentsFor('all','3')} classes={classes.classes}/>;}
