# 고침 5건 구현 계획 (2026-11-27)

- 대상 워크트리: `C:\Users\hojin\Documents\fe-fortunes-weave-guide-megi\.claude\worktrees\yuphas-design-sample` (계획 작성 때 HEAD `068e771`). 계획을 쓰는 동안 저장소는 읽기만 했다.
- 디자인 값의 정본은 Fable 자문 문서 `fixes-round-plan.md`(같은 scratchpad 폴더)다. 이 문서는 그 값을 **어느 파일·함수에 어떻게 넣는지**만 적는다. 값을 다시 적지 않은 곳은 "자문 §X"로 가리킨다.
- 사용자 결정(2026-11-27): Q2 다섯 묶음만 남김, Q3 할 일 탭 `World Map ↗`도 장소 주소로, Q4 루트마다 기록 하나(1·2부가 같이 씀) + 3부 하나, Q9 능력치 기록은 이번에 안 함. 묻지 않은 것은 자문 추천을 따른다: Q1 숙련 12개 모두 등급 고르기, Q5 메모 200자, Q6 `builds`가 든 파일은 통째로 바꾸고 `builds`가 없는 파일은 지금 기록 유지, Q7 `기록 지우기`는 체크만 지움, Q8 입력은 루트 화면 서랍에서만, Q10 `육성판 목적`·`필터 지우기` 삭제.
- 작업 규칙: 할 일 하나에 커밋 하나, 작성자는 사용자 본인, 공동 작성자 줄 없음, 한국어 Conventional Commit 제목(P11). 커밋 직후 `git log -1 --format=%B`로 확인한다. 코드는 Opus 5.5 중간 강도가 쓴다(P12). 화면 작업 전에 modern-web-guidance(모달·폼·select)와 impeccable을 먼저 본다(P06). Next 16 API는 `node_modules/next/dist/docs/`에서 확인한다.
- 규칙 번호: 이 브랜치는 U64~U67까지 있고, main의 U63이 표 가운뎃점 규칙이다. 새 줄은 **U68~U72(안)** 으로 적는다. 커밋할 때 `docs/user-rules.md`의 마지막 U 번호를 다시 보고, 합치기로 번호가 밀렸으면 다음 빈 번호부터 차례로 붙인다. 이 문서에서는 `U-a…U-e`가 각각 U68…U72를 뜻한다.
- 주의: localhost:3000의 체크 칸은 누르지 않는다(P05). 브라우저 검사를 따로 돌릴 때는 `npm run build` 후 `node scripts/serve-static.mjs out 3210`을 띄우고 `BROWSER_BASE_URL=http://localhost:3210`을 준다(`status-browser-check.mjs`의 기본값은 3000이다).

---

## 커밋 0 — `docs: 고침 5건 자문과 구현 계획 기록`
- 자문 문서를 `docs/fixes-round-plan.md`로, 이 문서를 `docs/fixes-impl-plan.md`로 복사한다(계획은 실행 전에 프로젝트 문서로 남긴다).
- `docs/design-spec.md` 맨 위 "yuphastemple 통합" 절 바로 아래에 새 절 "고침 5건 · 2026-11-27"을 만들고, 자문 §D·E·C·B·F의 값을 가리키는 줄을 넣는다. 지원 표 줄의 "얼굴 왼쪽 위"는 "왼쪽 아래, 줄 높이 ≥ 얼굴"로 고친다(P07).

## 커밋 1 (D) — `fix: 지원 표 얼굴이 줄마다 잘리지 않게 맞추기`
- `app/redesign.css`
  - 965줄 `.y-support-ch`: `background-size:auto 3.6em; background-position:-6px top; vertical-align:top` → `background-size:auto var(--face-h); background-position:-6px bottom; vertical-align:middle`.
  - 966줄 `.y-support-table td`: `vertical-align:middle`.
  - 새 줄: `.y-support-table{--face-h:54px}` / `.y-support-table tbody :is(th,td){block-size:calc(var(--face-h) + 2px)}`.
  - `@media(max-width:767px)` 안: `.y-support-table{--face-h:40px}`. 992줄·994줄의 `background-size`는 지운다. 994줄 `padding-inline-start`는 `58px!important`로 바꾼다.
- 규칙: `docs/user-rules.md`에 **U-c** "서랍 지원 표 얼굴은 모든 줄에서 잘리지 않는다(줄 높이 ≥ 얼굴 높이, 얼굴은 칸 왼쪽 아래)" | 11-27 | `scripts/rules-browser-check.mjs`.
- 검사: `scripts/rules-browser-check.mjs`에 `[U-c]` 추가. `/theodora/1/`에서 할 일 묶음의 얼굴 단추로 세오도라 서랍을 열고, 1440과 390에서 `.y-support-table tbody th`마다 `getBoundingClientRect().height >= parseFloat(getComputedStyle(table).getPropertyValue('--face-h'))`인지 본다. `[data-support-pairs]` 표(루트별 지원 대화)도 한 번 열어 칸이 넘치지 않는지 본다.

## 커밋 2 (E) — `feat: 루트 머리 왼쪽에 팀 화면 단추 두기`
- `components/shell.tsx`: `.guide-home` 링크를 `<div className="guide-links">`로 감싸고, 그 안에 `<Link className="guide-home guide-team" href="/team/" aria-label="최종 25인 팀 화면"><Users size={22}/><span>팀 25인</span></Link>`를 더한다(lucide `Users` 가져오기).
- `app/redesign.css`: `.guide-links{display:flex;align-items:center;gap:8px}`. ≤767px는 지금 `.guide-home` 규칙이 클래스를 같이 쓰므로 자동으로 적용된다. `@media(max-width:359px){.guide-links .guide-home{min-inline-size:36px;min-block-size:36px}}`.
- 규칙: **U-d** "루트 머리 왼쪽 `첫 화면` 옆에 팀 화면(/team/) 단추. 휴대폰은 아이콘만" | `scripts/rules-check.mjs` `scripts/header-browser-check.mjs`.
- 검사: `rules-check.mjs` `[U-d]`에 `shell.tsx`가 `href="/team/"`을 갖는지 확인. `header-browser-check.mjs` `[U-d]`는 320·390·1440에서 `.guide-team`이 보이고 머리 안에 있으며 가로 넘침이 0인지 본다. `button-gap-check.mjs`는 단추를 자동으로 잡는다(320 크기가 없으면 크기 목록에 320×640을 더한다).

## 커밋 3 (C) — `feat: 인물 탭을 서랍 머리 카드 격자로 다시 그리기`
- `components/guide.tsx`: `<People … onPerson={setPerson} route={route}/>`.
- `components/people.tsx` `People`:
  - `kind` 상태, `육성판 목적` select, `필터 지우기` 단추를 지운다(Q10). 역할 select는 `ToggleGroup`(이미 있는 `ui/toggle-group.tsx`) 탭 `전체·본대·보완·선택·수집`으로 바꾼다. 기억 키 `scope+'-role'`은 그대로 둔다.
  - 검색 칸은 클래스 `.y-search`(자문 §C-1 값)로 만든다. 오른쪽에 `N명` + `시험 안내`.
  - 격자는 `<div className="people-grid">` 안에 `<article className="person-card" key=…>`를 둔다. 카드 안은 `CharacterHeader`(profile은 서랍과 같은 규칙: `part==='3'`이면 `{...yuphas, portrait:''}`) + `PersonTags`. 이름은 `<button className="person-card-open" onClick={()=>onPerson(p.id)}>`.
  - 프로필이 없는 인물(`!p.yuphas`)도 `CharacterHeader`가 portrait로 그린다(지금 동작과 같음).
