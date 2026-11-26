# yuphastemple 화면 말씨 견본 계획 (2026-11-26, 2차)

근거: `docs/yuphas-design-teardown.md`(Fable 5.2 분해), `https://yuphastemple.com/data/style.css`(그림 조각 붙이는 법). 사용자 승인 전 **견본**이다. 커밋하지 않는다.

## 사용자 결정(2026-11-26, 1차 견본 뒤)

1. 분해 보고서 §9.4의 "복사 금지"를 그 사이트 UI 그림·글꼴·CSS 기법·값에 한해 푼다(게임 UI에서 나온 것으로 판단). 파일은 `public/yuphas/`, 출처는 `assets/design/SOURCES.md`.
2. 그 사이트 디자인이 우리 디자인 규칙(docs/user-rules.md U 규칙, docs/design-spec.md)과 부딪치면 **그 사이트를 따른다**. 내용·자료·동작은 그대로. 규칙 문서·검사는 아직 고치지 않고 뒤집은 규칙을 아래에 적는다.

## 범위

- 꼭 끝낼 화면: 장 공략 `/theodora/1`(위·스크롤·인물 보기·인물 서랍).
- 공통 토큰·부품으로 따라오는 만큼: 첫 화면 `/`, 팀 `/team`.

## 그림 조각을 어디에 쓰나(어두운 테마)

| 그림 | 그 사이트에서 | 우리 화면에서 |
|---|---|---|
| tileBg2.png | `--bg` 반복 질감 | 쪽 바탕(장 공략·팀·첫 화면) |
| tileBg3.png | `--bgT` 판 단추 질감 | 채운 단추·선택칸·완료 숨기기·기록 관리, 팀 25인 타일 |
| buttonLeft.png + buttonCenter.png | 3조각 알약(고른 탭, 주 단추) | 열린 탭(다섯 탭·팀 탭), 주 단추(이동·테마), 팀 고른 경우 단추 |
| buttonInactiveBG5.png | 좁은 화면 메뉴 단추 | 휴대폰 아래 탭 줄의 안 고른 탭 |
| listTop/listCenter2/listBottom.png | 전체 화면 창 3조각 틀 | 할 일 묶음 틀, 루트 머리 위 판(listTop) |
| popup/*.webp 9장 | 물품 팝업 9조각 틀 | 인물 서랍(원래 크기), 오른쪽 칸 카드·인물 카드·재료 카드(절반 크기) |
| headerBG.png | 표 머리 띠 | 고정 머리 줄, 표 머리 줄, 팀 머리, 첫 화면 위 띠 |
| dividerT.png | 구역 구분선 | 장 제목·쪽 제목·오른쪽 칸 제목 아래, 첫 화면 4칸과 3부 띠 사이(두 테마) |
| searchboxRepeat/Right.png | 위 검색칸 틀 | 인물·문서 검색칸 |
| NocturneSerif-Regular.woff2 | 사이트 유일 글꼴 | 라틴·숫자·문장부호(한글은 Gowun Batang) |
| background14, bgLineCover4, background-4-3-6-*, basicStats, combatStats(Mys) | 고정 액자·능력치 칸 | **안 씀**: 액자 그림 안에 "Growth Rate·HP·Str" 글자와 능력치 칸이 그려져 있거나, 그 액자 전용 세로선 덮개라 우리 배치에 맞는 자리가 없다 |

밝은 테마: 그 사이트에 밝은 테마가 없다. 어두운 그림은 밝은 바탕에서 어색해 dividerT만 쓰고, 나머지는 지금 밝은 색 + CSS 이중 선.

## 사이트 우선으로 뒤집은 규칙(규칙 문서는 아직 그대로)

- U55·design-spec "단추·입력 10px, 카드 16": 모서리 0px.
- 최소 글자 18px(HANDOFF §4·design-spec)·U43: 본문 16px, 작은 글 14px, 표 16px, 칩 15px.
- 누를 곳 44–48px(design-spec): 단추 36px, 탭 32px, 할 일 줄 위아래 .3em, 체크 칸 18px.
- design-spec 글꼴 Pretendard: 글 전체 명조(Nocturne + Gowun Batang).
- design-spec 완료 줄 "투명도·밝기 낮춤 금지": 그 사이트의 '못 쓰는 것' 필터(grayscale 1, brightness .7, contrast 1.5).
- U09 "색은 은은하게": 루트 머리 뒤 문장 투명도 .10 → .7 + brightness .45. 어두운 테마 루트 머리 면의 루트 색 → listTop 청록 판.
- U55 "접기 표시는 아래 화살표 하나(기본 ▶ 없음)": 다섯 탭 앞 ▶/▼ 삼각형.
- U54 표 머리 왼쪽·위 정렬: thead 머리 줄 가운데, 칸 4px 8px(줄 머리 칸 th scope=row는 왼쪽·폭 그대로).
- 글 외곽·빛을 큰 제목만(1차 결정): 어두운 테마 모든 글 4방향 검정 외곽선, 이름 두꺼운 외곽선 + 빛, 탭·링크 호버 빛, 위 띠 링크 늘 빛.
- 서랍 덮개 `#171717` 72%: 검정 55% + 흐림 4px.
- "이동" 뒤 2px 테두리 2초: idFlash 1.8s(동작 줄이기 3s steps(1)).
- 색(design-spec): 어두운 테마 청록·양피지·청동.

따르지 않은 것: 휴대폰에서 무대 전체를 0.78배로 줄이는 맞춤 축소(scaleToFit)·고정 무대·쪽 스크롤 없음. 화면 배치 장치이고 스크롤·확대 동작을 바꾸므로 '동작 그대로'에 걸린다. 그래서 휴대폰도 데스크톱과 같은 px.

## 고칠 파일

- `app/layout.tsx`: Gowun Batang 400/700 → `--font-heading`.
- `app/redesign.css` 끝: `/* ===== yuphas 견본 … ===== */` 한 덩어리.
- `assets/design/SOURCES.md`: 출처 절.

## 확인

- Playwright(Chrome headless) 같은 스크립트·크기로 전(3100, main)·후(3200): `/theodora/1` 위·스크롤·인물·서랍, `/`, `/team` × 1440×900·390×844 × 어둡게·밝게.
- `npm run typecheck`, `npm run lint`, 390·375px 가로 넘침.
