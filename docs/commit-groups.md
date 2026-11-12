# 제안 커밋 묶음

실제 커밋은 0개다. Git 명령·Git 쓰기를 실행하지 않았다. 아래는 각 파일을 한 번씩만 배정한 목록이다. 앞의 네 메시지는 기존 계획을 유지했다. 같은 파일에 걸친 색·배치·상태 수정은 해당 파일의 묶음에 함께 둔다. 전체 묶음이 현재 검증된 완성 상태를 이룬다.

## 1. style: 루트별 명세 색상과 공통 표시 기준 적용

- `app/globals.css`
- `app/route-colors.css`
- `components/theme.tsx`
- `components/ui/button.tsx`
- `scripts/design-tokens.mjs`

## 2. feat: 문장과 군주 초상을 갖춘 대시보드 구현

- `components/home.tsx`
- `assets/design/SOURCES.md`
- `assets/design/emblem-cai.webp`
- `assets/design/emblem-theodora.webp`
- `assets/design/emblem-dietrich.webp`
- `assets/design/emblem-leda.webp`

원본 `assets/design/route-emblems-source.webp`와 군주 초상은 이미 색인에 있는 변경 없는 자산이다.

## 3. fix: 할 일 그림과 위치 버튼 복원 및 원본 대조 추가

- `components/source-markup.tsx`
- `lib/checklist.ts`
- `scripts/checklist-source.mjs`
- `scripts/derive-checklist.mjs`
- `scripts/verify-image-parity.mjs`
- `scripts/verify.mjs`
- `package.json`
- `content/derived/checklist.json`
- `docs/image-parity.json`

## 4. feat: 명세에 맞춘 루트 화면과 보조 칸 구현

- `app/[route]/[part]/page.tsx`
- `components/guide.tsx`
- `components/shell.tsx`
- `components/tasks.tsx`
- `components/context-rail.tsx`
- `lib/content.ts`

## 5. feat: 인물과 준비 재료 문서 팀 화면 명세 반영

- `components/records.tsx`
- `components/secondary.tsx`
- `components/detail-sheets.tsx`
- `components/documents.tsx`
- `components/team.tsx`
- `lib/secondary.ts`
- `lib/team.ts`

## 6. docs: 최신 원본 문서 동기화와 이전 기록 갱신

- `content/notes/knowledge/guide-workflow.md`
- `content/notes/knowledge/interface.md`
- `content/notes/knowledge/sources.md`
- `content/notes/plan.md`
- `content/transfer-manifest.json`
- `docs/transfer-review.md`

## 7. test: 화면 크기와 테마별 명세 검증 결과 저장

- `.gitignore`
- `scripts/browser-check.mjs`
- `docs/browser-results.json`
- `docs/design-implementation-plan.md`
- `docs/design-review.md`
- `docs/commit-groups.md`

## 커밋에서 제외

- `docs/screens/`: 요청대로 PNG 236개 전체 제외. `.gitignore`에 반영했다.
- `docs/design-spec.md`: 현재 HEAD와 내용이 같으므로 구현 커밋에서 제외한다. 정본을 다시 작성하지 않았다.
- `next-env.d.ts`: 실행 중인 Next.js 개발 서버가 `.next/dev/types` 참조로 자동 갱신한 파일이다. 수동으로 되돌리거나 커밋 목록에 넣지 않았다.
- `.tmp/`, `.next/`, `out/`, `node_modules/`, 복사된 `public/assets/`·`public/reference-data/`: 생성물과 임시 파일이다.
- `.impeccable/questions/`: 도구의 임시 상태다. 폴더 안의 기존 `.gitignore`가 전체를 제외한다.
- `archive/`: 이번 작업에서 변경하지 않았다.
