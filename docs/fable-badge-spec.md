# 배지·아이템 그림·글 간격·이동 버튼 사양 (2026-11-14)

사용자 지시 네 가지(A 배지, B 아이템 그림, C 자세히 제거, D 이동 버튼)의 값이다. 구현자는 값을 그대로 쓴다. 여기 없는 결정은 §E 질문에 추가한다.

참고한 지침: impeccable `craft-floor.md`(대비 4.5:1, 색 면 위 보조 글, 아이콘은 한 계열), modern-web-guidance `icons`(아이콘 대비 3:1), `precise-text-alignment`(배지 글의 `text-box` 다듬기와 대체 방법). 대비는 모두 계산했다.

## A. 배지: 그림이 붙는 말은 모두 배경 있는 묶음

### A1. 원칙

- 그림 + 이름 + 뒤따르는 값을 한 상자에 넣는다. 상자 배경은 종류 색이다.
- 글자색은 모든 배지에서 본문색(`--text`)이다. 색은 배경과 그림에만 쓴다.
- 인물 이름(`.named-person`)과 병종 이름(`.named-class`)도 배지로 한다. 대신 가장 옅은 중립 배경을 써서 색 배지(지원·명성·골드·재료)가 눈에 먼저 띄게 한다. 이유: 사용자가 "그림이 있으면 전부"라고 했고, 체크 문장에 인물이 많아 색을 주면 화면이 다시 시끄러워진다.

### A2. 종류와 색

| 종류 `data-kind` | 대상 | 배경 밝게 / 어둡게 | 그림색 밝게 / 어둡게 |
|---|---|---|---|
| `bond` | 지원, 유대 | `#F6DCE6` / `#45222F` | `#A83866` / `#F0A3C1` |
| `renown` | 명성 | `#D9E8F5` / `#1E3347` | `#2A6FA3` / `#94C4EA` |
| `gold` | 골드, `1,000G` | `#F5E7B8` / `#40351A` | `#7D5A10` / `#E6C766` |
| `material` | 물고기류, 광석류, 옥강, 뇌석, 고기, 그 밖의 재료 | `#DCEBDD` / `#20382A` | `#3C7A4B` / `#9CD0A8` |
| `gift` | 선물 | `#F0E0D2` / `#3D2C20` | `#8F5A36` / `#DDB08C` |
| `skill` | 기능과 등급(`창술 B`) | `#E6E3EE` / `#2F2C3A` | 원본 그림 |
| `item` | 무기·물품·소모품(`선더 소드`, `태양 열매`) | `#E2E6EA` / `#2A3036` | `#4C5B69` / `#AFC0CF`(대체 아이콘일 때) |
| `person` | 인물 이름 | `#EFEDE8` / `#2E2E2C` | 초상화 |
| `class` | 병종 이름 | `#EFEDE8` / `#2E2E2C` | 원본 그림 |

- 물고기·광석·고기는 따로 색을 주지 않고 `material` 하나로 묶는다(사용자 예시 "재료는 초록"). 구분은 그림이 한다. 기존 `fish`·`ore`·`meat` 그림 종류는 그대로 둔다.
- 대비: 본문색 대 배경 10.0~13.1:1, 그림색 대 배경 4.2~7.9:1, 완료 행의 보조 글색(`#62605A`) 대 밝은 배경 4.9~5.4:1.
- 토큰 이름: `--badge-{kind}`(배경), `--badge-{kind}-ink`(그림). `app/redesign.css`의 두 토큰 블록에 넣는다. 지금의 `.game-icon-*` 색 줄과 `.dark .game-icon{filter:brightness(1.3)}`는 지운다.

### A3. 모양

