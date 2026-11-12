# 만자천홍 · 나의 공략

기존 개인 공략의 행동과 체크 이력을 보존하는 한국어 정적 웹 앱입니다.

## 실행

Windows PowerShell, Node.js 22.18 이상에서 실행합니다.

```powershell
$env:TEMP = "$PWD\.tmp"
$env:TMP = "$PWD\.tmp"
New-Item -ItemType Directory -Force .tmp | Out-Null
npm ci
npm run dev
```

```powershell
npm run verify
npm run lint
npm run typecheck
npm run build
npm run test:browser
```

`out/`가 정적 결과입니다. `build`와 `dev`는 SWC 실행 전에 TEMP/TMP를 설정하고 assets를 public/assets에 복사합니다. 출처 문서와 manifest도 함께 복사합니다. canonical JSON은 문서의 원본 연결을 위해 public/reference-data로 복사됩니다.

화면 검사는 설치된 Chrome을 씁니다. 다른 경로는 `CHROME_PATH` 환경 변수로 지정할 수 있습니다. 브라우저를 내려받지 않습니다. 화면 캡처는 `.tmp/screenshots`, 결과는 `docs/browser-results.json`에 둡니다.

## 내용 이전

```powershell
npm run transfer -- "원본 개인 공략 폴더"
npm run verify -- "원본 개인 공략 폴더"
```

원본이 없을 때도 복사본·이전 manifest 간 검사와 고정 수량 검사는 실행됩니다. 원본이 있을 때는 원본 해시도 대조합니다. `archive/`와 원본 폴더는 앱에서 읽거나 변경하지 않습니다. 이전 스크립트만 지정한 원본의 JSON·Markdown과 표시 대조 자료를 읽습니다.

체크는 처음에만 seed로 시작합니다. 브라우저가 다르면 기록이 자동 공유되지 않습니다. `내보내기`로 checklist.json을 보관하고 다른 브라우저에서 `가져오기`를 사용하세요. 저장 실패 시 화면 체크를 바꾸거나 저장 완료로 표시하지 않습니다.

이전 수정 내역은 [transfer-review.md](docs/transfer-review.md), 실행 기록은 [implementation.md](docs/implementation.md)에 있습니다. Netlify 설정 파일만 준비했으며 배포는 하지 않았습니다.

기술 설정 참고: [Next.js 정적 내보내기](https://nextjs.org/docs/app/guides/single-page-applications), [Radix Dialog의 키보드·초점 동작](https://www.radix-ui.com/primitives/docs/components/dialog)
