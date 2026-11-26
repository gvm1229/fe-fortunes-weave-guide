> 검토에서 바뀐 값(병종 60개, 칩 32px, 등급 칸 16px·44×32·화살표 없음, 팀 탭 3칸 등)은 [fixes-impl-plan.md](fixes-impl-plan.md) 끝 "Fable 검토"를 따른다.

# 고침 5건 계획 · 디자인 값 (Fable 5.2 자문, 2026-11-27)

대상: 워크트리 `yuphas-design-sample` (HEAD `068e771`). 이 문서는 자문이다. 코드는 Opus 5.5 중간 강도가 쓴다(P12).
조사 방법: 저장소 읽기 + `http://localhost:3200/theodora/1/` 실측(1440·390, 체크 칸 안 누름) + yuphastemple.com 실측(`/loretta/builder/`, `/loretta/build/`, `/dietrich/builder/`, `data/app.js?h=3149a9b3bc`, `data/style.css?h=d468e14895`).
"실측" = 브라우저에서 잰 값. "코드로 확인" = 그 사이트 JS·CSS를 읽은 값. "제안" = 내가 정한 값(사양에 없으므로 사용자 승인 필요한 것은 §G 질문에 넣음).

권장 작업 순서(커밋은 하나씩, P11): D → E → C → B → F(자료 → 저장 → 화면 → 고르기 창 → 복사).

---

## A. yuphastemple 육성 도구 분해

### A1. 쪽 구성 (실측·코드로 확인)

| 주소 | 이름 | 내용 |
|---|---|---|
| `/<인물>/builder/` | growth calculator | 맨 위 `Create a build (beta)` 단추 → 입력 줄(Lv. + 능력치 9개 + Total) → Reclass bonus stat finder → Growth calculator(Level / Recruited at Lv. / Future Lv., Simple·Advanced mode, Yours·Expected·Difference·Future 표) |
| `/<인물>/build/` | build creator | `Level`, `Recruited at Lv.` 두 숫자 칸 → 2열: 왼쪽 Inventory(6칸)·Combat arts(3칸)·Attack Magic·Assist Magic / 오른쪽 Personal Ability(고정 1)·Equipped Abilities(5칸) |
| 왼쪽 인물 카드(모든 탭 공통) | — | 이름 ▾(인물 고르기), 병종 ▾(**Choose a class**), 탈것 ▾, `No battalion ▾`, 숙련 6×2 그림, Basic Stats, Combat Stats |

- 능력치 9개: `HP Str Mag Spd Dex Def Res Lck Cha` (+ Total 자동).
- **중요: 그 사이트 육성 도구에는 "숙련(검술·창술 …) 등급" 입력 칸이 없다.** 숙련은 카드에 장점·약점 그림으로만 나온다. 등급 글자는 마법·기술 목록에 조건 표시로만 쓰인다(`Fire D`, `Thoron A`).
- 이 게임의 "기능/숙련 레벨" = 12개 숙련의 등급. 숙련 이름(그 사이트 순서): `Sword, Spear, Axe, Bow, Gauntlet, Black Magic, White Magic, Authority, Infantry, Riding, Armor, Flying`. 등급 순서(`RANK_ORDER`, 코드로 확인): `E, E+, D, D+, C, C+, B, B+, A, A+, S, S+` (12단계).
- 레벨 범위: 입력 `min=1 max=99 maxlength=2`, `statCalcMax = 99`(코드로 확인).

### A2. 숫자 칸(스테퍼) (실측)

- 묶음 `.scNum`: `inline-flex`, 전체 51×31px, 바깥 여백 `1px 2px`.
- 입력 `.scIn`: 31×31px, 테두리 `1px solid var(--line)`(= `#383D38`), 바탕 투명, 가운데 정렬, `inputmode="numeric" pattern="[0-9]*"`, 브라우저 화살표 숨김.
- ▲▼ 단추 `.scStep`: 19×15px 둘을 위아래로(사이 1px), 글자 8px, 테두리 1px `--line`, 호버 바탕 `--sel`. `tabindex="-1"`(키보드는 입력 칸에서).
- 줄 `.levelContainer > span`: `display:flex; gap:8px; justify-content:space-between`, 이름표는 굵게.
- 목록 줄 `.bcRow`: 421×26px, 아래 1px `--line`, 호버 시 선 색 `--text`. 빈 칸은 `images/abilities/_empty.png` + "Empty". 구역 제목 `.calcTitle`: small-caps, 자간 .08em, 1.08em, 굵게, 왼쪽 1em.
- 2열 `.bcCols`: `grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0 20px`, 700px 이하 1열.

### A3. "Choose a class" 창 (실측 1440×900 + CSS)

**열기**: 카드의 병종 단추 `.pk[data-k=cl]` → `openPicker('cl')`.
**닫기**: ✕ 단추, 바깥(어두운 막) 누름, Esc. 닫을 때 스크롤 0으로.

| 부분 | 값 |
|---|---|
| 막 `#md` | `position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(4px); padding:8px; display:flex; align-items:flex-start; justify-content:center; z-index:9` |
| 판 `.mb` | 너비 100%(1440에서 1424×884), `max-height:100%`, 바탕 `#142324` + `images/listCenter2.png`(100% auto, 가운데), 위 `::before` `listTop.png`(1100px 이하는 `listBottom.png`을 뒤집음), 아래 `::after` `listBottom.png`. 세로 flex |
| 머리 `.mh` | flex, gap 4px, 줄 바꿈 허용. 왼쪽 굵은 제목 `Choose a class`(15px, 오른쪽 여백 10px) → 무기 탭 → 오른쪽 끝 검색 칸 → ✕ |
| 무기 탭 `#mtb` | `All, Sword, Spear, Axe, Bow, Gauntlet, Black Magic, White Magic` 8개. 탭 높이 29px, 글 15.84px, 테두리 2px `#39484F` 바탕 `#192D34`. 고른 탭은 알약 그림(`buttonLeft.png` + `buttonCenter.png`) 글 `#FFF4D9`. 아이콘 `images/skills/<이름>-v2.png` |
| 검색 `#mf` | 250×29px, 2px `#484E44`(포커스 `#60593E`), 바탕 `#192D34`, 글 15.84px `#ECEBF3`, 왼쪽 돋보기. 안내 글 `Search name, license, skills, abilities…`. 이름·증서·레벨·명성·제한·이동·탈것·숙련·기술을 한 글로 묶어 포함 검색 |
| ✕ `#mx` | 30×30px, 안쪽 25×25 `#3A1D1D` 바탕 + 2px `#60593E` + `#FFE8C4` X 선 |
| 본문 `#mc` | `overflow:auto` |
| 표 `.classModal` | `width:auto; margin:0 auto`(1440에서 854px 폭 가운데). **5열**: `Infantry, Ranged, Magic, Armor, Riding`(비행은 Riding 열). 칸은 위 정렬, 테두리 없음 |
| 묶음 머리 `th` | 5열 합침, 작은 글, 위 12px 아래 2px. 글: `Beginner license · Lv. 5 · Renown 1` / `Specialty license · Lv. 20 · Renown 4` / `Advanced license · Lv. 35 · Renown 8` / `Elephant license · Lv. 35 · Part 3 Unlock` / `Master license · Lv. 45 · Part 3 Unlock` / `Divine license · Lv. 45 · Part 3 Unlock · Limited to one unit at a time` |
| 첫 줄 | 머리 없이 그 인물의 고유 병종 하나(Commoner 또는 Noble)만 첫 열에 |
| 병종 칩 `.rc` | 140×34px(안쪽 높이 30px), `display:flex; gap:4px; margin:0 8px 4px; padding-right:8px`, 2px `#39484F`, 바탕 `#192D34`, 줄 높이 2em. 왼쪽 병종 점 그림 `.ci` 30×30 (`images/classicons/<female|male>/<Name>.webp`), 그 위 왼쪽 위에 이동 아이콘(18px을 .55배 = 약 10px, 보병은 숨김), 이름(넘치면 말줄임), 오른쪽 위에 쓸 수 있는 무기 아이콘(18px을 .55배, 인물의 장점이면 `_boon` 그림) |
| 고른 칩 `.rc.active` | 바탕 `#3B453A`, 테두리 `#60593E` |
| 3부 가림 | Elephant·Master·Divine 줄은 `data-spoil="3"`: `backdrop-filter:blur(6px)` + "Click to reveal (Part III)". 누르면 묻고 풂(`localStorage spoilerPart`) |
| 1100px 이하 | `tr{display:flex; flex-wrap:wrap}`, `td{flex-basis:max(33.3%, min(50%, 200px))}`, 빈 칸 숨김 → 2~3열로 접힘 |

