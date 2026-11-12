# 사용자 수정 검수 · 2026-11-13

정본: docs/design-spec.md §3·§7. 모든 수치는 Codex / Windows에서 실제 실행한 결과다. 브라우저는 설치된 Chrome과 Playwright, 기존 Next.js 개발 서버 http://localhost:3000을 사용했다. TEMP/TMP는 저장소 .tmp다.

## 그림 출처

공식 페이지: https://www.nintendo.com/kr/games/switch2/aacsa/character/index.html

| 인물 | 타임스킵 전 공식 큰 그림 | 원본 크기 | 공식 클랜 문장 |
|---|---|---|---|
| 카이 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/main/img_chara_w1_pc.webp) | 1546×1510 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_1_pc.webp) |
| 디트리히 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/main/img_chara_w2_pc.webp) | 1774×1712 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_2_pc.webp) |
| 세오도라 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/main/img_chara_w3_pc.webp) | 1698×1692 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_3_pc.webp) |
| 레다 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/main/img_chara_w4_pc.webp) | 964×1562 | [원본](https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_4_pc.webp) |

8개 파일 모두 다운로드 원본 바이트를 보존했다. 이미지 편집·변환·생성 없음. 공식 문장 누락 0개. 문장의 원본에 포함된 글자도 그대로 유지했다. 1·2부 얼굴은 people-display의 c04~c07 등 기존 타임스킵 전 파일을 쓰며, 대시보드 큰 그림만 위 공식 큰 원본을 쓴다. 3부 띠·옆 메뉴의 타임스킵 후 그림은 3부에서만 사용한다.

## 측정

| 항목 | 결과 | 증거 |
|---|---|---|
| 첫 화면 | 10장면 모두 가로·세로 스크롤 0px, 배지 표시, 순서 카이 → 디트리히 → 세오도라 → 레다 | browser-results.json의 order·dashboardVerticalScroll |
| 공략 진행 배지 | 세오도라 1st / 레다 2nd / 디트리히 3rd / 카이 4th | 첫 화면 PNG·order |
| 고정 머리 | 데스크톱 top 0px, 휴대폰 top 56px | 30개 실제 스크롤 검사 |
| 오른쪽 칸 | 데스크톱 top 0px, 높이 900/1080px, 내부 overflow auto | sticky 검사 |
| 장 제목 | 머리 아래 최소 7.58px 여유, 가림 0 | chapterClearance |
| 인물 정보 | 본문 20px, 실제 table 2열, 항목 폭 데스크톱 132px / 휴대폰 96px | personTables |
| 설명 | 문단 최대 2문장, 접힌 묶음 최대 3줄, 위반 0/0개 | 파생 자료·브라우저 |
| 원문 보존 | 35734문장, 참고 문서 318개 대조 통과 | sentence-preservation.json |
| 골드 | 용도·금액·조건 3열, 금액 오른쪽 정렬·굵게·숫자와 G 줄바꿈 없음 | goldTables·PNG |
| 대시보드 hero | 두 테마 동일: 1440 화면 330×471.22px, 375 화면 165.5×137.23px, 네 칸 균일 | hero-measurements.json |
| 얼굴 | 할 일 28×28 / 오른쪽·준비 48×48 / 인물 96×96px, 위반 0개 | faceSizes |
| 선물 표 | 전체 61명 × 4장면, 2열 표와 원본 선물 목록 일치 | gift-table-check.json |
| 준비 인물 줄 | 화면당 84개 × 4장면, 모두 48×48px·이름 오른쪽·같은 줄 | corrections-browser-results.json |
| 그림 비율 | 원본 대비 1% 초과 위반 0개, contain 위반 0개, 접힌 설명에서 부분적으로 잘린 그림 0개 | aspectRatioViolations·croppedScenes |
| 그림 확대 | 502×604px 원본이 실제 502×604px로 열림, 두 크기·두 테마 모두 통과 | image-enlargement |
| 밝은 금색 글자 대비 | 디트리히 5.19:1 / 레다 5.62:1 / 3부 5.58:1 | accentContrast |

## 실행 결과와 한계

