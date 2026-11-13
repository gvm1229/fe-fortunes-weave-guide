# 재설계 v3 작업 계획 (2026-11-14)

구현자는 이 문서의 값과 순서를 그대로 따른다. 여기에 없는 시각 결정(색·크기·문구·배치)은 새로 만들지 않고 §C 질문에 추가한다. 디자인 판단은 이 문서가 하고, 구현자는 하지 않는다.

조사 근거: 실제 화면(localhost:3000, 1440×810·390×693, 두 테마), `components/*`, `lib/*`, `app/*.css`, `content/data/*`, 이전 공략 `fe-fortunes-weave-guide-main`, `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`, GoogleChrome modern-web-guidance(SKILL.md, `ui-behaviors/same-document-transitions`·`scrollytelling`·`motion`), `.impeccable/design.json`.

## 0. 공통 규칙

- [ ] 한 항목(T0~T13) = 커밋 하나. 항목마다 `npm run lint`, `npm run typecheck`, `npm run verify` 통과 후 커밋한다. 커밋 규칙은 HANDOFF §3(한국어 Conventional Commit, 공동 작성자 줄 금지).
- [ ] 개발 서버(3000)를 끄지 않는다. `npm run build`·`.next` 삭제 금지. 빌드 확인은 `.tmp/fable-build` 복사본에서 한다(HANDOFF §6의 `.tmp/redesign-build` 방식).
- [ ] 체크박스를 누르는 시험은 복사본을 다른 포트로 띄운 주소에서만 한다(저장소가 분리된다). `localhost:3000`에서 체크·가져오기 금지.
- [ ] 수정 금지: `archive/`, `content/data/*`, `content/source/*`, `content/derived/*`, `content/display-parity.json`, `content/checklist-seed.json`, `app/route-colors.css`(생성 파일), `components/home.tsx`의 시각 결과(T11의 감싸기만 예외).
- [ ] 기존 코드 문체(한 줄에 길게 쓰는 방식)를 따른다. 요청과 무관한 정리는 하지 않는다. 내 변경으로 안 쓰게 된 코드·CSS만 지운다.
- [ ] 최소 글자 18px. `:root{font-size:18px}`라서 **1rem = 18px**다. Tailwind·shadcn의 rem 단위(`text-sm`, `h-9`, `p-4`)는 그대로 쓰지 말고 px 임의값(`text-[18px]`, `min-h-[44px]`)으로 적는다.
- [ ] 버튼·토글·배지는 모두 채움형. 테두리만 있는 변형(`outline`)을 만들지 않는다.
- [ ] 새 문구는 이 문서에 적힌 것만 쓴다.

## A. 확정 값

### A1. 색 (첫 화면 제외 전부: `.app-shell[data-route]`, `.sheet[data-route]`, `.team-page`)

| 토큰 | 밝게 | 어둡게 | 쓰임 |
|---|---|---|---|
| `--bg` | `#F4F3F0` | `#191918` | 페이지 |
| `--surface` | `#FFFFFF` | `#232322` | 카드·목록 |
| `--surface-2` | `#F0EEEA` | `#2C2C2A` | 안쪽 면·완료 행·표 머리 |
| `--text` | `#26251F` | `#ECEAE4` | 본문 |
| `--muted` | `#62605A` | `#B4B1A8` | 보조 글 |
| `--line` | `#E3E1DB` | `#3A3A37` | 목록 구분선 |
| `--table-line`(신규) | `#D5D2CA` | `#4A4A46` | 표 선. `#bcb8a9`·`#69675e` 직접값을 이것으로 교체 |
| `--primary` / `-fg` | `#4A4658` / `#FFFFFF` | `#C9C3DA` / `#1F1D26` | 선택된 탭·주 버튼·체크 |
| `--secondary` / `-fg` | `#E7E5E0` / `#2B2A25` | `#343432` / `#ECEAE4` | 보조 버튼·탭 바탕·진행 막대 바탕 |
| `--secondary-soft` | `#EFEDE8` | `#2E2E2C` | 칩 |
| `--accent` / `-fg` | `--primary`와 같은 값 | 같은 값 | 체크박스·초점 |
| `--swap` / `--swap-fg`(신규) | `#B45309` / `#FFFFFF` | `#F2A65A` / `#1F1408` | 교체 인물 테두리·배지 (§A4) |
| `--portrait-bg`(신규) | `#16272D` | `#16272D` | 초상화 배경 (§A2) |

진행 막대: 0~49% `#9A6B43`, 50~99% `#5B7A99`, 100% `#4E8469`. 어둡게 `#D2A97F`, `#9DB8D4`, `#94C4AB`. 바탕은 `--secondary`.

루트 색은 옅은 면과 작은 표시에만 쓴다(`.app-shell[data-route=…]`에 정의).

| 루트 | `--route-tint` 밝게 / 어둡게 | `--route-ink` 밝게 / 어둡게 |
|---|---|---|
| kai | `#DCE5F2` / `#1D2A40` | `#3F64A8` / `#8FAEE6` |
| dietrich | `#E4E2DE` / `#262628` | `#3A3A3E` / `#C9C9C4` |
| theodora | `#F1E6C4` / `#3A3118` | `#8F6F1E` / `#E0C36A` |
| leda | `#F2DCE3` / `#3D2029` | `#B0486E` / `#E596B2` |
| part3 | `#E3DCF0` / `#2A2140` | `#6A52A3` / `#B9A6E6` |

- `--route-tint`: 루트 머리 그림 면 배경(글자는 `--text`). `--route-ink`: "현재" 칩 배경(글자 밝게 `#FFFFFF`, 어둡게 `#191918`), 색종이 한 색.
- 아이콘 기호 색(지원·명성·골드 등)은 현재 값을 유지한다.
- 대비는 계산해 두었다(본문 13:1 이상, 보조 글 5.4:1 이상, 막대 3.4:1 이상, 배지 5.0:1 이상). 값을 바꿔야 하면 바꾸지 말고 보고한다.

### A2. 초상화 배경

- 1·2부 초상화(`assets/portraits/cNN.webp` 62장)는 그림 안에 어두운 청록 배경(대표값 rgb 22,39,45)이 들어 있다. 3부 초상화(`post-timeskip/*.png` 43장)와 큰 그림은 투명이다. 그래서 투명한 쪽만 비어 보인다.
- 규칙 하나: `:is(.app-shell,.team-page,.sheet) img[src*="/portraits/"]:not(.banner-lord){background:var(--portrait-bg)}`. 어둡게에서는 카드와 구분되게 `outline:1px solid #3A4A50;outline-offset:-1px`를 더한다.
- 제외: 첫 화면(`.home` 전체), 루트 머리의 큰 군주 그림(`.banner-lord`).
- 신 그림(`assets/gods/*.png`, 투명)에도 같은 배경을 준다(가정 — §C Q7).

### A3. 크기·모서리·간격

- 모서리: 카드 16px, 버튼·토글·입력 10px, 칩·배지 8px. 기존 24px 목록 면은 16px로 바꾼다.
- 그림자 없음. 예외: 팝오버·기록 관리 메뉴 `0 8px 24px rgb(0 0 0/.16)`.
- 페이지 옆 여백 24px(767px 이하 16px). 카드 안 여백 24px(767px 이하 16px). 카드 사이 24px(767px 이하 16px).
- 얼굴 크기: 문장 속 28, 목록·묶음·도구줄 40, 루트 편성 카드 72, 인물 카드 96(휴대폰 72). 한 구역 안에서 섞지 않는다. 최종 25인 격자는 §T7 표를 따른다.
- 글자: 본문 20, 보조 18, 카드 제목 22/700, 구역 제목 24/700. 18px 미만 금지.

### A4. 교체 표시

- 색은 **모든 교체에 하나**(`--swap`). 이유: 배지가 누구 대신인지 말해 주므로 색을 나눌 정보가 없고, 최대 6명(진영장 4 + 체험 2)에 여섯 색을 쓰면 "색을 은은하게" 요구와 어긋난다.
- 테두리: 모든 카드에 `border:6px solid transparent`를 미리 두고 교체된 카드만 `border-color:var(--swap)`. 교체 여부로 크기가 바뀌지 않는다.
- 배지: 카드 오른쪽 위, 테두리에 걸친다. `position:absolute;top:-12px;right:6px;height:24px;padding:0 6px 0 2px;border-radius:6px;background:var(--swap);color:var(--swap-fg);font:600 18px/24px`. 내용 = 나간 인물 얼굴 20×20(모서리 4) + 나간 인물 이름 + `대신`. 예: `[얼굴] 미카엘라 대신`.
- 칸 폭 120px 미만(휴대폰 4열)에서는 이름을 숨기고 `[얼굴] 대신`만 보인다. `top:-14px;right:2px`. 카드 `aria-label`에는 항상 전체 문구를 넣는다.
- 배지는 위 칸 쪽으로 걸친다. 자기 카드의 이름 줄을 가리지 않는 것이 기준이다.

### A5. 움직임

- 새 움직임은 모두 `@media (prefers-reduced-motion:no-preference)` 안에 쓴다. 기존 전역 줄이기 규칙(redesign.css)은 그대로 둔다.
- 버튼·토글·탭: `transition:background-color .15s,color .15s,transform .1s`, `:active{transform:scale(.97)}`.
- 체크박스: 체크 순간 `check-pop` 180ms ease-out(scale .8→1.12→1). 행 배경·글자색 200ms.
- 누를 수 있는 카드(팀 카드, 문서 목록, 이 장의 인물): hover `translate:0 -2px` 150ms + 배경 `--surface-2`.
- 접기: `@supports (interpolate-size:allow-keywords)` 안에서 `::details-content` 높이 200ms, 화살표 회전 150ms.
- 시트: 열기 220ms `cubic-bezier(.2,.8,.2,1)` 오른쪽에서, 닫기 160ms. 덮개 150ms. Radix가 닫힘을 기다리도록 transition이 아니라 keyframes(`[data-state=open|closed]`)로 쓴다.
- 화면 전환: 사라짐 160ms ease-out, 나타남 220ms ease-in, 같은 요소 이동 300ms.

## B. 작업 항목

### T0. docs: 재설계 v3 사양 기록
- [ ] `docs/design-spec.md` 맨 위 절 앞에 "재설계 v3 · 2026-11-14" 절을 추가한다. §A 표를 그대로 옮기고 나머지는 이 문서로 연결한다. 이 절이 이전 "구현 상세값"보다 우선한다고 적는다.
- [ ] `DESIGN.md` 앞머리 색·모서리 값, `.impeccable/design.json`의 색 값을 §A에 맞춘다.
- 하지 말 것: §1 루트 색 표(첫 화면이 쓴다)와 `scripts/design-tokens.mjs` 수정.

