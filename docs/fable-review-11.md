# Fable 검토 11 (2026-11-15)

대상: `git diff 73ba88f..HEAD` (97d7afd, 64e2c3d, 2cfa856). 코드·자료 수정 없음, 읽기만 했다.

확인 방법: 자료 대조 스크립트(임시 폴더), `tsc --noEmit` 통과, `node scripts/verify.mjs` 통과, 개발 서버(:3000) 화면 읽기(체크는 누르지 않음), yuphastemple 인물 페이지 3명(디에고·시몬·대도)과 `locations.json` 가격 대조.

## 결론

- 가장 큰 문제는 **개인 진행 글이 아직 사이트에 남아 있다**는 것이다(H1·H2). `verify.mjs`는 통과하지만 검사가 놓친다.
- 영입만 카드 18개의 루트·장·지원 쌍·명성/지원 값, 선물 고르기 규칙은 맞았다. 틀린 게임 사실은 찾지 못했다.

## 높음

### H1. 할 일 화면에 "현재 Lv(실측)"·"마지막 실제 가호"가 그대로 보인다

- 위치: `scripts/fix-progress-text-20261115.mjs:19`, `:24` → `content/source/react-content.json`(원본 HTML), `content/derived/checklist.json`
- 잘못: 규칙 19는 `현재 Lv(실측)·투사·검술 C`를 찾지만 원본 HTML은 `현재 <span>Lv(실측)</span>·<span class="class-token">…투사…` 처럼 태그가 끼어 있어 맞지 않는다. 규칙 24도 가호 토큰(`<span class="god-token"><img/><span>아우로라 3</span></span>`) 때문에 맞지 않는다. `playbook.json` 글만 바뀌었다.
- 실제 결과(화면에서 확인, 세오도라 1부):
  - `ready-theodora-loretta--readiness-start`, `ready-theodora-sirocco--readiness-start`, `ready-theodora-dante--readiness-start`, `ready-theodora-ninae--readiness-start`: 보이는 글은 "현재 Lv(실측)·투사초급직·검술C 확인 · C 추가 훈련 생략 …", 체크 칸 `aria-label`은 "레벨·병종·검술 등급 확인 …". 보이는 글과 낭독기 글이 다르다.
  - `prep-carry-confirm--levels`: "마지막 실제 가호는 (이월 가호 레벨)·나머지 0이다."가 그대로 보인다.
  - 원본 HTML에 `현재 <span>Lv(실측)</span>`이 16곳 남았다(할 일 4곳 + 인물 카드 「원문 기록」의 "출격 일정"·"준비·실행 순서"·"기능 목표·근거").
- 고치기: 이 5개 할 일은 `display-overrides.json`의 `actions`에 새 글을 넣거나(가장 간단), 원본 HTML에서 태그를 포함해 바꾼 뒤 `regen-parity`·`derive-checklist`를 다시 돌린다. 인물 원문 기록의 같은 문장도 함께 바꾼다.

### H2. 문서·인물·팀·준비 화면에 개인 진행이 많이 남았다

- 위치와 남은 글(모두 페이지에 실려 나가는 것을 확인):
  - 문서 화면(`content/derived/documents.json`, 모든 루트 문서 목록에 나온다) 18개 문서:
    - `content/notes/boon-buy-review.md:3`, `:25` "(구매 기록) · 남은 인과의 파편N개 … 이전M"
    - `content/notes/carry-hard-review.md:8`, `:12`, `:25`, `:89` "현재 잔액은N다", "마지막 실제 보고"
    - `content/notes/exp-boon-decision-review.md:5`, `:42`, `:55-56`, `:62`
    - `content/notes/missables-shopping-review.md:20`, `content/notes/aurora-price-review.md:7`, `:12`, `content/notes/combat-review.md:15`, `:123`, `content/notes/questions.md:13`, `:25`, `content/notes/restart-review.md:183`, `:251`, `content/notes/plan.md:561-574`, `:920`, `content/notes/god-service-review.md:5`, `content/notes/theodora-lv20-class-review.md:9`, `content/notes/sword-xp-review.md:35`
    - `content/notes/sequential-routes-apply-review.md:24-27`(Lv(실측) 표), `sequential-routes-training-review.md:23`, `:173`, `:197`, `sequential-routes-apply-plan.md:6`, `theodora-inn-versus-field-exp-review.md:31`, `:36`, `:55`
  - 인물 카드 「원문 기록」(세오도라 시로코·로레타·리네·단테): "사용자 확인 Lv(실측) · 투사 · 검술C · 2026-11-07 보고 · 전직 완료 미확인"
  - 팀 화면(`presentation.json` `parity.team.proposal`, `teamSections`): "사용자의 마지막 파비오 마력(실측)였지만 …", "옛 디트리히판에서는 외전을 놓쳤으므로 새 진행에서 회수해야 한다."(규칙 44줄은 "…회수해야 합니다" 꼴만 바꿨다)
  - 준비 화면: `content/data/god-service-plan.json:46` "실제 마지막 보고: (이월 가호 레벨), 나머지0"
  - 할 일: `prep-boons--0c34c5be60` "기존 아우로라 3을 활용한다"
