# yuphastemple 통합 계획 (2026-11-27)

근거: [yuphas-design-teardown.md](yuphas-design-teardown.md), [yuphas-integration-research.md](yuphas-integration-research.md), [yuphas-pages-teardown.md](yuphas-pages-teardown.md), 견본 [yuphas-sample-plan.md](yuphas-sample-plan.md). 작업 폴더: 워크트리 `claude/yuphas-design-sample`. 커밋은 사용자 승인 뒤.

## 사용자 결정 (2026-11-26~27)

- yuphastemple 디자인이 우리 디자인 규칙보다 우선. 그 사이트 그림·글꼴·CSS 기법 자유 사용.
- 어두운 화면만. 밝은 화면 폐지.
- 물품·재료·선물·음식·지원·지도·무기·마법은 yuphastemple로 새 탭 링크(자료를 다시 만들지 않음).
- 이름 표시 규칙: 누를 수 없는 이름 배지 = 한국어. yuphastemple 새 탭으로 가는 실제 단추 = 영어 이름(그 사이트에서 찾을 수 있게).
- 화면에 근거·기록용 글 금지 → docs/reference/로. archive/는 그대로.
- 글보다 그림(사용자 선호).

## 할 일

### 1. 자료 (먼저)
1. content/data/yuphas-names.json: 한국어 이름 → en·slug·kind·한국어 등급(game/wiki/wiki-temp/미확인). 씨앗: assets/items/manifest.json, affordable-gifts.json, support-pairs-source.json, checklist-display-names.json(뜻 없는 줄 거름) + 한국어 도감(turam.dev, 같은 영어 슬러그). 무기·마법 영어 이름 25개 채움.
2. 인물마다 yuphastemple 선호 선물·음식 전체 목록, 지원 상대·조건, 병종, 장점·약점(boon/bane), 소속 문장.
3. yuphastemple 인물 쪽·탭·팝업 그림을 모아 우리 그림 교체: 초상화·얼굴·물품 아이콘·무기 종류 아이콘·소속 문장 등. 출처는 assets/design/SOURCES.md.
4. "임시 표기" 이름과 못 맞춘 이름은 docs/reference/name-review.md에 따로 목록(사용자 검토용).
5. 새 검사 scripts/yuphas-links-check.mjs(슬러그 형식·이름표 연결).

### 2. 화면
1. 인물 옆 칸: yuphastemple /loretta/ 머리 모양 — 큰 이름, 병종(그림+이름), 장점·약점 아이콘 격자(지금 "특기" 글 대신), 뒤 소속 문장, 큰 초상화.
2. 선호 선물·음식: 인물별 전체 목록. 줄마다 한국어 이름 배지(누를 수 없음) + 영어 이름 단추(새 탭 ?item=).
3. 지원 표: yuphastemple /<인물>/supports/ 모양으로 다시 그림. 루트 배정 유지, 근거·출처는 docs로.
4. 우리에게 남는 쪽(병종·기능 문서 등): yuphastemple 병종 팝업 모양.
5. 본문 물품·무기·마법 배지, 오른쪽 칸 "이 장의 재료", 재료 카드 → 같은 이름 규칙의 링크. 재료 서랍·지도 사진 없앰, 지도 링크 188개 → yuphastemple 지도.
6. 같은 물품 반복 시 영어 단추는 묶음에서 처음 한 번. 확인 꼬리말 → "미확인" 한 낱말.
7. 근거 글 빼기(조사 보고서 §4.1 1~17). 자료는 그대로 두고 그릴 때 거름. "참고 문서" 탭 삭제, 파일은 content/notes/ 그대로, docs/reference/README.md 목차.
8. 밝은 화면 제거: 테마 단추 4곳, 밝은 토큰, 관련 규칙·검사.

### 3. 규칙·검사
- docs/user-rules.md: 뒤집힌 규칙 대체 기록(P08).
- 검사 스크립트를 새 규칙에 맞춤(새 규칙을 검사).

## 확인
- 개발 서버 3200에서 전후 사진 → docs/screens/yuphas-compare.html.
- npm run typecheck, npm run lint, 가로 넘침 검사, node scripts/release.mjs check.
- 사용자 검토 → Fable 5.2 검토(남은 지적 0) → 커밋 → 배포.

## 하지 않는 것
- archive/ 수정, 게임 자료 내용 변경(이름 표시·링크만), 스포일러 가림.