### T1. build: shadcn 컴포넌트와 테마 연결
- [ ] `npx shadcn@latest add tabs toggle toggle-group card badge accordion tooltip popover`. `init`은 실행하지 않는다. `button.tsx`·`sheet.tsx` 덮어쓰기 질문에는 아니오. 명령이 막히면 Radix 패키지(`@radix-ui/react-tabs`·`-toggle`·`-toggle-group`·`-accordion`·`-tooltip`·`-popover`)를 설치하고 같은 파일을 직접 쓴다.
- [ ] 정적 내보내기: 상호작용 컴포넌트 파일 첫 줄에 `'use client'`. 서버 전용 기능을 쓰지 않으므로 `output:'export'`에 영향 없다. `TooltipProvider`는 `components/theme.tsx`의 `Themes` 안에 둔다(`delayDuration={300}`).
- [ ] `app/globals.css`의 두 `@import` 바로 아래에 이 블록만 추가한다.
  ```css
  @theme inline{--color-background:var(--bg);--color-foreground:var(--text);--color-card:var(--surface);--color-card-foreground:var(--text);--color-popover:var(--surface);--color-popover-foreground:var(--text);--color-primary:var(--primary);--color-primary-foreground:var(--primary-fg);--color-secondary:var(--secondary);--color-secondary-foreground:var(--secondary-fg);--color-muted:var(--surface-2);--color-muted-foreground:var(--muted);--color-accent:var(--surface-2);--color-accent-foreground:var(--text);--color-border:var(--line);--color-input:var(--line);--color-ring:var(--primary);--radius-sm:8px;--radius-md:10px;--radius-lg:16px;--radius-xl:16px}
  ```
- [ ] 생성된 파일을 다음 값으로 고친다(이 값 외 변형 삭제).
  - Tabs: 목록 `inline-flex gap-[4px] p-[4px] rounded-[12px] bg-[var(--secondary)]`. 탭 `min-h-[40px] px-[16px] rounded-[8px] text-[18px] font-semibold text-[var(--secondary-fg)]`, 선택 `bg-[var(--primary)] text-[var(--primary-fg)]`.
  - Toggle·ToggleGroup: 항목 `min-h-[44px] px-[14px] rounded-[10px] text-[18px] font-semibold bg-[var(--secondary)] text-[var(--secondary-fg)]`, 켜짐 `bg-[var(--primary)] text-[var(--primary-fg)]`. 묶음 `gap-[6px]`, 항목을 붙이지 않는다.
  - Card: `rounded-[16px] bg-[var(--surface)] text-[var(--text)]`, 테두리·그림자 없음.
  - Badge: `inline-flex items-center gap-[4px] min-h-[28px] px-[8px] rounded-[8px] text-[18px] font-semibold`. 변형 3개: 기본(`--secondary-soft`/`--text`), `strong`(`--primary`/`--primary-fg`), `swap`(`--swap`/`--swap-fg`).
  - Accordion: 항목 아래 1px `--line`. 제목 `min-h-[56px] text-[20px] font-semibold`, 내용 아래 여백 16px.
  - Tooltip: 배경 `--text`, 글자 `--bg`, 18px, 모서리 8, 여백 6×10.
  - Popover: 배경 `--surface`, 모서리 16, 여백 16, 그림자는 §A3.
  - 초점: `focus-visible:outline-[3px] focus-visible:outline-[var(--primary)] focus-visible:outline-offset-2`.
- 추가하지 않는 것: `scroll-area`(시트 본문은 기본 스크롤이 문서 내 이동·위치 기억과 맞다. `scrollbar-gutter:stable;overscroll-behavior:contain`만 준다), `select`·`checkbox`(체크 목록과 장 선택은 기존 기본 요소가 검사·저장과 묶여 있다), `dialog`(기존 `sheet.tsx` 유지).
- 확인: 기존 화면에 변화 없음. `git diff app/globals.css`는 위 블록(과 CLI가 넣은 애니메이션 import)뿐.

### T2. style: 색 완화와 초상화 배경 통일
- [ ] `app/redesign.css` 맨 위 두 토큰 블록을 §A1 값으로 바꾸고 신규 토큰을 추가한다.
- [ ] 본문 배경 고정: `html body:has(.app-shell),html body:has(.team-page){background:#F4F3F0}`와 `html.dark …{background:#191918}`. 지금은 `route-colors.css`가 body에 루트색(`#F6E7A8` 등)을 칠해 화면 가장자리에 비친다.
- [ ] 루트 머리: `.route-banner-art{background:var(--route-tint);color:var(--text);block-size:160px}`(767px 이하 128px), 문장 그림 `opacity:.10`, 제목 여백 `44px 40px`(휴대폰 `24px 20px`). `.banner-lord` 높이는 면보다 넘치지 않게 `block-size:200%` 기준으로 위쪽 정렬을 유지한다.
- [ ] `.current-chip`은 `--route-ink`. 진행 막대 색 교체. 표 선은 `--table-line`.
- [ ] 초상화 배경은 §A2 규칙 한 줄.
- 확인: 5개 범위(네 루트 1부 + 3부) × 두 테마에서 계산된 색이 표와 같다. 첫 화면은 변경 전후 화면이 같다(1440×810, 390×844, 두 테마). 3부 인물 화면에서 초상화 배경이 모두 `#16272D`.
- 하지 말 것: 첫 화면 색, `route-colors.css`, 기호 색 변경.

### T3. fix: 같은 묶음의 중복 초상화·병종 그림 제거
원인: 원본 조각에 이미 `<img>`가 있는데 `GameText`가 이름마다 그림을 또 붙인다(예: 백마술 탭 "시로코 학습표" 제목에 시로코 얼굴 2개, 루트 편성 카드에 큰 얼굴 + 이름 옆 작은 얼굴, 병종 그림 + 병종 칩 그림).
- [ ] `components/game-text.tsx`: `GameText`에 `skip?:ReadonlySet<string>`을 추가한다. `skip`에 든 인물·병종 이름은 그림 없이 글자만 낸다(병종은 굵기 유지). 같은 파일에서 그림 경로→이름 역방향 표를 `people`·`classes`로 만들어 내보낸다. **import 줄은 바꾸지 않는다**(`scripts/verify-redesign.mjs`가 import 문자열을 치환해 컴파일한다).
- [ ] `components/records.tsx`의 `Semantic`, `components/source-markup.tsx`: `h2~h5, li, p, td, th, summary, figcaption`과 `data-face-row` 요소를 그릴 때 그 안의 `/portraits/`·`/classes/` 그림이 가리키는 이름을 모아 하위 `GameText`에 `skip`으로 넘긴다(부모의 `skip`과 합친다).
- [ ] `scripts/verify-redesign.mjs`에 `skip`을 주면 그림이 0개이고 글자는 그대로라는 검사를 더한다.
- 확인(브라우저 스크립트): `/team/` 네 탭, `/theodora/1/` 다섯 화면, `/part3/3/`에서 `li,h2,h3,h4,p,td,th` 각각 안에 같은 `src`의 초상화·병종 그림이 2개 이상인 요소 0개.

### T4. fix: 화면 표기 백마법 → 백마술
- [ ] `lib/display.ts` `displayText` 끝에 `.replaceAll('백마법','백마술')`. `GameText`도 받은 글에 같은 치환을 먼저 한다.
- [ ] `content/character-copy.json`의 4곳, `components/team.tsx`의 탭·시트 제목, 팀 카드 무기 이름(`w.label`)에 적용한다.
- [ ] `scripts/feature-browser-check.mjs`의 "백마법" 4곳을 "백마술"로.
- 확인: `components lib app`에서 `백마법` 검색 0건. 각 화면과 열린 시트의 `innerText`에 `백마법` 없음.
- 하지 말 것: `content/data`·`derived` 원문 수정. `흑마법`은 건드리지 않는다(§C Q10).

### T5. feat: 인물 자료 보강(자료 계층)
지금 인물 카드는 `phase-goals`의 이번 부 병종과 한 줄 목표만 쓴다. 이전 공략 카드가 보여 주던 최종 병종·병종별 무기와 시험 조건·기능 우선순위는 자료가 저장소에 있는데 연결되지 않았다. `content/data`는 이전 공략 `data/`와 바이트가 같다(자료 누락이 아니라 표시 누락).
- [ ] `lib/content.ts`의 `Person`과 `peopleFor`에 추가한다.

  | 필드 | 원천 |
  |---|---|
  | `finalClasses:string[]` | `phase-goals.routes[루트][이름]['3'].classes` (예: 세오도라 `['홀리 랜서']`, 우술라 `['섀도 시커','더 캘러미티']`) |
  | `next?:string` | `phase-goals…[부].next` |
  | `skills:{skill,target,kind,when,why}[]` | `training-priorities.routes[루트][이름][부].goals`(priority 순) |
  | `skillNote:string` | 같은 곳 `.note` |
  | `exams:Record<병종,{tier,level,renown,required,choice,unlock,weapons,traits}>` | 이번 부 병종 + 최종 병종. `class-details.classes` + `assets/classes/manifest.json` |
  | `steps:Record<병종,{label,reason}>` | `class-path-reasons.routes[루트][이름][부].steps`의 `label`, `compact.reason` |
  | `fusion?:string` | `phase-goals…fusion` |
- [ ] `lib/team.ts`: 팀 인물마다 `exam`(최종 병종의 `class-details`)과 `classWeapons`(manifest)를 더한다.
- [ ] `components/game-text.tsx`의 기능 그림 표에 `'중장술':'armor'`를 더한다(`class-details`·manifest는 "중장술", 다른 자료는 "중갑술"로 적혀 있다. 글자는 바꾸지 않는다 — §C Q6).
- [ ] 새 `scripts/verify-character-data.mjs`를 `scripts/verify.mjs`에서 불러온다. 검사: 61명 × 3부. 경로의 모든 병종이 manifest·class-details에 있다. 최종 25인은 `finalClasses.at(-1)`이 팀 카드 병종과 같다. 빈 값은 아래 **알려진 목록과 정확히 같아야** 한다(자료가 바뀌면 드러나게).
  - 병종 빈칸: 세오도라/누조 2부, 디트리히/누조 2부, 디트리히/제스터 2부, 레다/버커니어 2·3부.
  - 기능 자료 없음: 세오도라/이오 1·2부, 세오도라/누조 1·2부, 레다/이오 1·2부, 레다/알렉산드라 1·2부, 레다/하르빈 3부, 레다/버커니어 2·3부, 디트리히/이오 1부, 디트리히/누조 1·2부, 디트리히/제스터 1·2부, 카이/이오 1·2부.
- 인물별 값과 빠진 것 전체는 부록 A·B.

### T6. feat: 인물 카드 재구성
파일: `components/people.tsx`, `components/detail-sheets.tsx`, `components/records.tsx`(안 쓰게 된 `RecordRows`만 삭제), `app/redesign.css`.

현재 문제: "시험 조건·시기별 계획·원문 기록"이 `unit-readiness` 전체를 38행 표로 쏟는다. 이름표 없는 키 8개가 모두 "출격·경험치"로 나오고, 1·2·3부 값이 부마다 반복되고, `scheduleByPhase`는 `investmentLane + starts + stops`를 이어 붙인 중복이다.