- 잘못: 고쳐 쓰기 규칙이 할 일·자료 문장 꼴에만 맞춰져 있어 검토 문서의 다른 꼴 문장을 못 잡았다.
- 고치기: 둘 중 하나를 사용자에게 묻는다. (가) 진행 수치가 든 검토 문서를 `progress/docs/`로 옮겨 사이트에서 뺀다(가장 확실). (나) 문서별로 수치 문장을 지운다. 팀·준비·원문 기록 문장은 중립 글로 바꾼다.

### H3. `verify.mjs`의 개인 진행 검사가 H1·H2를 못 잡는다

- 위치: `scripts/verify.mjs:128-129`
- 잘못: (1) `JSON.stringify`한 글에 정규식을 써서 `"현재 ",{"tag":"span",…"children":["Lv(실측)"]}`처럼 태그로 나뉜 글을 못 본다. (2) `documents.json`을 검사하지 않는다. (3) "마지막 실제", "Lv(실측) … 보고", "마력(실측)" 같은 꼴이 목록에 없다.
- 실제 결과: H1·H2가 남아 있는데 `status: passed`.
- 고치기: 나무의 글자만 이어 붙인 문자열(태그·속성 제외)로 검사하고, `documents.json` 본문도 넣고, 꼴을 `/Lv ?17/`, `/마지막 실제 (가호|보고)/`, `/구매 완료/`, `/마력은? ?42/`로 넓힌다.

## 중간

### M1. 없어진 진행 문서로 가는 링크 9개

- 위치: `content/notes/theodora-renown-review.md:35`(2개), `content/notes/restart-review.md:122`, `content/notes/knowledge/sources.md:130`, `:133`, `:150`(각 2개)
- 잘못: `progress.md`, `routes/*/progress.md`는 사이트에서 빠졌는데 링크는 남았다. `lib/document-links.ts:7`도 `progress.md`를 아직 아는 문서로 다룬다.
- 실제 결과: 문서에서 "전체 진행"·"세오도라 진행"을 누르면 열 문서가 없다.
- 고치기: 링크를 일반 글로 바꾸고 `document-links.ts`의 `'progress.md'`를 지운다.

### M2. 같은 선물이 「싸게 살 수 있는 선물」과 「비싼 선물」에 다른 이름으로 함께 나온다

- 위치: `components/people.tsx:66`, `content/data/people-display.json`(디에고·시몬 등), `content/data/affordable-gifts.json`
- 잘못: 새 카드에서 처음 보이게 된 `gifts` 목록이 "비싼 선물" 이름표로 나오는데 싼 물품이 들어 있고, 이름도 다르다.
- 실제 결과:
  - 디에고: 싼 선물 "진홍 홍소 200G" + 비싼 선물 "진홍 고슈" (같은 물품 Crimson Ghosh). "관절 보호 장갑"도 300G짜리다.
  - 시몬: 싼 선물 "진홍 홍소 200G" + 비싼 선물 "진홍 고슈 · 수호 인형"(수호 인형은 200G).
  - 키로이카: 싼 선물 "햇홍소" + 비싼 선물 "진홍 고슈 · 화산 고슈" — "홍소/고슈" 두 번역이 한 카드에 섞인다.