**어떤 병종이 보이나**(코드로 확인, `buildPicker`·`renderModalClasses`):
1. 전체 61개 = 고유 3(Commoner·Noble·God) + Beginner 5 + Specialty 12 + Advanced 16 + Elephant 1 + Master 16 + Divine 8.
2. 고유 병종은 그 인물 것 하나만(`uniqueClass`, 없으면 Commoner). Noble인 인물: Bertrand, Bonaventure, Ludia, Lysander, Nathan, Olympia, Peppe, Theodora, Tobias.
3. 성별 제한: `Wing Soldier`, `Celestial Trooper`는 여성만. → 남성(Dietrich)은 57개, 여성(Loretta)은 59개.
4. 못 타는 인물(고유 능력 글 "cannot change class to cavalry or flying"): `Goliath`, `Orchel` → `type`에 cavalry·flying이 든 병종 제외.
5. 무기 탭을 고르면 그 무기를 쓰는 병종만(고유 병종은 All에서만).
6. 열 배치: 손으로 정한 표 `CLASS_COLUMN`(Infantry: Dancer, War Monk, The Apsara, The Godhand, Blacksmith, High Savant, Seere / Ranged: Bow Knight, Forest Knight / Magic: Valkyrium, Troubadour / Armor: Guardian, Sentinel, Orichaldia, The Cavalier, The Trident, Elephant Rider, Light Cavalry, Charioteer, Bardinger) → 없으면 이동 둘째 종류 → 보병+마법이면 Magic → 보병+활이면 Ranged → 비행은 Riding.

### A4. 상태 저장·공유 (코드로 확인)

- **저장소(localStorage)에 육성 기록을 두지 않는다.** localStorage는 `itemView`, `showPairedEndings`, `spoilerPart` 세 가지 표시 설정뿐.
- 육성은 **주소에 담는다**: 병종·탈것·부대는 경로(`/<인물>/<병종>/…`)와 쿼리, 나머지는 `?b=<코드>`. 코드는 (칸 번호 1바이트 + 값 2바이트) 묶음을 큰 수로 이어 글자로 바꾼 것(`buildEncode`). 칸 번호: tool 255, level 1, recruit 2, beginner 3, specialty 4, advanced 5, future 6, battalion 7, stat 16~24, item 32~, ability 40~, art 48~, spell 56~, forge 64~.
- 바꿀 때마다 `history.replaceState`로 주소만 갈아 끼운다 → **공유 = 주소 복사**. 따로 내보내기 단추는 없다.
- 우리에게 주는 뜻: 그 사이트 방식(주소)은 "루트마다 여러 인물 기록을 오래 보관"에 맞지 않는다. 우리는 기존 체크 기록 저장소를 쓴다(§F).

### A5. 우리가 가진 그림·자료 (저장소 확인)

- 병종 점 그림: `public/yuphas/classes/female/*.webp` 60개, `male/*.webp` 58개(슬러그 이름).
- 숙련 그림: `public/yuphas/icons/skills/<skill>.png`, `_boon`, `_bane`, 이동 `infantry|riding|armor|flying-flat.png`.
- 창 틀 그림: `public/yuphas/listTop.png`, `listCenter2.png`, `listBottom.png`, `buttonLeft.png`, `buttonCenter.png`, `buttonInactiveBG5.png`, `dividerT.png`, `tileBg2.png`, `tileBg3.png`, `searchboxRepeat.png`, `searchboxRight.png`, `popup/*`.
- 병종 한국어 이름: `content/data/yuphas-names.json`의 `classes`, `assets/classes/manifest.json`(58개). 한국어가 없는 것: `orichaldia`(+ 고유 `commoner` 평민·`noble` 귀족은 yuphas-characters에 있음) → U65대로 영어만.
- **없는 것**: 병종별 증서 단계·성별·종류(type)·쓸 수 있는 무기·열 배치. `yuphas-characters.json`에는 인물별 `classes.start/unique/beginner/specialty/late`와 숙련 기본 등급·장단점만 있다. → 새 자료 파일 필요(§F2).

---

## D. 지원 표 얼굴 잘림 (요청 3) — 원인과 고침

**원인(실측)**: 얼굴 그림 62장은 모두 96×64px. CSS는 `.y-support-ch{background-size:auto 3.6em; background-position:-6px top}` → 글자 15px에서 얼굴 높이 **54px**. 그런데 표 줄 높이는 글 한 줄이면 **38px**(위 7.5 + 글 24 + 아래 6 + 선 1)이라 얼굴 아래 16px(약 30%)이 잘린다. 등급 칸이 두 줄로 넘어간 줄만 62px이 되어 얼굴이 다 보인다(세오도라 서랍 16줄 중 5줄만 62px, 나머지 11줄 38px). 그림 크기 차이가 아니라 **줄 높이가 얼굴보다 낮은 것**이 원인.
휴대폰: `@media(max-width:767px)` 안에 `.y-support-ch` 규칙이 두 번 있고(992줄 3em, 994줄 2.6em) 뒤 것이 이겨 얼굴 39px, 줄 38px → 1px 잘림.

**고침(app/redesign.css)**:
```css
.y-support-table{--face-h:54px}                       /* 96×64 그림을 81×54로 */
.y-support-table tbody :is(th,td){block-size:calc(var(--face-h) + 2px)} /* 표 칸의 높이는 최소 높이로 동작 → 56px */
.y-support-ch{background-size:auto var(--face-h);background-position:-6px bottom;vertical-align:middle}
.y-support-table td{vertical-align:middle}
@media(max-width:767px){.y-support-table{--face-h:40px}}   /* 60×40 */
```
- 965줄의 `background-size:auto 3.6em;background-position:-6px top`과 `vertical-align:top`을 위 값으로 바꾼다. 992줄(3em)·994줄(2.6em)의 `background-size`는 지운다(변수로 대체). 이름 왼쪽 여백: 데스크톱은 그대로 `calc(5em - 4px)`(71px. 얼굴이 보이는 폭은 81px에서 왼쪽 6px을 뺀 75px이라 이름이 얼굴 끝에 4px 겹치는 지금 모양 유지). 휴대폰은 얼굴이 60px 폭(보이는 폭 54px)이 되므로 `padding-inline-start:58px`로 바꾼다(지금 `calc(3.4em - 4px)`=47px은 7px 겹침).
- 아래 정렬(`bottom`)인 이유: 얼굴 그림은 아래가 잘린 반신이라 줄 선에 붙어야 두 줄짜리(62px) 칸에서 떠 보이지 않는다.
- 같은 클래스를 쓰는 루트별 지원 대화 표(`[data-support-pairs]`)에도 적용된다. 그 표는 줄이 이미 높아 영향 없음(확인 필요).
- 검사 추가: `rules-browser-check.mjs`에 "서랍 지원 표의 모든 `tbody th` 높이 ≥ 얼굴 높이(`--face-h`)" (U67에 붙임).
- 미확인: yuphastemple 지원 탭의 줄 높이는 이번에 다시 재지 않았다(분해 문서 §2 참고). 위 값은 우리 화면 실측 기준.