```css
.game-badge{display:inline-flex;align-items:center;gap:4px;min-block-size:28px;padding:1px 8px 1px 4px;border-radius:8px;background:var(--badge-bg);color:inherit;font-size:inherit;font-weight:500;line-height:1.3;white-space:nowrap;vertical-align:middle;margin-inline:2px;max-inline-size:100%}
.game-badge[data-kind=bond]{--badge-bg:var(--badge-bond);--badge-ink:var(--badge-bond-ink)}  /* 종류마다 같은 식 */
.game-badge>svg{inline-size:20px;block-size:20px;flex-shrink:0;color:var(--badge-ink);stroke-width:1.8}
.game-badge>img{inline-size:22px;block-size:22px;object-fit:contain;flex-shrink:0}
.game-badge[data-kind=person]>img{inline-size:24px;block-size:24px;border-radius:6px}
.game-badge .badge-value{font-weight:700;font-variant-numeric:tabular-nums}
@supports (text-box:trim-both cap alphabetic){.game-badge>.badge-label,.game-badge>.badge-value{text-box:trim-both cap alphabetic}}
```

- 높이 28px은 본문 줄 높이(20px × 1.75 = 35px, 18px × 1.6 = 28.8px) 안에 들어가 줄 간격을 바꾸지 않는다.
- 그림이 없는 쪽(오른쪽) 여백 8px, 그림 쪽 4px.
- 글자 크기는 둘러싼 글을 따른다(18px 이상). 14px은 휴대폰 팀 칸에만 허용하며 그 칸에는 배지를 쓰지 않는다.
- 줄바꿈: 배지 안에서는 줄이 바뀌지 않는다. 배지 사이에서만 바뀐다. 가장 긴 예 `라돈 꼬치고기 ×3`이 18px에서 약 165px(그림 포함)이라 358px 폭에 들어간다. 배지가 칸보다 넓어지는 경우가 나오면 줄이지 말고 보고한다.
- 완료 행(`[data-complete=true]`) 안에서는 `opacity:.75`.
- 배지를 넣지 않는 곳(배경과 여백을 없앤다): 버튼·칩 안(`.button`, `.text-link`, `.reference-chip`, `.ui-badge`, `.ui-press`), 팀 최종 25인 카드(`.unit-card`), 교체 배지. 규칙: `:is(.button,.text-link,.reference-chip,.ui-badge,.ui-press,.unit-card) .game-badge{background:none;padding:0;margin:0;min-block-size:0}`.
- 기존 `.named-person`·`.named-class` 규칙(`redesign.css:216-217`)은 배지 규칙으로 대체한다. 클래스 이름은 남긴다.

### A4. `GameText` 변경

파일: `components/game-text.tsx`. `GameIcon`·`GameText` 이름과 props는 유지한다.

- 출력 구조(예: `지원 3`):
  ```html
  <span class="game-badge" data-kind="bond"><svg class="game-icon game-icon-bond"/><span class="badge-label">지원</span> <b class="badge-value">3</b></span>
  ```
  이름과 값 사이 공백은 원문에 있던 그대로 둔다. 배지의 글 = 원문 조각이어야 한다(`verify-redesign.mjs`가 글 일치를 본다).
- 값을 함께 잡는 규칙(정규식의 뒤쪽을 넓힌다. 묶음 전체가 한 조각으로 나오게 하고 안에서 이름·값을 가른다).

  | 종류 | 잡는 모양 | 예 |
  |---|---|---|
  | 지원·유대 | 이름 + `\s*(Lv\.?\s*)?\d+` 또는 `\s*[SABC](?![가-힣A-Za-z])` | `지원 3`, `지원 C`, `유대 5` |
  | 명성 | 이름 + `\s*(Lv\.?\s*)?\d+` | `명성 6`, `명성 Lv.6` |
  | 골드 | `[\d,]+G` 전체, 또는 `골드` | `1,000G` |
  | 재료·선물·아이템 | 이름 + `\s*[×x]\s*\d+` 또는 `\s*\d+(개|마리)` | `라돈 꼬치고기 ×3`, `태양 열매 10개` |
  | 기능 | 이름 + `\s*[SABCDE]\+?` + 선택 `\s*→\s*[SABCDE]\+?` | `검술 C`, `지휘술 D → C` |
  | 인물·병종 | 이름만 | `세오도라`, `가디언` |
  - 값이 없으면 이름만 배지로 한다(`지원 대화`의 `지원`).
  - 기능 배지는 지금처럼 `withSkills`일 때만 만든다. 그림은 `<img class="game-skill">`를 유지한다.
  - `skip`·같은 글 안 반복 규칙은 그대로다. 건너뛴 이름은 배지 없이 글자만 낸다.
