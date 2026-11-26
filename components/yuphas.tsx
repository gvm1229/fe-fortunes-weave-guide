'use client';
import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import type { YuphasProfile, YName, YGift } from '@/lib/yuphas-profile';
import type { Build } from '@/lib/check-state';
import { classBySlug, classIcon } from '@/lib/yuphas-classes';
import { giftUrl, itemUrl, mapUrl, personUrl, yuphasItem as yuphasItemFor, yuphasPerson } from '@/lib/yuphas';
/**
 * yuphastemple 이름 규칙(2026-11-27 사용자 결정): 누를 수 없는 이름 배지는 한국어, yuphastemple 새 탭으로 가는 실제 단추는 영어 이름.
 * 한 할 일 묶음 안에서 같은 물품이 되풀이되면 영어 단추는 처음 한 번만 그린다(YuphasGroup).
 */
const Seen = createContext<Map<string, string> | null>(null);
export function YuphasGroup({ children }: { children: ReactNode }) { const [map] = useState(() => new Map<string, string>()); return <Seen.Provider value={map}>{children}</Seen.Provider>; }
/** 묶음에서 이 자리(owner)가 그 슬러그의 첫 자리인지. 같은 자리는 다시 그려도 첫 자리로 남는다(useId는 다시 그려도 같다). */
export function useFirstLink() {
  const seen = useContext(Seen), id = useId();
  return (slug: string, place: string | number) => { if (!seen) return true; const key = `${id}:${place}`, owner = seen.get(slug); if (!owner) { seen.set(slug, key); return true; } return owner === key; };
}
/** yuphastemple 새 탭 단추. 글은 영어 이름(그 사이트에서 찾을 수 있게). */
export function YLink({ en, href, className, icon }: { en: string; href: string; className?: string; icon?: ReactNode }) {
  return <a className={'y-link' + (className ? ' ' + className : '')} href={href} target="_blank" rel="noreferrer" lang="en" aria-label={`${en}, yuphastemple 새 탭`} data-yuphas-link>{icon}{en}<span className="y-link-mark" aria-hidden="true">↗</span></a>;
}
/** 누를 수 없는 한국어 이름 배지(그림 + 이름). */
export function KoBadge({ ko, icon, kind = 'item', value }: { ko: string; icon?: string | null; kind?: string; value?: ReactNode }) {
  return <span className="game-badge" data-kind={kind} data-ko-badge>{icon && <img src={icon} alt="" loading="lazy" width={22} height={22} />}<span className="badge-label">{ko}</span>{value != null && <> <b className="badge-value">{value}</b></>}</span>;
}

/** 숙련 이름(그 사이트 영어) → 우리 말. 그림 말풍선·읽어 주는 이름에 쓴다. */
export const skillKo: Record<string, string> = { Sword: '검술', Spear: '창술', Axe: '도끼술', Bow: '궁술', Gauntlet: '격투술', 'Black Magic': '흑마술', 'White Magic': '백마술', Authority: '지휘술', Infantry: '보병술', Riding: '기마술', Armor: '중갑술', Flying: '비행술' };
const moveKo: Record<string, string> = { infantry: '보병', riding: '기마', flying: '비행', armor: '중갑' };
/** 인물 머리: yuphastemple /<인물>/ 머리 카드 모양(docs/yuphas-pages-teardown.md §1). 큰 이름 + 빛, 병종 줄, 6×2 장점·약점 그림, 뒤 소속 문장, 오른쪽 큰 초상화.
 *  build(이 루트의 내 육성 기록, U72)가 있으면 병종 줄을 기록한 병종으로 바꾸고 레벨과 숙련 등급 글자를 읽기 전용으로 보인다. */