## E. 팀 화면 단추 (요청 4)

- 자리: 루트 머리 `.guide-topbar` 왼쪽, `첫 화면` 링크 **바로 오른쪽**. 지금 머리는 자식 둘(`.guide-home`, `.guide-scope`)을 양 끝에 두므로, 둘을 묶는 `<div className="guide-links">`(flex, gap 8px)를 만들고 그 안에 `첫 화면` + 새 링크.
- 마크업: `<Link className="guide-home guide-team" href="/team/" aria-label="최종 25인 팀 화면"><Users size={22}/><span>팀 25인</span></Link>` (lucide `Users`).
- 모양: `.guide-home`과 완전히 같음(글 18px, 아이콘 22px, gap 8px, 빛 `text-shadow` 같은 규칙에 `.guide-team` 포함은 클래스 공유로 자동).
- 휴대폰(≤767px): 글 숨기고 아이콘만, 44×44px(지금 `.guide-home`과 같음). ≤359px(320px): 두 아이콘 단추 36×36px, gap 8px(U55 최소 32px 충족, U37 4px 이상 충족) — 머리 폭 288px 안에 `36+8+36` + 오른쪽 묶음(초상화·이름·1부·2부 약 190px)이 들어가게.
- 팀 화면의 `루트 선택` 뒤로 링크는 그대로 `/`.
- 검사: `header-browser-check.mjs`(머리 고정·넘침), `button-gap-check.mjs`(360·390·768·1440 + 320)에 새 단추 포함. `rules-check.mjs`에 "shell.tsx에 `/team/` 링크 있음" 한 줄.

## C. 인물 탭 다시 그리기 (요청 1)

**방향**: 인물 탭 = **인물 카드 격자**(서랍 머리 카드 `CharacterHeader`를 그대로 재사용). 자세한 내용은 카드를 눌러 여는 **인물 서랍** 한 곳에만 둔다. 지금 탭의 긴 표·접기(`PersonInfo more`)는 탭에서 없앤다(같은 내용이 서랍에 그대로 있음 → 중복 제거).

1. **거르기 줄**(위): 검색 칸(yuphastemple 검색 칸 모양: 높이 32px, 2px `#484E44`, 바탕 `#192D34`, 포커스 `#60593E`) + 역할 탭 `전체·본대·보완·선택·수집`(지금 화면 탭과 같은 단추 모양, 높이 32px, 고른 탭은 알약 그림) + 오른쪽 `N명` + `시험 안내` 단추 + (§F) `AI용 복사` 단추. `육성판 목적` 고르기 칸과 `필터 지우기`는 없앤다(제안 — 탭 하나로 충분).
2. **격자** `.people-grid`: `grid-template-columns:repeat(auto-fill,minmax(420px,1fr)); gap:16px` → 1440px(본문 1392px)에서 3열(약 453px), 1000~1439px 2열, ≤767px 1열(`minmax(0,1fr)`), 320px에서도 1열 288px.
3. **카드** = `<article class="y-card person-card">` 안에 `CharacterHeader` 내용 그대로:
   - 큰 이름(한국어, 32px·휴대폰 26px, 빛) + 영어 이름 단추(yuphastemple 새 탭)
   - 병종 줄: **이 루트에 기록한 병종**(§F, 없으면 지금처럼 시작 병종) 점 그림 36px + 한국어 이름 + 이동 아이콘 + `Lv 20`(기록 있을 때만, 15px `#ACAAB9`)
   - 숙련 6×2 그림(장점 ▲·약점 ▼). 기록한 등급이 있으면 그림 오른쪽 아래에 등급 글자(11px, 검정 외곽) — 읽기 전용
   - 배지 줄 `PersonTags`(역할·최종 25인·지원·명성)
   - 뒤 소속 문장, 오른쪽 큰 초상화(지금 `.y-card` 그대로)
   - 높이: `min-block-size:220px`(서랍은 250px, 격자에서는 220px; 휴대폰 200px).
4. **누르면 서랍**: 이름을 `<button class="person-card-open">`으로 만들고 `::after{position:absolute;inset:0}`로 카드 전체를 누를 곳으로. 영어 이름 단추는 `position:relative;z-index:1`로 위에. 호버: 테두리 `#60593E`, 바탕 `#3B453A`(타일 호버 값). 포커스: 2px `#FFE8C4` 바깥선.
   - `Guide`의 `setPerson(p.id)`를 `People`에 `onPerson`으로 넘긴다(지금 `People`은 서랍을 못 연다).
5. 정렬은 지금 그대로(역할 → order).
6. **규칙·검사 영향(반드시 같이 고침)**: U02(인물 정보 표), U26('서랍·인물 카드의 선물 목록'), U54(표 머리 칸 폭) 검사가 `.people-grid .person` 안의 표를 본다면 서랍 기준으로 옮긴다. `docs/user-rules.md` U02·U26 줄에 "인물 탭 카드는 머리 카드만, 표·선물은 서랍"을 대체로 적는다(P08). `scripts/`에서 `people-grid|\.person\b|person-summary`를 찾아 고칠 것.
7. 지울 것(내 변경이 만든 고아만): `People`의 `Card`·`PersonHeading` 사용, `PersonInfo`의 `more`·`openKey` 인자(팀 화면 등 다른 곳이 안 쓰면).

## B. 준비 탭 처음부터 다시 (요청 2)

### B1. 지금 무엇이 있나 (실측, 세오도라 1부)

- 표 **68개**, 그림 169개, 휴대폰에서 전체 높이 **47,134px**(접기를 다 열면). 구성:
  1. `가호와 주간 봉사`: 신 초상화 줄 + 기록 표(항목·봉사 순서·종료 목표·축복).
  2. 접기 `축복·보존·시험의 공통 기준`: 13개 절(가호 누적 목표, 다음 루트에도 남는 것, 전직 시점·경험치, 최종 25명 목표, 출격과 육성 준비는 별개, 병과·육성 공통 기준, 이번 주, 남은 미영입 대상, 다음 로드 선행 식사, 상점에서 먼저, 장을 넘기기 전, 필요한 자격만 바로, 부별 해금, 알렉산드라 예외).
  3. 접기 `이 구간의 준비와 운영 안내`: `1부 · 실전과 보충 육성` + 장마다 `N장 · 골드` + `N장 · 전직 준비 점검` × 12.