- 아이템 이름 목록: `assets/items/manifest.json`의 키. 긴 이름부터 맞춘다. 이미 인물·병종·기능·재료로 잡히는 이름은 제외한다.
- **import 줄 제약**: `scripts/verify-redesign.mjs`가 `game-text.tsx`의 import 세 줄을 문자열로 치환해 컴파일한다. 새 줄은 정확히 `import items from '@/assets/items/manifest.json';` 한 줄만 추가하고, 같은 커밋에서 스크립트에 그 줄을 `'const items='+readFileSync('assets/items/manifest.json','utf8')+';'`로 바꾸는 `.replace`를 더한다. Lucide import 줄에 아이콘을 추가하는 것은 괜찮다(치환 대상이 아니다).
- 검사 갱신(`verify-redesign.mjs`): 기존 개수 검사는 유지된다(`.game-icon-bond` 1개 등). 더할 것 — `지원 3`·`명성 6`·`1,000G`·`검술 C`가 각각 `.game-badge` 하나이고 그 글이 원문과 같다. `.named-person`·`.named-class`가 `game-badge`를 함께 갖는다.

### A5. `GameText` 밖에서 맞출 곳

| 위치 | 지금 | 바꿀 것 |
|---|---|---|
| `components/people.tsx`의 `Skill` + 등급(`필요 기능` 행, 최종 병종 무기) | 그림 + 글자 + 따로 굵은 등급 | `.game-badge[data-kind=skill]` 하나에 그림·기능·등급. 종류(`주력` 등)는 옆의 `Badge` 그대로 |
| `PersonHeading`의 `지원 n`·`명성 n` | `Badge` 기본색 | `.game-badge[data-kind=bond|renown]` |
| `ClassPath`(병종 경로) | 그림 + 이름 + 단계 칩 | 그림·이름을 `.game-badge[data-kind=class]`로, 단계 칩은 옆에 그대로 |
| `components/context-rail.tsx`·`secondary.tsx`의 `GameIcon` + 글(`골드 목표`, 장별 골드 제목) | 그림만 | 제목 글은 배지로 하지 않는다. 금액 값(`2,000G`)을 `gold` 배지로 |
| `team-routes.tsx`·`team.tsx`의 무기 목록(`.route-weapons span`) | 그림 + 글 | `.game-badge[data-kind=skill]` |
| `source-markup.tsx`·`records.tsx`의 원본 그림(`media-icon`, `inline-icon`, `media-portrait`) + 바로 뒤 이름 | 따로 | 그림과 바로 뒤 글 조각이 같은 이름이면 한 배지로 묶는다. 묶을 수 없으면 그대로 둔다 |

## B. 아이템 그림

- 원천: `assets/items/manifest.json` — `{이름:{file,source}}`. 다른 에이전트가 모으는 중이다.
- 그리기: `<img src="/{file}" alt="" loading="lazy" width="22" height="22">`, 배지 안에서 22×22, `object-fit:contain`, 배경 없음. 그림에 불투명 배경이 있으면 `border-radius:4px`만 준다. 색 필터로 다시 칠하지 않는다.
- manifest에 없는 이름의 대체 아이콘(Lucide, 20px, 선 굵기 1.8, 색 `--badge-item-ink`): 무기 `Sword`, 그 밖의 물품·소모품 `Package`. 재료류는 지금의 `Fish`·`Gem`·`Beef`, 선물은 `Gift`.
- manifest에 그림이 생긴 재료·선물도 원본 그림을 먼저 쓴다(예: `라돈 꼬치고기`). 종류 색은 그대로다.
- manifest 파일이 아직 없으면 빈 객체로 다룬다. 빌드가 깨지지 않게 파일이 생긴 뒤에 import를 넣는다.
- 그림 파일도 `verify.mjs`의 "없는 미디어" 검사에 걸리므로 `public/assets` 사본(`scripts/run.mjs`가 복사)과 경로가 맞아야 한다.

## C. "자세히" 제거 뒤 글 간격