- `components/yuphas.tsx` `CharacterHeader`: `nameSlot?: ReactNode` 인자를 더한다. 주면 `.y-card-name`의 글 대신 그것을 쓴다(카드에서는 열기 단추). 서랍·팀 서랍 호출은 바꾸지 않는다.
- `app/globals.css` 20줄 `.people-grid`·`.person` 규칙과 23줄 1199px 규칙은 지우고, `app/redesign.css`에 새로 둔다: `.people-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(420px,100%),1fr));gap:16px}`, `.person-card .y-card{min-block-size:220px;margin:0}`(≤767px 200px), `.person-card-open::after{content:'';position:absolute;inset:0}`, `.y-card-en{position:relative;z-index:1}`, 호버·포커스 값은 자문 §C-4.
- 고아가 된 것 정리: `PersonHeading`(다른 곳에서 안 쓰면 삭제), `Card` 가져오기, `PersonInfo`의 `more`·`openKey` 인자(호출하는 곳이 서랍뿐이 되면 삭제, 그 분기 안의 `more&&` 줄도 삭제). `.person-heading` CSS가 남으면 함께 지운다.
- 규칙 줄:
  - **U-a** "인물 탭은 서랍 머리 카드 모양 카드 격자(이름 검색 + 역할 탭). 카드를 누르면 인물 서랍. 탭 안에 표·접기 없음" | `scripts/rules-browser-check.mjs`.
  - U02 날짜 칸에 ", 11-27 인물 탭은 머리 카드만, 표·쌍은 서랍(U-a)"을 더한다. 검사 칸은 그대로.
  - U26의 "서랍·인물 카드의" → "인물 서랍의". 날짜 칸에 ", 11-27 인물 탭 카드 → 서랍(U-a)"을 더한다.
- 깨지는 검사와 고칠 내용(같은 커밋에서 고친다):
  - 새 공용 도우미 `scripts/people-sheets.mjs`를 만든다. `eachPersonSheet(page, fn)`은 `.person-card-open`을 하나씩 눌러 `[role=dialog]`를 기다리고 `fn(sheet, name)`을 부른 뒤 Esc를 누른다.
  - `feature-browser-check.mjs` 25~35줄: `.people-grid>.person` → `.people-grid>.person-card`. `필터 지우기`·`육성판 목적` 단계를 지우고 "역할 탭 `본대` 고름 → 새로 고침 → 그대로 고름"으로 바꾼다. 선호 선물 단계는 첫 카드를 눌러 서랍 `[data-yuphas-link]` 수가 3보다 큰지 본다. 79줄 `.person-heading img[src*="post-timeskip"]` → `.person-card .y-card-portrait[src*="post-timeskip"]`.
  - `header-browser-check.mjs` 40줄과 `rules-browser-check.mjs` 159~162줄(U26 싼 선물, U42 누조): `eachPersonSheet`로 서랍마다 `.y-gift[data-cheap], .gift-chips li` 수가 0보다 큰지 본다. 누조는 서랍 글에서 확인한다. 실패하는 인물이 나오면(프로필 선물 목록에 없는 싼 선물), `PersonSheet`에서 picks가 비었을 때 `PersonInfo`의 싼 선물 줄을 보이도록 고친다.
  - `rules-browser-check.mjs` 74줄 U08: 선택자를 `.people-grid .y-card-portrait`로 바꾸고 `.person > :not(.person-heading)` 예외를 지운다.
  - `corrections-browser-check.mjs` 34·50·52~57줄: `.person>details` 열기를 지운다. people의 `faceSizes` 단언(96/72)은 "카드마다 `.y-card-portrait` 1개"로 바꾼다. 계획 쌍 ≤14·카이 전차병 문구 검사는 1440에서 `eachPersonSheet`로 서랍 안 `.detail-pairs`(접기 열기)를 읽는다.
  - `design-lead-browser-check.mjs` 34~69줄의 `.person-summary`·`.person .tags` 측정: `.tags`는 `.person-card .tags`로 바꾸고, 표 측정은 `eachPersonSheet`로 옮긴다.
  - `browser-check.mjs` 84줄 `personTables`와 `consistency-browser-check.mjs` 48줄 U54(`.person-summary th`): 인물 화면에서는 0개가 되므로, 서랍 하나를 열어 재도록 바꾼다(검사가 헛돌지 않게 "표 1개 이상"도 단언한다).

## 커밋 4 (B-1) — `feat: 할 일 지도 단추를 yuphastemple 장소 주소로 잇기`
- 자료:
  - 새 `scripts/yuphas/places.mjs`는 작업 폴더 `.tmp/yuphas/ydata/locations.json`의 `LOCATIONS[en].a` 키(`Cai/Dietrich/Theodora/Leda/Part 3` → `cai/dietrich/theodora/leda/part3`)를 읽어 `content/data/yuphas-place-routes.json` `{ "<slug>": ["theodora", …] }`를 만든다(장소 슬러그는 `lib.mjs` `mapSlug`).
  - `scripts/yuphas/build-links.mjs`: `yuphas-names.json`의 `places` 중 `slug && linkVerified`인 것을 `out.places[ko] = [en, slug, routes]`로 내보낸다. 출력 줄에 장소 수를 더한다. 그 뒤 `node scripts/yuphas/build-links.mjs`를 다시 돌린다(`--check`가 배포 관문에 있다).
- `lib/yuphas.ts`:
  - `export const placeUrl = (route, slug, q?) => \`${YUPHAS}/map/${route==='part3'?'part-3':route}/${slug}/\` + (q ? '?q='+encodeURIComponent(q) : '')`.
  - `export function findPlace(text, route): {ko,en,slug}|undefined`는 글 안에 나오는 장소 이름 가운데 그 루트 지도에 있는 것만 고르고, 겹치면 긴 이름을 우선한다. **서로 다른 장소가 정확히 하나일 때만** 돌려준다(둘 이상이면 모르는 것으로 보고 루트 지도).
  - `personUrl`의 탭 타입에 `'builder'`를 더한다(커밋 9에서 씀).
- `components/tasks.tsx` 120줄: 묶음마다 `place = findPlace(heading + action 글 + notes 글, route)`를 계산해 `<SourceMarkup … place={place}/>`로 넘긴다.
- `components/source-markup.tsx` 68줄: `a['data-map-link']`이면 `place ? <YLink en={place.en} href={placeUrl(route, place.slug)} …/> : <YLink en="World Map" href={mapUrl(route)} …/>`. `data-source-location` 표시는 그대로 둔다(`verify-image-parity`가 센다).
- 규칙: U65 "본문 지도 링크는 yuphastemple 지도" → "본문 지도 링크는 장소를 알면 yuphastemple 장소 주소(영어 장소 이름 단추), 모르면 루트 지도". 날짜 칸에 ", 11-27 장소 주소(사용자 결정 Q3)"을 더한다.
- 검사:
  - `rules-check.mjs` 210줄의 정확한 문자열 단언 `'<YLink en="World Map" href={mapUrl(route)}'` → "`placeUrl(route, place.slug)`와 대체 `mapUrl(route)`가 둘 다 있음"으로 바꾼다.
  - `yuphas-links-check.mjs`: `places` 행마다 `routes`가 비어 있지 않음, 슬러그가 `yuphas-names.json`과 같음.
  - `rules-browser-check.mjs` `[U65]`: `/theodora/1/`의 모든 장을 열고 `a[data-yuphas-link][href*="/map/theodora/"]`가 1개 이상인지, 장소 주소가 하나 이상 있는지(장소를 찾은 묶음이 있으므로) 본다.
