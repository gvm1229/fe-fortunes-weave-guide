# 미확인 게임 사실 재조사 (2026-11-25)

출시 약 2달 뒤 공개 자료(포럼·위키·공략)로 저장소의 `미확인` 게임 사실을 다시 확인한다. 개인 진행 수치(실측 레벨·현재 기능 등)와 작업 규칙 문구 속 '미확인'은 대상이 아니다.

## 절차

1. 저장소의 `미확인` 표시를 모아 공개 자료로 답할 수 있는 질문만 남긴다(아래 표).
2. 질문을 묶어 조사한다. 출처마다 시험·영상이 있는 확인인지, 의견인지 구분한다.
3. 여러 출처가 일치하거나 시험이 있는 것만 "확인"으로 바꾼다. 출처가 갈리면 "미확인"을 유지하고 갈린 내용을 적는다(P09).
4. 해당 문서·자료의 문구를 고치고 `refresh-manifest`·`derive:checklist`·`verify`·`rules-check`를 통과시킨 뒤 커밋한다.

## 질문

| # | 질문 | 저장소 위치 |
|---|---|---|
| Q1 | 아우람 로즈: 세오도라·디트리히 루트에서 올림피아 의뢰2 수주 전에도 바이나 오아시스 상점에서 파는가 | `notes/recruitment/aurum-rose.md`, `data/recruit-materials.json`, `data/recruitment-gates.json` |
| Q2 | 아스완·타호니아(2부 3장 게스트 → 3부 5구간) 합류의 루트 조건 | `notes/recruit-all-review.md`, `data/recruit-all-plan.json` |
| Q3 | 클라프카(3부 5구간 게스트 → 6구간) 합류의 루트 조건 | `data/recruitment-gates.json`, `data/playbook.json` |
| Q4 | 티아라가 세오도라 12장에서 대화 가능 명단에 나타나는 시점, 카이 외전 뒤 10/24 안에 영입 가능한지 | `notes/recruit-all-review.md`, `data/playbook.json` |
| Q5 | 카이 루트 카이·무우 "대회 시합" 이벤트 시점(무우 영입 기한) | `notes/support-pairs-by-route.md`, `data/recruit-all-plan.json` |
| Q6 | 센트리온이 카이 1부 이야기에 등장하는지 | `notes/support-pairs-by-route.md` |
| Q7 | 1·2부 지원 대화에 두 인물을 같은 루트에서 영입해야 하는지, 외전 인물도 그 루트 대화에 쓰이는지 | `notes/recruit-all-review.md` |
| Q8 | 지원 A 개수 상한, 3부 버전 선택이 지원에 주는 영향 | `notes/recruit-all-review.md` |
| Q9 | 명성 단계별 필요 수치, 제스터–레다 C를 본 사례 | `docs/fable-plan-recruit-feast.md` |
| Q10 | 누조·제스터가 선더 소드를 지참하는 기준(장인지 레벨인지) | `docs/fable-plan-recruit-feast.md`, `notes/weapons/levin-sword.md` |
| Q11 | 노멀과 하드의 경험치 배율 차이 | `notes/sword-xp-review.md`, `notes/personalized-evidence.md` |
| Q12 | 2부 군행동 레벨 계산식 | `data/army-actions.json`, `notes/army-readiness-review.md` |
| Q13 | 장 다시 하기 뒤 남는 "중요 업적"의 범위, 본 지원 대화가 남는지 | `docs/fable-plan-recruit-feast.md` |
| Q14 | 2부에 여관이 있는지 | `docs/fable-plan-recruit-feast.md` |
| Q15 | 전차병: 경험치 2배 근거, 마스터 스킬 장착 칸 수, 3부 마구간·먹이, 레벨·스탯 상한 | `docs/cai-charioteer-research.md` |
| Q16 | 3부에서 인과의 파편을 더 얻을 수 있는지 | 메모리·`notes/inventory-mount-review.md` |
| Q17 | 상급 시험 합격만으로 완료 자료가 상급으로 자동 배정되는지(알렉산드라) | `notes/inventory-mount-review.md` |
| Q18 | 이스마르 지원 대화가 열리는 장 | `data/playbook.json` |
| Q19 | 1부 5~6장에 시험 메뉴가 있는지 | `notes/level-renown-review.md`, `data/chapter-progression.json` |
| Q20 | 피아나 기억 회복·게이츠 정체 공개 이벤트의 날짜 | `docs/fable-plan-recruit-feast.md` |
| Q21 | 신들의 봉사 레벨별 필요 기여도 | `notes/restart-review.md` |
| Q22 | 교섭 감액이 영입 금액에 적용되는 방식, 양계 질문 셋째 답 | `notes/recruit-all-review.md` |
| Q23 | 라이브 추가 회복 발동률, Custom Axle 한국어 이름 | `data/team-white-spells.json`, `notes/cai-carriage-guide.md` |