82ca05d에서 접기는 이미 없어졌다(`ReadMore`가 묶음만 남김). 글이 전부 보이므로 아래 값을 더한다.

- 본문 폭: `.action-text`, `.action-notes`, `.readable-body`, `.detail-pairs dd`, `.team-panel .semantic :is(p,li)`에 `max-inline-size:42em`(한글 약 40자). 표 칸 안은 제외한다.
- 문단: `.readable-body p{margin:0 0 12px}`, 마지막은 0. 줄 높이 20px 글 1.75, 18px 글 1.7.
- 목록: `.readable-body :is(ul,ol){margin:0 0 12px;padding-inline-start:0;list-style:none;display:grid;gap:6px}`. 점은 쓰지 않고 항목 사이 간격으로 구분한다(왼쪽 선 통일).
- 메모(`.action-notes`): 위에 1px `--line`과 `padding-block-start:12px`를 주어 행동 글과 구분한다. 글 18px `--muted`.
- 묶음 사이(`.readable-group + .readable-group`): 16px.
- 표 칸: `td .readable-body`는 문단 간격 8px. 칸 여백 16px 유지.
- 시트 본문(`.sheet-scroll`): `max-inline-size:42em`을 문단·목록에만 주고 표·그림은 전체 폭.
- 인물 카드의 `시험 조건·시기별 계획`·`원문 기록`과 팀 `비교 근거` 접기는 `ReadMore`가 아니므로 그대로 둔다(§E 질문 1).
- 확인: `자세히`·`접기` 버튼 0개. 접혀 있던 글이 모두 보인다. 3부 준비 화면처럼 긴 화면(약 4만 px)에서 가로 넘침 0.

## D. 이동 버튼

82ca05d에서 버튼은 이미 `.check-toolbar` 안에 있다. 아래 값으로 맞춘다.

- 순서: `장 선택` · 진행(`n/m` + 막대, 남는 폭) · **이동** · 저장 표시 · `기록 관리`.
- 문구는 `이동`(사용자가 부르는 이름, 기존 문구). `aria-label="다음 할 일로 이동"`. 아이콘 `ArrowDown` 20px.
- 크기: 채움 `--primary`, 높이 48px, 여백 10×16px, 모서리 10px.
- 767px 이하: 문구를 숨기지 않는다. 390px에서 장 선택 87 + 이동 약 81 + 기록 관리 87 + 간격 24 = 279px이고 진행 막대에 79px이 남는다(최소 48px). 여백만 10×12px로 줄인다. 지금의 `.jump-label{display:none}`은 지운다.
- 다 끝나 갈 곳이 없으면 `disabled`, `opacity:.55`.
- 도구 줄 높이: 아래 여백 20px → 12px(`.check-toolbar{padding:12px 0}`). 1440px에서 93px → 약 72px.
- `다음 할 일` 글 묶음(`.next-action`)은 남긴다. 고정하지 않고 도구 줄 바로 아래에 둔다. 버튼이 어디로 가는지 알려 주는 글이라 필요하다. 묶음 안의 버튼은 없다(이미 제거됨). 위아래 여백 16px.
- 확인: 목록 중간까지 스크롤한 상태에서 버튼이 보이고, 누르면 첫 미완료 항목으로 가며 강조가 한 번 돈다. 390px에서 도구 줄이 한 줄이다.

## E. 질문 (괄호 안 기본값으로 진행)

1. "자세히 전부 제거"가 인물 카드의 두 접기와 팀 `비교 근거` 접기까지 포함하는가? (기본: 포함하지 않는다. 이 둘은 사용자가 요청한 "짧게"를 위한 접기다)
2. 인물·병종 이름까지 배지로 하면 체크 문장이 배지로 가득 찬다. 중립 배경으로 가도 되는가, 아니면 인물·병종은 지금처럼 그림 + 글자로 둘까? (기본: 중립 배경 배지)
3. 물고기·광석·고기를 초록 하나로 묶어도 되는가? (기본: 묶는다)
4. 제목 줄의 `골드 목표`처럼 그림이 붙은 제목 글도 배지로 할까? (기본: 제목은 그대로, 값만 배지)