- 한계(P07, 최종 답변에 적음): 원본 지도 링크에는 장소가 들어 있지 않다(188개 모두 game8 지도 주소). 그래서 장소는 같은 묶음 글에서 추정한다. 미리 훑어보니 notes 글만으로는 188개 중 22개에서 장소 이름이 나왔다. 나머지는 루트 지도로 남는다.

## 커밋 5 (B-2) — `feat: 준비 탭을 그림 다섯 묶음으로 처음부터 다시 그리기`
- 서버 자료: 새 `lib/prep.ts`(`import 'server-only'`)의 `prepPanels(route, part)`가 다음을 돌려준다.
  - ① `god-service-plan.json`: `routes[route]`(`queue`·`end`·`boons`), `priority`, 신 그림 `assets/gods/manifest.json`. `queue` 글 `"크레르1 → 칼라3 → 크레르3"`은 `→`로 나눠 `{god, level}[]`로 바꾼다. 3부는 글 한 줄.
  - ② `weekly-support.json[route]`: `rows`(이름표, 두 인물, 메모), `recruitmentQueue.targets`, `nextLord/nextTarget/nextText`. 얼굴은 `lib/portraits.ts`, 서랍 열기는 `#person-…` id(people 목록에서 이름으로 찾음). 2부·3부는 이 묶음을 그리지 않는다(2부는 "주간 식사 없음" 한 줄).
  - ③ 시험 단계: `content/data/yuphas-classes.json`의 `licenses`(커밋 6에서 생김. **이 커밋을 커밋 6 뒤로 미루거나**, 이 커밋에서는 세 줄을 `lib/prep.ts` 상수로 두고 커밋 6에서 `licenses`로 바꾼다. 추천: 상수로 두고 바꾸기). 증서 아이콘과 링크는 `yuphasItem('초급 증서')` 등. 없으면 `itemUrl('beginner-license')`.
  - ④ `secondary.prepTree`에서 `h3`가 `장을 넘기기 전`인 절의 `li` 글 3줄(나무에서 글만 뽑음).
  - ⑤ `mapUrl(route)`, `/team/`.
- `lib/secondary.ts`의 `Secondary`에 `panels: PrepPanels`를 더하고 `secondaryFor`에서 채운다. `prepTree`·`exam`·`blocks`·`service`는 `ContextRail` 같은 다른 곳이 쓰는지 grep해서, 아무도 안 쓰면 그 필드를 뺀다.
- `components/secondary.tsx` `Preparation`을 다시 쓴다. `Records`·`Semantic`·`ReadMore`를 쓰지 않는다. `<div className="prep-content">` 안에 `<section className="prep-panel" data-panel="gods|meals|exams|before|links">` 다섯 개를 둔다. 제목은 `<h2 className="y-section-title">`. 내 가호 레벨(`useChecks().data.status?.gods`)이 있으면 채운 단계·첫 미달(`다음`)을 표시한다(자문 §B3-①).
  - **자문과 다르게 할 점(제안, 최종 답변에 적음)**: 봉사 순서 칩에는 초상화를 넣지 않고 글 + 단계 숫자만 쓴다. 순서에 같은 신이 되풀이되고(크레르 두 번), 지금 검사가 "준비 화면 신 초상은 한 번"(`browser-check.mjs` 176~179줄)을 요구하기 때문이다. 신 초상화는 신 타일 줄에서 한 번만 보인다.
  - 얼굴 타일(②)은 `<button className="portrait-button">`이고 `onPerson`을 부른다. `Preparation` 인자에 `onPerson`을 더하고, `guide.tsx`가 `setPerson`을 넘긴다.
- CSS(`app/redesign.css`, 자문 §B3 값 그대로): `.prep-content{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px 24px}`, `[data-panel=gods]{grid-column:1/-1}`, `@media(max-width:999px){.prep-content{grid-template-columns:minmax(0,1fr)}}`, `.prep-chain`(flex-wrap), `.god-tiles{grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px}`, `.prep-faces`, `.exam-tiles{repeat(auto-fill,minmax(140px,1fr))}`. 옛 `.prep-content [data-face-row]`, `[data-face-list]`, `.prep-content>.records` 규칙(globals.css 37·39·76~78줄, redesign.css 102~103·375·446줄)은 다른 곳이 안 쓰면 지운다.
- 뺀 글: 화면에서 빠지는 공통 기준 13개 절과 장별 운영 안내를 `node`로 `presentation.json`의 `parity.prep`·`exam`에서 글로 뽑아 `docs/reference/prep-common.md`에 저장하고, `docs/reference/README.md` 목차에 한 줄 더한다. 자료(`content/`)는 지우지 않는다. `verify-feature-parity`·`verify-readability`·`verify.mjs` 80줄은 자료만 보므로 그대로 통과해야 한다(돌려서 확인).
- 규칙: **U-b** "준비 탭은 그림 다섯 묶음(가호 봉사·이번 주 식사·시험 단계·장 넘기기 전·바로가기). 표 0개, 1440·390·320 가로 넘침 0. 뺀 글은 docs/reference/prep-common.md" | 11-27(사용자 결정 Q2) | `scripts/layout-browser-check.mjs` `scripts/rules-check.mjs`. U66 목록에 "준비 탭 공통 기준·운영 안내"를 더한다.
- 깨지는 검사와 고칠 내용:
  - `browser-check.mjs` 176~179줄: `.reference-disclosure` 열기를 지운다. "신별 초상 48px 한 번"은 "`.prep-content img[src*="/gods/"]` src마다 한 번, 폭 ≥ 88px"로 바꾼다.
  - `corrections-browser-check.mjs` 35·59·66~78줄: `.reference-disclosure` 열기를 지운다. `prep` `faceSizes` 48×48은 "얼굴 48×48, 신 타일 ≥ 88"로 바꾼다. `prep-training` 장면의 `[data-face-row]`는 `.prep-faces img`(48×48, 이름이 아래에 있음)로 바꾼다.
  - `globals.css` 37줄의 `--face-list` 크기 규칙에서 `.prep-content img[src*="/gods/"]`를 빼야 신 타일이 커진다.
  - `layout-browser-check.mjs` `[U-b]`: 크기 목록에 320×640을 더한다. `/theodora/1/`·`/leda/2/`·`/part3/3/` 준비 탭에서 `scrollWidth<=clientWidth`, `.prep-content table` 0개, 오른쪽 끝이 화면 밖인 요소 0개를 본다.
  - `rules-check.mjs` `[U-b]`: `components/secondary.tsx`의 `Preparation` 함수 본문에 `Records`·`Semantic`이 없음.
  - `consistency-browser-check.mjs` 97줄(360 준비 표 폭)은 표가 없어도 통과하므로 그대로 둔다.

