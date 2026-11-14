# Fable 검토 12 (2026-11-15)

대상: 커밋 `78bb297` 이후 커밋하지 않은 변경(`git diff 78bb297`)과 새 파일 `scripts/fix-progress-data-20261115.mjs`. 코드·자료는 고치지 않았고 이 보고서만 썼다.

확인 방법

- 문서 54개의 바뀐 줄을 모두 읽었다(`git diff -w`).
- 할 일·표시 자료(`content/derived/checklist.json`, `presentation.json`)를 이전 커밋과 항목별로 비교했다(할 일 45곳, 표시 38곳).
- 원본 HTML(`content/source/react-content.json`) 954개 조각의 태그 짝을 검사했다. 깨진 곳 없음.
- 문서 안 링크의 파일·제목 닻을 검사했다. 이번 변경으로 끊긴 링크 없음.
- `verify.mjs`의 개인 진행 검사와 표 검사를 읽기 전용으로 따라 돌렸다. 통과.
- 하지 않은 것: `npm run verify` 실행(`docs/*.json`을 다시 쓰므로), 빌드, 개발 서버 화면 읽기(이 환경에서 localhost 요청이 거부됐다). 화면에 나오는지는 자료 파일과 코드, 이전 빌드 결과물 `out/`으로 판단했다.

## 결론

- **가장 큰 문제는 H1이다.** `content/data/`의 JSON 전체가 사이트의 `/reference-data/`로 그대로 공개되는데, 이 파일들에 주인 저장 상태가 통째로 남아 있다. `verify.mjs`는 이 경로를 보지 않는다.
- 문서 쪽은 손대지 않은 문서 몇 개에 주인 수치가 그대로 있다(H2). 고친 문서에는 끊긴 문장 1곳과 조사 오류 2곳이 있다(M4).
- 고쳐 쓴 할 일 글의 HTML은 깨지지 않았고 뜻도 유지됐다. 바뀐 TS/CSS에서 동작 오류는 찾지 못했다.

## 높음

### H1. 주인 저장 상태가 `/reference-data/*.json`, `/reference-files/notes/*.json`으로 공개된다

- 경로: `scripts/run.mjs:10`, `:12`가 `content/data` 전체(`checklist.json`만 제외)와 `content/attachments`를 `public/`으로 복사한다. `components/documents.tsx:86-87`이 문서 안 `data/…` 링크를 `/reference-data/…`로 연다. 이전 빌드 결과에도 `out/reference-data/carry-state.json`이 있다.
- 남은 내용
  - `content/data/carry-state.json`
    - `lastReported` 전체: `"shards":N`, `"boonsBought":13`, 가호 레벨((이월 가호 레벨)), `"oldRenown":12`, `"oldGold":70193`, 끝낸 외전·놓친 외전 목록, 구매한 축복 13개 이름.
    - `:21` "(옛 진행 상태) 그대로로 사용자 재확인"
    - `:89` "세오도라1부7장후반·세오도라Lv20·명성6·중급 전직 가능"
    - `activeRouteProgress`(7장 후반·Lv20·명성 6)
    - `carry[1].known` "현재N파편·(구매 기록). 기존M에서4,800 사용"
    - `:184` "(구매 기록)·현재N는 사용자 직접 보고"
    - 이번 스크립트는 `known` 두 칸만 바꿨다.
  - `content/data/boon-prices-user-reported.json` 파일 전체: "사용자 실제 구매 메뉴 보고", `"reportedExpPurchasedPercent":10`, `"reportedRemainingShards":N`, `"purchaseExecuted":true`.
  - `content/data/god-service-plan.json:3` `"lastReported":{"아우로라":3,"주라":2,…}`
  - `content/data/purchase-plan.json:344`, `:474` `lastReportedBought: 13`, `lastReportedDate`
  - `content/data/sequential-training-plan.json:104` `"reported"`(세오도라 7장, 주력 6명, 신규 4명 병종·기능)
  - `content/data/unit-readiness.json:333`, `:389`, `:494`, `:695` `"reported":{"date":"2026-11-07","level":17,…}`
  - `content/data/weekly-support.json:32` `reportedCompletedRecruits`
  - `content/data/starter-handoffs.json:4` "현재 세오도라7장 보고는 주력5동료로 칸이 찬 실제 상태 우선"
  - `content/data/recruitment-build-audit.json:407` "늦은 디트리히 영입은 경기병이었던 사용자 관찰"
  - `content/data/playbook.json`
    - `:28450` `retiredReason` "사용자 확인13개 구매 목록 … 현재 잔액N"
    - `:28458`, `:28466` "구매 완료를 사용자 확인"
    - `:28344` `references`의 "파비오는 기존 확인에서 엽독의 보주만 해제해 데스 공격 속도 0→8", `routes/dietrich/roster.md` 링크("실제 부대 수치"). 원본 HTML만 고치고 이쪽은 안 고쳤다.
  - `content/attachments/notes/boon-purchase-application-validation.json`(`"currentShards": N`, "실제 구매 완료와 잔액은 사용자 보고"), `theodora-ch5-validation.json`("사용자 보고")