- [ ] 카드 = shadcn `Card`. 순서: 머리 → 요약 표 → 접는 묶음 2개.
- [ ] 머리: 초상화 96(휴대폰 72), 이름 22/700, 배지(역할, 3부면 `{루트}에서 준비 · {구분}`, 합류 표시, 지원 n, 명성 n). 지금과 같은 정보.
- [ ] **요약 표(카드에서 유일한 표)** — 제목 칸 폭 120px(휴대폰 100px), 이 순서.

  | 제목 | 내용 |
  |---|---|
  | 영입 이유 | `summary.reason` |
  | 합류 | `summary.join` |
  | 출격 | `summary.battle` |
  | 최종 병종 | `finalClasses`를 `→`로. 병종 그림 + 이름 + 단계 배지, 이어서 그 병종의 무기 그림과 이름. 예: `홀리 랜서 최상급직 · 창술 · 백마술` |
  | 병종 경로 | 이번 부 `classes`(지금의 `ClassPath`). `next`가 있으면 끝에 `다음: {next}`. 빈 배열이면 `이 부에서 바꾸는 병종 없음` |
  | 필요 기능 | `skills`를 칩으로: 기능 그림 + `창술 B` + 종류 배지(`주력`, `실전 추천`, `선택` 등 원문 그대로). 없으면 `없음` |
  | 목표 | `summary.goals`. 글 안의 `주력 무기 A`는 `skills`의 주력 기능 이름으로 바꿔 보인다(예: `도끼술 A`) |
  | 멈출 때 | `summary.stop` |
  | 보존 주의 | 있을 때만 |
  - 지양 10명은 `최종 병종`·`병종 경로`·`필요 기능` 행을 내지 않는다.
- [ ] **접는 묶음 1 "시험 조건·시기별 계획"** — 표 금지. `<dl class="detail-pairs">`로 제목 한 줄, 그 아래 설명. 쌍마다 위 1px `--line`, 여백 12px 0. 제목 18/600 `--muted`, 설명 20/1.6. 값이 비면 쌍을 내지 않는다. 순서:
  1. `{병종} 시험` — 이번 부 병종마다 한 쌍. `권장 Lv{level} · 명성 {renown} · {required} · 선택 {choice}`, 줄바꿈 `무기 {weapons}`, 줄바꿈 `해금 {unlock}`. `–` 값은 뺀다.
  2. `{기능} {등급} · {종류}` — `skills`마다 한 쌍. 설명 `{when}. {why}`.
  3. `기능 메모` — `skillNote`.
  4. `준비 마감`(1부만) — `{middleClass} · {middleExam} · {middleBy}`, 줄바꿈 `{part1Skills} · {skillsBy}`.
  5. `육성 시작` — `starts[부]`.
  6. `레벨업·실전 병종` — `growthClass`(다르면 ` / battleClass`) ` · swapReason`.
  7. `육성판` — `{kind} · {merge}`, 있으면 ` · {fusion}`.
  8. `영입 조건` — `gates`의 `localCondition`, `가입 병종 {init}`.
  9. `합류 순서` — `joinSteps`.
  10. `경로 안내`(1부만) — `pathNotes`.
  11. `선물`.
  - 중복 제거: 공백과 `·`를 뺀 설명이 앞 쌍이나 요약 표 칸과 같으면 그 쌍을 버린다.
  - 내지 않는 키(위 값의 반복): `schedule`, `scheduleByPhase`, `investmentLane(ByPhase)`, `usageByPhase`, `investmentByPhase`, `stops`, `reason`, `floorLabel`, `final25`, 다른 부의 값.
- [ ] **접는 묶음 2 "원문 기록"** — 지금 "영입 조건·자세한 육성" 안의 `Semantic nodes={p.details}`를 그대로 둔다(이전 공략 카드 원문 보존).
- [ ] 두 묶음은 shadcn `Accordion type="multiple"`, 기본 닫힘. 열림 상태는 `usePreference<string[]>('people-open-'+route+'-'+part)`에 `{이름}:plan|raw`로 저장한다(기존 접기 기억 기능 유지).
- [ ] 격자: 1000px 이상 2열, 미만 1열, `align-items:start`.
- 확인:
  - 세오도라 1부: 최종 병종 `홀리 랜서 · 창술 · 백마술`, 병종 경로 `병사→경기병→가디언`, 필요 기능 `창술 B 주력 · 백마술 B 실전 추천 · 지휘술 D → C 선택`, `가디언 시험` 쌍에 `권장 Lv35 · 명성 8 · 창술 B`, `무기 창술 · 백마술`. 2부: 경로 `가디언`, `다음: 홀리 랜서`.
  - 세오도라/누조 2부: `이 부에서 바꾸는 병종 없음 · 다음: 마스터 아치`.
  - 183개 카드 전부: 묶음 1 안에 `table` 0개, 쌍 14개 이하, 같은 설명 반복 0개.
  - `scripts/verify-character-copy.mjs` 통과(`characterSummary` 서명 유지).

### T7. feat: 팀 페이지 4탭과 최종 25인 격자
파일: `components/team.tsx`(재작성, 필요하면 `team-final.tsx`·`team-unit-sheet.tsx`로 나눈다), `lib/team.ts`, 새 `app/team.css`(layout에서 redesign.css 다음에 import), `app/globals.css`에서 안 쓰게 된 `.team-stripe·.team-grid·.team-unit·.team-fields·.team-purpose·.scenario-tabs` 규칙 삭제.

- [ ] 탭(shadcn `Tabs`): `최종 25인`(final) · `백마술`(spells) · `루트 편성`(routes) · `비교 근거`(details). 기본 `final`. 저장 키 `team-tab` 유지.
- [ ] **정렬은 이전 공략 규칙 그대로이며 이미 같다.** 바꾸지 않는다.
  - 이전: `fe-fortunes-weave-guide-main/personalized-app/src/App.tsx:362` — `baseline.map(n=>swaps[n]||n).sort(displayGroupRank, displayPriority)`.
  - 순위 계산: `tools/team_specialties.py:32-33`, 자료 `data/team-specialty-review.json`의 `displayGroups`·`displayGroupOrder`·`displayPriority`·`sortingNote`. 선호 기록 `notes/knowledge/team-results-page.md:35`.
  - 뜻: 이스마르 → 군주 4명 → 근접 → 마법 → 활 → 기동 → 회복 → 재행동. 교체로 들어온 인물도 자기 역할 자리로 다시 정렬한다.
  - 현재: `components/team.tsx:37`. 격자는 왼쪽→오른쪽, 위→아래로 채운다.
- [ ] 머리(600px 이상): 1행 48px = `← 루트 선택` · 탭 · (1100px 이상) `25명 · 여성 n명` 18px `--muted` · 테마. 2행 44px = 편성안 `ToggleGroup`(단일, 자료의 `title`) · 체험 `ToggleGroup`(다중, 자료의 `label`) · `Toggle` `시간 경과 후 초상화`. 폭 1200px 미만이면 2행을 `select`(편성안) + `옵션` 버튼(`Popover`: 체험 2개, 초상화 토글, 인원 문구)으로 바꾼다.
- [ ] 머리(599px 이하): 1행 48 = 뒤로(아이콘) · `팀 구성` · 테마. 2행 48 = 탭 4개 균등. 3행 44 = `select` + `옵션`.
- [ ] 편성안 설명 글(`description`)과 교체 손익 글은 최종 25인 탭에 두지 않고 비교 근거 탭 맨 위(T9)와 상세 시트로 옮긴다.
- [ ] `final` 탭일 때만 `.team-page{height:100dvh;overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr)}`(머리 줄들을 한 묶음으로, 격자가 나머지). 격자는 남는 높이를 `repeat(행,minmax(0,1fr))`로 나눈다. 다른 탭은 보통 스크롤.
- [ ] 격자 배치(뷰포트 기준).

  | 조건 | 열×행 | 페이지 여백 | 칸 사이 | 격자 위 여백 |
  |---|---|---|---|---|
  | 폭 ≤599 | 4×7 | 8 | 4 | 14 |
  | 폭 ≥600, 높이 ≤559 | 7×4 (머리는 한 줄 48: 뒤로·탭·옵션·테마) | 8 | 4 | 14 |
  | 폭 ≥600, 세로형(가로/세로 ≤1) | 5×5 | 12 | 8 (폭 ≥1000: 12) | 12 |
  | 폭 ≥600, 가로형, 높이 ≥560 | 5×5 | 12 (높이 <760: 8) | 8 (높이 <760: 6, 폭 ≥1600: 12, 폭 ≥2560: 16) | 12 |
  - 격자 위 여백은 첫 줄 배지가 걸칠 자리다.
  - 머리 줄 사이와 머리–격자 사이 간격: 8(높이 <760: 6, 폭 ≤599: 4).
- [ ] 카드 내용은 칸 크기에 따라 정한다. 칸 `.unit-cell{container:unit/size;position:relative}`, 카드는 그 안의 `button.unit-card`.

  | 단계 | 칸 조건 | 배치 | 초상화(정사각) | 글 |
  |---|---|---|---|---|
  | tile | 기본 | 세로, 가운데 | `clamp(28px,100cqh - 32px,96px)` | 이름 18/600, 줄 20, 자간 -0.04em, 한 줄 |
  | col | 비율 ≤5/4, 폭 ≥130, 높이 ≥150 | 세로, 안 여백 4 | `min(100cqw - 20px,100cqh - 66px)` | 이름 20/700 줄 22 · 병종(그림 20 + 간격 2 + 이름 18) 줄 24, 한 줄 |
  | col+ | 비율 ≤5/4, 폭 ≥190, 높이 ≥300 | 세로, 안 여백 4 | `min(100cqw - 20px,100cqh - 152px)` | 이름 22/700 줄 28 · 병종 줄 28(그림 28) · 역할 18 줄 24 최대 2줄 · 병종 무기 그림 24 한 줄 |
  | row | 비율 ≥5/4, 폭 ≥236, 높이 ≥104 | 가로(초상화 왼쪽), 안 여백 4, 그림–글 간격 8, 글은 세로 가운데 | `min(100cqh - 20px,100cqw - 168px)` | 이름 20/700 줄 22 · 병종 줄 24 · 역할 18 줄 21 최대 2줄(`word-break:keep-all`) |
  | row+ | 비율 ≥5/4, 폭 ≥300, 높이 ≥150 | 가로, 안 여백 8, 그림–글 간격 12 | `min(100cqh - 28px,144px)` | 이름 22/700 줄 28 · 병종 줄 28 · 역할 18 줄 24 최대 2줄 · 병종 무기 그림 24 한 줄 |
  - 그림만 있는 무기 아이콘에는 `Tooltip`과 `aria-label`을 붙인다.
  - 카드: `border:6px solid transparent;border-radius:14px`(tile은 10px), 배경 `--surface`, `overflow:hidden`. 교체 표시는 §A4. 배지는 카드 밖으로 걸치므로 카드의 자식이 아니라 칸(`.unit-cell`)의 자식으로 두고 `pointer-events:none`을 준다. 격자에는 `overflow:visible`.
  - 기준 뷰포트에서 나와야 하는 결과:

    | 뷰포트 | 칸(폭×높이, 약) | 단계 | 보이는 것 |
    |---|---|---|---|
    | 1920×1080 | 370×177 | row+ | 얼굴 144 · 이름 · 병종 · 역할 · 병종 무기 |
    | 1440×810 | 277×127 | row | 얼굴 107 · 이름 · 병종 · 역할 |
    | 1280×720 | 248×113 | row | 얼굴 80 · 이름 · 병종 · 역할 |
    | 1080×1920 | 202×345 | col+ | 얼굴 182 · 이름 · 병종 · 역할 · 병종 무기 |
    | 768×1024 | 142×169 | col | 얼굴 103 · 이름 · 병종 |
    | 390×693 | 90×70 | tile | 얼굴 37 · 이름 |
  - 가장 빠듯한 곳: 1280×720의 글 칸 폭 140px(`더 트라이던트` 병종 줄 126px, 역할은 2줄), 768×1024의 병종 줄(칸 안 폭 122px에 120px), 390×693의 다섯 글자 이름(칸 안 폭 78.5px에 74.2px). 넘치면 값을 바꾸지 말고 보고한다. 폭 375px 미만 휴대폰은 보장 범위 밖이다.
  - 18px 최소 글자 때문에 작은 화면 카드에는 무기·특기·주요 무기·백마술·이유가 들어가지 않는다. 글자를 줄여 넣지 않는다. 전부 상세 시트에 있다(§C Q2).