- 고치기: 게임 한국어 이름을 하나로 정하고(사용자에게 묻기), 영입만 카드에서는 `gifts` 가운데 싼 목록에 이미 있거나 500G 이하인 것을 "비싼 선물"에서 뺀다.

### M3. 같은 처지의 18명은 여전히 그 루트 카드가 없다

- 위치: `content/data/recruit-only-cards.json`, `scripts/add-recruit-only-cards-20261115.mjs:43`(이름 13개만 본다)
- 잘못: "어느 루트에도 카드가 없던 13명"만 만들었다. 다른 루트에 카드가 있어도 이 루트에는 대화 때문에 영입만 하는 사람은 빠졌다.
- 실제 결과(`recruit-all-plan.json` routeRoster와 대조): 세오도라 울턴드·티아라·세테스·피아나·하르빈·버커니어, 레다 울턴드·제스터·로레타, 디트리히 피터르·릴리안·루루디아·녹투라·하르빈·라이선더·무우, 카이 에스메랄다·무우. 이들의 묶음 제목 초상화는 단추가 아니어서(세오도라 화면에서 확인) 눌러도 서랍이 안 열리고, 그 루트의 영입 이유·대화 쌍·선물이 없다.
- 고치기: 사용자에게 범위를 묻는다. 넓힌다면 이름 목록 대신 routeRoster에서 그 루트 카드가 없는 사람 전부로 만든다.

## 낮음

### L1. 누조 메모가 "확인 안 됨"과 어긋난다

- 위치: `content/data/playbook.json:5985`, `:11447`, `:18059`, `:23856`; `lib/character-summary.ts:34`
- 잘못: 단계에는 "선더 소드 지참은 원래 공략 한 곳에서만 확인됐다"를 붙였는데, 바로 아래 메모는 "12장 무렵 영입하면 선더 소드를 들고 온다. 일찍 영입하면 없다."로 단정한다. 디트리히 영입 줄에는 안내가 없다(세오도라·레다·카이만).
- 고치기: 메모를 "…들고 온다고 한다(출처 한 곳)"로 바꾸고 디트리히 줄에도 같은 안내를 단다.

### L2. 어색하거나 뜻이 흐려진 고쳐 쓴 문장

- `content/data/playbook.json` `theo-03` 메모 "명성2다. 군비증강 2건·소피아 영입을 끝냈는지 확인한다." → 주어 없이 상태를 단정한다. "명성 2일 때: …"가 낫다.
- `content/data/unit-readiness.json`·`roster-plan.json`·`roster-selection.json`·`content/notes/roster-build-review.md` "영입(명성2,6장 명성3 예상)" → 무엇의 명성 2인지 사라졌다. "5장 명성2, 6장 명성3 예상".
- `content/notes/haphazard-training-review.md` "5장이라는 최신 진행을 기준으로 검토했으며" → 여전히 개인 진행이다.
- `content/notes/poet-copy-review.md` "5장 명성2에서는 시로코 명성5 조건을 채우지 못했다." → 과거형 개인 기록이다.
- `prep-boons` 묶음: "…에 산다" 13줄 뒤에 "지금 추가 구매는 보류한다"가 온다. "13개 외 추가 구매는 보류한다"가 분명하다.

### L3. 서랍에 지원·명성과 "지원 대화용 영입" 표시가 없다

- 위치: `components/detail-sheets.tsx:14`
- 잘못: 인물 화면 카드 머리(`PersonHeading`)에는 지원·명성·"지원 대화용 영입" 배지가 있지만 서랍 머리에는 역할("수집")만 있다. 인수인계 글은 "합류 장·지원/명성"을 보인다고 했다. 영입 조건은 「시험 조건·시기별 계획」이라는 맞지 않는 이름의 접힌 칸 안에만 있다.
- 고치기: 서랍도 `PersonHeading`을 쓰거나, 영입만 카드에서는 접힌 칸 이름을 "영입 조건"으로 한다.

### L4. 3부 인물 화면: 같은 이름 카드가 여러 장, 이유 글이 1·2부 대화만 말한다