| 검사 | 실제 실행·결과 | 증명 범위와 한계 |
|---|---|---|
| npm run lint | Windows / ESLint: 오류·경고 0 | 현재 소스 정적 규칙. 배포·게임 사실은 검증하지 않음 |
| npm run typecheck | Windows / TypeScript: 통과 | 현재 타입 연결. 빌드 성공은 검증하지 않음 |
| npm run verify | Windows / Node.js: 통과 | 62개 루트·부·장의 그림·위치 버튼, 원문 문자·숫자·문장 수, 공식 그림 바이트, 1·2부 시대. 원문의 게임 사실 정확성은 검증하지 않음 |
| npm run test:browser | Windows / Chrome: 240장면·9개 부 그림 대조·45개 동작 통과 | 1440×900·1920×1080·375×812·768×1024 두 테마, 첫 화면 추가 1280×720. 겹침 검사는 부모·자식 포함과 개발 서버 도구를 제외. 다른 OS·브라우저·배포본은 미검증 |
| node scripts/corrections-browser-check.mjs | Windows / Chrome: 148장면 통과 | 1·2부 네 루트와 3부의 할 일·인물·준비·재료, 준비 인물 줄. 두 크기·두 테마에서 표 본문 20px·접힌 설명 3줄도 추가 검사 |
| Impeccable 시각 검출기 | Windows에서 실제 실행, 4px 왼쪽 띠 경고 2개 | 정본 §1·§4가 지정한 띠이므로 유지. 이 도구의 경고를 규격 오류로 집계하지 않음 |
| 빌드·.next 삭제 | 미실행: 사용자 금지 | 기존 개발 서버를 사용. out/의 과거 빌드·운영 배포본은 갱신·검증하지 않음 |
| Git·커밋·Hive·전역 지식 저장 | 미실행: 사용자 금지 | 파일 읽기·저장소 안의 수정만 수행. 커밋·게시 없음 |

금액 표는 용도·금액·조건 순서로 재배치해 원문과 대조한다. 새 표 머리글과 파생 행 복사본은 문장 보존 수에서 제외한다. 반복 안내는 화면에서 한 번만 보여 주고 원문 자료는 그대로 둔다. 큰 그림이 들어 있는 접힌 설명은 자세히를 누르면 그림 전체를 보여 주며 미리보기에서 그림 일부를 잘라 보여 주지 않는다. 금액 표 전체는 접지 않고 칸 안의 설명을 접는다. 모든 참고 문서의 문장 보존은 정적 검사이며, 318개 문서 전체를 브라우저로 하나씩 연 것은 아니다.

## 변경 파일

- components/home.tsx
- components/shell.tsx
- components/tasks.tsx
- components/people.tsx
- components/records.tsx
- components/secondary.tsx
- components/source-markup.tsx
- components/detail-sheets.tsx
- components/documents.tsx
- components/read-more.tsx
- components/image-viewer.tsx
- lib/portraits.ts
- lib/content.ts
- lib/checklist.ts
- lib/secondary.ts
- lib/documents.ts
- scripts/derive-checklist.mjs
- scripts/readability.mjs
- scripts/markdown-presentation.mjs
- scripts/verify.mjs
- scripts/verify-readability.mjs
- scripts/verify-design-assets.mjs
- scripts/browser-check.mjs
- scripts/corrections-browser-check.mjs
- app/globals.css
- app/route-colors.css
- content/derived/checklist.json
- content/derived/presentation.json
- content/derived/documents.json
- assets/design/SOURCES.md
- assets/design/emblems/manifest.json
- assets/portraits/pre-timeskip/large/SOURCES.md
- assets/portraits/pre-timeskip/large/manifest.json
- docs/corrections-plan.md
- docs/corrections-report.md
- docs/browser-results.json
- docs/corrections-browser-results.json
- docs/image-parity.json
- docs/sentence-preservation.json
- assets/portraits/pre-timeskip/large/{cai,dietrich,theodora,leda}.webp (추가)
- assets/design/emblems/{cai,dietrich,theodora,leda}.webp (추가)
- assets/design/emblem-{cai,dietrich,theodora,leda}.webp (삭제)
- public/assets/의 위 자산·출처·manifest 사본도 동기화, 잘라 만든 네 문장 사본 삭제
- docs/screens/: 고유 PNG 244개 저장. 추가 검사에서 변경된 표 화면을 같은 경로에 다시 촬영했다.
- docs/hero-measurements.json
- docs/gift-table-check.json

## 질문

없음.
