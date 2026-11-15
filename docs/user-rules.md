# 사용자 규칙 (강제)

2026-11-13~15 대화(질문 답변 포함)에서 사용자가 지적·지시한 것을 모두 규칙으로 만들었다. 말이 겹치거나 부딪치면 **나중에 한 말**을 따른다(P08). 대체된 옛 말은 '날짜·대체' 칸에 적었다.

- **화면·자료 규칙(U)** 은 '검사' 칸의 파일이 자동으로 막는다. 그 파일에는 규칙 번호(`[U01]` 꼴)가 검사 바로 앞이나 파일 머리에 있다. `scripts/rules-check.mjs`(verify가 부름)가 이 문서를 읽어 번호가 빠지면 실패한다.
- **작업 방식 규칙(P)** 중 P01~P03은 배포 관문 `scripts/release.mjs`가 막는다. P04~P12는 사람이 지키는 절차이며 `AGENTS.md`에 적혀 있다(자동 검사 아님).
- 배포는 `node scripts/release.mjs check` → Fable 5.2 검토(기록에 `검토 대상 해시`·`남은 지적(낮음 포함): 0`) → 커밋 → `node scripts/release.mjs deploy` 순서로만 한다.
- 새 지시가 오면 같은 응답 안에서 이 표에 줄을 더하고, 검사를 붙이고, 부딪치는 옛 줄을 대체로 표시한다.

## 화면·자료 규칙