- 페이지 소스에도 실린다: `unit-readiness`의 `reported`(Lv(실측))는 `presentation.json` records에 들어가 인물 카드 자료로 클라이언트에 넘어간다. 화면에는 안 그리지만 HTML 안에 글자로 있다. 이전 빌드의 `out/theodora/1/index.html`에서 `"reported"…"promotionConfirmed":false`를 확인했다. `presentation.json`에는 `"lastReported":{"아우로라":3,"주라":2…}`도 있다.
- 고치기(하나를 고른다)
  - (가) `run.mjs`에서 `content/data` 전체 복사를 그만두고, 문서가 실제로 링크하는 파일만 복사한다.
  - (나) 위 필드·파일을 자료에서 지우거나 `progress/`로 옮긴다. `carry-state.json`의 `lastReported`·`activeRouteProgress`, `boon-prices-user-reported.json`, 각 `reported*` 필드, `retiredReason` 문장이 대상이다.
  - 어느 쪽이든 `verify.mjs`가 `content/data/*.json` 원문, `content/attachments`, `public/reference-*`도 같은 꼴로 검사하게 한다.

### H2. 손대지 않은 문서에 주인 수치·상태가 그대로 있다

모두 `documents.json`에 실려 문서 화면에 나온다.

- `content/notes/sword-xp-review.md`
  - `:9` "실제 저장은 계속 하드·캐주얼, 디트리히 2부 1장 첫 전투 전이다."
  - `:14` "현재 시로코·알렉산드라가 한 자루를 나눠 쓰므로…"
  - `:29` "지금의 1개 | 시로코가 선더 소드+1 사용"
  - `:36` "디트리히는 힘 35·마력 17이다"
  - `:37` "알렉산드라는 마력 16, 시로코는 25다"
  - `:38` "파비오의 검술 등급은 아직 확인되지 않았다"
- `content/notes/personalized-evidence.md`
  - `:5` "기존 디트리히2부는 첫 전투 전 그대로로 재확인했다."
  - `:16` "실제 저장은 하드·캐주얼, 디트리히 2부 1장 첫 전투 전이다."
- `content/notes/sequential-routes-training-review.md:27`, `:30` "17→20 우선 보충", "네 명의17→20은 각3레벨"
- `content/notes/theodora-inn-versus-field-exp-review.md:5`, `:33` "여관17→20", "네 명의 정확한 현재 게이지는 미확인"
- `content/notes/plan.md`
  - `:132` 제목 "2부 미완료 확정·가호 할인 가격 외부 조사"
  - `:138` 제목 "디트리히 완료 뒤 이월…"
  - `:300`, `:309` "전체·디트리히 진행"에 연결/반영
  - `:315` "이미 쓴 약 50시간"
  - `:505` "40%는 다음 상한 오인 보고였으며 … 현재 버전 답변을 반영" — `:501`은 "다른 이용자의 40% 언급"으로 바꿔 서로 어긋난다.
  - `:559` 제목 "세오도라5장 명성2에 맞춘 재배치", `:562` "5장 명성2를 전체/루트 진행에 기록"
  - `:611` 제목 "세오도라7장후반·Lv20의 전직과EXP 판단"
  - `:823` "현재 세오도라6인 유지·신규4명17→20"
  - `:877` "전체·루트 기록과 가져오기 안내 갱신"