## 커밋 6 (F-1) — `feat: yuphastemple 병종 61개 자료와 생성 스크립트`
- 새 `scripts/yuphas/classes.mjs`(`class-moves.mjs`와 같은 꼴, 원본은 작업 폴더의 `Y('data.json').DATA`, 손으로 고치지 않음):
  - `DATA.classes`는 65개다. **`dlc`인 4개(Awakened·Badhbh Cath·Seere·Trickster, 인물 전용 3부 병종)와 `God`을 뺀다** → Commoner·Noble + 59 = 61. 61개라는 수와 성별 차이(남성 57·여성 59)는 자문이 그 사이트에서 직접 잰 값과 맞는다. 코드 안에서 DLC를 거르는 줄은 찾지 못했다(미확인). DLC 병종은 화면에 넣지 않는다고 최종 답변에 적는다.
  - 행: `{slug, en, ko, license, level, renown, part3:boolean, column, gender?, moves, weapons}`.
    - `slug`: `createSlug(name)`.
    - `license`: `default|beginner|specialty|advanced|elephant|master|divine`(`c.license` 소문자, `N/A` → `default`).
    - `part3`: `note==='Part 3 Unlock'`.
    - `weapons`: `WEAPON_TYPES` 중 `name in c.skills`인 것을 그림 파일 이름(`black_magic` 꼴)으로.
    - `moves`: `class-moves.mjs` 규칙과 같음.
    - `column`: app.js `CLASS_COLUMN` 표를 그대로 옮기고 나머지는 이동 규칙(자문 §A3-6)으로 계산.
    - `ko`: `yuphas-names.json` `classes`의 slug→ko. 없으면 `null`(`orichaldia`).
  - `licenses`: 자문 §F2 표(머리 글 값). Elephant의 `ko`는 `"코끼리"`(자문 §B3-③에서 화면 글로 씀).
  - `characters`: `yuphas-characters.json` 62명마다 `{gender, unique: classes.unique.slug, noRide?: true}`. `noRide`는 data.json 인물의 개인 능력 글이 `/cannot change( class)? to cavalry or flying/i`에 맞을 때(Goliath·Orchel). 이렇게 하면 `yuphas-characters.json`은 건드리지 않는다.
  - 쓰기: `content/data/yuphas-classes.json`.
- 새 `lib/yuphas-classes.ts`(클라이언트에서 써도 됨, 61줄 + 62명이라 몇 KB):
  - `export type YClass`, `export const classes: YClass[]`, `classBySlug(slug)`.
  - `allowedClasses(personSlug): YClass[]` = 자문 §F2 허용 규칙(`license!=='default' || slug===unique`, 성별, `noRide`면 `moves`에 riding·flying 있는 것 제외).
  - `classIcon(slug, gender)` → `/yuphas/classes/${gender}/${slug}.webp`(그림은 성별 폴더에 모두 있음을 확인함. 성별 전용 병종은 그 성별 폴더에만 있음).
  - `export const buildCatalog: BuildCatalog = { people: Object.keys(characters), classes: classes.map(c=>c.slug) }`.
- 새 `scripts/builds-check.mjs`의 1부(자료 검사): 61개, 슬러그 유일, 증서별 개수 2/5/12/16/1/16/8(default는 Commoner·Noble), 그림 파일 존재, 62명 모두 `allowedClasses` ≥ 1이고 고유 병종 포함, 남성에 `wing-soldier`·`celestial-trooper` 없음, `goliath`·`orchel`에 기마·비행 없음. `lib/yuphas-classes.ts`는 `@/` 경로를 쓰므로 검사는 JSON을 직접 읽고 같은 허용 규칙을 따라 한다. 더 좋은 방법: 허용 규칙을 가져오기 없는 순수 함수 `lib/class-rules.ts`에 두고 `lib/yuphas-classes.ts`와 검사가 함께 부른다(Node 24는 `.ts`를 직접 가져온다. `verify.mjs`가 이미 이렇게 한다).
- `scripts/release.mjs` 28줄 `DATA`에 `'scripts/builds-check.mjs'`를 더한다.

## 커밋 7 (F-2) — `feat: 인물 육성 기록을 체크 기록 파일에 저장하기`
- `lib/check-state.ts`(가져오기 없음 유지. `verify.mjs`와 `builds-check.mjs`가 Node로 직접 가져온다):
  ```ts
  export const BUILD_ROUTES = ['theodora','leda','dietrich','cai','part3'] as const;
  export const SKILL_IDS = ['sword','spear','axe','bow','gauntlet','black_magic','white_magic','authority','infantry','riding','armor','flying'] as const;
  export const RANKS = ['E','E+','D','D+','C','C+','B','B+','A','A+','S','S+'] as const;
  export type BuildRoute = typeof BUILD_ROUTES[number]; export type SkillId = typeof SKILL_IDS[number]; export type Rank = typeof RANKS[number];
  export type Build = { level?: number; classId?: string; skills?: Partial<Record<SkillId, Rank>>; note?: string };
  export type Builds = Partial<Record<BuildRoute, Record<string, Build>>>;
  export type BuildCatalog = { people: string[]; classes: string[] };
  export const NOTE_MAX = 200;
  // CheckState에 builds?: Builds
  ```
  - `validateBuilds(value, catalog): Builds`: 엄격 검사. 객체 아님, 모르는 루트·인물·병종, 레벨이 1~99 정수 아님, 모르는 숙련·등급, 메모가 글이 아니거나 200자 초과이면 이유를 담은 오류를 던진다(예: `육성 기록 theodora › loretta의 병종 "wing-solder"를 모릅니다.`). 빈 인물·루트는 결과에서 뺀다.
  - `sanitizeBuilds(value, catalog?): Builds | undefined`: 느슨하게 읽는다. 틀린 칸만 버리고 나머지는 살리며, 오류를 던지지 않는다. catalog가 없으면 모양만 본다.
  - `validateChecks(value, limits?, catalog?)`: `d.builds !== undefined`이면 결과에 `builds`를 **반드시** 넣는다. catalog가 있으면 `validateBuilds`, 없으면 `sanitizeBuilds`로 모양만 본다. 이렇게 해야 저장소 값이 이상해도 체크 기록 전체가 막히지 않는다. 빈 `{}`도 그대로 돌려준다(파일이 이긴다, Q6). **지금 함수는 아는 필드만 돌려줘서 `builds`가 사라진다. 꼭 고칠 곳이다.**
  - `nextBuilds(builds, route, slug, patch: Partial<Build> | null): Builds`: 순수 함수. `null`이면 그 인물 기록을 지운다. 값이 `undefined`나 빈 글인 칸은 지운다. 빈 skills, 빈 인물, 빈 루트도 지운다.
  - 기록 단위(Q4): 화면 루트 ID를 그대로 쓴다. 1·2부는 같은 `route`라 자동으로 같은 기록을 쓰고, 3부는 `part3`.
- `components/checks.tsx`:
  - `readStored`: `d.builds`가 있으면 `{...d, builds: sanitizeBuilds(d.builds, buildCatalog)}`.
  - `importData`: `validateChecks(value, limits, buildCatalog)`. 그다음 `...(!data.status && snapshot.data.status ? {status: …} : {})` 옆에 `...(data.builds === undefined && snapshot.data.builds ? {builds: snapshot.data.builds} : {})`를 둔다. 파일에 `builds`가 없으면 지금 기록을 그대로 두고, 있으면 파일 것으로 통째로 바꾼다.
  - 새 `setBuild(route, slug, patch)`: `if(!snapshot.ready) return; bump({...snapshot.data, builds: nextBuilds(snapshot.data.builds, route, slug, patch)})`.
  - `clear`: `save({...empty, ...(snapshot.data.builds ? {builds: snapshot.data.builds} : {}), revision…})`(Q7).
  - `toggle`·`setStatus`는 `{...snapshot.data}`를 펼치므로 그대로 두어도 `builds`가 남는다(코드로 확인함).