- [ ] 카드를 누르면 상세 시트(기존 `Sheet`)가 열린다. 내용은 `detail-pairs` 형식: 초상화 96 · 이름 · 역할 · `희망 인물` 배지 / `최종 병종`(병종 문서 버튼 + 단계) / `시험 조건`(`exam`) / `병과의 사용 가능 무기` / `특기` / `주요 무기·마법`(2개와 설명) / `핵심 백마술`(누르면 마법 시트) / `경유`(`growthGoal`이 있으면 `{via} → {skill} {rank} · {unlock}`) / `역할 설명`(`characterReason`) / 교체된 인물이면 `교체 손익`(`roleTradeoffs`) / 버튼 `특기 검토 문서`.
- [ ] 초상화 토글이 꺼져 있으면 타임스킵 전, 켜면 후 초상화.
- 확인(스크립트, 뷰포트 6종 × 편성안 3 × 체험 없음·둘 다 × 두 테마):
  - `scrollHeight===innerHeight`, `scrollWidth===innerWidth`, `scrollTo(0,100)` 후 `scrollY===0`.
  - 칸 25개가 모두 뷰포트 안, 크기 동일. 카드마다 `scrollHeight<=clientHeight`, `scrollWidth<=clientWidth`, 모든 글자 상자가 카드 안, 글자 18px 이상.
  - 순서 = 정렬 규칙. 교체 수 = 0 / 4 / 3(+체험). 교체 카드 테두리 6px `--swap`, 배지 배경 같은 색·오른쪽 위. 나머지 카드 테두리 투명.
  - `scripts/verify-feature-parity.mjs`의 12조합 검사는 그대로 통과.
- 하지 말 것: 글자 축소, 카드 안 스크롤, 내용 말줄임(`…`), 교체 여부에 따른 카드 크기 변화, 정렬 변경.

### T8. feat: 루트 편성 탭 재작성
파일: `lib/team.ts`(해석기), 새 `components/team-routes.tsx`, `app/team.css`.

현재 문제: 원본 조각을 그대로 흘려보내 얼굴이 2개씩, 병종 그림이 2개씩 나오고, 줄마다 왼쪽 시작점이 다르고, 긴 글이 옆으로 넘친다. `3부`를 고르면 내용이 없다(자료 `routeTeams[*].parts['3']`가 빈 배열). `변경 인물만`은 77개 카드가 전부 `data-change="keep"`이라 켜면 아무것도 안 남는다.

- [ ] `lib/team.ts`에서 `routeTeams[루트].parts[부].tree`를 구조로 바꾼다. 조각 모양은 77개 모두 같다: `section > div(h3 제목 + span 인원) + p 안내 + ul > li[img 초상화, div(이름 b, 이유 p, 병종 span, 무기 div[aria-label], 백마술 div[data-white-person]?, 목표 p|ul)]`.
  결과: `{title,count,note,units:{name,portrait,reason,className,classTier,weapons:{skill,icon}[],white?:{allowed,title,spells:{id,name,rank,title}[],notes:string[]},goal:string[]}[]}`. `intro.tree`는 `{title,priority:string[],notes:string[]}`.
- [ ] 조작 줄: 루트 `ToggleGroup`(세오도라·레다·디트리히·카이) · 부 `ToggleGroup`(1부·2부) · 링크 버튼 `이 편성의 공략`. 저장된 부가 `3`이면 `1`로 읽는다. `변경 인물만`은 내지 않는다(§C Q3).
- [ ] 머리: 제목 24/700 `{루트} {부}부 우선 전력` + 인원 배지. 안내 글 18 `--muted`. 우선 인물은 얼굴 28 + 이름 칩 한 줄. 안내 3줄은 목록.
- [ ] 카드 격자: `repeat(auto-fill,minmax(320px,1fr))`, 사이 16, 휴대폰 1열. 카드 여백 20.
  - 윗줄: 초상화 72(카드에 **하나만**) + 이름 22/700 + 이유 20.
  - 아랫줄(`detail-pairs`, 카드 전체 폭): `병종`(그림 28 + 이름 버튼 → 병종 문서, 단계 배지) / `병종 무기`(그림 24 + 이름) / `핵심 백마술` 또는 `백마술 · 병종 변경 시`(칩 버튼 → 마법 시트, 안내 글) / `목표`.
  - 이유·목표 글은 `GameText`에 모든 인물·병종 이름을 `skip`으로 넘겨 글 속 그림을 내지 않는다. 기능 그림만 허용.
  - 1·2부 편성이므로 초상화는 항상 타임스킵 전.
- 확인: 카드 수 세오도라 6·10, 레다 9·11, 디트리히 9·11, 카이 9·12. 카드마다 초상화 1개. 카드 안 `dt,dd`의 왼쪽 좌표가 모두 같다(±1px). 가로 넘침 0. 렌더된 글 = 원본 조각 글(공백 제외, 백마법→백마술 반영).

### T9. feat: 비교 근거·백마술 탭 정리
- [ ] 비교 근거 맨 위 `선택한 편성` 카드: 편성안 제목, 설명, 교체 목록(`나간 인물 → 들어온 인물` · 역할 · 손익 글), 켜진 체험.
- [ ] 그 아래 원본 `teamSections.details`의 최상위 구역 10개를 원본 순서대로. 첫 구역(안내)은 펼친 채 카드로, 그 안의 `nav`(목차)는 내지 않는다. 나머지 9개는 `Accordion type="multiple"` 항목. 제목은 구역의 첫 `h2`. 제목 없는 `recruitment-pool`은 원본 목차 문구 `확보·예비`. 기본 열림은 `comparison`만. 빈 `ol#roster`는 내지 않는다.
- [ ] 구역 안은 `Semantic`(T3 적용) + 공통 규칙: 본문 최대 폭 880px, 모든 블록이 같은 왼쪽 선(중첩 `section`·`article`의 추가 여백·테두리 제거), `h3` 22/700 위 여백 24, 표는 폭 100% + 좁으면 감싼 칸만 가로 스크롤, 얼굴 목록은 40px 칩 줄.
- [ ] 문서 안 `#id` 이동(`jump`)은 대상이 든 항목을 연 뒤 스크롤한다. `#final-25`·`#white-spell-book`·`#route-comparison`은 해당 탭으로 간다.
- [ ] `전체 참고 문서` 버튼과 목록은 비교 근거 탭 맨 아래로 옮긴다.
- [ ] 백마술 탭: 안내 목록 → `시로코 학습표` 카드 → 묶음 4개(회복·해제 7, 이동·구조 3, 제어·보호 7, 공격 4). 마법 카드 격자 `repeat(auto-fill,minmax(300px,1fr))`, 사이 16, 여백 20. 카드: 이름 22/700(밑줄 없음) · 배지(사거리, 성격) · 효과 · 출처 링크. `id="spell-…"` 유지.
- 확인: T3 스크립트 0건(시로코 학습표 얼굴 1개). 각 구역 안 블록의 왼쪽 좌표 종류가 1개(표 칸·목록 들여쓰기 제외). 원본 대비 글자 보존.

### T10. style: 루트 화면 정리(할 일·인물·준비·재료·문서)
구조와 기능은 그대로 두고 면·간격·고정만 바꾼다.
- [ ] 카드 모서리 16으로 통일(`.action-group`, `.route-banner`, `.context-rail>section`, `.person`, `.material-entry`, 문서 목록 버튼).
- [ ] 화면 탭(`.guide-navigation`)을 팀 탭과 같은 모양으로: 선택 = `--primary` 채움.
- [ ] 준비·재료 화면: 구역 제목 24/700, 위 32·아래 16, 모든 구역이 같은 왼쪽 선.
- [ ] 1000px 이하 `이 장의 정보`(`.context-rail`)를 할 일 목록 위 가로 띠로: `display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;scroll-padding-inline:16px;overscroll-behavior-x:contain`, 카드 `flex:0 0 min(300px,82%);scroll-snap-align:start`.
- [ ] 열린 장의 제목 줄 고정: `.chapter-section[open]>summary{position:sticky;top:var(--task-header-height);z-index:10;background:var(--bg)}`.
- [ ] `Sheet` 닫기 버튼 이름을 `닫기`로(지금은 그림·인물 시트에서도 "참고 문서 닫기").
- 하지 말 것: 체크 목록 DOM·id(`data-checklist-source`, 체크박스 id, `details.chapter-section`, `.action-group`), 이동·완료 숨기기·내보내기·가져오기 동작 변경.
- 확인: 9개 범위 × 5화면에서 가로 넘침 0, 글자 18px 이상, 고정된 도구 줄·장 제목이 내용과 겹치지 않음.

### T11. feat: 화면 전환과 작은 움직임
지원 확인: next 16.4.6 + react 19.3.1. `import { ViewTransition } from 'react'`가 설정 없이 동작하고 `Link`에 `transitionTypes`가 있다(`node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`, `experimental.viewTransition`은 16.3에서 제거).
- [ ] 같은 요소 이동(첫 화면 ↔ 루트 화면): `home.tsx`의 `.lord-portrait`와 `tasks.tsx`의 `.banner-lord`를 `<ViewTransition name={'lord-'+route} share="morph" default="none">`로 감싼다(1·2부만, 3부 띠는 제외). 첫 화면은 이 감싸기 외에 바꾸지 않는다.
- [ ] 페이지 전환: `Home`, `Shell`의 `main`, `Team`의 `main`을 `<ViewTransition default="page-fade">`로 감싼다. 1부↔2부 링크는 `transitionTypes={['nav-forward']}`/`['nav-back']`, 이동 16px + 흐려짐.
- [ ] 화면 안 전환(탭·편성안·체험·화면 탭): `usePreference`는 `useSyncExternalStore`라 React 전환으로 잡히지 않는다. 새 `lib/view-transition.ts`의 `withViewTransition(update)`를 쓴다 — `document.startViewTransition`이 없거나 동작 줄이기면 바로 `update()`, 아니면 `document.startViewTransition(()=>flushSync(update))`.
- [ ] 편성안을 바꾸면 카드가 새 자리로 움직이게 칸마다 `style={{viewTransitionName:'team-unit-'+번호}}`(번호 = `Object.keys(units)` 순서. 이름은 한 화면에 하나씩만).
- [ ] CSS: `::view-transition-old(.page-fade)` 160ms, `::view-transition-new(.page-fade)` 220ms, `::view-transition-group(.morph)`과 `team-unit-*` 300ms. 동작 줄이기에서 `::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}`.
- [ ] 스크롤 연동(장식, 대체 없음): `@supports ((animation-timeline:view()) and (animation-range:0% 100%))` 안에서 루트 머리 군주 그림만 `translate 0→0 24px`, `opacity 1→.6`, `animation-range:exit 0% exit 100%`. `animation-timeline`은 `animation` 축약 뒤에 쓴다.
- [ ] §A5의 버튼·체크·카드·접기·시트 움직임.
- 넣지 않는 곳: 체크 목록에 스크롤 스냅(읽기를 방해), 최종 25인 격자에 스크롤 효과(스크롤 없음), 단계별 고정 연출(읽는 문서라 맞지 않음), 자동 재생 움직임.
- 확인: Chromium에서 첫 화면→세오도라 1부 이동 때 군주 그림이 이어지고, 편성안 전환 때 카드가 이동한다. 동작 줄이기 설정에서 전환·움직임이 없다. 콘솔 오류 0(이름 중복 경고 포함).

