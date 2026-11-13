# 가호·지원·명성·인라인 정렬 점검

2026-11-04 · 게임 정보와 체크 기록을 바꾸지 않는 표시 개선이다.

## 공통 표시

| 항목 | 적용 |
|---|---|
| 가호 레벨 | 신의 실제 초상화를 이름 왼쪽에 표시. 현재 아우로라3·주라2는 그대로 유지 |
| 지원 | 인물 상자와 같은 분홍 배경·테두리·하트. 지원 집중·레벨·조건·대화·버튼·참고 제목에도 사용 |
| 명성 | 인물 상자와 같은 회색 배경·테두리·반짝 아이콘. 수치·조건·관련 설명에도 사용 |
| 사진이 있는 짧은 제목 | 초상화·이름·뒤 문구를 같은 줄의 직접 자식으로 두고 세로 중심을 맞춤 |
| 일반 문장·막타·주간 인물 | 인라인 사진·기능 아이콘·수치 태그의 높이와 기준선을 공통 규칙으로 정리 |

지원 배경은 #f5ece9, 테두리는 #e0cac2다. 명성 배경은 #e9edef, 테두리는 #d0d6d8이다. 모두 인물 조건 표와 동일한 값이다. 공통 정본은 `semantic.css`다.

## 초상화 출처

아우로라·주라·마스·스미르노스·칼라·크레르·포트나7명의 실제 그림을 공개 웹에서 확인했다. Fire Emblem Wiki가 제공하는180px 미리보기를 편집하지 않고 프로젝트에 저장했다. 크레르는 해당 문서의 첫 기본 초상화를 사용했다.

- [아우로라](https://fireemblemwiki.org/wiki/File:FEFW_Aurora_portrait.png)
- [주라](https://fireemblemwiki.org/wiki/File:FEFW_Jurah_portrait.png)
- [마스](https://fireemblemwiki.org/wiki/File:FEFW_Mars_portrait.png)
- [스미르노스](https://fireemblemwiki.org/wiki/File:FEFW_Smyrnos_portrait.png)
- [칼라](https://fireemblemwiki.org/wiki/File:FEFW_Kalla_portrait.png)
- [크레르](https://fireemblemwiki.org/wiki/File:Portrait_credna_fe18.png)
- [포트나](https://fireemblemwiki.org/wiki/File:FEFW_Fortuna_portrait.png)

Creative Uncut의 아우로라·주라 초상화와도 이름·모습을 대조했다. 그림은 Nintendo / INTELLIGENT SYSTEMS 작품이며, 파일별 출처는 `assets/gods/manifest.json`과 `assets/gods/SOURCES.md`에 있다.

## 정렬 수정과 검사 범위

시인의 비문 사본 모달에서 사진과 이름만 inline-flex였고, 뒤의 영입용 문구는 일반 인라인 상자였다. 수정 전 부모 제목의 중심과 사진 중심은 약2px 차이였다. 부모 제목도 같은 flex 줄로 만들고 뒤 문구를 별도 자식으로 감싸 맞췄다. Windows Chrome에서 사진·이름·뒤 문구의 중심 차이는 PC0px, 휴대폰에서도 반올림0px였다.

개인화와 모든 생성된 참고 문서에서 같은 구조를 찾아 공통 정렬을 적용한다. 코드 예시·스크립트 등 실제 안내 문장이 아닌 부분은 표시 변환에서 제외한다. 생성 과정의 HTML 조각이 문자로 잘못 노출되는 문제도 원문 보존 검사에서 발견해 수정했다.

문서 전체는 구조·문구 보존 검사로 확인하고, 실제 화면은 본문·인물 조건·소재 모달·지원 모달을 PC·중간 폭·휴대폰에서 확인한다. 모든 문서를 각 화면 크기에서 하나씩 눈으로 읽었다는 뜻은 아니다. 새 게임 정보·진행·구매를 실행한 결과도 아니다.