- `content/notes/theodora-lv20-class-review.md:1` 제목 "세오도라7장후반 · 경기병과 EXP 판단"
- `content/notes/restart-review.md:85` "이미 쓴 50시간을 되돌리는 효과는 없음"
- `content/notes/gift-item-travel-review.md:24` "사용자가 모든 역과 공통 의뢰를 완료했다고 보고한 상태와 모순되는…"
- `content/notes/knowledge/sources.md:217` "세오도라7장 실제로는 주력5동료로 자리가 차고…", `:150` "일시적7장 진행과 교환 미해금 관찰은 체크 자료·루트 진행에만 기록"
- `content/notes/checklist-order-review.md:11` "이월·옛2부 보류·새1장 선택" — 띄어쓰기가 없어 `/옛 2부/` 검사를 빠져나갔다.
- 고치기: 같은 방식으로 해당 문장만 지우거나 일반 문장으로 바꾼다. `sword-xp-review.md`는 수치 줄 `:36-38`과 표의 "지금의 1개" 줄을 지우고 `:9`를 뺀다.

### H3. `verify.mjs` 검사가 H1·H2를 못 잡는다

- 위치: `scripts/verify.mjs:131-133`
- 놓치는 꼴: `옛2부`(붙여 씀), `첫 전투 전이다`, `재확인했다`, `17→20`, `7장후반`, `50시간`, `6인 유지`, `이전 디트리히판`, `기존 디트리히`, `사용자 상태가 아닌`, `실제 저장은`.
- 객체는 값을 ` ¦ `로 이어 붙이므로 `{"level":17}`이나 `{"아우로라":3,"주라":2}` 같은 숫자 칸은 어떤 글자 꼴로도 못 잡는다.
- `content/data` 원문과 `content/attachments`는 검사 대상이 아니다.
- 고치기: 꼴을 넓히고, 키 이름 `reported`·`lastReported`·`activeRouteProgress`가 공개 자료에 있으면 실패하게 하고, `run.mjs`가 공개하는 폴더 전체를 검사 대상에 넣는다.

## 중간

### M1. 할 일·인물·준비 화면에 남은 주인 상태 문장

- `content/data/playbook.json:4174` (세오도라 `theo-09--1ee6e78afa`): "기존 디트리히에서 외전을 했더라도 세오도라의 배 대여 대화는 별도로 확인합니다." → "다른 루트에서 외전을 했더라도 …".
- `content/data/playbook.json:12017` (`di-01--hard-casual-confirm`): "이번 재육성에서는 난이도 변경을 위한 재강림을 하지 않는다." → "이 루트에서는 …".
- `content/data/playbook.json:12940` (`miss-di05-fabio-chain` 메모): "새 재육성에서는 기억 서고 등록만 믿고 건너뛰지 않는다." → "다시 할 때도 …".
- 인물 카드 원문 기록(디트리히 리네, `content/source/react-content.json`·`display-parity.json`): "이전 디트리히판 경기병 합류 관찰 · 실제 보유 자격 우선". 바꿔 쓰기 규칙이 병종 이름 뒤 등급 글자("중급직") 때문에 맞지 않았다. `phase-goals.json` 쪽은 "늦게 합류하면 합류 때 병종 확인"으로 바뀌어 한 화면에 두 글이 다르게 나온다.
- 시험·준비 참고 칸(`presentation.json` `parity.exam[10]`, 원본 HTML `id="preserve"`): "현재 2부 군행동 뒤 수치를 그대로 합치는 방법은 아니며 조기 영입·놓친 9월 외전은 해결 못 함.", "이전의 미등록 육성 자료는 덮어써진다." 칸 전체가 주인의 옛 저장을 전제로 한 표다. "현재"·"놓친"·"이전의 미등록"을 빼거나 칸을 전체 보기 전용으로 돌린다.
- `content/data/god-service-plan.json:123` (준비 화면): "사용자가 제시한 한 루트0→3 한 신+0→2 한 신을 목표 규모로 사용." 주인의 가호 레벨(3·2)에서 나온 문장이다. → "한 루트에 한 신 0→3, 다른 한 신 0→2를 목표 규모로 사용."
- 디트리히 2부 관련 글은 여전히 "하던 2부가 있다"를 전제한다.
  - `prep-no-old-skip` 제목 "시작 전 · 디트리히 2부는 새 1부 뒤에", 행동 "디트리히 2부를 먼저 스킵·완료하지 않는다."
  - `di-23` "2부 중간 저장을 이어 하지 않고 새 자료로 시작한다."
  - `war-di-new` 메모 "진행 중이던 2부를 이어 하는 것이 아닙니다."
  - 고치기: "이미 하던 디트리히 2부 저장이 있으면 …" 같은 조건문으로 바꾼다.

