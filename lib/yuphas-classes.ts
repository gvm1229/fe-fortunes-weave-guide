import data from '@/content/data/yuphas-classes.json';
import { allowedFor, type YClass, type YCharacter } from './class-rules';
/** yuphastemple 병종 60개·증서·인물 62명의 병종 조건(content/data/yuphas-classes.json, scripts/yuphas/classes.mjs가 만든 작은 표). 브라우저에서 써도 되는 크기. */
export type { YClass };
export const classes = data.classes as YClass[];
export const licenses = data.licenses;
const characters = data.characters as Record<string, YCharacter>;
const bySlug = new Map(classes.map((c) => [c.slug, c]));
export const classBySlug = (slug?: string) => (slug ? bySlug.get(slug) : undefined);
export const allowedClasses = (personSlug: string) => allowedFor(classes, characters[personSlug]);
export const classIcon = (slug: string, gender: string) => `/yuphas/classes/${gender === 'male' ? 'male' : 'female'}/${slug}.webp`;