### T12. feat: 장 완료 색종이
- [ ] `npm i canvas-confetti` + `npm i -D @types/canvas-confetti`. `tasks.tsx`의 체크박스 `onChange` 안에서만 판단한다.
  - 조건: `value===true` 그리고 누르기 전 그 장이 미완료 그리고 `{...checks,[id]:true}`로 다시 센 그 장이 전부 완료(`checked()` 사용).
  - 불러오기: `const confetti=(await import('canvas-confetti')).default`.
  - 값: `particleCount:90, spread:70, startVelocity:38, ticks:160, scalar:.9, disableForReducedMotion:true`, `origin` = 그 장 제목 줄 가운데(숨겨졌으면 `{x:.5,y:.6}`), `colors` = [완료 막대색, `--route-ink`, 밝게 `#D2A97F` / 어둡게 `#9DB8D4`].
  - `matchMedia('(prefers-reduced-motion: reduce)')`면 호출하지 않는다. 숨김 글 `aria-live="polite"`로 `{장} 완료`.
- 터지지 않아야 하는 때: 화면을 열 때, 가져오기, 다른 탭 동기화, 체크 해제, 이미 완료된 장.
- 확인(별도 포트 복사본): 장의 마지막 항목을 체크하면 1회, 해제 후 다시 체크하면 다시 1회, 새로고침·가져오기에서는 0회, 동작 줄이기에서 0회.

### T13. test·docs: 검사 갱신과 기록
- [ ] `npm run verify`에 들어 있는 것 중 고칠 것: `verify-redesign.mjs`(T3 검사 추가), `verify.mjs`(T5 스크립트 import). 나머지(`verify-feature-parity`·`verify-readability`·`verify-character-copy`·`verify-design-assets`·`verify-image-parity`)는 자료를 보므로 그대로 통과해야 한다. 실패하면 자료를 건드린 것이다.
- [ ] `npm run verify` 밖의 브라우저 검사는 옛 구조를 본다. 고친다: `scripts/browser-check.mjs`(`.team-grid`·`.team-stripe`·`.team-unit`·`.scenario-tabs`·`person-info`), `feature-browser-check.mjs`(`.team-unit`·`team-reference`·"백마법"), `design-lead-browser-check.mjs`·`corrections-browser-check.mjs`(`person-info`).
- [ ] T7 확인 스크립트를 `scripts/team-fit-check.mjs`로 남긴다.
- [ ] `HANDOFF.md` §4·§6, `PLAN.md`에 이번 결정(6px 교체 표시, 4탭, 색, 초상화 배경, 색종이)을 날짜·출처와 함께 적는다.
- [ ] 선호 기록은 이전 프로젝트 `notes/knowledge/interface.md`·`team-results-page.md`가 정본이다. 거기에 적은 뒤 `npm run transfer`로 사본을 갱신한다. 사본만 직접 고치면 `verify`의 해시 검사가 실패한다. 지난 커밋(b41c56d)처럼 `content/notes/knowledge/*.md`, `content/transfer-manifest.json`, `content/derived/documents.json`이 함께 바뀌어야 하며, 이 생성 결과만 §0 수정 금지의 예외다. 생성 명령으로 맞춰지지 않으면 손으로 고치지 말고 보고한다.

## C. 질문 (답이 올 때까지 괄호 안 기본값으로 진행)

1. **Q1 휴대폰 배지**: 390px 4열 칸(90px)에는 `미카엘라 대신`(98px)이 들어가지 않는다. 휴대폰에서만 `[나간 인물 얼굴] 대신`으로 줄여도 되는가? (기본: 줄인다. 누르면 시트에 전체 문구)
2. **Q2 작은 화면 카드 내용**: 18px 최소 글자를 지키면 1280×720·1440×810 카드는 얼굴·이름·병종·역할까지만 들어간다. 무기·특기·주요 무기·백마술은 눌러서 보는 것으로 괜찮은가? (기본: 괜찮다)
3. **Q3 루트 편성**: 3부 편성 자료가 없고(빈 값) `변경 인물만`은 표시할 변경이 없다. 3부 선택과 이 필터를 없애도 되는가? (기본: 없앤다. 3부는 최종 25인 탭)
4. **Q4 첫 화면**: 군주 그림 이어지기 효과를 위해 `home.tsx`에 보이지 않는 감싸기를 넣어도 되는가? 버튼 `최종 25명`을 탭 이름 `최종 25인`에 맞출까? (기본: 감싸기만 넣고 문구는 그대로)
5. **Q5 교체 색**: 하나로 통일(권장)인가, 교체마다 다른 색인가? (기본: 하나)
6. **Q6 자료 불일치** — 고치지 않고 표시만 했다. 어느 쪽이 맞는가?
   - 레다/자스민 3부 병종이 `비숍`인데 1·2부는 `헤비 아머`, 기능은 `창술 A`.
   - 카이/카이의 성장 병종이 `기갑 타조병`인데 경로는 `병사→경기병→바딩거`.
   - `class-details`·manifest는 `중장술`, 나머지는 `중갑술`.
7. **Q7 신 그림**에도 초상화와 같은 배경을 줄까? (기본: 준다)
8. **Q8 세오도라 예시**: 자료상 가디언·홀리 랜서의 시험 조건은 `창술 B`/`창술 A`뿐이고, 백마술은 "병종 무기(창술·백마술)"와 "기능 목표 백마술 B · 실전 추천"으로 있다. 이 둘을 보여 주는 것으로 맞는가, 아니면 시험 조건에 백마술이 있어야 하는가? (기본: 자료대로)
9. **Q9 4K**: 3840×2160·2160×3840도 이번 확인 대상인가? 대상이면 큰 칸용 단계(주요 무기·백마술·이유까지, 글자 확대)를 추가로 정한다. (기본: 넘침 없음만 확인)
10. **Q10 흑마법**도 `흑마술`로 바꿀까? (기본: 그대로)
11. **Q11 할 일 화면**: 이번에는 색·면·간격·고정만 바꾼다. 배치 자체를 다시 짜길 원하는가? (기본: 구조 유지)

### 사용자 답 · 2026-11-14 (이 대화)

- Q1·Q2 → **휴대폰(767px 이하)에서는 최소 글자 14px을 허용한다.** 최종 25인 휴대폰 칸은 이름 14px, 배지는 얼굴 없이 `{이름} 대신` 한 줄 14px로 쓴다(검토 H3 반영: 두 줄 배지는 얼굴을 가렸다). 다른 화면의 본문은 지금 크기를 유지하고, 14px은 칸이 좁아 넘치는 곳에만 쓴다.
- Q3 → 없앤다.
- Q6 → archive 원본으로 확인되는 것만 고치고, 확인 안 되면 `미확인` 표시. 추가 지시:
  - 지양 10명(양계·키로이카·밴디츠·마지데·골라이어스·자코네·대도·자스민·센트리온·타호니아)은 지원 대화용 영입만 한다. 이전 공략처럼 육성 안내(병종·기능·시험·목표)를 내지 않는다. 레다/자스민 비숍 불일치는 이 규칙으로 화면에서 사라진다.
  - **카이 루트는 마법·회복 담당을 뺀 전원이 전차병(Charioteer)으로 육성한다.** 이유: 레벨이 오를수록 성장률이 높아지는 병종이고, 전차병은 탈것 성장 보정을 두 배로 받는다. 카이 루트는 탈것 체계가 있어 특별 탈것(이오의 로시난, 알렉산드라의 부케팔라스)의 성장 보정과 재이동 같은 기술을 얻는다.
- Q8 → 자료대로 구분해 둘 다 표시.
- Q4·Q5·Q7·Q9·Q10·Q11 → 답 없음. 기본값으로 진행.

## D. 문서와 코드의 불일치 (발견한 것)

1. 표시 누락: 이전 공략 카드의 최종 병종·병종 무기·시험 조건·기능 우선순위가 새 카드에 없다. 자료는 `training-priorities.json`·`class-details.json`·`class-path-reasons.json`·manifest에 있다(`lib/`에서 한 번도 읽지 않음).
2. `people.tsx`의 상세 표: `records.tsx`의 `labels`에 `growthClass·battleClass·swapReason·final25·joinSteps·investmentLane·investmentLaneByPhase·scheduleByPhase`가 없어 모두 "출격·경험치"로 나온다. `final25`는 "예"로 찍힌다.
3. `team.tsx`가 경유 문구를 고정 문자열로 쓴다(`선택 경유 · 배틀 마스터 → 도끼술 S 준비`). 자료 `growthGoal`은 `{via,skill,rank,unlock}`이고 `unlock`(3부 4구간 · 심판의 천칭)은 화면에 없다.
4. 팀 루트 편성의 `3부` 선택은 빈 화면, `변경 인물만`은 항상 빈 결과(§T8).
5. 교체 표시: 이전 선호는 "4px 윤곽선 + 오른쪽 위 채움형 '누구 대신'"(`team-results-page.md:102`), 현재 코드는 윤곽선 없이 칩 `A → B`. 이번 요청은 6px.
6. 이전 선호는 항목 이름 `병과의 사용 가능 무기`(`team-results-page.md:127`), 코드는 `사용 가능 무기`.
7. 문서는 내부 화면 배경을 `#F1EEDC`로 적었지만 body에는 루트색이 칠해져 있다(`route-colors.css`의 `body:has(...)`).
8. 얼굴 크기: 문서는 28/48/96, 코드는 22×26·28·32·36·40·48·72×96·96이 섞여 있다.
9. 문서는 "채운 버튼만", 코드는 클래스 이름 `button-outline`과 `Button` 변형 `outline`을 쓴다(모양은 채움). 새 컴포넌트에는 outline 변형을 두지 않는다. 기존 이름은 그대로 둔다.
10. 탭 문구 `백마법`·`비교·근거`, 제목 `최종 25명` ↔ 이번 요청 `백마술`·`비교 근거`·`최종 25인`.
11. `components.json`은 shadcn 설정인데 `ui/button.tsx`·`ui/sheet.tsx`는 손으로 쓴 클래스 방식이고 `@theme` 연결이 없다.
12. `:root{font-size:18px}`로 rem이 18px이다. 문서에 없다.
13. 전역 동작 줄이기 규칙이 `animation-duration:.01ms` 방식이다(modern-web-guidance는 권하지 않음). 이번에는 유지하고 새 움직임만 `no-preference` 안에 쓴다.
14. `lib/content.ts`의 `routes[].description`은 사양 §0이 금지한 장식 문구이며 어디서도 쓰지 않는다(삭제하지 않고 보고만).
15. `Sheet` 닫기 버튼 이름이 모든 시트에서 "참고 문서 닫기".
16. HANDOFF §4의 "인물 정보는 2열 표" ↔ 이번 요청(주 정보만 표, 나머지는 제목–설명 쌍).

