---
name: 만자천홍 개인화 공략
colors:
  background: "#F4F3F0"
  surface: "#FFFFFF"
  text: "#26251F"
  muted: "#62605A"
  primary: "#4A4658"
  accent: "#4A4658"
  dark-background: "#191918"
  dark-surface: "#232322"
  dark-text: "#ECEAE4"
  progress-started: "#9A6B43"
  progress-advancing: "#5B7A99"
  progress-complete: "#4E8469"
  bond: "#C13F78"
  bond-fill: "#F6C8DC"
  renown: "#2279B6"
  renown-fill: "#C5E8FF"
  gold: "#946619"
  gold-fill: "#F8D77E"
  fish: "#287B8A"
  fish-fill: "#C8E9E8"
  ore: "#625A8C"
  ore-fill: "#E0D6F4"
  meat: "#AA5C46"
  meat-fill: "#F2D4C6"
  gift: "#91603D"
  table-line: "#D5D2CA"
  dark-table-line: "#4A4A46"
typography:
  body:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "20px"
    lineHeight: 1.75
  supporting:
    fontFamily: "Pretendard, sans-serif"
    fontSize: "18px"
  group:
    fontSize: "22px"
  section:
    fontSize: "24px"
  mobile-chapter:
    fontSize: "26px"
  chapter:
    fontSize: "28px"
  mobile-title:
    fontSize: "30px"
  display-max:
    fontSize: "2.5rem"
  display-min:
    fontSize: "1.8rem"
rounded:
  compact: "10px"
  navigation: "12px"
  panel: "16px"
  mobile-hero: "20px"
  control: "8px"
  list: "16px"
spacing:
  row: "24px 28px"
  mobile-row: "20px"
  columns: "40px"
---

# 화면 기준

정본은 [디자인 사양](docs/design-spec.md)의 ‘현재 승인된 디자인 방향’이다. 이 문서는 해당 선택의 요약이며 별도 사양을 만들지 않는다.

2026-11-13 사용자 선택: **B(Checklist Design)의 미감과 반응형 구성을 기반**으로 한다. A(PackItEasy)에서는 접히는 체크리스트 묶음과 맨 위 중앙 체크리스트·배경 이미지(루트 주제색·군주 오벨리스크 일러스트 활용 가능)를 가져온다. C에서는 진행률별 진행 막대 색 변화만 가져온다.

현재 첫 화면의 네 군주 일러스트·공식 문장·주제색을 나란히 놓은 오벨리스크 구성은 보존한다. 3부는 더 크게 보이게 하고 영역 전체가 진입 링크가 된다. 첫 화면 외 기존 화면의 시각 구성은 보존 기준으로 삼지 않는다.

최소 글자 18px, 원문·그림·기능·실제 체크 보존, 루트·부 분리, 두 테마 지원은 유지한다. 2026-11-14 구현값은 위 색·글자·간격과 정본의 ‘구현 상세값’을 따른다. 실제 스타일은 `app/redesign.css`다. 검토 결과는 `docs/redesign-review.md`에 기록한다.