- **중복**: 3번의 장별 골드는 `재료와 구매` 탭 "장별 골드"와 같고, 장별 골드·전직 준비 점검은 `할 일` 탭 각 장 안에도 똑같이 나온다(할 일 탭 제목 목록에서 확인). 최종 25명 목표는 `/team`과 겹친다.
- 넘침: 3200 서버 DOM 측정에서는 390px 가로 넘침 0건이었다(다른 작업자가 이미 고쳤을 수 있음. 배포판은 미확인). 그래도 모양은 옛 기록 표(`Records`)·옛 문서 나무(`Semantic`)라 다른 화면과 맞지 않는다.
- 지도: 준비 탭 안에는 지도 링크가 **하나도 없다**(`지도·공통 의뢰`, `위치`라는 낱말만). 할 일 탭의 지도 단추는 모두 `World Map ↗` → `https://yuphastemple.com/map/theodora/`(장소·검색어 없음).

### B2. 무엇을 남기나 (제안 — §G 질문 Q2)

| 남김(그림으로) | 뺌(화면에서만. 글은 `docs/reference/prep-common.md`로) |
|---|---|
| ① 가호 봉사 순서와 내 가호 레벨 | 시작 확인·다음으로 넘길 것 같은 "실제 값을 확인하세요" 글 |
| ② 이번 주 식사 조·영입 대기 인물(얼굴) | 다음 루트에도 남는 것, 전직 시점·경험치, 출격과 육성 준비는 별개, 병과·육성 공통 기준, 필요한 자격만 바로, 부별 해금 |
| ③ 시험 단계(증서·레벨·명성) | 알렉산드라 예외(그 인물 서랍의 계획에 이미 있는 내용) |
| ④ 장을 넘기기 전 확인 3줄 | 최종 25명 목표 → `팀 25인` 단추로 대체 |
| ⑤ 지도·팀 바로가기 | 접기 `이 구간의 준비와 운영 안내` 전체(할 일·재료 탭과 중복), `상점에서 먼저`의 무기 표(재료와 구매 탭 "구매 계획"과 중복) |

결과: 표 0개, 한 화면 반 정도 길이.

### B3. 배치

공통: 묶음(판) = `<section class="prep-panel">`: 제목은 서랍과 같은 `.y-section-title`(16.2px, 자간 .08em, 아래 `dividerT.png` 선), 안쪽 여백 0, 묶음 사이 32px. 모든 flex 줄은 `flex-wrap:wrap`, 모든 격자 칸은 `minmax(0,1fr)` 또는 `auto-fill`, 표·고정 폭 없음.

**1440px**: `.prep-content{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:32px 24px}`. ①은 두 열 합침(`grid-column:1/-1`), ②·③ 나란히, ④·⑤ 나란히.
**≤999px(390·320 포함)**: 1열, 순서 ①②③④⑤.

① **가호와 주간 봉사** (자료: `god-service-plan.json`의 `routes[route].queue/end/boons`, `priority`, 내 상태 `status.gods`, 그림 `assets/gods/manifest.json`)
- 봉사 순서 줄: 칩을 화살표로 잇는다. 칩 = 신 초상화 32×32(1px `#383D38`) + 이름 + 목표 단계 숫자(굵게). 높이 40px, 2px `#39484F`, 바탕 `#192D34`, 칩 사이 `→`(`#ACAAB9`, 좌우 6px). 내 가호 레벨이 있으면: 이미 채운 칩은 흐리게(`opacity:.55`) + ✓, **첫 미달 칩**은 바탕 `#3B453A`·테두리 `#60593E` + 작은 글 `다음`. (지금의 "다음 봉사 목표" 문장을 대체)
- 신 타일 줄: 여섯 신 모두. 격자 `repeat(auto-fill,minmax(96px,1fr)); gap:6px`(yuphastemple 타일 값). 타일 = 2px `#39484F`, 바탕 `#192D34`, 초상화 1:1 `object-fit:cover; object-position:center top`, 이름 16px 굵게(검정 외곽), 아래에 단계 점 3개(채움 `#FFE8C4`, 빈 점 `#39484F`, 점 8px·사이 4px; 내 상태가 없으면 점 대신 목표 숫자만). 320px에서는 3열(약 92px).
- 축복 구매: 배지 줄(`KoBadge` 모양) `칼라 20% · 300`. (300의 단위는 자료에 없음 → 지금 화면과 같이 숫자만. 미확인)
- 종료 목표 한 줄: `end` 글 14px `#ACAAB9`.
- 2부: 식사 없음 한 줄 + 진입 목표 신 타일. 3부: `service`가 글 한 줄뿐 → 신 타일 + 그 한 줄.

② **이번 주 식사** (자료: `parity.prep`의 `data-weekly-route` "이번 주" 절과 "남은 미영입 대상", "다음 로드 선행 식사")
- 얼굴 타일 줄: 얼굴 48×48(1px `rgba(60,77,80,.5)`, 바탕 `rgba(39,68,78,.35)` — 영입 목록 `.rt` 값) + 아래 이름 14px. 누르면 인물 서랍(`portrait-button`, U50과 같은 동작). 줄 제목 셋: `이번 주`(주인공 + 두 명), `영입 대기`, `다음 루트 먼저`. 같은 묶음 안 같은 얼굴은 한 번만(U08).
- 조건 금액·물품(예: 미카엘라 3,000G, 로레타 철의 검 3개)은 얼굴 아래 배지로. 물품은 U65대로 한국어 배지 + 영어 단추 + `Map ↗`(§B4).
- 구현 주의: 지금 이 자료는 화면용 나무(`Tree`)라서 얼굴·이름을 뽑으려면 나무에서 `img[src*=portraits]`의 alt를 읽어야 한다. 더 안전한 길: `content/data/`에 원자료가 있으면 그것을 쓴다(코드 작성자가 `scripts/regen-parity-*.mjs`에서 출처 확인). 원자료를 못 찾으면 이 묶음은 기존 `Semantic`으로 그 세 절만 그리고(표가 섞이지 않는 절만), 질문으로 남긴다.

③ **시험 단계** (값은 yuphastemple 병종 창 머리에서 확인)
- 타일 격자 `repeat(auto-fill,minmax(140px,1fr)); gap:8px`: `초급 · Lv 5 · 명성 1` / `중급 · Lv 20 · 명성 4` / `상급 · Lv 35 · 명성 8`. 3부 화면에서만 추가: `코끼리 · Lv 35`, `최상급 · Lv 45`, `신장직 · Lv 45 · 한 번에 1명`.
- 타일: 증서 물품 아이콘 40px(`yuphasItem('초급 증서')` 등, 없으면 병종 점 그림) + 한국어 배지 + 영어 단추 `Beginner License ↗` → `https://yuphastemple.com/?item=beginner-license`(`specialty-license`, `advanced-license`도 화면에서 확인됨).
- 아래 `시험 안내` 단추(지금 인물 탭에 있는 것과 같은 문서).

④ **장을 넘기기 전**: 자료의 세 줄을 그대로, 줄마다 왼쪽 작은 아이콘(lucide `ScrollText`·`MessagesSquare`·`CalendarDays` 18px) + 글 16px. 목록, 표 아님.

⑤ **바로가기**: 단추 둘. `World Map ↗`(영어, yuphastemple 새 탭 → `mapUrl(route)`), `팀 25인`(→ `/team/`). 높이 36px, `.y-link`·보조 단추 모양.