- `components/tasks.tsx`:
  - 33~34줄 가져오기 알림에 `· 육성 기록 포함` 또는 `· 파일에 육성 기록 없음(기존 육성 기록 유지)`을 더한다.
  - 지우기 확인 글을 "이 브라우저의 체크 기록과 내 상태를 모두 지웁니다(인물 육성 기록은 남깁니다)…"로 바꾼다.
  - `exportFile`은 `checks.data`를 그대로 쓰므로 바꾸지 않는다.
- `scripts/transfer.mjs`: 이전 프로젝트 자료를 옮기는 도구이고 진행 파일을 다루지 않는다(62줄 확인). 바꿀 것 없음.
- 규칙:
  - **U-e** "루트별 인물 육성 기록(레벨 1~99·병종·숙련 12개 등급·메모 200자). 1·2부는 한 기록, 3부는 따로. 체크 기록과 같은 저장소·같은 내보내기 파일의 `builds`. `builds` 없는 파일을 가져와도 육성 기록 유지, 있으면 파일 것으로 바꿈. `기록 지우기`는 육성 기록을 지우지 않음. 사이트에 개인 기록 없음" | 11-27(사용자 결정 Q4~Q7) | `scripts/builds-check.mjs` `scripts/status-browser-check.mjs`.
  - U25 "개인 값은 …" 뒤에 "·인물 육성 기록"을 더하고 날짜 칸에 ", 11-27 육성 기록(U-e)"을 더한다.
- 검사 `scripts/builds-check.mjs`의 2부(Node, 브라우저 없음. `../lib/check-state.ts`를 가져옴):
  - (가) `builds` 없는 예전 파일이 통과하고 결과에 `builds`가 없다.
  - (나) 올바른 `builds`가 통과하고 그대로 돌아온다(`deepEqual`).
  - (다) 모르는 루트·인물·병종, 레벨 0·100·1.5, 등급 `F`, 숙련 `lance`, 메모 201자가 각각 거절된다.
  - (라) `checks`·`status` 결과가 `builds`를 더하기 전과 같다.
  - (마) `sanitizeBuilds`는 틀린 칸만 버린다.
  - (바) `nextBuilds`는 빈 칸·인물·루트를 지우고, `null`이면 인물을 지운다.
  - (사) `validateChecks(…, catalog 없음)`은 이상한 `builds`가 있어도 던지지 않는다.

## 커밋 8 (F-3) — `feat: 인물 서랍에 육성 기록 입력 두기`
- `lib/yuphas-profile.ts`: `YuphasProfile`에 `gender: 'male'|'female'`와 `ranks: Record<SkillId, Rank>`(`c.skills[skill].rank`, 순서는 `ORDER`)를 더한다. `skills[i]`에 `id: SkillId`(= `file(skill)`)를 더한다.
- 새 `components/build-editor.tsx`(`'use client'`) `BuildEditor({route, profile, person})`:
  - `useChecks()`로 `data.builds?.[route]?.[profile.slug]`를 읽고 `setBuild`로 쓴다. `!ready`면 입력을 `disabled`로 둔다.
  - 1줄: 병종 단추(클래스 `.build-class`, `ClassPicker`의 Trigger) + `Lv` 스테퍼. 입력은 `type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2}`이고 편집 중 값은 로컬 `useState`에 둔다. 저장은 `onBlur`·Enter·▲▼에서만 하고 `clamp(1,99)`, 빈칸이면 `level: undefined`. 키보드 ↑↓로 ±1. ▲▼는 `tabIndex={-1}`, `aria-hidden` 대신 `aria-label="레벨 올리기/내리기"`.
  - 2줄: 숙련 6×2. 칸마다 그림 32px(장점·약점 표시는 머리 카드와 같음) + 기본 `<select aria-label="검술 등급">`. 선택지는 `–`(값 `""`, 보이는 글은 기본 등급 `profile.ranks[id]`를 흐리게) + `RANKS`. `onChange`에서 바로 저장한다.
  - 3줄: 메모 `<input maxLength={200} placeholder="메모" aria-label="메모">`. 저장은 `onBlur`.
  - 4줄: `<YLink en={\`${profile.en} · Builder\`} href={personUrl(profile.slug,'builder')}/>` + 글 단추 `이 인물 기록 지우기` → `window.confirm` 뒤 `setBuild(route, slug, null)`.
- `components/detail-sheets.tsx` `PersonSheet`: 머리 카드 바로 아래에 `{person.yuphas && <><h3 className="y-section-title">내 기록</h3><BuildEditor route={route} profile={person.yuphas} person={person}/></>}`. 팀 화면(`team.tsx`)은 자기 서랍을 쓰므로 바뀌지 않는다(Q8).
- `components/yuphas.tsx` `CharacterHeader`: `build?: Build` 인자를 더한다.
  - `build.classId`가 있으면 병종 줄을 `classBySlug`의 한국어 이름(없으면 영어)·`classIcon(slug, profile.gender)`·`moves`로 바꾸고, `build.level`이 있으면 `Lv N`(15px `#ACAAB9`)을 붙인다.
  - `build.skills[id]`가 있으면 숙련 그림 오른쪽 아래에 등급 글자(11px, 검정 외곽, 읽기 전용)를 둔다.
  - `PersonSheet`과 인물 탭 카드(`people.tsx`)가 `useChecks().data.builds?.[route]?.[slug]`를 넘긴다.
- CSS는 자문 §F4 값 그대로: `.build-editor`, `.build-row{display:flex;flex-wrap:wrap;gap:8px 16px}`, `.build-skills{display:grid;grid-template-columns:repeat(6,44px);gap:6px}`, `@media(max-width:359px){gap:4px}`, `.build-step`.
  - **자문과 다르게 할 점(제안)**: select·입력 글자를 14px가 아니라 **16px**로 한다. 휴대폰 Safari는 16px보다 작은 입력 칸에 초점이 가면 화면을 확대해서 320px 화면이 흔들린다. 44px 칸에 `S+`가 들어가는지 확인한다.
- 검사(`status-browser-check.mjs` 끝에 `[U-e]` 덧붙임. 빈 프로필의 검사용 서버에서만 돈다):
  1. 레벨에 0과 100을 넣고 칸을 떠나면 1과 99가 된다.
  2. 숙련 등급을 고르면 새로 고친 뒤에도 남는다.
  3. 체크 칸을 하나 누른 뒤에도 `localStorage`의 `builds`가 그대로다.
  4. 내보낸 JSON에 `builds.theodora.<slug>`가 있다. 저장소를 비우고 그 파일을 가져오면 화면이 돌아온다.
  5. 육성 기록이 있는 상태에서 **`builds` 없는 파일**을 가져오면 체크는 파일 것이 되고 육성 기록은 남는다.
  6. `기록 지우기`를 눌러도 `builds`가 남는다.
  7. `/leda/1/`에서 같은 인물 기록이 비어 있고, `/theodora/2/`에서는 1부와 같다(Q4).