export function CharacterHeader({ name, profile, portrait, children, nameSlot, lazy, build }: { name: string; profile?: YuphasProfile; portrait: string; children?: ReactNode; nameSlot?: ReactNode; lazy?: boolean; build?: Build }) {
  const style = profile?.emblem ? { '--faction': `url('${profile.emblem}')` } as React.CSSProperties : undefined;
  const picked = profile && classBySlug(build?.classId);
  const cls = picked ? { ko: picked.ko || picked.en, icon: classIcon(picked.slug, profile.gender), moves: picked.moves } : profile?.cls;
  return <div className="y-card" style={style} data-character-header>
    <img className="y-card-portrait" src={profile?.portrait || portrait} alt={nameSlot ? '' : name} loading={lazy ? 'lazy' : undefined} />
    <div className="y-card-body">
      <p className="y-card-name">{nameSlot ?? name}{profile && <YLink en={profile.en} href={personUrl(profile.slug)} className="y-card-en" />}</p>
      {cls && <p className="y-card-class" data-recorded={picked ? true : undefined}><img className="y-class-icon" src={cls.icon || ''} alt="" />{cls.ko}{cls.moves.map((m) => <img key={m} className="y-move-icon" src={`/yuphas/icons/skills/${m}-flat.png`} alt={moveKo[m]} title={moveKo[m]} />)}{build?.level && <span className="y-card-level">Lv {build.level}</span>}</p>}
      {profile && <ul className="y-skills" aria-label="숙련 장점·약점">{profile.skills.map((s) => <li key={s.skill} data-state={s.state} title={`${skillKo[s.skill]}${s.state === 'boon' ? ' · 장점' : s.state === 'bane' ? ' · 약점' : ''}`}><img src={s.icon} alt={`${skillKo[s.skill]}${s.state === 'boon' ? ' 장점' : s.state === 'bane' ? ' 약점' : ''}`} /><span aria-hidden="true">{s.state === 'boon' ? '▲' : s.state === 'bane' ? '▼' : ''}</span>{build?.skills?.[s.id] && <b className="y-skill-rank" role="img" aria-label={`${skillKo[s.skill]} 기록 ${build.skills[s.id]}`}>{build.skills[s.id]}</b>}</li>)}</ul>}
      {children}
    </div>
  </div>;
}