### B4. 지도 연결 (준비 탭 + 본문 공통)

- 지금 `lib/yuphas.ts`의 `mapUrl(route, q?)`는 `/map/<루트>/?q=<영어 이름>`만 만든다. 장소 주소가 없다.
- 추가: `placeUrl(route, placeSlug, q?)` → `https://yuphastemple.com/map/<루트>/<장소 슬러그>/` (+ `?q=`). 조사 문서 §1 표에서 `/map/<루트>/<장소>/?q=<이름>` 형식이 열리는 것 확인됨(`/map/theodora/grand-aragon/?q=Tales%20of%20the%20Arena`). 3부는 `part-3`.
- 장소 이름표: `yuphas-names.json`의 `places` 121곳(ko → en·slug). `scripts/yuphas/build-links.mjs`가 `yuphas-links.json`에 `places`를 내보내게 한다(지금은 items·people·classes만).
- 규칙: 한국어 장소 배지(누를 수 없음) + 영어 장소 단추(`Yashiro Fort ↗` → `placeUrl`) — U65 그대로. 물품이 같이 있으면 `?q=<물품 영어 이름>`을 붙인다.
- **권장(범위 확인 필요, Q3)**: 할 일 본문의 `World Map ↗`(장소 없음) 단추도 같은 규칙으로 장소 주소를 달아 준다. 사용자가 말한 "지도가 yuphastemple과 연결 안 됨"은 이 단추일 가능성이 높다(조사 문서 §4의 계획은 `/map/<루트>/<장소>/?q=<물품>`였는데 지금은 루트 첫 쪽만 연다).

### B5. 검사

- `layout-browser-check.mjs`/`browser-check.mjs`: 준비 탭 1440·390·320에서 `documentElement.scrollWidth <= clientWidth`, `.prep-content` 안 `table` 0개, 화면 밖으로 나간 요소 0개.
- `rules-check.mjs`: `secondary.tsx`의 `Preparation`이 `Records`·`Semantic`을 쓰지 않음(②의 대체 길을 쓰면 그 세 절만 예외).
- `verify-feature-parity.mjs`·`verify-readability.mjs`가 준비 탭 글을 세고 있으면 기준을 고친다(자료는 지우지 않고 화면에서만 뺌. U66과 같은 방식). 새 규칙 줄 필요(§F8의 번호 참고).

---

## F. 인물 육성 기록 (요청 5) — 구현 계획

### F1. 무엇을 기록하나

루트 × 인물마다: **레벨, 병종, 숙련 등급 12개, 메모(선택)**. 능력치 9개·소지품·기술은 이번에 넣지 않는다(그 사이트 육성 도구로 가는 영어 단추 `Builder ↗`(`https://yuphastemple.com/<slug>/builder/`)를 옆에 둔다. `personUrl`에 탭 `'builder'` 추가).

### F2. 새 자료 파일

`content/data/yuphas-classes.json` — 새 스크립트 `scripts/yuphas/classes.mjs`가 yuphastemple `data.json`에서 만든다(기존 `class-moves.mjs`와 같은 방식, 손으로 고치지 않음).
```json
{ "reviewed": "2026-11-27", "site": "https://yuphastemple.com",
  "licenses": [
    {"id":"default","en":"Default","ko":"기본","level":null,"renown":null},
    {"id":"beginner","en":"Beginner","ko":"초급","level":5,"renown":1},
    {"id":"specialty","en":"Specialty","ko":"중급","level":20,"renown":4},
    {"id":"advanced","en":"Advanced","ko":"상급","level":35,"renown":8},
    {"id":"elephant","en":"Elephant","ko":null,"level":35,"part":3},
    {"id":"master","en":"Master","ko":"최상급","level":45,"part":3},
    {"id":"divine","en":"Divine","ko":"신장직","level":45,"part":3,"single":true}
  ],
  "classes": [
    {"slug":"wing-soldier","en":"Wing Soldier","ko":"천익병","license":"specialty","column":"riding",
     "gender":"female","type":["flying"],"weapons":["sword","spear"],"moves":["flying"]}
  ]
}
```
- 61개 모두. `column`은 §A3-6 규칙을 스크립트에서 계산해 넣는다(화면이 다시 계산하지 않게).
- 한국어 이름은 `yuphas-names.json` `classes` + 평민·귀족. 없으면 `ko:null`(화면은 영어만).
- `yuphas-characters.json`의 인물마다 `noRide: true`(Goliath, Orchel)를 더한다(고유 병종은 이미 `classes.unique`에 있음).
- 브라우저가 큰 파일을 받지 않게: 서버 쪽(`lib/yuphas-profile.ts`)에서 인물마다 **고를 수 있는 병종 슬러그 목록** `allowed: string[]`와 기본 숙련 등급 `base: Record<skill, rank>`를 `YuphasProfile`에 더해 내려보내고, 병종 61개 표(이름·그림·열·증서)는 작은 클라이언트 모듈 `lib/yuphas-classes.ts`가 읽는다(61줄, 수 KB).

허용 규칙(= §A3): `allowed = classes.filter(c => (c.license!=='default' || c.slug===unique.slug) && (!c.gender || c.gender===person.gender) && !(person.noRide && c.type에 cavalry|flying))`.

### F3. 저장 — 기존 체크 기록과 같은 곳, 같은 파일

**기존 방식(확인)**: `components/checks.tsx`가 localStorage 키 `fortunes-weave-checklist-v1`에 `CheckState {schemaVersion:1, revision, updatedAt?, checks, status?}`를 통째로 저장한다. `기록 관리 → 내보내기`는 `checks.data`를 그대로 JSON 파일로 내려받고(`tasks.tsx` `exportFile`), 가져오기는 `lib/check-state.ts` `validateChecks`로 엄격히 검사한 뒤 저장한다. `status`(내 상태)는 2026-11-15에 **선택 필드로 덧붙인** 선례다: 예전 파일(상태 없음)을 가져와도 지금 상태를 지우지 않는다.

**육성 기록도 똑같이 선택 필드 `builds`로 덧붙인다.** `schemaVersion`은 1 그대로(필드가 없어도 유효하므로 판 올림 불필요 → 예전 파일·예전 저장 값이 그대로 읽힌다).

```jsonc
{
  "schemaVersion": 1,
  "revision": 132,
  "updatedAt": "2026-11-27T12:00:00.000Z",
  "checks": { "…": true },
  "status": { "boons": {}, "gods": {} },
  "builds": {
    "theodora": {
      "loretta": {
        "level": 20,
        "classId": "wing-soldier",
        "skills": { "sword": "C", "spear": "D+", "flying": "D" },
        "note": "창술 C+ 되면 팔라딘 시험"
      },
      "theodora": { "level": 22, "classId": "soldier", "skills": { "spear": "B", "white_magic": "C" } }
    },
    "leda": {}
  }
}
```

| 자리 | 값 | 규칙 |
|---|---|---|
| `builds` 키 | 루트 ID | `theodora`·`leda`·`dietrich`·`cai`·`part3`만. 1부와 2부는 같은 회차라 한 기록을 같이 쓴다(Q4) |
| 인물 키 | yuphastemple 슬러그(소문자 영어) | `yuphas-characters.json`의 `slug`(62명). 예 `loretta`, `theodora`, `cai` |
| `level` | 정수 1~99 | 선택. 없으면 "기록 없음" |
| `classId` | 병종 슬러그 | 선택. `yuphas-classes.json`의 61개 중 하나 |
| `skills` | `{ <숙련>: <등급> }` | 선택. 숙련 키 12개: `sword, spear, axe, bow, gauntlet, black_magic, white_magic, authority, infantry, riding, armor, flying`(그림 파일 이름과 같음). 등급: `E, E+, D, D+, C, C+, B, B+, A, A+, S, S+`. 적지 않은 숙련 = 기록 없음(화면은 그 인물의 기본 등급을 흐리게 보임) |
| `note` | 글 200자 이하 | 선택(Q5) |

