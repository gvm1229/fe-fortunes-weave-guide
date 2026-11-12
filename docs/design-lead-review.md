# §8 검수

항목 1–6을 반영했다. Codex/Windows의 localhost:3000과 설치된 Chrome/Playwright에서 검사했다. TEMP/TMP·npm 임시 저장은 저장소 `.tmp`다.

## 변경 파일

- `app/globals.css`
- `components/tasks.tsx`
- `components/source-markup.tsx`
- `components/shell.tsx`
- `components/people.tsx`
- `components/records.tsx`
- `components/secondary.tsx`
- `lib/content.ts`
- `scripts/design-lead-browser-check.mjs`
- `docs/design-lead-fixes-plan.md`
- `docs/design-lead-browser-results.json`
- `docs/design-lead-review.md`

## 측정

세오도라 1부 할 일·인물을 1440×900·375×812, 밝게·어둡게 검사했다. 8개 장면·20개 동작 통과, PNG 20개를 직접 확인했다. 화면은 `docs/screens/design-lead/`에 있다(기존 Git 제외 경로).

모든 조합에서 최소 글자 18px, 가로 넘침 0px, 병종 칩 30px, 완료 구역 48px, 그림 비율 최대 오차 0.0598%다. 얼굴 토큰을 제외한 허용 오차 1% 위반은 0건이다. 칩은 글자 18px·좌우 8px·원본 아이콘 20px이며 문서 열기도 작동한다.

현재 6장으로 애니메이션 없이 자동 이동한다. 이동 대상은 화면 안에 들어오고 키보드 초점을 받는다. 2px accent 테두리를 2초 유지한 뒤 사라진다.

첫 화면 버튼은 메뉴 안쪽 전체 216px이며 글자가 잘리지 않는다. 테마는 위의 별도 줄이다.

외톨이 저장 줄·0 지원/명성 칩·원시 가입 단계·반만 보이는 설명 줄·중복 아이콘은 각각 0건이다. 시작 동료 3명·자동 합류 4장 2명, 단계는 초급 전·초급·중급이다. 불명확해서 숨긴 단계는 없다. 증서 안내는 골드 표 안 1회, 할 일·준비에는 없다.

## 검사와 한계

lint·typecheck·verify 통과. verify는 원본 367파일·35,734문장·62개 루트/부/장을 확인한다. 실제 할 일 DOM의 원본 그림 1,160개와 위치 버튼 73개도 일치했다. 브라우저 실행 오류는 0건이다.

개발 서버 갱신으로 중단된 중간 검사는 정적 검사 후 단독 재실행하여 통과했다. 이번 화면 검사는 Windows Chrome의 지정된 범위만 증명한다. 다른 루트 화면·브라우저·운영체제·배포 빌드는 미검증이다. Git·커밋·build·hive·전역 저장소 쓰기·`.next` 삭제는 사용자 지시대로 실행하지 않았다.

## 질문

강조가 사라지는 시간은 미지정이다. 새 값을 만들지 않고 기존 버튼의 0.15초를 재사용했다. 별도 지속 시간 지정이 필요한가?