## 커밋 9 (F-4) — `feat: yuphastemple 모양 병종 고르기 창`
- 새 `components/class-picker.tsx` `ClassPicker({profile, value, onPick, children /* 트리거 */})`:
  - 구조: Radix `Dialog`(`@radix-ui/react-dialog`, 이미 설치됨)를 서랍 안에서 겹쳐 연다. `Dialog.Trigger asChild`는 병종 단추다. `Dialog.Portal > Dialog.Overlay.class-picker-overlay + Dialog.Content.class-picker`.
  - 겹친 창: Radix가 겹친 층을 관리하므로 Esc·바깥 누름은 맨 위의 고르기 창만 닫고 서랍은 열린 채 남는다. 창의 포커스 가둠이 서랍 것보다 먼저 적용된다. 닫히면 Radix가 포커스를 Trigger(병종 단추)로 돌려준다. 고른 칩을 눌러 닫을 때도 같다(`onPick` 뒤 `setOpen(false)`).
  - `z-index`: 창 막은 `.sheet-overlay`·`.sheet`보다 위에 둔다(redesign.css에서 서랍 z 값을 확인하고 그보다 +10).
  - 처음 포커스: `onOpenAutoFocus={e=>{e.preventDefault(); selectedRef.current?.focus() ?? searchRef.current?.focus();}}`.
  - modern-web-guidance에서 모달 항목을 먼저 확인한다. 기본 `<dialog>`가 더 단순하더라도 Radix 서랍의 포커스 가둠·`inert`와 부딪칠 수 있으므로 Radix를 쓴다.
  - 이름표: `Dialog.Title` `병종 고르기`, `aria-describedby={undefined}`.
  - 무기 탭: `전체` + 7개를 `<button aria-pressed>`로 만든다(거르기 단추이므로 tablist가 아님). `aria-label`은 한국어 숙련 이름.
  - 검색: `<input type="search" aria-label="병종 검색">`. 한국어·영어 이름과 증서 이름을 `normalize('NFKC').toLowerCase()`로 포함 검색한다.
  - 결과 수: `<p className="sr-only" aria-live="polite">N개 병종</p>`.
  - 본문: 증서 묶음마다 `<section><h3>초급 증서 · Lv 5 · 명성 1</h3>`. 3부 묶음(코끼리·최상급·신장직)은 머리 글에 `· 3부 해금`을 붙이고 가리지 않는다. 그 아래 `.class-cols`(5열 `보병·원거리·마법·중갑·기마`, 열마다 칩을 세로로)를 둔다. 맨 위에는 고유 병종 칩과 `기록 지우기` 칩.
  - 칩: `<button aria-pressed={selected} title={en}>`. 점 그림 30px(pixelated), 이동 아이콘 10px(보병은 숨김), 한국어 이름(없으면 영어, 말줄임), 무기 아이콘 10px(그 인물의 장점이면 `_boon`). U65 해석: 칩은 yuphastemple로 가는 단추가 아니라 고르는 단추라서 한국어를 쓴다.
  - 보이는 병종은 `allowedClasses(profile.slug)`뿐이다. 결과가 없으면 `맞는 병종이 없습니다.`
  - 창은 열렸을 때만 그린다(`open &&`). 칩이 최대 59개라 서랍을 열 때마다 그리지 않게 한다.
  - 움직임 줄이기 설정에서는 열림 효과가 없다.
- CSS는 자문 §A3·§F5 값 그대로(`/yuphas/listTop.png`·`listCenter2.png`·`listBottom.png`·`buttonLeft.png`·`buttonCenter.png`):
  - 판 폭 `min(1100px,100%)`, 높이 `max-block-size:100%`, 본문 `overflow:auto`.
  - `@media(max-width:1100px){.class-cols{grid-template-columns:repeat(auto-fill,minmax(148px,1fr))}}`(열 이름은 숨김).
  - `@media(max-width:359px){minmax(136px,1fr)}`. 검색 칸은 ≤767px에서 한 줄 100%.
- 규칙: U-e 줄에 "병종은 yuphastemple 모양 고르기 창(그 인물이 고를 수 있는 병종만, DLC 전용 병종 제외)"을 붙이고, 검사 칸에 `scripts/button-gap-check.mjs`를 더한다.
- 검사(`status-browser-check.mjs` `[U-e]` 이어서):
  1. 서랍에서 병종 단추를 누르면 `role=dialog` 이름 `병종 고르기`가 열리고, 칩 수가 `allowedClasses` 수와 같다(기대값은 검사 안에서 `yuphas-classes.json`으로 계산해 단언. 자문 실측은 여성 59·남성 57).
  2. 칩을 고르면 창이 닫히고, 포커스가 병종 단추에 있고, 머리 카드 병종 줄이 바뀌고, 새로 고친 뒤에도 남는다.
  3. Esc는 창만 닫는다(서랍 `role=dialog`는 남음). 포커스는 병종 단추로 간다.
  4. 디트리히 창에 `천익병` 칩이 없다.
  5. 320·390·1440에서 창 안 가로 넘침이 0이다.
  - `button-gap-check.mjs`에는 "인물 서랍 → 병종 고르기 창" 장면을 하나 더해 칩 간격 4px·가장자리 8px를 잰다.

## 커밋 10 (F-5) — `feat: 인물 탭에서 육성 기록을 AI용 글로 복사하기`
- `components/people.tsx` 거르기 줄에 `<Button variant="secondary" disabled={!count}><ClipboardCopy/> AI용 복사</Button>`를 둔다.
  - `navigator.clipboard.writeText(text)`가 실패하면 `<textarea readOnly>`를 담은 작은 Radix Dialog를 띄워 직접 복사하게 한다.
  - 알림: `aria-live="polite"`로 `N명 기록을 복사했습니다.` 기록이 0명이면 단추를 막고 `title="기록이 없습니다"`.
- 글 만들기: 새 순수 함수 `lib/build-text.ts` `buildText({routeLabel, routeEn, date, rows})`. 형식은 자문 §F6 그대로(영어 이름 먼저, 한국어를 괄호로 함께). `plan`·`needs`는 `person.data.finalClasses`·`person.data.skills`에서 가져오고, 기록하지 않은 숙련은 쓰지 않는다.
- 검사: `builds-check.mjs`에 `buildText` 고정 예시(로레타 1명)의 글 전체를 단언한다. `status-browser-check.mjs`에서는 단추가 켜지고 알림 글이 나오는지만 본다(클립보드 권한은 `context.grantPermissions(['clipboard-read','clipboard-write'])`).

## 커밋 11 — `docs: 고침 5건 뒤 배포 관문 검사 결과`
- `node scripts/release.mjs check`가 만든 결과 파일과 `HANDOFF.md`의 yuphastemple 절에 이번 변경 요약 한 단락을 남긴다. 배포(`release.mjs deploy`)는 Fable 검토와 사용자 승인 뒤에만 한다.

---

## 확인 절차(커밋마다 → 마지막에 전체)
1. 커밋마다: `npm run typecheck`, `npm run lint`, `npm run verify`(rules-check 포함). F 커밋에서는 `node scripts/builds-check.mjs`도 돌린다.
2. 화면 커밋(1~5, 8~10): `npm run build` → `node scripts/serve-static.mjs out 3210` → `BROWSER_BASE_URL=http://localhost:3210`으로 그 커밋이 고친 검사를 돌린다. 예: 커밋 3은 `feature-`, `rules-`, `corrections-`, `design-lead-`, `header-browser-check`.
3. 넘침: 1440×900, 390×844, 320×640에서 할 일·인물·준비·서랍·고르기 창의 `documentElement.scrollWidth - clientWidth === 0`을 본다. 이것은 `layout-browser-check`(320 추가)와 `status-browser-check`의 고르기 창 단계가 맡는다.
4. 사용자 미리보기는 `npm run dev`(localhost:3000)로만 하고, 거기서는 체크 칸을 누르지 않는다.
5. 마지막: `node scripts/release.mjs check`를 처음부터 끝까지 통과시킨다(DATA 5개 + 브라우저 12개). 그 뒤 Fable 5.2 검토(`남은 지적(낮음 포함): 0`)를 받는다.