- 빈 기록은 저장하지 않는다(값이 하나도 없는 인물·루트 키는 지움) → 파일이 작게 유지된다.
- TypeScript: `export type Build = { level?: number; classId?: string; skills?: Partial<Record<SkillId, Rank>>; note?: string }; export type Builds = Partial<Record<Route, Record<string, Build>>>;` `CheckState`에 `builds?: Builds`.

**검사 함수 `validateBuilds(value, catalog?)`** (`lib/check-state.ts`, `validateStatus`와 같은 꼴):
- 가져오기(엄격, catalog 줌): 객체 아님 / 모르는 루트 / 모르는 인물 슬러그 / 모르는 병종 슬러그 / 레벨이 1~99 정수 아님 / 모르는 숙련·등급 / 메모가 글이 아니거나 200자 초과 → **이유를 말하는 오류**(예: `육성 기록 theodora › loretta의 병종 "wing-solder"를 모릅니다.`). 파일 전체를 거절하고 기존 기록은 그대로(지금 가져오기 동작과 같음).
- 가져오기는 "그 인물이 고를 수 있는 병종인지"(성별·못 탐)는 **검사하지 않는다**(손으로 만든 파일이 사소한 이유로 막히지 않게. 고르기 창만 막는다).
- 저장소 읽기(느슨, `sanitizeBuilds`): 모르는 키·값은 그 항목만 버리고 나머지는 살린다(`sanitizeStatus`와 같은 생각: 자료가 바뀌어도 체크 기록 전체가 막히지 않게).
- `validateChecks`가 `builds`를 돌려주도록 고친다(지금은 아는 필드만 돌려줘서 `builds`가 **버려진다** — 꼭 고칠 곳).

**`components/checks.tsx` 바꿀 곳**:
- `importData`: `status`와 같은 줄에 `...(!data.builds && snapshot.data.builds ? {builds: snapshot.data.builds} : {})` — **육성 기록이 없는 예전 파일을 가져와도 지금 육성 기록을 지우지 않는다.** 파일에 `builds`가 있으면 파일 것으로 통째로 바꾼다(체크와 같은 "파일이 이김" 동작. 루트별 합치기는 Q6).
- `toggle`·`setStatus`는 `{...snapshot.data, …}`로 펼치므로 `builds`가 자동으로 보존된다(확인함).
- 새 함수 `setBuild(route, slug, patch)`: `bump({...snapshot.data, builds: next})`. 값이 모두 비면 키 삭제. `!snapshot.ready`면 아무것도 안 함(읽기 실패 때 덮어쓰지 않는 기존 안전장치 그대로).
- `clear()`(기록 지우기): 지금은 `empty`로 바꿔 내 상태까지 지운다. 육성 기록을 같이 지울지는 Q7. 권장: 지우지 않음(`{...empty, builds: snapshot.data.builds}`)하고 육성 기록 지우기는 따로.
- 저장 시점: 숫자 칸은 `change`(칸을 떠나거나 ▲▼ 누름)에서만 저장, 메모는 `blur`에서 저장 → 글자마다 `revision`이 오르지 않게.
- 다른 탭과 맞춤: 기존 `storage` 이벤트 처리 그대로.
- 예전 사이트판(이 기능 전)에 새 파일을 가져오면 `builds`만 조용히 빠진다(체크는 정상). 문제 없음.
- 내보내기 파일 이름·모양은 그대로. `progress/` 폴더 JSON(git 무시, U25)도 같은 꼴이므로 조정자가 세오도라 기록을 채운 합친 JSON을 그대로 가져올 수 있다.
- `scripts/transfer.mjs`(진행 파일 옮기기 도구)가 필드를 골라 복사한다면 `builds`도 넘기게 고친다(코드 작성자 확인).

### F4. 화면 — 어디서 입력하나

**입력은 인물 서랍 한 곳**(머리 카드 바로 아래 새 묶음 `내 기록`). 인물 탭 카드는 읽기 전용으로 병종·레벨·등급을 보여 준다(§C). 서랍은 할 일·인물·팀 어디서 열어도 같으므로 한 곳에서만 고치면 된다. 팀 화면 서랍(`team.tsx`)에서는 루트가 없으므로 입력 묶음을 그리지 않는다(Q8).

`PersonSheet` 안 순서: 머리 카드 → **내 기록** → 우리 계획 표(`PersonInfo`) → 선호 선물·음식 → 지원.

`내 기록` 묶음(`components/build-editor.tsx`, 새 파일. `route`, `profile`, `people` 계획을 받음):

| 줄 | 내용 | 값 |
|---|---|---|
| 1 | **병종 단추**(= 그 사이트 카드의 `Commoner ▾`): 병종 점 그림 36px + 한국어 이름 + 이동 아이콘 + `▾`. 누르면 고르기 창 | 높이 40px, 2px `#39484F`, 바탕 `#192D34`, 호버 `#3B453A`/`#60593E`. 기록 없으면 시작 병종을 흐리게 + `병종 고르기` |
| 1 | **레벨 칸**(같은 줄 오른쪽): 이름표 `Lv` + 숫자 칸 + ▲▼ | 그 사이트 스테퍼 값을 키움: 입력 44×36px(1px `#383D38`, 가운데, 16px), ▲▼ 각 28×17px(사이 2px). `type="text" inputmode="numeric" pattern="[0-9]*" maxlength=2`, 범위 1~99, 범위 밖은 가까운 값으로, 비우면 기록 삭제. 키보드 ↑↓로 ±1 |
| 2 | **숙련 등급 6×2**: 머리 카드와 같은 순서·그림(장점 `_boon`·약점 `_bane`), 그림 32px 아래에 등급 고르기 칸 | 칸 = 기본 `<select>`(폭 44px 높이 28px, 14px, 1px `#383D38`, 바탕 `#192D34`). 선택지: `–`(기록 없음) + 12등급. 값이 없을 때 자리 글은 기본 등급(흐리게 `#ACAAB9`). 격자 `repeat(6,44px)` gap 6px(= 294px), ≤359px에서는 gap 4px(= 284px ≤ 288px). `aria-label="검술 등급"` |
| 3 | 메모 한 줄(Q5) | `<input>` 높이 36px, 200자, 자리 글 `메모` |
| 4 | 영어 단추 `<En> · Builder ↗` + `이 인물 기록 지우기`(글 단추) | |

- 기본 `<select>`를 쓰는 이유: 12개 × 12단계를 휴대폰에서 가장 빨리 고르고, 키보드·화면 낭독기가 그대로 된다. 꾸민 팝업 12개를 새로 만들지 않는다(단순함 우선).
- 병종을 고르면 머리 카드의 병종 줄도 그 병종으로 바뀐다(`CharacterHeader`에 `clsOverride` 전달).
- 계획 대비 표시(작게, 선택): `PersonInfo`의 "필요 기능" 목표(예 창술 B)를 기록이 넘으면 그 배지에 ✓. 이번 범위에서는 **하지 않는다**(요청에 없음. 다음 후보로만 적음).

