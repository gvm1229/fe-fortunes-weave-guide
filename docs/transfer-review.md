# 내용 이전 검토

원본 data JSON 49개와 참고 Markdown 318개는 바이트 그대로 보관한다. 실제 체크는 최초 실행 때만 seed로 쓴다. 수정 표시와 원본을 분리하여 이전 검사에서 내용 손실을 발견할 수 있게 했다.

## 확인하고 고친 표시

| 위치 | 수정 | 이유·근거 |
|---|---|---|
| 전체 루트 이름 | 세오도라 1부처럼 부 앞 공백 | 사용자 표시 규칙 |
| 준비의 중첩 god-token | 같은 행의 같은 신 그림 중복 제거 | 기존 생성 화면에 같은 이미지가 중첩됨. 게임 사실 변경 없음 |
| 인물 카드 | 대표 초상화 한 번, 펼친 설명에서 초상화 제외 | 기존 설명의 반복 얼굴 제거 |
| 준비·구매·문서 | 서버에서 루트·부별 선택 후 전달 | 다른 루트 자료 노출 방지. 전체 원문은 팀 화면의 전체 참고에서 제공 |
| 다음 할 일 | 문서 흐름 안에 배치 | 고정 막대와 장 제목 겹침 방지 |
| 체크 | 개별 false > 묶음 상속, inheritLegacy:false 존중 | 원본 checks.ts/check-state.ts의 실제 동작 보존 |
| 문장 자산 | 중립 Shield | assets에서 emblem/crest 자산을 찾지 못함. 가짜 공식 그림 생성 없음 |

## 오래된 루트 전환 문구

`content/display-overrides.json`에서 기존 ID를 유지하며 표시만 고친다. 근거는 원본 `data/sequential-training-plan.json`과 최신 AGENTS.md의 각 루트 1→2부 연속 진행 규칙이다. 게임 진행·seed·완료 값은 바꾸지 않는다.

| 행동 ID | 수정 내용 |
|---|---|
| prep-no-old-skip--082f661242 | 다른 루트 과거 진행 대신 이번 직접 진행과 스킵 여부 구분 |
| prep-no-old-skip--6fa26cfe8f | 다른 루트의 미래 준비 대신 현재 루트 직접 진행 확인 |
| reward-theodora-part1--start-leda-part1 | 다른 1부로 이동하던 지시를 같은 루트 2부로 수정 |
| sequential-theodora-war-reward-20261108--2 | 다른 루트 2부 진입 전 안내를 현재 완료 뒤 자원 확인으로 수정 |
| sequential-theodora-register-20261108--start-leda-war | 다른 루트 2부 직행 대신 자료 등록 뒤 첫 화면 선택 |
| leda-post-clear-boons-20261110--start-dietrich-part1 | 같은 루트 2부로 수정 |
| war-creek-nathan--194939803d | 레다 화면의 키릭 영입 조건에서 다른 루트 병기 제거 |
| sequential-leda-war-reward-20261108--2 | 현재 완료 뒤 자원 확인 |
| sequential-leda-war-reward-20261108--start-dietrich-war | 자료 확인 뒤 첫 화면 선택 |
| di-27--start-kai-part1 | 같은 루트 2부로 수정 |
| sequential-dietrich-war-reward-20261108--2 | 현재 완료 뒤 자원 확인 |
| sequential-dietrich-war-reward-20261108--start-kai-war | 자료 확인 뒤 첫 화면 선택 |
| reward-kai-part1--start-theodora-war | 모든 1부 선행 후 세오도라 2부 지시를 카이 2부로 수정 |

레다의 카이·디트리히 외전은 레다 루트 안의 실제 인물 일정이므로 다른 루트 자료로 오인해 삭제하지 않는다. 날짜·물품·보상 등 새 게임 사실을 추가하지 않았다. 자료가 없는 값은 미확인으로 표시한다.

## 이전 방식과 증명 한계

주요 행동·인물 목표·영입·구매·팀은 JSON 정본에서 읽는다. 복잡한 기존 보충 설명은 생성 화면을 의미 있는 요소의 나무 구조로 해독한 `display-parity.json`으로 보존하며 HTML을 직접 삽입하지 않는다. Markdown은 정본 파일을 그대로 읽는다.

검사는 원본 파일 해시, 9단계의 표시 블록 수, 행동·체크 ID·영입·부별 인물 수·문서·미디어 존재를 증명한다. 원본의 모든 게임 사실이 게임 안에서 맞는지는 이번 이전 작업에서 새로 실측하지 않았다.