## 위험과 최종 답변에 적을 것(P07)
- 지도 링크에는 원래 장소 정보가 없다. 장소는 묶음 글에서 추정하므로 대부분 루트 지도로 남는다(미리 훑어본 결과 notes 글 기준 22/188).
- 자문은 61개라고 했지만 data.json에는 65개가 있다. 차이는 DLC 4개와 God이다. 그 사이트 코드에서 DLC를 거르는 곳은 찾지 못했지만, 직접 잰 수가 61·57·59라서 DLC를 뺀다.
- 자문과 다르게 한 점 두 가지: 봉사 순서 칩에 초상화를 넣지 않음(같은 신 되풀이), 입력 글자 16px(휴대폰 Safari 확대 방지).
- 인물 탭 표를 서랍으로 옮기면서 U26 싼 선물 검사를 서랍 기준으로 바꾼다. 프로필 선물 목록에 없는 싼 선물이 있는 인물이 나오면 서랍에 싼 선물 줄을 보충한다.
- 디자인 사양의 지원 표 얼굴 위치를 "왼쪽 위"에서 "왼쪽 아래"로 바꾼다.
- yuphastemple이 인물 슬러그를 바꾸면 그 기록은 `sanitizeBuilds`가 버린다. 옛 슬러그 옮김 표는 이번에 만들지 않는다.

---

## Fable 검토

검토 대상: 이 문서(커밋 0~11), 2026-11-27. 근거: 자문 문서 `fixes-round-plan.md`, 워크트리 HEAD `b1137fc`의 코드 읽기, 3200 서버·yuphastemple 실측(자문 때 잰 값). 이번 검토에서 새로 브라우저로 잰 것은 없고, 저장소 파일만 다시 읽었다.

### 승인하는 것

- 커밋 순서와 나눔(D → E → C → 지도 → 준비 → 자료 → 저장 → 입력 → 창 → 복사), 규칙 번호 U68~U72, 검사를 같은 커밋에서 고치는 방식.
- 커밋 1(D) 값 전부. 자문과 같다.
- 커밋 3(C): `nameSlot`, `eachPersonSheet` 도우미, 깨지는 검사 목록. 자문보다 자세하고 맞다.
- 커밋 5(B-2): 이번 주 식사를 화면용 나무가 아니라 `content/data/weekly-support.json`에서 읽는 것(파일 있음을 확인). 자문의 "원자료 확인" 숙제를 풀었다.
- 커밋 7: `validateChecks`가 `builds`를 돌려주게 고치는 것, `importData`의 "파일에 없으면 유지", `clear`가 육성 기록을 남기는 것, `nextBuilds` 순수 함수.
- 커밋 9: Radix Dialog를 서랍의 React 자식으로 겹쳐 여는 것(바깥 누름·Esc가 맨 위 창만 닫는지는 검사 3이 확인).

### 자문과 다른 두 곳에 대한 판정

1. **봉사 순서 칩에 초상화 없음 → 승인.** 같은 신이 순서에 두 번 나오고(크레르 1 → 칼라 3 → 크레르 3) U08(같은 묶음 안 같은 얼굴 한 번)과 지금 검사가 막는다. 칩은 글 + 단계 숫자, 높이는 40px이 아니라 **32px**로 한다(그림이 없으므로). 나머지 값(2px `#39484F`, 바탕 `#192D34`, 첫 미달 칩 `#3B453A`/`#60593E` + `다음`, 채운 칩 흐리게 + ✓)은 자문 그대로.
2. **입력·select 글자 16px → 승인(조건 있음).** 휴대폰 Safari가 16px 미만 입력에서 화면을 키우는 것은 사실이고 U43 본문 16px과도 맞다. 조건: 44px 칸에 `S+`와 기본 화살표가 같이 들어가지 않으므로 등급 select는 `appearance:none; padding:0 2px; text-align:center; text-align-last:center`로 화살표를 없앤다(아래 필수 7).

### 막는 문제(고쳐야 승인)

**1. 병종 수가 틀렸다(커밋 6).** 자문의 "61개"는 그 사이트 `CLASSES` 배열 길이이고 **God을 포함한 수**다(기본 3 = Commoner·Noble·God, 그 뒤 5+12+16+1+16+8 = 58). 계획은 "God과 DLC 4개를 빼면 61"이라고 적었지만 God을 빼면 **60개**다(기본 2 + 58). 계획 안에서도 검사 기대값 `2/5/12/16/1/16/8`의 합은 60이라 "61개" 단언과 서로 맞지 않는다.
   - 고침: 파일에는 60개(God·DLC 4개 제외). 검사는 "60개, 증서별 2/5/12/16/1/16/8"만 단언한다. 여성 59·남성 57(= 고유 1 + 58, 남성은 여성 전용 2개 빠짐)은 그대로 맞다. 커밋 제목·U72 글·최종 답변의 "61"을 모두 60으로.
   - 우리 인물 62명 중 고유 병종이 God인 사람은 없다(`yuphas-characters.json` 확인).

**2. 저장소를 읽을 때 육성 기록을 버리면 안 된다(커밋 7 `readStored`).** 계획은 저장소 값을 `sanitizeBuilds(d.builds, buildCatalog)`로 읽는다. 그러면 병종·인물 자료가 잠깐 잘못 만들어지거나 슬러그가 바뀐 날, 화면을 여는 것만으로 기록이 메모리에서 빠지고 다음 저장(체크 한 번) 때 **영영 지워진다**. "기존 기록을 지우지 않는다"는 요구에 어긋난다.
   - 고침: `readStored`는 **catalog 없이** 모양만 고친다(모르는 인물·병종 키는 그대로 보관, 화면만 안 그림). 엄격 검사는 가져오기에만.
   - 검사 추가(`builds-check.mjs`): 모르는 인물 슬러그가 든 저장 값을 `readStored`와 같은 길로 읽은 뒤 `nextBuilds`로 다른 인물을 고쳐도 그 모르는 항목이 남는다.

**3. 빈 `builds`가 기록을 지운다(커밋 7).** 계획은 "빈 `{}`도 그대로 돌려준다(파일이 이긴다)"고 했다. 그러면 육성 기록을 한 번 넣었다 지운 브라우저에서 내보낸 파일(`"builds": {}`)이나 손으로 만든 파일을 가져올 때 지금 기록이 통째로 사라진다.
   - 고침: (가) `nextBuilds`가 비면 `builds` 키 자체를 없앤다(저장·내보내기에 `{}`가 남지 않게). (나) 가져오기에서 `builds`가 없거나 **루트가 하나도 없는 빈 객체**면 "없음"으로 보고 지금 기록을 유지한다. Q6(파일에 기록이 있으면 통째로 바꿈)은 그대로.
   - 검사 (가)에 "`builds: {}` 파일은 없는 파일과 같게 처리" 한 줄 추가.

**4. 못 타는 인물 규칙은 `type`으로(커밋 6).** 그 사이트는 병종의 `type`에 `cavalry`·`flying`이 있는지로 거른다. 계획은 `moves`(이동 아이콘 표)로 거른다. 두 표가 같은 병종을 가리키는지 확인된 적이 없다.
   - 고침: 스크립트가 `type`에서 `mounted: boolean`을 계산해 행에 넣고, 허용 규칙은 `noRide && mounted`로 거른다.

