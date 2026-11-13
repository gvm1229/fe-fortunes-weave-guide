# 개인화 React 앱

공략은 http://127.0.0.1:8766/guide, 팀 구성은 http://127.0.0.1:8766/team에서 연다. 프로젝트의 공략 열기.cmd가 로컬 서버를 시작한다. 화면 코드 정본은 personalized-app/src이고 공략 내용과 실제 완료 체크는 data/의 JSON이다.

기존 personalized.html과 personalized-team.html 주소도 같은 React 앱을 연다. 두 이름의 독립 화면 파일은 제거했다. bundle.html은 React를 브라우저에서 실행하기 위한 빌드 결과다.

## 내용을 고칠 때

공략 내용은 data/playbook.json과 연결 데이터를 고치고, 화면 동작은 src의 React 코드를 고친다. 프로젝트 루트에서 다음 순서로 실행한다.

    npm --prefix personalized-app run build
    python tools/check_react_content.py
    python tools/check_sequential_routes.py
    python tools/check_fonts.py
    python tools/check_reference_reading.py
    python tools/check_recruit_materials.py
    node tools/test_checklist_state.cjs
    python tools/test_guide_server.py

빌드는 공략 JSON에서 내용 조각을 만든 뒤 React와 함께 묶는다. Python 내용 생성은 120초, TypeScript 검사는 60초, React 생성은 120초, 파일 합치기는 60초가 제한이다. Windows에서는 제한을 넘긴 도구의 자식 프로세스도 종료한다. 설치된 패키지만 사용하며 매번 다시 설치하지 않는다.

src/content.json·content-packed.ts·legacy-content.css는 자동 생성된다. build.mjs는 새 묶음이 성공할 때만 bundle.html을 교체하고 중간 dist 폴더를 정리한다. index.html은 React 진입 파일이므로 유지하며 빌드 중에도 수정하지 않는다.

생성·타입 검사·묶기의 종료를 확인한다. Windows 재시작으로 실행 세션이 사라지면 빌드를 다시 실행한다. 작업 전 정본 해시를 비교하려면 check_react_content.py에 --baseline과 해시 JSON 경로를 전달한다.

## 체크 동작을 시험할 때

    python tools/serve_react_fixture.py

출력된 임시 주소를 사용한다. 서버는 data/playbook.json에서 현재·이력 체크 ID를 읽고 임시 저장소에만 시험 값을 쓴다. 실제 data/checklist.json은 게임 진행 정본이다.

기존 공략·도감과 참고 문서는 별도 자료로 제공한다. 공통 글꼴은 fonts.css와 assets/fonts/의 Pretendard를 사용한다.

위 목록이 현행 검사다. 옛 편성·독립 HTML의 특정 시점을 확인하던 나머지 검사 도구는 과거 작업 기록이며, 현재 React 화면의 통과 근거로 사용하지 않는다.
