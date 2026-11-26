# 화면 다듬기 계획 (2026-11-26)

사용자 요청: 사용자가 준 UI 기술 4개(ui-ux-pro-max, lukemelnik ui-design, Google stitch taste-design, edgequake 단일 화면 분석)와 impeccable(polish·layout·craft-floor)을 적용해 화면을 개선하고, 전후 화면 사진을 남긴다. 워크트리 `claude/frontend-ui-improvement-screenshots-cc03dd`에서만 작업한다.

## 원칙

- **다듬기이지 재설계가 아니다.** 첫 화면(오벨리스크 구성, U38·U61·U62)과 색·글꼴·자료·문구는 그대로 둔다.
- `docs/user-rules.md`의 U·P 규칙을 하나도 깨지 않는다. `node scripts/release.mjs check`가 통과해야 한다.
- 새 스타일은 `app/redesign.css` 끝의 새 묶음 하나에 모은다(겹친 옛 규칙을 덮어쓰기 쉬워 되돌리기도 쉽다).

## 전 화면 사진에서 찾은 문제 → 고칠 것

| # | 문제(근거 사진) | 고칠 것 | 근거 기술 |
|---|---|---|---|
| 1 | 한국어가 낱말 중간에서 줄이 바뀜("단계/는", "사용한/다") — 휴대폰 07 | 본문 전체 `word-break: keep-all` + `overflow-wrap: break-word`, 문단 `text-wrap: pretty`, 제목 `text-wrap: balance` | impeccable Type, ui-ux-pro-max §6 |
| 2 | 장 머리 설명 글이 흰 목록 밖 바탕에 떠 있고 한 줄 문단 사이가 약 70px — 06·14 | 문단 간격을 좁혀(8~12px) 한 덩어리로 묶고, 묶음 사이만 넓게 | impeccable Layout(가까운 것은 붙이고 다른 묶음은 띄움) |
| 3 | "이야기 주력…" 같은 작은 제목이 바로 위 인물 칩 줄에 붙음 — 06 | 작은 제목 위 여백 > 아래 여백 | craft-floor Spacing |
| 4 | 오른쪽 정보 칸 마지막 카드("이 장의 재료")가 잘려 보임 — 06·07 | 정보 칸 카드 간격·안쪽 여백을 줄여 넘침을 줄이고, 넘칠 때 아래쪽이 잘린 것임을 알 수 있게(옅은 그림자 띠) | ui-design 상태 표시, impeccable Extremes |
| 5 | 접힌 장 목록 사이가 너무 넓음(장 하나에 약 138px) — 3부 15 | 접힌 장 간격 축소 | impeccable Rhythm |
| 6 | 휴대폰 할 일 줄: 체크 칸 열 때문에 글 폭 손실 — 휴대폰 07 | 체크 칸과 글 사이 간격·왼쪽 여백 축소 | stitch 휴대폰 단일 열 |
| 7 | 팀 화면 휴대폰 탭 "비교 근거"가 화면 끝에 닿음 — 팀 02 휴대폰 | 탭 목록 가장자리 8px 이상(U37) | ui-ux-pro-max §2 |
| 8 | 팀 '루트 편성'의 병종 칸(회색 큰 알약)이 옆 배지와 모양이 다름 — 팀 04 | 같은 종류는 같은 모양(U55) | impeccable 일관성 |
| 9 | 숫자(0/443, 0/24)가 자리마다 폭이 달라 흔들림 | `font-variant-numeric: tabular-nums` | craft-floor Browser surfaces |
| 10 | 개발 서버의 Next.js "N" 표시가 왼쪽 아래 글을 가림(사용자 미리보기 P05) — 모든 사진 | `next.config.ts`에 `devIndicators: false` | ui-design 렌더 확인 |

## 추가 (사용자 선택 "둘 다 고치기", 2026-11-26)

| # | 문제(근거) | 고칠 것 |
|---|---|---|
| 11 | `keep-all` 뒤 줄 머리에 "·"가 옴("상자/·탐색", "레벨/·기술") — 비교 실험: 390px 3부 11곳, 세오도라 1부 5곳, 1440px 팀 1곳 새로 생김 | 화면에서만 "·"를 앞 글자(또는 앞 빈칸)와 묶어 줄을 못 나누게 함(`white-space:nowrap` 묶음). 글자 자체는 그대로 |
| 12 | 재료 카드에서 같은 이름이 최대 4번(카드 제목·사진 옆 이름·"이름" 줄·같은 "다른 이름") | 사진 옆 이름이 카드 제목과 같으면 숨김, "다른 이름"에서 "이름"과 같은 값은 숨기고 남는 값이 없으면 줄을 숨김. 자료는 그대로 |
| 13 | 팀 '비교 근거' 표: 병종 이름 단추가 높이 48px 회색 덩어리, 담당 칸 이름이 한 글자씩 세로로 꺾임(1440px "미카엘라" 이름 높이 96px) — '루트 편성'만 고치고 빠짐 | 병종 단추는 '루트 편성'과 한 규칙(`:is(.route-unit-class,.team-panel .semantic td) .text-link`, 높이 28px), 인물 칩은 `white-space:nowrap`으로 한 줄 |



- 첫 화면 구성 변경, 색·글꼴 교체, 자료·문구 변경, 새 기능.

## 검증

1. 개발 서버(포트 3100)에서 전후 같은 화면 사진: `docs/screens/ui-before/`, `docs/screens/ui-after/`(git 무시 폴더).
2. `npm run lint`, `npm run typecheck`, `node scripts/release.mjs check`(자료 검사 + 브라우저 검사 12종).
3. impeccable `detect`로 바뀐 파일 검사.