## E. 검토 기준

### 코드 검토
- [ ] 금지 경로(§0)에 변경이 없다. `git diff --stat`에 `content/data`, `content/source`, `content/derived`, `archive`, `app/route-colors.css`가 없다.
- [ ] `home.tsx` 변경은 `ViewTransition` 감싸기뿐이다.
- [ ] `lint`·`typecheck`·`verify` 통과. 새 의존성은 Radix 6종 + `canvas-confetti`(+types, CLI가 넣은 애니메이션 패키지)뿐이다.
- [ ] `components lib app`에 `백마법`, `text-sm`, `text-xs`, `outline` 변형, 18px 미만 글자 크기가 없다.
- [ ] 정렬 식이 `displayGroupRank → displayPriority` 그대로다.
- [ ] 색종이는 체크 이벤트 안에서만 호출된다(`useEffect` 금지).
- [ ] `usePreference` 키 이름이 유지되고 체크 저장 키(`fortunes-weave-checklist-v1`)를 건드리지 않는다.
- [ ] `game-text.tsx`의 import 줄이 그대로다.
- [ ] 새 움직임이 모두 `prefers-reduced-motion:no-preference` 안에 있다.
- [ ] 항목별 커밋이 분리돼 있고 각 커밋에서 검사가 통과한다.

### 시각 검토 (화면 × 뷰포트 × 테마)
- 화면: `/`, `/team/` 4탭(최종 25인은 편성안 3 × 체험 유무), 네 루트 × 1·2부 × 5화면, `/part3/3/` × 5화면.
- 뷰포트: 1920×1080, 1440×810, 1280×720, 390×693, 1080×1920, 768×1024.
- 테마: 밝게·어둡게.
- 전수: `/team/` 전부, `/theodora/1/` 5화면, `/part3/3/` 5화면. 나머지 루트는 1440×810과 390×693, 두 테마.

| 볼 것 | 기준 |
|---|---|
| 최종 25인 | 25명 전원이 보이고 어떤 방향으로도 스크롤되지 않는다. 잘린 글·말줄임 없음. 카드 크기 동일 |
| 교체 표시 | 들어온 카드만 6px 테두리, 오른쪽 위 같은 색 배지, 배지가 이름을 가리지 않는다 |
| 중복 그림 | 한 묶음에 같은 얼굴·병종 그림이 한 번만 |
| 왼쪽 선 | 루트 편성·비교 근거에서 블록 시작점이 하나로 맞는다 |
| 인물 카드 | 표는 요약 표 하나. 세오도라에 홀리 랜서·가디언·백마술이 보인다. 접는 묶음에 반복 없음 |
| 색 | §A1 값. 루트색은 머리 면과 "현재" 칩에만. 첫 화면은 이전과 같다 |
| 초상화 | 투명해 보이는 얼굴 없음. 구역 안 크기 통일. 1·2부는 타임스킵 전 |
| 글자 | 18px 이상. `백마법` 없음. 새 장식 문구 없음 |
| 그림 | 잘리지 않고 누르면 확대된다 |
| 움직임 | 전환·눌림·접기가 A5 값. 동작 줄이기에서 꺼진다. 색종이는 장 완료 순간에만 |
| 기능 보존 | 체크·내보내기·가져오기·이동·완료 숨기기·문서 시트·마법 시트·체험 토글·초상화 토글·접기 기억 |
| 체크 자료 | 3000번 주소의 실제 체크 수(세오도라 1부 185/439)가 그대로 |


## 부록 (자료에서 자동 추출, 2026-11-14)

### 부록 A. 루트별 인물 61명 — 화면에 나와야 하는 값 (원천: phase-goals · training-priorities)

표기: 기능의 `( )`는 선택·다른 루트 항목. **빠진 것**은 현재 요약 표(`목표` 행 = phase-goals text)에 없는 필수·추천 기능과 빈 값이다. 모든 행 공통으로 최종 병종·병종별 무기·시험 조건이 지금 화면에 없다.

#### 세오도라 루트

| 인물 | 1부 병종 | 2부 병종 | 3부(최종) | 1부 기능 | 2부 기능 | 3부 기능 | 빠진 것 |
|---|---|---|---|---|---|---|---|
| 세오도라 ★ | 병사→경기병→가디언 | 가디언 | 홀리 랜서 | 창술 B · 백마술 B · (지휘술 D → C) | 창술 A · 백마술 B · (지휘술 D → C) | 창술 A · 백마술 B · (지휘술 D → C) | 1부 백마술 B / 2부 백마술 B |
| 토비아스 | 투사→브리건드→워리어 | 워리어 | 배틀 마스터 | 도끼술 B · (보병술 C) · (지휘술 D) | 도끼술 A · (보병술 C) · (지휘술 D) | 도끼술 A · (보병술 C) · (지휘술 D) | 2부 도끼술 A |
| 보나파르트 | 주술사→샤먼→바테스 | 바테스 | 드루이드 | 흑마술 B · 백마술 B · (검술 C) | 흑마술 A · 백마술 B · (검술 C) | 흑마술 A · (검술 C) · (보병술 D) | 1부 백마술 B / 2부 백마술 B |
| 릴리안 ★ | 사냥병→아처→스나이퍼 | 스나이퍼 | 보우 나이트 | 궁술 B · 기마술 D · (지휘술 C) | 궁술 A · 기마술 D · (지휘술 C) | 궁술 A · 기마술 D · (지휘술 C) | — |
| 소피아 ★ | 주술사→프리스트→비숍 | 비숍 | 와이즈맨 | 백마술 B · (보병술 C) · (기마술 D) | 백마술 A · (보병술 C) · (기마술 D) | 백마술 A · (보병술 C) · (기마술 D) | — |
| 녹투라 | 투사→브리건드→워리어 | 워리어 | 배틀 마스터 | 도끼술 B · (격투술 C → B) · (보병술 C) | 도끼술 A · (격투술 C → B) · (보병술 C) | 도끼술 A · (격투술 C → B) · (보병술 C) | 2부 도끼술 A |
| 리네 ★ | 병사→프리스트→비숍 | 비숍 | 홀리 랜서 | 백마술 B · (보병술 D) · (창술 A) | 백마술 A · (보병술 D) · (창술 A) | 창술 A · 백마술 B · (보병술 D) | 3부 창술 A·백마술 B |
| 단테 ★ | 주술사→샤먼→바테스 | 바테스 | 발키리움 | 흑마술 B · 백마술 B · (검술 C) | 흑마술 A · 백마술 B · (검술 C) | 흑마술 A · 기마술 D · 백마술 A | 1부 백마술 B / 2부 백마술 B / 3부 기마술 D·백마술 A |
| 알렉산드라 ★ | 천익병 | 천익병 | 성천익병 | 검술 C · 비행술 C · (창술 B) | 검술 C · 비행술 C+ · (창술 B) | 검술 A · 비행술 C+ · (창술 B) | 1부 비행술 C / 2부 검술 C·비행술 C+ / 3부 비행술 C+ |
| 시로코 ★ | 투사→브리건드→워리어 | 워리어 | 디 아바타르 | 검술 B · 보병술 C | 검술 A · (지휘술 D) · (흑마술 A) | 흑마술 S · 검술 B · 기마술 D | 1부 보병술 C / 2부 검술 A / 3부 기마술 D |
| 우술라 ★ | 사냥병→브리건드→워리어 | 워리어 | 섀도 시커→더 캘러미티 | 검술 B · (보병술 C) | 검술 B · (보병술 C) | 검술 S · 궁술 A | 3부 궁술 A |
| 라이선더 | 비약 타조병→경기병 | 바딩거 | 오리할디아 | (창술 C) · 기마술 D | 창술 A · 기마술 B · (지휘술 D) | 창술 A · 기마술 B · (지휘술 D) | 1부 기마술 D / 2부 기마술 B |
| 이오 | 경기병→바딩거 | 경기병 | 오리할디아 | 없음 | 없음 | 창술 A · 기마술 B · (지휘술 D) | 1부 기능 자료 없음 / 2부 기능 자료 없음 |
| 누조 | 사냥병→아처→스나이퍼 | — | 마스터 아치 | 없음 | 없음 | 궁술 A · (지휘술 D) · (기마술 D) | 1부 기능 자료 없음 / 2부 병종 빈칸(다음 마스터 아치) / 2부 기능 자료 없음 |
| 로레타 ★ | 투사→검사→사도 | 사도 | 마스터 아치 | 검술 B · 보병술 C | 검술 A · 보병술 C | 궁술 A · 검술 A · (보병술 C) | 1부 보병술 C |
| 루루디아 | 투사→검사→사도 | 사도 | 소드 마스터 | 검술 B | 검술 A | 검술 A | 2부 검술 A / 3부 검술 A |

#### 레다 루트

