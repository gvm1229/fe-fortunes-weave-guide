# 에이전트 작업 규칙

이 저장소에서 일하는 모든 에이전트는 먼저 [HANDOFF.md](HANDOFF.md)를 읽는다. 사용자 선호, 현재 게임 진행, 사이트 상태, 작업·커밋 규칙, 환경 함정이 모두 거기 있다.

- 디자인 정본: [docs/design-spec.md](docs/design-spec.md). 사양에 없는 시각 결정은 새로 만들지 않고 질문으로 남긴다.
- 계획: [PLAN.md](PLAN.md).
- 사용자 선호 원문: `content/notes/knowledge/` (이 저장소가 정본. 이전 프로젝트 `C:\Users\hojin\Documents\fe-fortunes-weave-guide-main`은 2026-11-14부터 읽기 전용 참고).
- 답변은 짧고 쉬운 한국어. 커밋 작성자는 사용자 본인, 공동 작성자 줄 금지, 한국어 Conventional Commit 제목.
- `hive` 명령·전역 지식 기록 금지. `archive/` 수정 금지.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