### F5. 병종 고르기 창 (yuphastemple 창을 옮김)

- 부품: `components/class-picker.tsx`. 창은 Radix Dialog(이미 서랍 `ui/sheet.tsx`가 쓰는 묶음)를 **서랍 안에서 겹쳐** 연다(겹친 Dialog는 Radix가 지원: 포커스 가둠·Esc가 맨 위 창부터). 코드 작성자는 modern-web-guidance(모달 항목)를 먼저 확인하고, 기본 `<dialog>`가 더 단순하면 그쪽으로(이때 서랍의 포커스 가둠과 충돌하는지 꼭 확인).
- 틀(§A3 그대로): 막 `rgba(0,0,0,.55)` + `backdrop-filter:blur(4px)`, 화면 가장자리 8px. 판 바탕 `#142324` + `/yuphas/listCenter2.png`(100% auto), 위 `/yuphas/listTop.png`, 아래 `/yuphas/listBottom.png`. 판 폭 `min(1100px, 100%)`(그 사이트는 100%지만 표가 854px 가운데라 1100px로 충분 — 제안), `max-block-size:100%`, 본문 `overflow:auto`.
- 머리: 제목 **`병종 고르기`**(한국어, 누를 수 없는 글) → 무기 탭 8개(`전체` + 숙련 그림 7개, `aria-label`은 한국어 숙련 이름, 고른 탭은 알약 그림) → 검색 칸(250px, ≤767px에서는 100% 한 줄) → ✕(30×30, `#3A1D1D`, 2px `#60593E`, `aria-label="닫기"`).
- 본문: 증서 묶음마다 머리 글 `초급 증서 · Lv 5 · 명성 1` 꼴(값은 `licenses`), 그 아래 5열(`보병·원거리·마법·중갑·기마`) 표 대신 **CSS 격자**: `grid-template-columns:repeat(5,minmax(0,1fr))` 칸마다 칩을 세로로. ≤1100px: 열 구분 없이 `repeat(auto-fill,minmax(148px,1fr))`로 흐름(그 사이트도 이 폭에서 접는다). 320px: 1열(288px)이 아니라 `minmax(136px,1fr)` 2열.
- 칩: `<button>` 높이 34px, 2px `#39484F`, 바탕 `#192D34`, gap 4px, 오른쪽 여백 8px. 왼쪽 점 그림 30×30(`/yuphas/classes/<female|male>/<slug>.webp`, `image-rendering:pixelated`), 그림 왼쪽 위 이동 아이콘 10px(보병은 숨김), **이름은 한국어**(없으면 영어), 오른쪽 위 무기 아이콘 10px(그 인물 장점이면 `_boon`). 넘치면 말줄임 + `title`에 전체 이름.
  - U65 해석: 칩은 "고르는 단추"이지 yuphastemple로 가는 단추가 아니므로 한국어 이름을 쓴다. 영어 이름은 `title`·검색어로만.
- 고른 칩: 바탕 `#3B453A`, 테두리 `#60593E`, `aria-pressed="true"`. 창을 열면 고른 칩에 포커스.
- 보이는 병종: `profile.allowed`만(§F2). 무기 탭·검색(한국어·영어 이름, 증서 이름)으로 거름. 결과 없으면 `맞는 병종이 없습니다.`
- 3부 가림(blur)은 **하지 않는다**(통합 계획 "하지 않는 것: 스포일러 가림"). 1·2부 화면에서도 3부 증서 묶음을 보이되 머리 글에 `3부 해금`을 적는다.
- 맨 위에 `기록 지우기` 칩(병종 기록 없음으로) 하나.
- 누르면 저장하고 닫는다. Esc·막 누름·✕는 바꾸지 않고 닫는다. 닫으면 포커스가 병종 단추로 돌아온다.
- 키보드: Tab 순서 = 탭 → 검색 → 칩들. 칩 사이 화살표 이동은 넣지 않는다(단순함. 칩이 최대 59개라 Tab과 검색으로 충분 — 제안).

### F6. AI용 복사

- 자리: 인물 탭 거르기 줄의 `AI용 복사` 단추(아이콘 lucide `ClipboardCopy`). 누르면 **그 루트의 기록 있는 인물 전부**를 글로 복사(`navigator.clipboard.writeText`, 실패하면 글 상자를 띄워 직접 복사). 결과는 `aria-live="polite"` 한 줄로 알림: `12명 기록을 복사했습니다.` 기록이 0명이면 단추 비활성 + `기록이 없습니다`.
- 형식(영어 이름을 먼저 — AI가 게임 자료와 맞추기 쉽게, 한국어 병기):
```
Fire Emblem: Fortune's Weave — Theodora route (세오도라) builds, exported 2026-11-27
Skill ranks: E < E+ < D < D+ < C < C+ < B < B+ < A < A+ < S < S+

Loretta (로레타) | Lv 20 | Wing Soldier (천익병)
  skills: Sword C, Spear D+, Flying D   | boon: Sword, Spear, Flying | bane: Armor
  plan: final class <최종 병종 영어/한국어> | needs: <필요 기능 목록>
  note: 창술 C+ 되면 …
```
  - `plan`·`needs`는 우리 인물 계획(`person.data.finalClasses`, `skills`)에서. 기록 안 한 숙련은 적지 않는다.
- JSON이 필요하면 `기록 관리 → 내보내기` 파일에 이미 들어 있다(따로 단추를 만들지 않는다).

### F7. 접근성

- 모든 입력에 보이는 이름표 또는 `aria-label`. 숙련 그림 `alt`는 지금처럼 `검술 장점`.
- 누를 곳 32px 이상(U55), 단추 사이 4px 이상(U37). 포커스 바깥선 2px `#FFE8C4`.
- 색만으로 뜻을 전하지 않는다: 고른 칩은 `aria-pressed` + 테두리 색, 장단점은 ▲▼(지금 그대로).
- 저장 결과는 기존 체크 상태 알림(`status`) 문구를 그대로 쓴다.
- 움직임 줄이기 설정에서 창 열림 효과 없음.

### F8. 규칙·검사 (새 지시는 규칙 줄 + 검사로, user-rules.md 머리말 규칙)

`docs/user-rules.md`에 추가(번호는 다음 빈 번호부터, 다른 작업자와 겹치지 않게 조정자가 확정):

| 번호(안) | 규칙 | 검사 |
|---|---|---|
| U68 | 인물 탭은 서랍 머리 카드 모양의 카드 격자, 누르면 서랍. 탭 안에 표 없음 | `rules-browser-check.mjs` |
| U69 | 준비 탭은 표 0개·가로 넘침 0(1440·390·320), 지도·장소는 yuphastemple 장소 주소 | `layout-browser-check.mjs`, `yuphas-links-check.mjs` |
| U70 | 서랍 지원 표 얼굴은 모든 줄에서 잘리지 않는다(줄 높이 ≥ 얼굴 높이) | `rules-browser-check.mjs` |
| U71 | 루트 머리 왼쪽에 팀 화면 단추 | `rules-check.mjs`, `header-browser-check.mjs` |
| U72 | 루트별 인물 육성 기록(레벨·병종·숙련 등급): 병종은 yuphastemple 모양 고르기 창, 기록은 체크 기록과 같은 저장소·같은 내보내기 파일(`builds`), 육성 기록 없는 예전 파일을 가져와도 기존 기록 보존, 사이트에 개인 기록 없음(U25 연장) | `scripts/builds-check.mjs`(새), `status-browser-check.mjs` |