| 인물 | 1부 병종 | 2부 병종 | 3부(최종) | 1부 기능 | 2부 기능 | 3부 기능 | 빠진 것 |
|---|---|---|---|---|---|---|---|
| 레다 ★ | 사냥병→아처→무희 | 무희 | 디 압사라스 | 궁술 B → A · 검술 C · (보병술 C) | 검술 A · 궁술 A · (보병술 B) | 검술 A · 궁술 A · (보병술 B) | 1부 검술 C / 2부 검술 A·궁술 A / 3부 검술 A·궁술 A |
| 무우 ★ | 투사→세스타스→워리어 | 워리어 | 더 갓 핸드 | 격투술 B · 백마술 C · (도끼술 B) | 격투술 A · 백마술 C · (도끼술 B) | 격투술 S · 백마술 C · (도끼술 B) | 1부 백마술 C / 2부 격투술 A·백마술 C |
| 시로코 ★ | 주술사→샤먼→바테스 | 바테스 | 디 아바타르 | 흑마술 B · 검술 C · 백마술 B | 흑마술 A · 검술 B · 백마술 A | 흑마술 S · 검술 B · 기마술 D | 1부 검술 C·백마술 B / 2부 검술 B·백마술 A / 3부 기마술 D |
| 올림피아 ★ | 주술사→프리스트→비숍 | 비숍 | 와이즈맨 | 백마술 B · (보병술 D) · (지휘술 D) | 백마술 A · (보병술 D) · (지휘술 D) | 백마술 A · (보병술 D) · (지휘술 D) | 3부 백마술 A |
| 그자람 ★ | 투사→검사→사도 | 사도 | 소드 마스터 | 검술 B · (지휘술 D) · (궁술 A) | 검술 A · (지휘술 D) · (궁술 A) | 검술 A | — |
| 에스메랄다 ★ | 병사→중갑 보병→가디언 | 가디언 | 포트리스 | 창술 B · 백마술 C · (중갑술 C) | 창술 A · 백마술 C · (중갑술 C) | 창술 A · 중갑술 C · (백마술 C) | 1부 백마술 C / 2부 백마술 C |
| 카타냐 ★ | 병사→투사→검사→사도 | 사도 | 성천익병 | 검술 B · (보병술 C) · (흑마술 A) | 검술 A · (보병술 C) · (흑마술 A) | 창술 A · 비행술 C · (검술 B) | 3부 창술 A |
| 피아나 ★ | 주술사→프리스트→비숍 | 비숍 | 발키리움 | 백마술 B · (기마술 D) · (보병술 D) | 백마술 A · (기마술 D) · (보병술 D) | 백마술 S · 기마술 D · (흑마술 B) | 3부 백마술 S·기마술 D |
| 소피아 ★ | 주술사→프리스트→비숍 | 비숍 | 와이즈맨 | 백마술 B | 백마술 B | 백마술 A · (보병술 C) · (기마술 D) | — |
| 버커니어 | 병사→중갑 보병 | — | — | (창술 C) | 없음 | 없음 | 2부 병종 빈칸(다음 포트리스) / 2부 기능 자료 없음 / 3부 병종 빈칸 / 3부 기능 자료 없음 |
| 이오 | 경기병→바딩거 | 경기병 | 오리할디아 | 없음 | 없음 | 창술 A · 기마술 B · (지휘술 D) | 1부 기능 자료 없음 / 2부 기능 자료 없음 |
| 알렉산드라 ★ | 천익병 | 천익병 | 성천익병 | 없음 | 없음 | 검술 A · 비행술 C+ · (창술 B) | 1부 기능 자료 없음 / 2부 기능 자료 없음 / 3부 비행술 C+ |
| 이니오니 ★ | 아처→스나이퍼 | 스나이퍼 | 마스터 아치 | 궁술 B | 궁술 A | 궁술 A | 2부 궁술 A / 3부 궁술 A |
| 자스민 ⛔ | 병사→중갑 보병→헤비 아머 | 헤비 아머 | 비숍 | 창술 B | 창술 A | 창술 A | 1부 창술 B / 2부 창술 A / 3부 창술 A |
| 사란 | 주술사→프리스트→비숍 | 비숍 | 비숍 | 백마술 B | 백마술 A | 백마술 A | 1부 백마술 B / 2부 백마술 A / 3부 백마술 A |
| 하르빈 | 사냥병→아처→포레스트 나이트 | 포레스트 나이트 | 포레스트 나이트 | 궁술 B · 기마술 D | 궁술 A · 기마술 D | 없음 | 3부 기능 자료 없음 |

#### 디트리히 루트

| 인물 | 1부 병종 | 2부 병종 | 3부(최종) | 1부 기능 | 2부 기능 | 3부 기능 | 빠진 것 |
|---|---|---|---|---|---|---|---|
| 디트리히 ★ | 투사→검사→사도 | 사도 | 더 블레이드 | 검술 B · (보병술 A) · (지휘술 D) | 검술 A · (보병술 A) · (지휘술 D) | 검술 S · (보병술 A) · (지휘술 D) | 2부 검술 A |
| 에스메랄다 ★ | 병사→중갑 보병→헤비 아머 | 헤비 아머 | 포트리스 | 창술 B · 중갑술 D · (지휘술 D) | 창술 A · 중갑술 C · (지휘술 D) | 창술 A · 중갑술 C · (백마술 C) | — |
| 파비오 ★ | 주술사→샤먼→바테스 | 바테스 | 드루이드 | 흑마술 B · 백마술 B · (검술 C) | 흑마술 A · 백마술 B · (검술 C) | 흑마술 A · (검술 C) · (보병술 D) | 1부 백마술 B / 2부 백마술 B |
| 미카엘라 ★ | 투사→브리건드→워리어 | 워리어 | 배틀 마스터→디 이터널 | 도끼술 B · (격투술 B) | 도끼술 A · (격투술 B) | 도끼술 S · 격투술 A | — |
| 우술라 ★ | 사냥병→아처→레인저 | 레인저 | 섀도 시커→더 캘러미티 | 궁술 B · 검술 C · (보병술 C) | 궁술 A · 검술 C · (보병술 C) | 검술 S · 궁술 A | 2부 검술 C / 3부 궁술 A |
| 리네 ★ | 경기병→헤비 아머 | 헤비 아머 | 홀리 랜서 | 창술 B · 중갑술 D · 백마술 B | 창술 B · 중갑술 D · 백마술 B | 창술 A · 백마술 B · (보병술 D) | 3부 창술 A·백마술 B |
| 알렉산드라 ★ | 천익병 | 천익병 | 성천익병 | 검술 C · 비행술 C · (창술 B) | 검술 C · 비행술 C+ · (창술 B) | 검술 A · 비행술 C+ · (창술 B) | 1부 비행술 C / 2부 검술 C·비행술 C+ / 3부 비행술 C+ |
| 이오 | 경기병 | 경기병 | 오리할디아 | 없음 | 창술 A · 기마술 B · (지휘술 D) | 창술 A · 기마술 B · (지휘술 D) | 1부 기능 자료 없음 / 2부 기마술 B |
| 카타냐 ★ | 병사→주술사→샤먼→바테스 | 바테스 | 성천익병 | 흑마술 B · (검술 C) · (보병술 C) | 흑마술 A · (검술 C) · (보병술 C) | 창술 A · 비행술 C · (검술 B) | 3부 창술 A |
| 단테 ★ | 주술사→샤먼→바테스 | 바테스 | 발키리움 | 흑마술 B · 백마술 B · (보병술 D) | 흑마술 A · 백마술 B · (보병술 D) | 흑마술 A · 기마술 D · 백마술 A | 1부 백마술 B / 2부 백마술 B / 3부 기마술 D·백마술 A |
| 피아나 ★ | 주술사→프리스트→트루바두르 | 트루바두르 | 발키리움 | 백마술 B · 기마술 D · (보병술 D) | 백마술 A · 기마술 D · (보병술 D) | 백마술 S · 기마술 D · (흑마술 B) | 1부 기마술 D / 2부 기마술 D / 3부 백마술 S·기마술 D |
| 게이츠 | 바딩거 | 바딩거 | 오리할디아 | 창술 B · 기마술 C · (지휘술 D) | 창술 A · 기마술 B · (지휘술 D) | 창술 A · 기마술 B · (지휘술 D) | 1부 기마술 C |
| 누조 | 사냥병→아처→스나이퍼 | — | 마스터 아치 | 없음 | 없음 | 궁술 A · (지휘술 D) · (기마술 D) | 1부 기능 자료 없음 / 2부 병종 빈칸(다음 마스터 아치) / 2부 기능 자료 없음 |
| 제스터 | 투사→사냥병→아처→스나이퍼 | — | 섀도 시커 | 없음 | 없음 | 궁술 A · (검술 C) · (지휘술 D) | 1부 기능 자료 없음 / 2부 병종 빈칸(다음 섀도 시커) / 2부 기능 자료 없음 |
| 울턴드 ★ | 워리어 | 워리어 | 홀리 랜서 | (검술 B) | (검술 B) | 창술 A · 백마술 A | 3부 백마술 A |
| 소피아 ★ | 주술사→프리스트→비숍 | 비숍 | 와이즈맨 | 백마술 B | 백마술 B | 백마술 A · (보병술 C) · (기마술 D) | — |

#### 카이 루트

| 인물 | 1부 병종 | 2부 병종 | 3부(최종) | 1부 기능 | 2부 기능 | 3부 기능 | 빠진 것 |
|---|---|---|---|---|---|---|---|
| 카이 ★ | 병사→경기병→바딩거 | 바딩거 | 더 캐벌리어 | 창술 B · 기마술 C · (검술 C) | 창술 A · 기마술 B · (검술 C) | 창술 S · 기마술 A · (지휘술 D) | 2부 기마술 B / 성장 병종 기갑 타조병가 경로에 없음(질문 Q6) |
| 티아라 ★ | 주술사→프리스트→비숍 | 비숍 | 무희 | 백마술 B | 궁술 B · 백마술 B | 궁술 B · (보병술 C) | 3부 궁술 B |
| 피터르 ★ | 사냥병→전차병→포레스트 나이트 | 전차병 | 마스터 아치 | 궁술 C → B · 기마술 D · (검술 C) | 궁술 A · 기마술 D · (검술 C) | 궁술 A | 2부 기마술 D / 3부 궁술 A |
| 그자람 ★ | 투사→사냥병→전차병→포레스트 나이트 | 전차병 | 소드 마스터 | 궁술 C → B · 기마술 D · (검술 A) | 궁술 B · 기마술 D · (검술 A) | 검술 A | 2부 기마술 D |
| 미카엘라 ★ | 투사→사냥병→전차병→포레스트 나이트 | 전차병 | 배틀 마스터→디 이터널 | 궁술 C → B · 기마술 D | 궁술 C · 기마술 D | 도끼술 S · 격투술 A | 2부 기마술 D |
| 울턴드 ★ | 주술사→프리스트→비숍 | 비숍 | 홀리 랜서 | 백마술 B · 창술 B | 백마술 B · 창술 A | 창술 A · 백마술 A | 3부 백마술 A |
| 녹투라 | 투사→브리건드→워리어 | 워리어 | 배틀 마스터 | 도끼술 B · (격투술 C → B) · (보병술 C) | 도끼술 A · (격투술 C → B) · (보병술 C) | 도끼술 A · (격투술 C → B) · (보병술 C) | 2부 도끼술 A |
| 세테스 | 병사→경기병→바딩거 | 바딩거 | 오리할디아 | 창술 B · 기마술 C · (지휘술 D) | 창술 A · 기마술 B · (지휘술 D) | 창술 A · 기마술 B · (지휘술 D) | 2부 기마술 B |
| 누조 | 사냥병→아처→스나이퍼 | 스나이퍼 | 마스터 아치 | 궁술 B · (지휘술 D) · (기마술 D) | 궁술 A · (지휘술 D) · (기마술 D) | 궁술 A · (지휘술 D) · (기마술 D) | — |
| 이오 | 경기병→바딩거 | 경기병 | 오리할디아 | 없음 | 없음 | 창술 A · 기마술 B · (지휘술 D) | 1부 기능 자료 없음 / 2부 기능 자료 없음 |
| 알렉산드라 ★ | 천익병 | 천익병 | 성천익병 | 검술 C · (비행술 C+) | 검술 B · (비행술 C+) | 검술 A · 비행술 C+ · (창술 B) | 2부 검술 B / 3부 비행술 C+ |
| 로레타 ★ | 투사→전차병→스나이퍼 | 전차병→스나이퍼 | 마스터 아치 | 궁술 A · 기마술 D | 궁술 A · 기마술 D | 궁술 A · 검술 A · (보병술 C) | — |
| 리네 ★ | 프리스트→비숍 | 비숍 | 홀리 랜서 | 백마술 B | 백마술 B | 창술 A · 백마술 B · (보병술 D) | 3부 창술 A·백마술 B |