| 번호 | 규칙(최신) | 날짜·대체 | 검사 |
|---|---|---|---|
| U01 | 주인공 이름은 Cai(카이). 'Kai' 이름과 `kai` 루트 ID를 쓰지 않는다(옛 기록 옮기기만 예외) | 11-13 | `scripts/rules-check.mjs` |
| U02 | 인물 주요 정보는 표, 시험 조건·시기별 계획·원문 기록은 세로 제목–설명 쌍. 중복 없음 | 11-13 | `scripts/corrections-browser-check.mjs` |
| U03 | 인물 자료가 정확하고 빠짐없다. 예: 세오도라 가디언 → 홀리 랜서, 둘 다 백마술. 시험 조건과 병종 무기·기능 목표를 구분해 둘 다 보인다 | 11-13 | `scripts/rules-check.mjs` |
| U04 | 팀 화면 최종 25인은 16:9·9:16에서 스크롤 없이 모두 보이고 스크롤이 안 된다 | 11-13 | `scripts/team-fit-check.mjs` |
| U05 | 팀 화면 교체 카드: 6px 테두리, 같은 색 오른쪽 위 배지에 누구 대신인지. 색은 밝게·어둡게 모두 밝은 빨강 | 11-13, 색은 11-14 | `scripts/team-fit-check.mjs` `scripts/rules-browser-check.mjs` |
| U06 | 팀 화면 정렬은 이전 공략 규칙(역할 묶음 → 우선순위) | 11-13 | `scripts/rules-browser-check.mjs` |
| U07 | 팀 화면 탭은 정확히 [최종 25인, 백마술, 루트 편성, 비교 근거](백마법 → 백마술) | 11-13 | `scripts/rules-check.mjs` |
| U08 | 같은 묶음 안에서 같은 얼굴을 되풀이하지 않는다(팀 화면 포함) | 11-13 | `scripts/rules-browser-check.mjs` |
| U09 | 색은 은은하게. 배경 없는 초상화는 한 가지 바탕색 | 11-13 | `scripts/rules-browser-check.mjs` |
| U10 | 장을 모두 체크하면 색종이(움직임 줄이기 제외) | 11-13 | `scripts/rules-browser-check.mjs` |
| U11 | '자세히' 단추를 어디에도 두지 않는다 | 11-13 | `scripts/rules-browser-check.mjs` |
| U12 | '첫 미완료로 이동'은 고정 머리 안 | 11-13 | `scripts/header-browser-check.mjs` |
| U13 | 카이 루트: 마법·회복 담당이 아니면 1·2부 전차병(2부 끝까지 유지). 알렉산드라는 전차병이 아니다(고유 탈것은 비행 병종). 누조는 투자 없음 | 11-13 | `scripts/rules-check.mjs` `scripts/verify-character-data.mjs` |
| U14 | 물품·무기 이름에 그림. 공식 게임 그림을 쓰고, 못 찾은 것만 일반 그림(목록 고정) | 11-13 | `scripts/rules-check.mjs` |
| U15 | 그림이 붙는 말은 묶음 색 바탕 배지: 지원 분홍·명성 파랑·재료 초록·골드 노랑 | 11-13 | `scripts/rules-browser-check.mjs` |
| U16 | 장 묶음에는 그 장 할 일만 둔다. 예외는 다음 장 준비뿐 | 11-14 | `scripts/verify.mjs` |
| U17 | 배지 안에 바탕 겹친 span 없음 | 11-14 | `scripts/corrections-browser-check.mjs` |
| U18 | 루트 머리는 스크롤해도 고정. 도구 줄 진행 막대는 없앤다 | 11-14 | `scripts/corrections-browser-check.mjs` |
| U19 | 데스크톱 최대 폭을 넓게, 할 일 안 모든 요소(표 등)는 칸을 꽉 채운다 | 11-14 | `scripts/corrections-browser-check.mjs` `scripts/rules-browser-check.mjs` |
| U20 | 영입 가능한 동료 전원 영입(필수). 한 인물은 조건이 가장 쉬운 루트에서. 더 쉬운 루트를 두고 다른 루트에 두면 이유를 적는다(디에고는 세오도라에도 영입) | 11-14 | `scripts/rules-check.mjs` |
| U21 | 1부 12장 연회 반복으로 지원을 올린다(필수, 2부엔 연회 없음). 회차마다 12장 영입을 다시 하고 선물을 준다(인물당 주 1개). 외전은 회차마다 다시 하지 않고 여관 짝 식사·자동 활동으로 올린 뒤 마지막에 한 번. 대화는 마지막 회차 뒤 여관에서 | 11-14 | `scripts/verify.mjs` |
| U22 | 누조는 네 루트 모두 영입(선더 소드). 게임 용어는 고기·연회 | 11-14 | `scripts/rules-check.mjs` |
| U23 | 이오는 탈것을 보존할 수 있는 루트만. 알렉산드라는 두 루트 이상 영입 | 11-14 | `scripts/verify.mjs` `scripts/rules-check.mjs` |
| U24 | 최종 25인(대체 포함): 서랍에 금색 '최종 25인' 배지, 얼굴에 4px 테두리. 테두리 색은 밝게·어둡게 모두 밝은 빨강 | 11-14, 금색 테두리 → 빨강(11-14) | `scripts/header-browser-check.mjs` `scripts/rules-browser-check.mjs` |
| U25 | 사이트에 개인 진행(체크·골드·축복 등) 없음. 새 브라우저는 빈 기록. 개인 값은 git 무시 progress/ JSON에만 두고, 사이트는 그것을 가져오고 축복 단계·가호 레벨·파편·골드를 고칠 수 있다 | 11-14, 11-15 | `scripts/header-browser-check.mjs` `scripts/status-browser-check.mjs` `scripts/verify.mjs` |
| U26 | 모든 영입 동료 서랍에 싼 선호 선물(지원 1 영입·영입만 카드 포함) | 11-14 | `scripts/verify.mjs` `scripts/rules-browser-check.mjs` |
| U27 | '완료 숨기기'는 고정 머리 안. 오른쪽 아래 둥근 '맨 위로' 단추(그림만, 풍선 도움말) | 11-14 | `scripts/header-browser-check.mjs` `scripts/rules-browser-check.mjs` |
| U28 | 테마 단추는 하나: 머리가 붙기 전 오른쪽 위, 붙은 뒤 막대 오른쪽 끝, 부드럽게 바뀜 | 11-15(11-14 '머리에 고정'을 대체) | `scripts/layout-browser-check.mjs` `scripts/rules-browser-check.mjs` |
| U29 | 바닥 고정 게임 날짜(YYYY/MM/DD, 가운데, 주행계 움직임). 날짜는 첫 미완료 항목 기준 | 11-14(2안 선택) | `scripts/header-browser-check.mjs` `scripts/verify.mjs` |
| U30 | 공유 미리보기 그림에 시간 경과 뒤 초상화 금지 | 11-14 | `scripts/rules-check.mjs` |
| U31 | "X가 X 위치입니다"·"X(X)" 같은 말 되풀이 금지 | 11-14 | `scripts/verify.mjs` `scripts/rules-check.mjs` |
| U32 | 루트별 지원 대화: 짝 이름이 세로로 깨지지 않고 한 줄, 인물 거르기 | 11-14 | `scripts/verify.mjs` `scripts/rules-browser-check.mjs` |
| U33 | '이 장의 인물' 얼굴 아래에도 '루트별 지원 대화' 단추 | 11-14 | `scripts/rules-browser-check.mjs` |
| U34 | 모든 진행 막대는 흰 바탕·초록 막대 | 11-14(진행률별 색 변화를 대체) | `scripts/rules-browser-check.mjs` |
| U35 | 가져오는 동안 화면 전체를 막는 창과 돌아가는 표시 | 11-15 | `scripts/status-browser-check.mjs` |
| U36 | 지원 순서 잠금은 줄마다 근거와 확인 여부, 출처 주소 | 11-15 | `scripts/rules-check.mjs` |
| U37 | 단추끼리 붙지 않는다(4px 이상), 화면 가장자리에서 8px 이상 | 11-15 | `scripts/button-gap-check.mjs` |
| U38 | 세로 화면(9:16 등) 첫 화면 군주 카드는 위아래로 쌓는다. 가로 화면은 네 오벨리스크가 나란히(첫 화면 구성 보존) | 11-15, 11-13 | `scripts/layout-browser-check.mjs` `scripts/home-visual-check.mjs` |
| U39 | 루트별 지원 대화에 빠진 쌍이 하나도 없다. 전체 목록 190쌍과 한 쌍씩, 단계 값까지 같다. 자료·할 일 글의 쌍 이름도 190쌍 안 | 11-15 | `scripts/rules-check.mjs` |
| U40 | 3부 인과 융합은 지원 반복을 모두 끝낸 뒤(구간 다시 하기로 파편이 돌아오지 않는다) | 11-14("꼭 기억") | `scripts/verify.mjs` |
| U41 | 한 인물은 한 루트(겹치지 않게). 여러 루트 영입은 스탯 융합·그 루트에서만 보는 대화·울턴드(던전 반복 루트 전부)·누조(선더 소드)만. 지원 대화 손실은 하나도 없게 | 11-14 | `scripts/rules-check.mjs` `scripts/verify.mjs` |
| U42 | 최종 25인 밖(지양 10명 등)은 지원 대화용 영입만, 육성·투자 없음. 이야기 주력 8명(토비아스·보나파르트·라이선더·녹투라·루루디아·세테스·게이츠·하르빈)은 육성 유지. 누조는 투자 없음 | 11-13·11-14 | `scripts/rules-check.mjs` `scripts/rules-browser-check.mjs` |
| U43 | 휴대폰 좁은 칸의 최소 글자는 14px(그 밖은 18px) | 11-13 | `scripts/team-fit-check.mjs` |
| U44 | 팀 루트 편성의 작동하지 않던 '3부' 선택·'변경 인물만'은 없앤다 | 11-13 | `scripts/rules-check.mjs` |
| U45 | 영입 단계는 명성 조건이 맞는 장에(디트리히 카타냐 7장, 카이 누조 12장) | 11-14 | `scripts/rules-check.mjs` |
| U46 | 사용자가 게임에서 확인한 사실은 사실로 쓴다(여관 식사는 영입 전 두 사람끼리도 지원이 오른다). 한 곳에서만 나온 내용은 '확인되지 않음'을 붙인다(누조 선더 소드 지참, 제스터–레다 명성 10) | 11-14 | `scripts/rules-check.mjs` |
| U47 | 2026-11-13 요청 화면 기능: 반응형·카드·스크롤 맞춤·작은 움직임·공유 요소 전환·화면 전환·고정·스크롤 연동 움직임(있는지 검사. 모양은 디자인 사양) | 11-13 | `scripts/rules-check.mjs` |
| U48 | 팀 '루트 편성'·'비교 근거': 같은 단계 제목의 왼쪽 여백 통일, 같은 칸 안 얼굴 되풀이 없음 | 11-13 | `scripts/rules-browser-check.mjs` |
| U49 | 선물 이름은 한 이름(홍소·창소)으로, 같은 물건을 두 번 적지 않는다 | 11-14 | `scripts/rules-check.mjs` |
| U50 | 할 일 묶음 제목의 얼굴을 누르면 인물 서랍이 열린다 | 11-14 | `scripts/rules-browser-check.mjs` |
| U51 | 휴대폰 고정 머리는 얇게 | 11-14 | `scripts/rules-browser-check.mjs` |
| U52 | 레다는 세오도라 다음에 하므로 장마다 추가 명성이 붙는다. 제스터 영입 명성 10은 10장까지 서둘러 채우는 단계를 둔다(미확인 표시와 함께). 1부 진행 순서는 세오도라 → 레다 → 디트리히 → 카이 | 11-14 | `scripts/rules-check.mjs` |
| U53 | 배지 안 일반 아이콘은 채운다(면은 배지 그림색, 속무늬는 배지 바탕색 선). 단추가 채움이므로 아이콘도 채움 | 11-15 | `scripts/consistency-browser-check.mjs` |
| U54 | 표 머리 칸은 왼쪽·위 정렬. 폭은 데스크톱 120px, 휴대폰 100px | 11-15 | `scripts/consistency-browser-check.mjs` `scripts/browser-check.mjs` |
| U55 | 같은 종류는 같은 모양: 단추·입력 모서리 10px, 장 선택·완료 숨기기도 채운 조작 요소, 접기 표시는 아래 화살표 하나(기본 ▶ 없음)(첫 화면 단추는 8px 그대로) | 11-15 | `scripts/consistency-browser-check.mjs` |
| U56 | 배지는 이름 중간에서 줄이 바뀌지 않고 이름과 값 사이 간격이 보인다. 휴대폰에서 표는 칸 안에 들어간다 | 11-15 | `scripts/consistency-browser-check.mjs` |
| U57 | 아나톨리아 최종 병종은 드루이드(샐러맨더를 든다 · 공략 자료 기준, 게임 확인 전). 그자람 최종 병종은 소드 마스터(드래군 검토 뒤 유지) | 11-15 | `scripts/rules-check.mjs` |

