# 일본어 위키 재조사 · 개인화 공략 전수 사실 검사 · 3부 공략 보강 계획 (2026-11-25)

사용자 요청 3가지를 순서대로 한다. Fable은 배포 관문 검토에만 부른다(사용자 지시, 토큰 절약).

## 1. 일본어 위키로 남은 미확인 재조사

- 대상: `docs/unverified-research-2026-11-25.md`에서 "미확인 유지·일부 확인·공략 1곳"인 질문.
- 출처: 일본어판 이름 『ファイアーエムブレム 万紫千紅』. 1부=? / 2부=戦争編 / 3부=救世編. GameWith(gamewith.jp/fefw), Game8(game8.jp), AppMedia(appmedia.jp), altema(altema.jp/febansisenkou), 그 밖의 일본어 위키·블로그.
- 판정 기준은 이전과 같다: 서로 다른 출처 2곳 이상 일치 또는 시험 기록 → 확인. 1곳 → 공략 1곳. 갈림 → 미확인 유지(P09).
- 결과는 `docs/unverified-research-2026-11-25.md`에 "일본어 위키 재조사" 절로 덧붙인다.

## 2. 개인화 공략 전수 사실 검사

- 대상: 사이트에 보이는 9개 단계(네 1부·네 2부·3부)의 할 일·표·메모 글, 인물 카드 자료, 팀 화면 자료.
- 방법: 단계별 글을 뽑아(`.tmp/audit/*.md`) 게임 사실 주장(가격·조건·장·날짜·입수처·병종 조건·영입 조건)만 골라 1·2단계에서 모은 출처와 대조한다. 개인 계획·선호는 대상이 아니다.
- 결과: `docs/fact-audit-2026-11-25.md`에 항목별(맞음/틀림/미확인·출처). 틀린 것 중 출처 2곳 이상이 확인한 것만 고친다(P09).

## 3. 3부 공략 보강

- 문(門)마다 부대 나누기: 구간별 문 수·출격 상한·적 구성·정화 지점, 최종 25명으로 나눈 부대 안.
- 자유행동 시간에 할 일: 구간별 자유행동 기간, 채집·재건·의뢰·던전·연회·시험·마스터 스킬.
- 가장 좋은 융합 시기: 지원 반복·구간 재시작·기준판 선택과의 순서, 파편 비용.
- 근거가 있는 것만 넣고, 추정은 "추정"으로 표시한다. 개인 진행 수치는 넣지 않는다.
- 3부 할 일(`content/data/playbook.json` part3-plan, `content/source/react-content.json`)과 문서를 고친다.

## 4. 마무리

`refresh-manifest` → `derive:checklist` → `verify` → `rules-check` → 할 일마다 커밋 → `node scripts/release.mjs check` → Fable 검토(`docs/fable-review-18.md`) → `node scripts/release.mjs deploy`.