★ = 최종 25인(unit-readiness.final25). ⛔ = 지양 10명(육성 목표를 보이지 않음).

### 부록 B. 팀 후보 34명 — 카드·상세 시트에 나와야 하는 값 (원천: react-content.team.units · class-details · classes/manifest)

| 순서 | 인물 | 최종 병종 | 시험 조건(class-details) | 병종 무기(manifest) | 특기 | 비고 |
|---|---|---|---|---|---|---|
| 0-0 | 이스마르 | 더 트라이던트 (신장직) | 창술 S | 창술·백마술 | 창술·지휘술 | 기준 25인 / 루트 육성 자료 없음 |
| 1-1 | 카이 | 더 캐벌리어 (신장직) | 기마술 A · 선택 도끼술 S / 창술 S / 검술 S | 검술·창술·도끼술 | 검술·창술·백마술·기마술 | 기준 25인 |
| 1-2 | 디트리히 | 더 블레이드 (신장직) | 검술 S | 검술·창술 | 검술·보병술 | 기준 25인 |
| 1-3 | 세오도라 | 홀리 랜서 (최상급직) | Lv45 · 창술 A | 창술·백마술 | 창술·백마술·지휘술 | 기준 25인 |
| 1-4 | 레다 | 디 압사라스 (신장직) | 궁술 C, 검술 A | 검술·궁술 | 검술·궁술·백마술·보병술 | 기준 25인 |
| 2-5 | 미카엘라 | 디 이터널 (신장직) | 선택 격투술 S / 도끼술 S / 검술 S | 검술·도끼술·격투술 | 도끼술·궁술·보병술 | 기준 25인 / 경유 배틀 마스터 → 도끼술 S · 3부 4구간 · 심판의 천칭 |
| 2-6 | 베르트랑 | 디 이터널 (신장직) | 선택 격투술 S / 도끼술 S / 검술 S | 검술·도끼술·격투술 | 검술·도끼술·격투술·지휘술 | 교체 후보 / 경유 배틀 마스터 → 도끼술 S · 3부 4구간 · 심판의 천칭 / 루트 육성 자료 없음 |
| 2-7 | 무우 | 더 갓 핸드 (신장직) | 백마술 C, 격투술 S | 격투술·백마술 | 검술·도끼술·격투술·백마술 | 기준 25인 |
| 2-8 | 그자람 | 소드 마스터 (최상급직) | Lv45 · 검술 A | 검술·창술 | 검술·격투술·보병술 | 기준 25인 |
| 2-9 | 에스메랄다 | 포트리스 (최상급직) | Lv45 · 중장술 C · 선택 도끼술 A / 창술 A | 창술·도끼술 | 창술·도끼술·중갑술 | 기준 25인 |
| 2-10 | 리네 | 홀리 랜서 (최상급직) | Lv45 · 창술 A | 창술·백마술 | 창술·백마술·기마술 | 기준 25인 |
| 2-11 | 울턴드 | 홀리 랜서 (최상급직) | Lv45 · 창술 A | 창술·백마술 | 창술·백마술·비행술 | 기준 25인 |
| 2-12 | 트로이아 | 배틀 몽크 (최상급직) | Lv45 · 백마술 D, 격투술 B | 격투술·백마술 | 격투술·흑마술·백마술 | 교체 후보 / 루트 육성 자료 없음 |
| 3-13 | 시로코 | 디 아바타르 (신장직) | 선택 백마술 S / 흑마술 S | 검술·도끼술·격투술·흑마술·백마술 | 검술·흑마술·백마술·지휘술 | 기준 25인 |
| 3-14 | 파비오 | 드루이드 (최상급직) | Lv45 · 흑마술 A | 검술·격투술·흑마술 | 흑마술·지휘술 | 기준 25인 |
| 3-15 | 타리문 | 드루이드 (최상급직) | Lv45 · 흑마술 A | 검술·격투술·흑마술 | 검술·흑마술·지휘술 | 교체 후보 / 루트 육성 자료 없음 |
| 3-16 | 아나톨리아 | 드루이드 (최상급직) | Lv45 · 흑마술 A | 검술·격투술·흑마술 | 격투술·흑마술·보병술 | 교체 후보 / 루트 육성 자료 없음 |
| 3-17 | 단테 | 발키리움 (최상급직) | Lv45 · 기마술 D · 선택 백마술 A / 흑마술 A | 흑마술·백마술 | 흑마술·백마술·지휘술 | 기준 25인 |
| 4-18 | 릴리안 | 보우 나이트 (최상급직) | Lv45 · 기마술 D, 궁술 A | 검술·궁술 | 궁술·보병술 | 기준 25인 |
| 4-19 | 피터르 | 마스터 아치 (최상급직) | Lv45 · 궁술 A | 궁술 | 궁술·보병술 | 기준 25인 |
| 4-20 | 이니오니 | 마스터 아치 (최상급직) | Lv45 · 궁술 A | 궁술 | 도끼술·궁술 | 기준 25인 |
| 4-21 | 아스완 | 마스터 아치 (최상급직) | Lv45 · 궁술 A | 궁술 | 궁술·지휘술·보병술 | 교체 후보 / 루트 육성 자료 없음 |
| 4-22 | 우술라 | 더 캘러미티 (신장직) | 선택 궁술 S / 검술 S | 검술·궁술 | 검술·궁술·격투술 | 기준 25인 |
| 4-25 | 로레타 | 마스터 아치 (최상급직) | Lv45 · 궁술 A | 궁술 | 검술·창술·비행술 | 기준 25인 |
| 5-23 | 카타냐 | 성천익병 (최상급직) | Lv45 · 비행술 C · 선택 창술 A / 검술 A | 검술·창술 | 검술·창술·비행술 | 기준 25인 |
| 5-24 | 알렉산드라 | 성천익병 (최상급직) | Lv45 · 비행술 C · 선택 창술 A / 검술 A | 검술·창술 | 검술·창술·비행술 | 기준 25인 |
| 6-26 | 소피아 | 와이즈맨 (최상급직) | Lv45 · 백마술 A | 도끼술·격투술·백마술 | 궁술·백마술 | 기준 25인 |
| 6-27 | 올림피아 | 와이즈맨 (최상급직) | Lv45 · 백마술 A | 도끼술·격투술·백마술 | 도끼술·백마술 | 기준 25인 |
| 6-28 | 오르헬 | 와이즈맨 (최상급직) | Lv45 · 백마술 A | 도끼술·격투술·백마술 | 도끼술·흑마술·백마술 | 교체 후보 / 루트 육성 자료 없음 |
| 6-29 | 피아나 | 발키리움 (최상급직) | Lv45 · 기마술 D · 선택 백마술 A / 흑마술 A | 흑마술·백마술 | 흑마술·백마술·기마술 | 기준 25인 |
| 6-30 | 홍화 | 발키리움 (최상급직) | Lv45 · 기마술 D · 선택 백마술 A / 흑마술 A | 흑마술·백마술 | 흑마술·백마술 | 교체 후보 / 루트 육성 자료 없음 |
| 7-31 | 티아라 | 무희 (상급직) | Lv35 · 명성 8 · 선택 궁술 B / 검술 B | 검술·궁술 | 흑마술·백마술·지휘술 | 기준 25인 |
| 99-99 | 센트리온 | 가디언 (상급직) | Lv35 · 명성 8 · 창술 B | 창술·백마술 | 자료 없음 | 교체 후보 / 지양·정렬 없음(99) / 루트 육성 자료 없음 |
| 99-99 | 타호니아 | 배틀 마스터 (최상급직) | Lv45 · 선택 격투술 A / 도끼술 A / 검술 A | 검술·도끼술·격투술 | 자료 없음 | 교체 후보 / 지양·정렬 없음(99) / 루트 육성 자료 없음 |

## F. 카이 루트 전차병 방침 (2026-11-14 사용자 지시 + 영상 근거)

근거 영상: choops, "Mounts Make SUPER SOLDIERS in Fortune's Weave"(2026-09-28, https://youtu.be/9W0Hb75BKUA). 원어 영어 자동 자막을 받아 읽었다. 고유명사 철자는 자막 기준이라 불확실하다.

### 영상에서 들은 사실
- 탈것 포획·마구간은 **카이 루트 전용**이다. 동물 칸에 먹이(생선·채소·고기)를 두고 5턴 뒤 포획한다. 1·2성 재료면 희귀 동물 확률이 오른다.
- 탈것 유대는 기수 한 명과 탈것 한 마리 사이에만 쌓인다. 장 리셋·루트 변경 때 유지되지 않으므로 지원 올리기 꼼수가 통하지 않는다. 마구간 먹이는 하루 1번이고, 미리 쌓아 둘 수 있다.
- 유대 5: 페어 스킬(예: 이동 +2, 전투 뒤 2칸 추가 이동), 고정 스탯 합계 +5, **성장률 합계 +25%**(탈 때만, 오른 스탯은 영구).
- 고유 탈것: 이오의 로시난(말), 알렉산드라의 부케팔라스(페가수스). 유대 5에서 고정 스탯 +6, **성장률 합계 +30%**. 카이 루트에서는 다른 인물에게 옮길 수 있고 유대는 다시 쌓는다.
- **전차병의 숨은 효과: 탈것 성장률 보너스 2배**(+25% → +50%, 로시난 +30% → +60%). 로시난은 말이라 전차병이 탈 수 있다.
- 전차병의 길: Lv35부터 HP·수비 +10%, 힘·마력·기술·카리스마 +5%.
- 권장: 핵심 인물을 가능한 일찍 기마 병종에 넣고 유대 5 탈것을 붙인다. Lv20에 전차병 + 유대 5 탈것(가능하면 로시난).
- 영상에 없는 것: 탈것 시스템 해금 시점, 번식. **부케팔라스(페가수스)를 전차병이 탈 수 없다는 것은 추론**이다.

### 적용 규칙
- 카이 루트 1·2부: 마법·회복 담당(티아라·울턴드·리네, 비숍 경로)을 뺀 전원을 **Lv20 이후 전차병**으로 육성한다. 3부 최종 병종은 그대로 둔다.
- 전차병 시험 조건(자료): 중급직, 권장 Lv20, 명성 4, **기마술 D + 궁술 C**. 그래서 해당 인물의 필요 기능에 `기마술 D`, `궁술 C`를 추가한다.
- 바뀌는 인물: 카이·녹투라·세테스·누조·이오. 이미 전차병인 인물: 피터르·그자람·미카엘라·로레타.
- 표시는 사이트 소유 자료 `content/kai-charioteer.json`으로 덮어쓴다. 원천 `content/data/*`(이전 프로젝트 정본 사본)는 바꾸지 않는다. 할 일 체크 원문은 바꾸지 않는다(인물 카드·팀 루트 편성에서 전차병을 보인다).
- 미확정(사용자 질문): 알렉산드라(천익병·부케팔라스)를 전차병으로 바꿀지, 로시난을 누구에게 줄지(기본: 이오가 그대로 탄다).