## 결과

판정 기준: 서로 다른 출처 2곳 이상이 같거나, 시험 기록이 있으면 "확인". 1곳뿐이거나 출처가 갈리면 "미확인 유지". 게임 화면에서 재현한 것은 없다. 조사는 Windows 브라우저·웹 검색으로만 했다. GameFAQs·Serenes Forest는 내장 브라우저로 읽었고, altema·VGC는 막혀 읽지 못했다.

| # | 판정 | 결과 | 출처 |
|---|---|---|---|
| Q1 | 미확인 유지 | GameWith는 의뢰2 수주 뒤 구매 단계만 적는다. 수주 전 판매 여부는 어디에도 없다 | gamewith.jp/fefw/577866 |
| Q2 | 일부 확인 | 2부 3장 게스트가 살아남으면 3부 5구간에 합류한다는 점은 두 곳이 같다. 루트 조건은 두 곳 모두 적지 않았다(조건이 없다는 증거는 아님) | RPG Site 영입·2부 공략, gamewith.jp/fefw/577934 |
| Q3 | 일부 확인 | 살아남으면 다음 구간(6구간)에 합류. 세오도라 루트 완료가 필요하다는 주장은 신뢰도 낮은 1곳뿐. RPG Site 안에서도 전투 구간이 4·5구간으로 갈린다 | RPG Site 3부, gamewith.jp/fefw/577935, gamingdeputy |
| Q4 | 조건 확인·기간 미확인 | 세오도라 루트 티아라: 지원3·명성10·카이 외전 클리어·3000G(두 곳 일치). 외전은 10/16~10/22, 12장은 10/24 종료라 그 사이 영입은 날짜상 가능해 보이나 직접 적은 출처는 없다 | gamewith.jp/fefw/577321, appmedia, RPG Site 세오도라 |
| Q5 | 미확인 유지 | 카이 대회 일정은 4·5·7·8(레다전, 약 9/1)·10·12장. 무우가 레다 동료라 8장 본선이 후보라는 것은 추론이다 | RPG Site 카이 공략 |
| Q6 | 확인 | 센트리온은 카이 1부 이야기에 나온다(2장 대화 장면, 4장 훈련, 6장 선더 소드). 동료 합류는 3부 2구간뿐 | RPG Site 카이, gamewith.jp/fefw/578276 |
| Q7 | 일부 확인(같은 루트 필요는 추론) | 대화에는 보통 두 인물이 모두 합류해 있어야 한다(일부 예외: 파비오–하르빈 C 등). 동료는 이야기(루트)마다 따로 저장되므로 같은 루트 영입이 필요하다. 외전 인물이 1부 대화에 쓰이는지는 미확인 | Anna's Notebook 대화 조건·루트 이월, GameWith 지원 목록 |
| Q8 | 일부 확인 | 지원 값은 저장 전체 공유이고 장·부를 다시 해도 줄지 않는다(여러 곳). A 개수 상한은 찾지 못함. 일부 A끼리 서로 막는다는 이용자 의견만 있다 | Anna's Notebook, Serenes 3쪽, GameWith 게시판 |
| Q9 | 공략 1곳 | 명성 2까지 800점, 이후 단계마다 1000점, 최대 12(Anna's Notebook, allthings.how도 최대 12). 레다–제스터 C는 1부 4~10장·두 인물 합류가 조건. 실제로 본 사례는 못 찾음 | Anna's Notebook 명성·대화 조건 |
| Q10 | 공략 1곳 | 선더 소드 지참은 합류 시기에 따라 달라진다(레벨 언급 없음). 누조·제스터 이름은 없다 | gamewith.jp/fefw/578276 |
| Q11 | 미확인 유지 | 노멀·하드 경험치 배율 자료 없음. 하드는 적 증가·가호 비용 상승만 확인 | gamewith.jp/fefw/573680 |
| Q12 | 일부 확인 | 2부 훈련은 장마다 정해진 레벨까지 올린다(1장 37~38, 2장 약 40, 3장 41, 4장 42). 계산식은 미확인 | RPG Site 2부, gamewith.jp/fefw/577891 |
| Q13 | 확인 | 장 다시 하기에도 지원 수치·단계, 갤러리에 들어간 대화·이벤트, 위업록, 구세의 축복, 인과의 파편, 완료 기록·성궤가 남는다. 이미 본 지원 대화는 갤러리에 남는다 | Anna's Notebook 장 다시 하기, RPG Site 이월, GameWith 위업록 |
| Q14 | 공략 1곳 | 2부 준비 시설에 지원용 여관이 있다. 식사 여부는 없음 | RPG Site 2부 |
| Q15 | 미확인 유지 | 전차병 기본 정보(권장 Lv20·명성4·이동+1 등)만 확인. 2배·장착 칸·상한·3부 마구간 운용은 못 찾음. 3부 마구간은 카이 루트 완료로 열린다 | gamewith.jp/fefw/577357, RPG Site 3부 |
| Q16 | 미확인 유지 | 3부의 인과의 파편 입수처는 못 찾음. GameWith는 전체 클리어 뒤 입수 수단이 제한될 수 있다고 경고 | gamewith.jp/fefw/579590 |
| Q17 | 시험 1건 | 상위 단계 병종을 열어 두기만 해도 완료 기록이 가장 높은 단계 병종으로 자동 배정되고, 기록 병종은 같거나 높은 단계로만 바뀐다(Korath88 시험). 다른 시험자는 없음 | Serenes Forest 3쪽 |
| Q18 | 미확인 유지 | 이스마르는 A 대화만 있는 인물로 보이며 짝 엔딩 구역에 있다. 열리는 장은 못 찾음 | GameWith 지원 목록 |
| Q19 | 확인 | 시험 시설은 세오도라 4장, 나머지 세 루트 5장에 열린다 | Anna's Notebook 명성, allthings.how·mobalytics |
| Q20 | 미확인 유지 | 게이츠는 디트리히 11장 뒤 12장 영입만 확인. 두 이벤트 날짜는 못 찾음 | Siliconera |
| Q21 | 미확인 유지 | 봉사 단계별 필요 기여도 표는 없다. 각 신 3단계, 주 1회, 수호일 보너스만 확인 | thegameswiki(AI 작성 표시), GameWith |
| Q22 | 공략 1곳(다른 자료가 뒷받침) | 양계 질문: 치즈 → 보름달이 뜬 밤 → 셋째는 아무 답이나 통과. "아무 답이나"를 직접 적은 곳은 GameWith 1곳이지만, 서로 다른 셋째 답(로컬 과일·영어 자료 감자)이 각각 통과로 보고돼 뒷받침된다. 사이트 문구에 (GameWith)를 밝혔다. 교섭 감액 방식은 미확인 | gamewith.jp/fefw/574062, RPG Site, KeenGamer |
| Q23 | 미확인 유지 | 라이브 발동률·Custom Axle 한국어 이름 모두 자료 없음 | GameWith 백마법 |

## 사이트에 반영한 것

- 양계 셋째 답: 카이 6장 영입 준비 문구와 영입 자료·검토 문서의 "화면 확인(과일/감자 상충)"을 "아무 답이나 통과"로 고쳤다. 미확인 목록에서 뺐다.
- 센트리온: 울턴드–센트리온 쌍 설명의 "카이 1부 이야기 등장 여부 미확인"을 확인된 내용으로 고쳤다. 대화 중 일부는 한 명만 합류해도 열리므로 "울턴드만 영입한 카이 1부에서 C가 열리는지는 미확인"을 덧붙였다.
- 2부 일반 물품 루트별 고정(같은 날 앞선 커밋)도 이번 배포에 함께 들어간다. 2부 체크 문구 "첫 일반 물품 반입이 고정"을 "디트리히 루트의 일반 물품 반입이 고정"으로 맞췄다.

확인 판정인 Q6·Q13·Q19 가운데 Q6만 사이트 문구를 바꿨다. Q13은 바꿀 사이트 문구가 없고(검토 문서에만 있음), Q19는 아래 범위 문제로 유지했다. Q7은 같은 루트 필요가 추론이라 `recruit-all-review.md`의 "추정"을 유지했다. 나머지는 출처가 1곳이거나 갈려서 P09에 따라 문구를 그대로 두었다. Q19의 "5~6장 시험 메뉴 미확인" 문구는 "상급 권장 Lv35" 표(2부로 보임)에 있어 1부 시험 시설 결과와 같은 질문인지 확실하지 않아 고치지 않았다.