**5. 지도 연결이 188개 중 22개뿐이다(커밋 4).** 사용자 결정 Q3은 "할 일 지도 단추도 바꾼다"인데 이대로면 166개가 그대로 루트 첫 쪽이다. 장소를 글에서 추정하는 것은 틀릴 위험도 있다.
   - 고침: 단추 주소를 세 단계로 정한다. ① 묶음 글에서 그 루트 지도의 장소가 정확히 하나 → `placeUrl(route, slug)`(영어 장소 이름 단추). ② 아니고 묶음의 yuphastemple 물품이 정확히 하나 → `mapUrl(route, 물품 영어 이름)` = `/map/<루트>/?q=<이름>`(그 물품이 있는 곳만 표시되는 것이 조사 문서 §1에서 확인됨. 단추 글은 `World Map`). ③ 둘 다 아니면 지금처럼 루트 지도.
   - 장소와 물품이 둘 다 하나씩이면 `placeUrl(route, slug, 물품 영어 이름)`.
   - 검사는 세 종류의 개수를 출력하고, 최종 답변에 "장소 N · 검색 N · 루트 지도 N"을 그대로 적는다(P07). U65 줄 글도 세 단계로.
   - `scripts/yuphas/places.mjs`는 `.tmp/yuphas/ydata/`가 없으면 "먼저 `scripts/yuphas/fetch.mjs`를 돌리라"는 말과 함께 실패하게 한다(지금 폴더에는 `locations.json`이 보이지 않았다 — `data.json`·`gifts.json`·`ids.json`·`app.js`만 확인).

**6. 휴대폰 탭 빈 칸 두 곳(새 항목, 커밋 2에 넣거나 따로 `fix:` 커밋 하나).**
   - 팀 화면: `app/redesign.css` 655줄은 탭이 넷일 때 만든 2×2 격자다. 탭이 셋(최종 25인·백마술·루트 편성)이 되어 넷째 칸이 빈다. 고침: `@media(max-width:359px){.team-page .team-head .ui-tabs-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.team-page .team-head .ui-tabs-list button{padding:0 4px;min-inline-size:0;white-space:nowrap}}` — 한 줄 3칸(320px에서 칸 약 96px, 가장 긴 글 "최종 25인"·"루트 편성"은 16px 글자로 약 72px), 높이 44px 유지. 글이 칸을 넘으면 그 폭에서만 글자 15px.
   - 루트 화면: `app/redesign.css` 154줄 `.guide-navigation{grid-template-columns:repeat(5,…)}`도 탭이 다섯(참고 문서 포함)일 때 값이다. 지금 탭은 넷이라 390px에서 다섯째 칸이 빈다(자문 때 찍은 390 화면에서 탭 넷이 폭의 4/5만 차지). 고침: `repeat(4,minmax(0,1fr))`.
   - `docs/design-spec.md` 359줄("네 탭을 2×2 격자")을 "세 탭 한 줄 3칸"으로, 655줄 위 주석도 같이 고친다. 검사: `button-gap-check.mjs`(320)와 `team-fit-check.mjs`에 "탭 줄의 마지막 탭 오른쪽 끝이 탭 상자 오른쪽 끝에서 8px 안" 단언을 더해 빈 칸이 다시 생기면 실패하게 한다(루트 화면 탭 줄도 같은 단언).

**7. 등급 select가 칸에 안 들어간다(커밋 8).** 위 판정 2의 조건. `appearance:none`, 가운데 정렬, 폭 44px·높이 32px(U55 최소 32px. 자문의 28px은 취소), 포커스 바깥선 2px `#FFE8C4`. 검사: 320px에서 `S+`를 고른 select의 `scrollWidth <= clientWidth`.

### 꼭 고칠 작은 것

8. 커밋 3: 격자 카드의 큰 초상화에 `loading="lazy"`(인물 30명 안팎 × 큰 그림). `CharacterHeader`에 인자로 넘긴다(서랍은 지금처럼 바로 불러옴).
9. 커밋 5 ④: 나무에서 "장을 넘기기 전" 절을 제목 글로 찾는 것은 깨지기 쉽다. `lib/prep.ts`가 줄 수 ≠ 3이면 빌드에서 오류를 던지게 한다(조용히 빈 묶음이 되지 않게).
10. 커밋 5 ③: 시험 단계 숫자를 상수로 두었다가 커밋 6에서 `licenses`로 바꾸는 방법 승인. 단 커밋 6의 `builds-check.mjs`에 "준비 탭이 쓰는 값 = `licenses` 값" 단언을 넣어 두 곳이 어긋나지 않게 한다.
11. 커밋 8: 레벨 칸의 로컬 값은 저장 값이 바뀌면(가져오기·다른 탭) 따라가야 한다(`key={저장 값}` 또는 초점이 없을 때 동기화). 검사 4(가져오기 뒤 화면 복원)가 서랍을 연 채로도 통과해야 한다.
12. 커밋 10: 복사 실패 때 Dialog를 하나 더 띄우지 말고 거르기 줄 아래에 `<textarea readOnly>`를 그 자리에 편다(창 세 겹을 피한다).
13. 커밋 0: `docs/design-spec.md`에 넣는 절에 이 검토의 판정 값(칩 32px, select 16px·32px·화살표 없음, 병종 60개, 팀 탭 3칸)을 반영한다. 자문 문서 사본 맨 위에 "검토에서 바뀐 값은 fixes-impl-plan.md 끝 참고" 한 줄.
14. 브라우저 검사의 새 단계는 `BROWSER_BASE_URL`이 `localhost:3000`이면 바로 멈추게 한다(체크 칸을 누르고 저장소를 비우는 단계라서, P05).

### 남는 위험(막지는 않음)

- 지도 ①의 장소 추정은 묶음 글에 장소가 하나뿐이어도 그 지도 단추가 가리키는 곳과 다를 수 있다. 배포 전 ①로 잡힌 묶음 목록을 한 번 눈으로 본다(22개 안팎이라 가능).
- 겹친 창의 휴대폰 Safari 동작(뒤 화면 스크롤 잠금, `backdrop-filter`)은 자동 검사로 못 본다. 미리보기에서 사용자가 한 번 확인.
- yuphastemple이 슬러그를 바꾸면 그 기록은 화면에 안 보인다(필수 2대로 저장 값은 남는다).

### 필수 변경 목록

1. 병종 수 61 → 60(God 제외), 검사·규칙 글·답변 모두.
2. `readStored`는 catalog 없이 읽어 모르는 육성 기록을 버리지 않는다 + 검사.
3. 빈 `builds`는 저장하지 않고, 가져오기에서 빈 객체는 "없음"으로 처리 + 검사.
4. 못 타는 인물은 병종 `type`(→ `mounted`)으로 거른다.
5. 지도 단추 세 단계(장소 → 물품 검색 → 루트 지도), 개수 보고, `places.mjs` 원본 없을 때 안내.
6. ≤359px 팀 탭 3칸, 휴대폰 루트 탭 4칸, 사양 문서·검사 갱신.
7. 등급 select: 16px, 화살표 없음, 44×32px, 넘침 검사.
8. 카드 초상화 `loading="lazy"`.
9. "장을 넘기기 전" 3줄이 아니면 빌드 오류.
10. 준비 탭 시험 값 = `licenses` 값 단언.
11. 레벨 칸이 저장 값 변화를 따라감.
12. 복사 실패 때 그 자리 textarea.
13. 디자인 사양에 판정 값 반영.
14. 새 브라우저 검사 단계는 3000번 서버에서 멈춤.
15. 봉사 순서 칩 높이 32px(초상화 없음 승인에 따른 값).

판정: 수정 후 승인
