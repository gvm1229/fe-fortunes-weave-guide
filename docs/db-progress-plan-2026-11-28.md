# 진행 기록 데이터베이스와 로그인 · 계획 (2026-11-28)

## 요청

- 진행 기록(체크·내 상태·인물 육성 기록)을 MongoDB Atlas에 둔다. 기기마다 JSON을 옮기지 않는다.
- 누구나 로그인 없이 본다. 고치려 하면 로그인 창이 뜨고, 로그인해야 고칠 수 있다.

## 설계

- **서버:** Netlify Functions(사이트는 지금처럼 정적 `out/`).
  - `GET /api/progress`: 누구나. 저장된 기록 한 건을 돌려준다.
  - `PUT /api/progress`: 로그인한 사람만. `lib/check-state.ts`의 검사를 그대로 써서 받은 기록을 검사하고 저장한다. 보낸 쪽이 알던 revision과 서버 revision이 다르면 409로 막는다(두 기기가 서로 덮어쓰지 않게).
  - `POST /api/login`·`POST /api/logout`·`GET /api/session`.
- **로그인:**
  - 아이디·비밀번호는 저장소에 넣지 않는다.
  - Netlify 환경 변수 `AUTH_USER`, `AUTH_PASS_HASH`(scrypt 해시), `SESSION_SECRET`, `MONGODB_URI`.
  - 로그인하면 서명한 HttpOnly·Secure·SameSite=Strict 쿠키(30일)를 준다.
  - 틀린 시도는 데이터베이스에 세어 15분에 10번 넘으면 잠시 막는다.
- **화면:**
  - `components/checks.tsx`의 저장소를 바꾼다. 읽기는 서버, 쓰기는 로그인했을 때만 서버에 보낸다.
  - 로그인하지 않았으면 고치기 직전에 로그인 창을 띄우고 값은 바꾸지 않는다.
  - 브라우저 저장소는 마지막으로 받은 기록의 사본(서버가 안 될 때 보기용)으로만 쓴다.
  - JSON 가져오기·내보내기는 남긴다. 가져오기도 로그인이 필요하다.
- **배포:**
  - `netlify.toml`에 functions 폴더와 `/api/*` 연결을 넣는다.
  - `release.mjs deploy`에 `--functions`를 더한다.
- **비밀 보호:** `.gitignore`에 `.env*`를 넣고, 로컬 시험용 `.env.local`은 커밋하지 않는다.

## 열린 결정(사용자에게 묻기)

1. 처음 기록: `progress/my-progress-with-builds.json`(revision 240, 11/27)을 데이터베이스에 넣을지, 로그인 뒤 직접 가져올지.
2. Netlify 환경 변수 설정: 내가 netlify CLI로 넣을지, 사용자가 넣을지.
3. Atlas 네트워크 접근: Netlify 함수는 IP가 바뀐다. 배포 뒤 연결이 안 되면 Atlas Network Access에 0.0.0.0/0 허용이 필요하다(사용자 작업).

## 검사

- 함수 단위 시험: 로그인 실패·성공, 쿠키 없이 PUT 거절, revision 충돌 409, 잘못된 기록 400.
- `netlify dev`로 로컬에서 화면 확인: 로그인 없이 보기, 체크 누르면 로그인 창, 로그인 뒤 저장·새로고침 유지.
- 기존 `release.mjs check` 관문, Fable 검토, 배포 뒤 실제 사이트 확인.