/** 점수에 따라 초록이 짙어지는 숫자(§3.6). */
const pts = (v: number) => ({ '--g': `${Math.round(Math.min(1, Math.max(0, (v - 50) / 150)) * 100)}%` }) as React.CSSProperties;
function GiftRow({ g, person, cheap }: { g: YGift; person: string; cheap?: boolean }) {
  return <li className="y-gift" data-cheap={cheap || undefined}>
    {g.ko && <KoBadge ko={g.ko} icon="/yuphas/icons/items/gift_common-v2.png" kind="gift" />}
    <YLink en={g.en} href={giftUrl(person, g.slug)} />
    <small className="y-gift-pts" style={pts(g.value)}>+{g.value}</small>
  </li>;
}
function FoodTile({ m, person, grade }: { m: YName; person: string; grade: 'great' | 'good' | 'bad' }) {
  return <li className="y-food" data-grade={grade}>
    <img className="y-food-ribbon" src={`/yuphas/icons/ui/foodHeaders-${grade}.png`} alt={grade === 'great' ? '매우 좋아함' : grade === 'good' ? '좋아함' : '싫어함'} />
    <img className="y-food-photo" src={`/yuphas/meals/${m.slug === 'madazins' ? 'mazadins' : m.slug}.webp`} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
    {m.ko && <KoBadge ko={m.ko} kind="gift" />}
    <YLink en={m.en} href={giftUrl(person, m.slug)} />
  </li>;
}
/** 선호 선물·음식 전체: yuphastemple 좋아하는 선물 탭 모양(§3). 리본(매우 좋아함·좋아함) + 선물 줄 격자 + 음식 타일. 싸게 살 수 있는 선물은 맨 앞에 따로 강조한다. */
export function LikedGifts({ profile, cheap }: { profile: YuphasProfile; cheap: string[] }) {
  const cheapSet = new Set(cheap);
  const all = profile.gifts.flatMap((g) => [...g.loved, ...g.liked]);
  const picks = cheap.map((ko) => all.find((g) => g.ko === ko)).filter((g): g is YGift => !!g).filter((g, i, a) => a.findIndex((x) => x.slug === g.slug) === i);
  return <div className="y-gifts">
    <p className="y-tab-link"><YLink en={`${profile.en} · Liked Gifts`} href={personUrl(profile.slug, 'liked-gifts')} /></p>
    {picks.length > 0 && <><p className="y-ribbon-text">싸게 살 수 있는 선물</p><ul className="y-gift-list">{picks.map((g) => <GiftRow key={g.slug} g={g} person={profile.slug} cheap />)}</ul></>}
    {profile.gifts.map((g, i) => <section key={i} className="y-gift-part">{g.part && <p className="y-part">{g.part}</p>}
      {g.loved.length > 0 && <><img className="y-ribbon" src="/yuphas/icons/ui/gifts-giftLoved.png" alt="매우 좋아함" /><ul className="y-gift-list">{g.loved.map((x) => <GiftRow key={x.slug} g={x} person={profile.slug} cheap={!!x.ko && cheapSet.has(x.ko)} />)}</ul></>}
      {g.liked.length > 0 && <><img className="y-ribbon" src="/yuphas/icons/ui/gifts-giftLiked.png" alt="좋아함" /><ul className="y-gift-list">{g.liked.map((x) => <GiftRow key={x.slug} g={x} person={profile.slug} cheap={!!x.ko && cheapSet.has(x.ko)} />)}</ul></>}
    </section>)}
    {(profile.meals.loved.length + profile.meals.liked.length + profile.meals.disliked.length) > 0 && <ul className="y-food-list" aria-label="음식">
      {profile.meals.loved.map((m) => <FoodTile key={m.slug} m={m} person={profile.slug} grade="great" />)}
      {profile.meals.liked.map((m) => <FoodTile key={m.slug} m={m} person={profile.slug} grade="good" />)}
      {profile.meals.disliked.map((m) => <FoodTile key={m.slug} m={m} person={profile.slug} grade="bad" />)}
    </ul>}
  </div>;
}
/** 지원 표: yuphastemple 지원 탭 모양(§2). 2열, 얼굴을 칸 배경으로, 등급 글자 + 괄호 속 시기. */
export function SupportTable({ profile }: { profile: YuphasProfile }) {
  if (!profile.supports.length) return null;
  return <div className="y-supports">
    <p className="y-tab-link"><YLink en={`${profile.en} · Supports`} href={personUrl(profile.slug, 'supports')} /></p>
    <table className="y-support-table"><thead><tr><th scope="col">인물</th><th scope="col">지원</th></tr></thead><tbody>
      {profile.supports.map((s) => <tr key={s.partner.slug}>
        <th scope="row" className="y-support-ch" style={s.face ? { backgroundImage: `url('${s.face}')` } : undefined}>{s.partner.ko || s.partner.en}{s.paired && <span className="y-paired" title="짝 엔딩">♥</span>}</th>
        <td>{s.ranks.map((r) => <span key={r.rank} className="y-rank">{r.rank}{r.part && <small> ({r.part})</small>}</span>)}</td>
      </tr>)}
    </tbody></table>
  </div>;
}
/** 인물 이름 → yuphastemple 지원 탭 단추(영어 이름). */
export function SupportLink({ ko }: { ko: string }) { const p = yuphasPerson(ko); return p ? <YLink en={p.en} href={personUrl(p.slug, 'supports')} /> : null; }
export { itemUrl };
/** 재료 한 줄: 한국어 배지(수량) + 영어 단추(물품 쪽) + 지도 단추(그 물품이 있는 곳). 사진·서랍은 없앴다(2026-11-27). */
export function MaterialChip({ name, quantity, people, route }: { name: string; quantity?: string; people?: string[]; route: string }) {
  const y = yuphasItemFor(name);
  return <div className="y-material-row" data-material>
    <KoBadge ko={name} icon={y?.icon} kind="material" value={quantity} />
    {y ? <YLink en={y.en} href={itemUrl(y.slug)} /> : <span className="y-unverified">미확인</span>}
    {y && <YLink en="Map" href={mapUrl(route, y.en)} className="y-map" />}
    {people && people.length > 0 && <span className="y-material-for">{people.join(' · ')} 영입</span>}
  </div>;
}
