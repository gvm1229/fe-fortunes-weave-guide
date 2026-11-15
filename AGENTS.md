# 에이전트 작업 규칙

이 저장소에서 일하는 모든 에이전트는 먼저 [HANDOFF.md](HANDOFF.md)를 읽는다. 사용자 선호, 현재 게임 진행, 사이트 상태, 작업·커밋 규칙, 환경 함정이 모두 거기 있다.

- 디자인 정본: [docs/design-spec.md](docs/design-spec.md). 사양에 없는 시각 결정은 새로 만들지 않고 질문으로 남긴다.
- 계획: [PLAN.md](PLAN.md).
- 사용자 선호 원문: `content/notes/knowledge/` (이 저장소가 정본. 이전 프로젝트 `C:\Users\hojin\Documents\fe-fortunes-weave-guide-main`은 2026-11-14부터 읽기 전용 참고).
- 답변은 짧고 쉬운 한국어. 커밋 작성자는 사용자 본인, 공동 작성자 줄 금지, 한국어 Conventional Commit 제목.
- `hive` 명령·전역 지식 기록 금지. `archive/` 수정 금지.

## 사용자 규칙(강제)

[docs/user-rules.md](docs/user-rules.md)의 규칙을 모두 지킨다. 화면·자료 규칙은 검사가 막고, 아래 P04~P11은 사람이 지키는 절차다(자동 검사 아님). 배포는 `node scripts/release.mjs check` → Fable 5.2 검토 → 커밋 → `node scripts/release.mjs deploy`로만 한다.

- [P04] 불분명한 결정은 추천이 보이는 질문(선택지 + 추천 표시)으로 묻는다.
- [P05] 사용자에게 보여 줄 미리보기는 실시간 개발 서버(`npm run dev`, localhost:3000)로 한다. 정적 빌드는 검사용이다. localhost:3000의 체크 칸은 누르지 않는다(사용자 실제 기록).
- [P06] 작업 전에 필요한 기술(skill)을 설치·사용한다. 화면 작업은 modern-web-guidance·impeccable, 부품은 shadcn을 우선한다.
- [P07] 문서와 기존 코드가 다르면 코드 규칙을 따르고, 다른 점을 최종 답변에 모두 적는다.
- [P08] 사용자의 나중 말이 앞 말보다 우선한다. 규칙이 바뀌면 docs/user-rules.md의 줄을 고치고 대체를 적는다.
- [P09] 자료가 서로 다르면 원본 공략으로 확인되는 것만 고치고, 확인 안 되면 "미확인"으로 둔다.
- [P10] 이전 프로젝트(fe-fortunes-weave-guide-main)는 읽기 전용이다. `archive/` 수정 금지, `hive` 명령·전역 지식 기록 금지.
- [P11] 커밋은 할 일 하나마다, 작성자는 사용자 본인, 공동 작성자(Co-Authored-By) 줄 금지, 한국어 Conventional Commit 제목. 검토 통과 뒤 배포.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