새 검사 `scripts/builds-check.mjs`(node만, 브라우저 없음):
1. `yuphas-classes.json`: 61개, 슬러그 유일, 증서별 개수 3/5/12/16/1/16/8, 그림 파일이 `public/yuphas/classes/female|male/`에 있음(성별 제한 병종은 그 성별만).
2. 인물 62명 모두 `allowed`가 1개 이상, 고유 병종이 들어 있음, 남성에 `wing-soldier`·`celestial-trooper` 없음, Goliath·Orchel에 기마·비행 병종 없음.
3. `validateChecks`: (가) `builds` 없는 예전 파일 통과, (나) 올바른 `builds` 통과·그대로 돌려줌, (다) 잘못된 루트·인물·병종·레벨 0·100·등급 `F`·메모 201자 각각 거절, (라) `checks`·`status`가 예전과 같은 결과.
4. `sanitizeBuilds`: 모르는 항목만 버리고 나머지 유지.

브라우저 검사(`status-browser-check.mjs`에 덧붙임 — **빈 프로필의 검사용 서버에서만**, localhost:3000 금지):
1. 서랍에서 병종 고르기 → 창이 열림·칩 수 = `allowed` 수·고르면 닫히고 머리 카드 병종이 바뀜·새로 고침 뒤 유지.
2. 레벨 0·100 입력 → 1·99로. 숙련 등급 고름 → 유지.
3. 내보내기 JSON에 `builds.theodora.<slug>` 있음. 저장소를 비우고 그 파일 가져오기 → 화면 복원.
4. 육성 기록을 넣은 뒤 **`builds` 없는 파일** 가져오기 → 체크는 파일 것, 육성 기록은 그대로.
5. 체크 칸을 누른 뒤에도 `builds` 유지(덮어쓰기 없음).
6. 다른 루트(`/leda/1/`)에서 같은 인물 기록이 비어 있음.
7. 고르기 창 320·390·1440 가로 넘침 0, Esc로 닫으면 포커스가 병종 단추로.

### F9. 위험

1. **기존 기록 지움**: `validateChecks`가 모르는 필드를 버리는 구조라, `builds` 처리를 빼먹은 채 "가져오기 → 저장"하면 육성 기록이 사라진다. 반대로 체크 기록은 `{...snapshot.data}` 펼침 덕에 안전. → F8 검사 3·4·5가 막는다.
2. `clear()`가 전부 지움(Q7).
3. 겹친 창(서랍 + 고르기 창)의 포커스·스크롤 잠금. 휴대폰 Safari에서 `backdrop-filter` 성능 → 막힐 경우 blur만 뺀다.
4. 인물 키를 yuphastemple 슬러그로 쓰므로 그 사이트가 슬러그를 바꾸면 기록이 안 맞는다 → `sanitizeBuilds`가 버리기 전에 옛 슬러그 옮김 표가 필요해질 수 있다(지금은 만들지 않음).
5. 병종 한국어 이름 일부 없음(`orichaldia` 등) → 영어로 보임.
6. 1·2부가 한 기록을 같이 쓰면(권장), 1부 화면에서 2부 상태로 덮어쓴 것이 보인다(같은 회차이므로 의도된 동작. Q4).
7. 3부(`part3`) 기록은 루트 넷의 기록과 따로다(융합 뒤 상태). 자동 이월은 하지 않는다.
8. 준비 탭에서 뺀 글을 검사 스크립트(`verify-feature-parity` 등)가 세고 있으면 배포 관문이 막힌다 → 같은 커밋에서 기준 수정.
9. 인물 탭 카드에서 표를 빼면 U02·U26·U54 검사가 실패할 수 있다(§C-6).
10. 문서와 코드가 다른 점(P07, 최종 답변에 적을 것): 조사 문서는 본문 지도 링크를 `/map/<루트>/<장소>/?q=<물품>`으로 바꾼다고 했지만 코드는 `/map/<루트>/`만 연다. 디자인 사양 "지원 표 얼굴 왼쪽 위"는 이번에 "왼쪽 아래"로 바뀐다(사양 줄도 같이 고칠 것).

---

## G. 사용자에게 물을 것 (P04: 선택지 + 추천)

**Q1. 숙련 등급은 그 사이트 육성 도구에 없는 입력입니다. 어떻게 넣을까요?**
- (추천) 12개 숙련 그림 아래에 등급 고르기 칸(E~S+ 12단계)을 우리 방식으로 만든다.
- 병종에 필요한 숙련만(무기 7개) 받는다.
- 숙련 등급은 받지 않는다(레벨·병종만).

**Q2. 준비 탭에서 무엇을 남길까요?**
- (추천) 가호 봉사 순서·이번 주 식사 얼굴·시험 단계·장 넘기기 전 3줄·바로가기만 남기고, 나머지 글과 중복 표(장별 골드·전직 점검·공통 기준 10개 절)는 화면에서 빼 `docs/reference/`로 옮긴다.
- 공통 기준 글도 접기 하나로 남긴다(모양만 새로).
- 준비 탭을 없애고 남길 것을 할 일·재료 탭으로 옮긴다.

**Q3. 지도 연결 범위는?**
- (추천) 준비 탭뿐 아니라 할 일 본문의 `World Map ↗` 단추도 장소 주소(`/map/<루트>/<장소>/?q=<물품>`)로 바꾼다.
- 준비 탭만.

**Q4. 육성 기록은 무엇마다 따로 둘까요?**
- (추천) 루트마다 하나(1부·2부는 같은 회차라 같이 씀) + 3부 하나. 모두 5칸.
- 루트 × 부마다 따로(9칸).

**Q5. 인물마다 짧은 메모 칸(200자)을 넣을까요?**
- (추천) 넣는다(AI에게 물을 때 사정을 적어 둘 수 있음).
- 넣지 않는다.

**Q6. 육성 기록이 든 파일을 가져올 때**
- (추천) 파일의 육성 기록으로 통째로 바꾼다(체크와 같은 동작. 파일에 육성 기록이 없으면 지금 것 유지).
- 루트별로 합친다(파일에 있는 루트만 바꿈).

**Q7. `기록 지우기`를 누르면 육성 기록도 지울까요?**
- (추천) 체크만 지우고 육성 기록은 남긴다. 육성 기록은 인물 서랍의 `이 인물 기록 지우기`로.
- 함께 지운다.

**Q8. 팀 화면(/team)의 인물 서랍에도 육성 입력을 보일까요?**
- (추천) 아니요. 루트 화면 서랍에서만(팀 화면은 루트가 정해져 있지 않음).
- 예, 루트를 고르는 탭과 함께.

**Q9. 능력치 9개(HP·힘 …)도 기록할까요?**
- (추천) 이번에는 아니요. 요청하신 레벨·병종·숙련만. 필요하면 나중에 `stats` 칸을 덧붙인다(파일 형식은 그대로 확장 가능).
- 예, 지금 같이.

**Q10. 인물 탭의 `육성판 목적` 고르기 칸과 `필터 지우기` 단추를 없애도 될까요?**
- (추천) 없앤다(이름 검색 + 역할 탭만).
- 그대로 둔다.