### M2. 같은 내용이 할 일과 문서에서 다르게 고쳐졌다

- 할 일(`playbook.json`): "디트리히 2부를 먼저 스킵하지 않는다", "2부 중간 저장을 이어 하지 않고…"
- 문서(`content/notes/chapter-route-plan.md:34`, `:36`, `:2055`, `:2920`, `:3006`): "시작 전 · 이전 2부 완료 보류", "이전 루트의 2부 자료로…", "이전 2부를 먼저 스킵하지 않는다", "이전 2부 중간 저장을…"
- "이전 2부"는 무엇의 2부인지 알 수 없는 말이다. `:3006` "새 1부 자료의 새 시작을 사용해야 합니다"도 할 일 글("새 1부 자료로 새로 시작해야 합니다")과 다르다.
- 고치기: 문서도 할 일과 같은 글로 맞춘다.

### M3. 여행지 그림 설명이 자료와 문서에서 다르다

- 자료(`recruit-materials.json`)는 "그림의 날짜·레벨은 위치 참고용 예시다."로 바꿨다.
- 문서는 옛 글 그대로다: `content/notes/recruitment/aurum-rose.md:29,65`, `azure-heart.md:27,61`, `fabled-ginji.md:27,57,87`, `gift-box.md:27,57,87`, `scarlet-drops.md:27,61,91` "…사용자 상태가 아닌 위치 참고다."
- 같은 꼴이 더 있다.
  - `content/notes/god-service-review.md:35` "장면의 인물·수치는 사용자 상태가 아닌 실제 게임 봉사 예시다."
  - `content/notes/underworld-merge-safety-review.md:43` "현재 사용자 저장의 인원/수치가 아닌 일본어 예시"
- 검사 꼴 `/사용자 (?:상태|잔액)가? 아니/`는 "아닌"에 맞지 않는다("니"와 "닌"은 다른 글자).
- 고치기: 문서도 "예시다"로 바꾸고 검사 꼴을 `아니|아닌`으로 한다.

### M4. 지우다가 끊기거나 어색해진 문장

- `content/notes/restart-review.md:101`: "…리네 가디언 직접 시험을 정리했다. 현재 " — 문장이 "현재"에서 끊겼다. "현재 "를 지운다.
- `content/notes/plan.md:181`: "체크 자료은 쓰지 않았다" → "체크 자료는".
- `content/notes/plan.md:415`: "체크·체크 자료을 보존하며" → "체크 자료를 보존하며".
- `content/notes/sword-xp-review.md`
  - `:13` "이 공략의 특정 편성과 여유분을 위한 목표이며, 이 편성의 필수 조건으로 그대로 적용하지 않는다." 앞뒤가 같은 것을 가리켜 뜻이 없어졌다. → "…목표이며, 모든 편성의 필수 조건은 아니다."
  - `:27`, `:32` "이 편성에서 얻는 것", "이 표는 이 편성에 대한 판단이다" — 어느 편성인지 가리키는 말이 없다.
  - `:45` "우선 이번 맵의 적 소지품과 드롭 표시를 확인할 가치가 있다." → "2부 1장 맵에서 …".