## 작업 방식 규칙

| 번호 | 규칙(최신) | 날짜·대체 | 검사 |
|---|---|---|---|
| P01 | 배포 직전마다 Fable 5.2로 이상·빠진 점을 검토하고 지적을 고친다. 새 규칙도 Fable을 거친다(규칙 문서가 해시에 들어감) | 11-14 22:33·11-15(11-14의 '금지'·'배포 전 1회만'을 대체) | `scripts/release.mjs` |
| P02 | 배포와 함께 git push | 11-14 | `scripts/release.mjs` |
| P03 | 배포 전에 작은 문제(낮음 지적 포함)까지 모두 고친다. 문제가 하나도 없을 때까지 멈추지 않는다 | 11-14 | `scripts/release.mjs` |
| P04 | 불분명한 결정은 추천이 보이는 질문으로 묻는다 | 11-14 | `AGENTS.md` |
| P05 | 사용자 미리보기는 실시간 개발 서버로(정적 미리보기는 검사용). localhost:3000의 체크 칸은 누르지 않는다 | 11-14 | `AGENTS.md` |
| P06 | 작업 전에 필요한 기술(skill)을 설치·사용한다(modern-web-guidance·impeccable 등, shadcn 권장) | 11-13 | `AGENTS.md` |
| P07 | 문서와 코드가 다르면 코드 규칙을 따르고, 다른 점을 답변에 모두 적는다 | 11-13 | `AGENTS.md` |
| P08 | 사용자의 나중 말이 앞 말보다 우선한다. 규칙을 고칠 때 옛 줄을 대체로 표시한다 | 11-15 | `AGENTS.md` |
| P09 | 자료가 서로 다르면 원본 공략으로 확인되는 것만 고치고, 확인 안 되면 '미확인'으로 둔다 | 11-13 | `AGENTS.md` |
| P10 | 이전 프로젝트(fe-fortunes-weave-guide-main)는 읽기 전용, `archive/` 수정 금지, `hive` 명령·전역 지식 기록 금지 | 11-13 | `AGENTS.md` |
| P11 | 커밋은 할 일 하나마다, 작성자는 사용자, 공동 작성자 줄 금지, 한국어 Conventional Commit 제목. 검토 통과 뒤 배포 | 11-13 | `AGENTS.md` |
| P12 | Fable 5.2는 자문(계획·디자인 값·검토)만 하고 코드를 쓰지 않는다. 코드 작성은 Opus 5.5 중간 강도에 맡긴다 | 11-15 | `AGENTS.md` |