- 위치: `lib/content.ts:59-61`
- 잘못: `route==='part3'`이면 18장이 모두 나온다(골라이어스 3장, 대도·디에고·양계 2장). 기존 누조 4장과 같은 방식이라 오류는 아니지만, 이유 글이 "이 루트에서 지원 대화를 보려고 영입합니다: (1·2부 쌍)"이고 3부에 볼 `pairs3`는 `pairs`가 있으면 나오지 않는다.
- 고치기: 3부에서는 `pairs3`를 보이고("3부에 볼 대화: …") "이 루트" 대신 루트 이름을 쓴다.

### L5. 밝은 화면에서 0% 진행 막대가 거의 안 보인다

- 위치: `app/redesign.css:533`
- 잘못: 흰 바탕 + 테두리 `#0000004D`(흰 면 위에서 약 `#B3B3B3`, 대비 약 2.1:1). 밝게 모드 흰 머리 띠에서 0%일 때 막대 칸이 흐리다(휴대폰 화면에서 확인). 초록 채움은 흰 바탕·어두운 바탕 모두 4:1 이상이라 괜찮다.
- 고치기: 테두리를 `#00000073`(약 3:1) 이상으로. `:534`의 `.dark` 줄과 `data-progress-stage` 단계 색(`redesign.css:122-129`, `lib/progress.ts`)은 이제 효과가 없다 — 지울지 사용자에게 알린다.

### L6. 제목 초상화 단추 크기 42px

- 위치: `app/redesign.css:528`
- 잘못: 그림 36px + 여백 3px = 42×42px(데스크톱·휴대폰 모두 측정). 같은 커밋의 휴대폰 규칙은 "누를 곳 44px 이상"을 적었다.
- 고치기: `padding:4px;margin:-4px`.

### L7. 2026-11-15 결정이 `content/notes/knowledge/`에 없다

- 위치: `content/notes/knowledge/`(이번 범위에서 바뀐 파일 없음)
- 잘못: 인수인계 규칙은 새 결정을 knowledge에 날짜·출처와 함께 적으라고 한다. 여관 식사 사실(사용자 게임 확인), 개인 진행 제거, 진행 막대 색, "확인 안 됨" 표시가 `HANDOFF.md`에만 있다.
- 고치기: `preferences.md`·`sources.md`에 적고 `refresh-manifest`를 돌린다.

### L8. 디자인 사양에 새 값이 없다

- 위치: `docs/design-spec.md`
- 잘못: 진행 막대 색만 적혔다. 휴대폰 머리 104px·바닥 40px, 초상화 단추, 「루트별 지원 대화」 단추 값이 없다.
- 고치기: 사양에 값을 적는다.

## 문제없음으로 확인한 것

- 카드 18개의 루트·장: 할 일 목록의 영입 묶음과 모두 일치. 명성·지원 값도 묶음 제목과 `recruitment-gates.json`이 일치.
- 지원 쌍: 「루트별 지원 대화」 표의 그 루트 줄과 일치. 1·2부 쌍이 없는 4장(세오도라 자코네, 디트리히 양계·밴디츠, 카이 마지데)은 3부 쌍이 있다.
- 선물: 12명 모두 가격·id 순으로 정렬돼 있고, 디에고·시몬·대도는 yuphastemple 반응·가격과 맞았다(나머지 9명은 원문 대조 안 함).
- 여관 짝 식사 문장: 화면·자료에 "확인하고 안 오르면" 꼴이 남지 않았다.
- 초상화 단추: 눌러도 묶음이 접히지 않고 서랍이 열린다(레다 키로이카로 확인). 「루트별 지원 대화」 단추는 그 루트 표만 든 문서를 연다.
- 진행 막대 색: 어둡게·밝게 모두 흰 바탕·초록으로 적용. 휴대폰 머리 104px, 가로 넘침 없음. 바닥 날짜 40px은 화면에서 재지 못했다(날짜 없는 장만 봤다).
- 3부 할 일 화면에는 이 13명의 초상화 단추가 없어 서랍이 엉뚱한 루트 카드를 여는 일은 없다.