- `content/notes/late-recruit-review.md:9`: "늦게 합류하면 합류 때 병종을 확인한다. 나머지 시기별 병종·능력…" — 앞의 예시가 사라져 "나머지"가 가리킬 것이 없다. "나머지"를 지운다.
- `content/notes/normal-part1-level-comparison.md:61`: "‘짧게 끝내도 지금 레벨이 보장된다’" — "지금 레벨"이 가리킬 것이 없다. → "같은 레벨이".
- "전체 진행"을 "체크 자료"로 바꾸면서 같은 말이 두 번 들어갔다.
  - `content/notes/react-personalized-review.md:23` "체크·백업·체크 자료·…8개 파일"
  - `content/notes/team-balance-recheck-review.md:48` "실제 체크·이월 상태·체크 자료 동일"
  - `content/notes/team-scenario-differences-review.md:37` "체크·이월 상태·체크 자료·…" (보호 파일 8개)
  - 하나를 지우면 "8개" 같은 개수도 맞춰야 한다.
- `content/notes/exp-boon-decision-review.md:9`: 원래 주인의 잘못된 보고였던 것을 "다른 이용자의40% 언급"으로 바꿨다. 아래 표의 InkAndWit 사례와 맞아 틀린 말은 아니다. 다만 뒤 문장 "로컬 공략의 나중 단계 수치 전체가 틀렸다는 뜻도 아니다."가 떠 있고, `plan.md:505`·`boon-prices-user-reported.json`의 "오인 보고"와 어긋난다.

## 낮음

### L1. 검토 11 L2에서 아직 안 고친 문장

- `content/data/playbook.json:155` (`prep-boons`): "지금 추가 구매는 보류한다. 다음 새 1부 첫 완료 보상을…" — "…에 산다" 13줄 뒤에 온다.
- "(명성 2,6장 명성 3 예상)" — 앞의 "5장"이 빠진 꼴이 인물 카드 영입 줄에 남았다(`presentation.json`에서 확인).
- "5장 명성 2,6장 명성 3 예상이다"(`chapter-gold.json:82,140,190`), "6장 명성 3은 현재 예상이다"(`chapter-progression.json:178`, `chapter-route-plan.md:235`) — 주인의 5장 시점 예상에서 나온 말이다. 일반 안내로 두려면 "현재"를 뺀다.

### L2. 바닥 날짜 검사는 실패할 수 없는 검사다

- 위치: `scripts/verify.mjs:134-139`
- `currentGameDate`가 "앞에서부터 가장 늦은 날짜"를 돌려주므로 묶음을 차례로 끝내면 값은 정의상 줄지 않는다. 단언 `v>=prev`는 항상 참이다.
- 실제 순서 어긋남은 디트리히 두 곳뿐이고 의도대로 동작한다: 11장 "10/5~10/17 아나톨리아 외전"(앞 묶음 10/21 뒤), 12장 "11/4~11/24"(앞 묶음 11/18 뒤).
- 고치기: 그대로 둬도 동작에는 문제없다. 뜻 있는 검사로 하려면 "날짜가 뒤로 가는 묶음은 이 두 개뿐"을 단언한다.

### L3. 표 검사가 가로줄(`---`)도 표 구분줄로 본다

- 위치: `scripts/verify.mjs:142`, `/^\|?\s*:?-{3,}/`
- 지금은 문서에 가로줄이 없어 통과한다. 누가 문서에 `---`를 쓰면 "표 머리줄 없음"으로 실패한다.
- 고치기: `|`가 든 줄만 구분줄로 본다(`/^\|?\s*:?-{3,}:?\s*\|/`).

### L4. 죽은 코드가 조금 남았다

- 단계별 색 CSS는 지웠지만 `lib/progress.ts`(`progressStage`), `components/progress.tsx`의 `data-progress-stage`, `scripts/verify-redesign.mjs:11-15`가 남았다. 이제 `app/redesign.css:122`의 `height:8px`에만 쓰인다. 지울지는 사용자 결정이다.

### L5. 선물 대체 아이콘 색이 다른 배지 아이콘과 다르다

- 위치: `app/redesign.css:533`
- 다른 배지 아이콘은 `.game-badge>svg{color:var(--badge-ink)}`인데 대체 아이콘만 `var(--muted)`다. 크기 22px와 767px 이하 표 안 줄바꿈 규칙은 정상이다.
- `docs/design-spec.md`에 이 아이콘 값(22px·색)이 없다.
- 고치기: 의도한 색이면 사양에 적고, 아니면 `color` 선언을 지워 `--badge-ink`를 따르게 한다.

### L6. 사용자 보고 표현이 knowledge 문서에 서로 다르게 남았다

- `content/notes/knowledge/preferences.md:98` "이 방법은 사용자 보고이며 이 공략이 실측하지 않았다" — 할 일 글은 "연회 반복 영상의 방법대로면"으로 바꿨다.
- `content/notes/levin-materials-review.md:35` "사용자 게임 화면 보고와 한국어 도감을 대조" — `thry-fruit-name-review.md`는 "게임 화면 목록"으로 바꿨다.
- 선호 기록이라 그대로 둘 수도 있다. 맞추려면 같은 말로 바꾼다.

### L7. `inventory-mount-review.md`의 남은 전제

- `content/notes/inventory-mount-review.md:12` "옛 미등록 육성의 손실을 허용하고 … **이전 디트리히 2부 선스킵을 기본안에서 제외**… 기존 디트리히 2부가 이미 완료됐다면", `:27` "놓친 9/17 외전을 회수하려면"
- M1의 디트리히 2부 전제와 같은 종류다. 함께 조건문으로 바꾼다.

## 문제없음으로 확인한 것

- 원본 HTML 954조각의 태그 짝이 모두 맞는다(이전 커밋도 같음). 태그 균형 처리(`balanced`)로 바깥 요소가 깨진 곳이 없다.
- 고쳐 쓴 할 일 45곳: 뜻이 유지됐다. 가호·기능 그림 토큰이 빠진 곳(이월 가호 5곳, 레다 축복 1곳)은 글이 일반 문장으로 바뀐 결과다. 연회 반복 줄은 9개 단계 모두 같은 글이다.
- 「전투가 편해지는 공통 습관」 칸: 파비오 문장과 부대 문서 링크가 빠졌고 목록 구조는 정상이다. 남은 링크 "공격 속도 점검"은 `notes/combat-review.md`로 간다.
- `combat-review.md`, `questions.md`, `routes/dietrich/roster.md`: 줄인 뒤 글이 자연스럽고 표가 맞다. 이 세 문서로 가는 끊긴 링크는 없다. `roster.md`를 가리키는 곳은 화면에 안 쓰는 `playbook.json` `references`뿐이다(H1에 포함).
- 문서 표: 머리줄·칸 수가 모두 맞다(`aurora-price-review.md`, `carry-hard-review.md`, `exp-boon-decision-review.md`, `god-service-review.md:8`, `recruitment-gates-review.md:38` 포함).
- 문서 링크: 지운 제목("현재 진행 확정", "실제 잔액과 미래 계산 예시", "실제 보고" 등)을 가리키는 닻 링크가 남지 않았다. 검사에서 나온 끊긴 링크 13개는 모두 `notes/backups/`와 knowledge의 이전부터 있던 것이다.
- `documents.json`은 문서 원문과 해시가 모두 같다(다시 만들어져 있음).
- `lib/game-date.ts`: 1부 날짜는 해를 넘기지 않아 월·일 비교가 맞다. 네 루트에서 값이 뒤로 가지 않는다.
- `lib/document-links.ts`: `progress.md` 예외를 지워도 남은 링크에 영향이 없다. `verify-feature-parity.mjs`의 바뀐 단언도 맞다.
- `scripts/header-browser-check.mjs`: 높이 40/56px 단언은 CSS(`redesign.css:481`, `:514`)와 맞다. 실행은 하지 않았다.
- `components/people.tsx`: 그림 없는 선물에만 Gift 아이콘이 나오고 `aria-hidden`이 있다.
