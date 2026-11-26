# yuphastemple.com 화면 4종 정밀 분해 (부록)

작성: Fable 5.2 (디자인 자문, 코드 작성 없음) · 측정일 2026-11-27
측정 환경: Claude 앱 내장 브라우저(Chromium, Windows 11, DPR 1.5), 화면 1440×900 / 768×1024 / 390×844
앞 문서: `yuphas-design-teardown.md`(사이트 전체 분해). 이 글은 그 문서의 §5.6·§5.10·§5.15를 네 화면에 대해 더 잘게 쪼갠 것이다.

읽는 법
- 숫자는 모두 실제 화면의 `getComputedStyle`·`getBoundingClientRect`와 그 사이트의 `data/style.css`, `data/app.js`, `data/map.js`, `data/*.json`에서 읽었다(읽기만 함, 디스크에 내려받지 않음).
- 자리 표기 `x,y · 폭×높이`는 화면 왼쪽 위에서 잰 CSS 픽셀이다(확대·축소가 적용된 뒤의 실제 크기).
- `v`는 그 사이트의 비례 단위 `--vw` = `max(화면 폭, 800px) / 100`. 1440에서 1v = 14.4px.
- "추정"이라고 적은 것만 추측이다.

측정하지 못한 것(정직하게)
- "짝 엔딩 보기" 단추는 **누르지 않았다.** 누르면 그 사이트 서버에 설정 저장 요청(`/api/pref?paired=1`)이 가기 때문이다. 눌린 뒤 모습은 app.js·style.css 글로만 확인했다.
- 지원 탭과 직업 팝업의 768 화면은 따로 재지 않았다(1440과 같은 규칙이 비례로 줄어드는 구조).
- 직업 목록 표(`/classes/`)의 좁은 화면 카드 배치는 재지 않았다.
- 측정 도중 같은 브라우저 창을 다른 작업이 함께 쓰고 있어서 탭 주소가 몇 번 바뀌었다. 그 뒤로는 내 전용 탭에서 다시 쟀고, 아래 숫자는 주소를 확인한 응답에서만 가져왔다.
- Firefox·Safari·실제 휴대폰은 확인하지 않았다.

---

## 0. 한눈에 보기

| 화면 | 주소 | 뼈대 | 자료 |
|---|---|---|---|
| 인물 머리(카드) | `/loretta/` | `.card.pc` 한 장(389×188) 안에 이름·직업·아이콘 12개·초상화·소속 문장 | `data.json` → `DATA.characters[]`, `DATA.classes[]` |
| 지원 탭 | `/loretta/supports/` | 2열 표 `table.supportTable` | `supports.json` → `characterSupports`, `supportNotes` |
| 좋아하는 선물 탭 | `/tialla/liked-gifts/` | 시기 단추 + 그림 제목 + 3열 단추 격자 + 음식 타일 | `gifts.json` → `characterGifts`, `locations.json` → `MAP_ITEMS` |
| 물품 팝업 | `?item=tales-of-the-arena` | 9조각 그림 틀 560px | `locations.json` → `MAP_ITEMS`, `LOCATIONS`, `pictures.json` |
| 직업 고르기 창 | 직업 줄의 ▾ 누름(주소 안 바뀜) | 전체 화면 창 `#md` + `table.classModal` | `DATA.classes[]` |
| 직업 팝업 | `?item=light-cavalry` | 물품 팝업과 같은 틀 | `DATA.classes[]` |

---

## 1. 인물 머리 카드 `.card.pc`

### 1.1 DOM (실제 그대로, 선택 목록 `<option>`만 줄임)

```html
<div class="card pc" style="--faction: url('../images/factions/linaria-dewdrops.webp');">
  <div class="pt" id="pt" title="Change character">
    <div class="im"><img class="av" alt="Loretta" src="images/characters/Loretta.webp?v=3"></div>
  </div>
  <div class="pf">
    <div class="row"><button class="pk" id="b_ch" data-k="ch">Loretta ▾</button><select id="ch" hidden>…63명…</select></div>
    <div class="row"><button class="pk" id="b_cl" data-k="cl">
        <img class="ci" src="images/classicons/female/Commoner.webp" alt="">Commoner&nbsp;
        <img class="si" src="images/skills/infantry-flat.png" alt="Infantry" title="Infantry">&nbsp;▾
      </button><select id="cl" hidden>…61개…</select></div>
    <div class="row" id="mrow" hidden><button class="pk" id="b_mt" data-k="mt">Select ▾</button><select id="mt" hidden>…22개…</select></div>
    <div class="row" id="brow" hidden><button class="pk" id="b_bt" data-k="bt"></button><select id="bt" hidden></select></div>
    <div class="card sks" id="sks">
      <span class="ski"><span class="sw"><img class="si" src="images/skills/sword_boon-v2.png" alt="Sword" title="Sword"></span></span>
      … (6개 뒤에 줄바꿈용 <span class="br"></span>) …
      <span class="ski off"><span class="sw"><img class="si" src="images/skills/armor_bane-v2.png" alt="Armor" title="Armor"></span></span>
    </div>
  </div>
</div>
```

- 이름·직업·탈것은 모두 `<button>`이고, 진짜 값은 숨긴 `<select>`가 들고 있다. 단추를 누르면 고르기 창(`#md`)이 뜬다.
- ▾는 글자 그대로(`▾`, U+25BE)다. 그림이나 CSS 삼각형이 아니다.
- 탈것 줄 `#mrow`는 탈것 직업일 때만 보인다. 부대 줄 `#brow`는 빌더에서만.

### 1.2 카드 틀

| 항목 | 규칙 | 1440 실측 |
|---|---|---|
| 자리 | `position:absolute; left:6.38%; top:5.96v; width:27.03%; height:13.05v` | 92,148 · 389.2×187.9 |
| 모양 | `display:flex; align-items:flex-start; overflow:hidden; z-index:2; padding:0; margin:0` | 바탕·테두리 없음(칸 모양은 액자 그림에 미리 그려져 있다) |
| 글 | 15px, 색 `#ffe8c4`, 검은 외곽 4겹(`--bodyShadow`, 검정 48%) | |

### 1.3 소속 문장(뒤 그림) `.card.pc::before`

```css
content:""; position:absolute; inset:0;
background: var(--faction, none) 72% / contain no-repeat;   /* 가로 72% 지점, 세로 가운데, 카드 높이에 맞춤 */
opacity:0.7; filter:brightness(0.45); pointer-events:none; z-index:0;
```

- 그림 원본 320×320 webp. 카드 높이에 맞춰 약 188×188로 그려지고, 왼쪽 끝이 카드 왼쪽에서 약 145px((389−188)×0.72).
- 초상화가 카드 왼쪽에서 216px부터 시작하므로 문장의 오른쪽 6할은 초상화 뒤에 가린다. 보이는 것은 "어두운 원의 왼쪽 반".
- 밝기 0.45 × 투명도 0.7 → 거의 물자국처럼 흐리다(app.js 주석은 "20% 투명도"라고 적혀 있으나 실제 값은 위와 같다).
- 값은 app.js가 넣는다: `card.style.setProperty('--faction', 'url("../images/factions/<파일>.webp")')`.

소속 → 파일 이름(`FACTION_SYMBOLS`):

| `faction` 값 | 파일 |
|---|---|
| Ribeira Winds | `ribeira-winds` |
| Megaira's Beacon | `megairas-beacon` |
| Rose Tempest | `rose-tempest` |
| Linaria Dewdrops | `linaria-dewdrops` |
| House Lamine | `house-lamine` |
| Tale of the Moon | `tale-of-the-moon` |
| Brigid Army | `brigid-army` |
| Temple Army | `temple-army` |
| Bandits | `bandits` |
| Neutral, The Har Hali | `neutral` (같은 그림) |
| Aragonian Army | `aragonian-army` |
| Mosa Army | `mosa-army` |
| Promised One's Army | `promised-ones-army` |
| Anatolia's Army | `anatolias-army` |
| Bertrand's Army | `bertrands-army` |
| Agartha, Brezarant Army | 없음 → `--faction: none` (문장 안 그림) |

### 1.4 초상화 `.pt > .im > img.av`

| 항목 | 값 |
|---|---|
| 자리 | `.pt { position:absolute; right:0; bottom:0; width:12v; height:97%; cursor:pointer }` → 308,154 · 172.8×182.3 |
| 그림 | 원본 500×500 webp. `width:100%; height:100%; object-fit:cover; object-position:center top` → 정사각 그림의 위쪽을 살리고 좌우를 조금 자른다 |
| 왼쪽 사라짐 | `mask-image: linear-gradient(to right, transparent, #000 15%)` → 왼쪽 15%(약 26px)가 투명에서 불투명으로 |
| 테두리·둥근 모서리·그림자 | 없음(`border-radius:0`) |
| 누르면 | 인물 고르기 창 |

초상화는 카드 폭의 44%를 차지한다(172.8/389.2).

### 1.5 이름 줄(첫째 `.row`)

| 항목 | 값 |
|---|---|
| 줄 | `font-size: 2v`(28.8px), `line-height:120%`(34.56px), `padding-left:0`, `margin-bottom:-0.2em`, `z-index:2` |
| 단추 `#b_ch` | `display:flex; align-items:center; width:100%; padding:0.4vw 1vw`(5.76px 14.4px), 바탕·테두리 없음 → 92,148 · 389.2×46.1 |
| 글 | Nocturne 400, 색 `#ffe8c4`, 왼쪽 정렬 |
| 글 그림자 | 검정 외곽 8겹(`±1px ±1px 0 #000`을 두 번) + 빛 4겹 `0 0 2px, 0 0 5px, 0 0 10px, 0 0 20px` 모두 `#cab99d` |
| ▾ | 이름 뒤 한 칸 띄운 글자. 같은 크기·같은 빛 |

단추가 카드 폭 전체라서, 초상화 위쪽 빈 곳을 눌러도 이름 고르기가 열린다(`.pf`는 `pointer-events:none`, 단추만 `all`).

### 1.6 직업 줄(둘째 `.row`)

| 항목 | 값 |
|---|---|
| 줄 | `font-size: max(12px, min(1em, 1.25v))` → 15px, `line-height:normal`, `padding-left:10px`, `filter: drop-shadow(0 0 1px black)` |
| 단추 `#b_cl` | `display:flex; align-items:center; padding:5.76px 14.4px` → 102,194 · 171.3×30.2 (Commoner일 때. 폭은 글 길이만큼) |
| 직업 그림 `.ci` | 원본 64×64 webp(점 그림). `width/height: calc(1.2em + 0.8v)` = 29.5px, `object-fit:contain`, `image-rendering:pixelated`, `margin: -0.4v 4px -0.4v -0.4v`(위아래 −5.76px로 줄 높이를 넘겨 그림을 키움) → 110.5,194.2 · 29.5×29.5 |
| 직업 이름 | 15px, 그림 오른쪽 4px |
| 이동 방식 아이콘 `.si` | `images/skills/<infantry|riding|flying|armor>-flat.png`, 18×18px. 회색 네모 없는 납작한 그림. 이름 뒤 `&nbsp;` 한 칸 |
| ▾ | 아이콘 뒤 `&nbsp;` 한 칸 |

이동 방식 정하는 법(`getMovementType`): `type`에 cavalry → Riding, 아니면 flying → Flying, 아니면 infantry → Infantry. 거기에 armored가 있거나 인물의 고유 능력 글에 "Unit is armored"가 있으면 Armor를 **하나 더** 붙인다(아이콘 2개가 나란히).

직업 그림의 성별: 직업에 `gender`가 있으면 그것, 없으면 인물의 `gender`, 그 성별 그림이 없으면 반대 성별 그림.

### 1.7 탈것 줄 `#mrow` (탈것 직업일 때만. 로레타 + Light Cavalry로 확인)

- 자리: 직업 줄 바로 아래 92,224 · 389×30.5 (줄 높이 30.5px씩 쌓임).
- 내용: `<img class="ci mi off" src="images/mountsthumb/Horse.png" title="Horse">No mount ▾`
- 탈것 그림 `.ci.mi`: 원본 30×30 png. `width/height: calc(1.2em + 0.4v)` = 23.75px, `margin-left:-0.2v; margin-right: calc(0.2v + 4px)`.
- 탈것을 안 고른 상태 `.mi.off`: `filter: grayscale(1) brightness(0.5)` — 직업의 탈것 종(Horse)을 회색으로 보여 준다.
- 탈것을 고르면 그 탈것 그림(`images/mountsthumb/<이름, 공백은 _>.png`)이 색 그대로.
- 주소도 바뀐다: `/loretta/light-cavalry/`.

### 1.8 숙련 아이콘 12개 `#sks` — 강점·약점·보통 표시법

**배치**

| 항목 | 규칙 | 1440 실측 |
|---|---|---|
| 상자 `.sks` | `position:absolute; bottom:0; display:flex; flex-wrap:wrap; padding:0.5v` | 92,267 · 342.6×69.1 (카드 아래 끝에 붙음) |
| 한 칸 `.ski` | `display:inline-flex` | 27.4×27.4 |
| 그림 `.ski .si` | `width/height: max(0.85em, 1.4v)` = 20.16px, `padding-right:0.5v; padding-top:0.5v`(7.2px, content-box) | 그림 20.2 + 틈 7.2 |
| 줄바꿈 | Black Magic 뒤에 `<span class="br">`(`flex-basis:100%; height:0`) | 6개 × 2줄 |
| 첫 칸 자리 | | 99.1,273.8. 칸 간격 27.36px(가로·세로 같음) |

순서(고정, `WEAPON_SKILL_CONFIGS`):
1줄: Sword · Spear · Axe · Bow · Gauntlet · Black Magic
2줄: White Magic · Authority · Infantry · Riding · Armor · Flying
탈것을 못 타는 상황(`noRide`)이면 Riding·Flying 칸을 아예 뺀다.

**세 상태는 CSS가 아니라 "그림 파일 세 벌"이다.** 아이콘마다 보통·강점·약점 그림이 따로 있다.

| 상태 | 파일 이름 | 그림 모습(34×34 png, 일부 30×30) | 실제 색(픽셀 직접 읽음) |
|---|---|---|---|
| 보통 | `<skill>-v2.png` | 단색 숯색 네모 + 크림색 그림 | 바탕 `#302f2d` 고름 |
| 강점(Boon) | `<skill>_boon-v2.png` | 위는 어둡고 **아래로 갈수록 금색** | 위 `#36332e` → 가운데 `#53492e` → 아래 `#72603a` (세로 그라데이션) |
| 약점(Bane) | `<skill>_bane-v2.png` | 위는 어둡고 **아래로 갈수록 보랏빛 남색** | 위 `#3b383f` → 가운데 `#4d4a5f` → 아래 `#635b72` |
| 그림(글리프) | 세 벌 공통 | 크림색 | 약 `#feedd1` (254,237,209) |

- 테두리 선·빛(glow)·크기 차이는 **없다.** 오직 네모 바탕색의 그라데이션으로만 구분한다.
- 파일 이름 규칙: `images/skills/` + 소문자·공백은 `_` + (`_boon`|`_bane`) + `-v2.png`. 예외 하나: `authority_bane.png`(‑v2 없음, 108×108).
- 12개 × 3벌 = 36개 모두 존재 확인.

**넷째 상태: 지금 직업이 못 쓰는 숙련 `.ski.off`**
- `filter: brightness(0.4)` → 칸 전체가 어두워진다. 강점·약점 그림 위에도 그대로 덮인다(로레타의 Armor 약점, Flying 강점이 Commoner에서 어둡게 보이는 이유).
- 판정: `classAllows(cls, skill)` = 직업 자료의 `skills` 안에 그 숙련 이름이 **열쇠로 있는지**. 값이 0이어도 있으면 쓸 수 있다.

**다섯째: 직업이 주는 숙련 덤 `.bn` (작은 동그라미 숫자)**
- 직업 `skills[skill]` 값이 0이 아니면 `<i class="bn">+1</i>`을 아이콘 오른쪽 위에 얹는다(Light Cavalry: Spear +1, Riding +2).
- `position:absolute; right:0; top:0; background:rgba(0,0,0,.67); border:1px solid #ffe8c4; border-radius:50%; color:#ffe8c4; font-size:max(6px, 0.6vw)`(8.64px)`; font-weight:700; width:1.67em`(14.4px)`; line-height:1.67em; text-align:center; aspect-ratio:1` → 실제 16.4×16.4px.

**자료 필드**
- 강점·약점: `DATA.characters[].skills[<숙련>].affinity` = `"Boon"` | `"Bane"` | 없음. 같은 자리에 `rank`("E"~"S+")도 있다(머리 카드에는 등급을 안 그린다).
- 로레타 예: Sword·Spear·Flying = Boon, Armor = Bane, 나머지 없음.

**말풍선**: 그림의 `title`에 숙련 이름만. 강점·약점이라는 글은 없다(색으로만 알림 → 접근성 약점).

### 1.9 화면 폭별 변화

카드에 걸린 규칙은 그대로이고, 무대 전체의 확대·축소(`.wrapper`·`.wrap`의 `transform: scale`)로만 변한다. 휴대폰 세로에서는 액자 그림 자체가 바뀌어 카드가 왼쪽 단의 맨 위로 온다.

| | 1440×900 | 768×1024 | 390×844 |
|---|---|---|---|
| 무대 배율(`.wrapper` × `.wrap`) | 1 × 1 | 1.04 × 0.96 ≈ 1.00 | 1.6 × 0.4875 = 0.78 |
| 카드 | 92,148 · 389.2×187.9 | 27,344 · 215.9×104.2 | 7,97 · 168.7×81.4 |
| 초상화 | 172.8×182.3 | 95.8×101.1 | 74.9×79.0 |
| 이름 글(계산값 → 실제) | 28.8px | 16px → 약 16px | 16px → 약 12.5px |
| 이름 단추 높이 | 46.1 | 25.3 | 18.0 |
| 직업 글(계산값 → 실제) | 15px | 12px → 약 12px | 12px → 약 9.4px |
| 직업 그림 | 29.5 | 20.8 | 16.2 |
| 아이콘 한 칸 | 27.4 | 16.7 | 13.7 |
| 아이콘 상자 안쪽 여백 | 7.2px | 4px | 4px |
| 문장 그림 | 72% / contain, .7, .45 | 같음 | 같음 |
| 초상화 마스크 | 15% | 같음 | 같음 |

- 768에서는 액자가 화면 한가운데 799×430으로만 그려지고 위아래 약 300px씩 검정이다. 카드도 그 안에서 216×104로 작다.
- 390에서는 아이콘 한 칸이 13.7px, 직업 글이 실제 9px대다. **누르기도 읽기도 어렵다. 이 크기는 본받으면 안 된다.**
- 배치 순서 자체(이름 위, 직업 아래, 아이콘 6×2, 초상화 오른쪽)는 세 폭에서 한 번도 바뀌지 않는다.

### 1.10 우리 사이트로 옮길 때(자문)

- 그대로 옮길 값진 것: ① 큰 이름 + 빛 ② 직업 점 그림 + 이름 + 이동 아이콘 한 줄 ③ 6×2 아이콘 격자 ④ 오른쪽 큰 초상화의 왼쪽 사라짐 ⑤ 뒤에 흐린 소속 문장.
- 고쳐서 옮길 것: 강점·약점을 색으로만 알리지 말 것. 아이콘 아래 작은 표식(▲ 강점 / ▼ 약점)이나 묶음 제목을 같이 둔다. 우리 규칙(글 18px 이상, 누를 곳 44px 이상)과 맞추려면 아이콘 한 칸을 휴대폰에서 44px로 잡아 6×2가 264px 폭에 들어가게 한다(390 화면에 들어감).
- 사양(`docs/design-spec.md`)에 없는 시각 결정이므로 사용자 질문이 필요하다: "강점·약점 표시를 금색/보라색 그림 세 벌로 할지, 한 벌 그림 + CSS 바탕색으로 할지". 추천은 뒤쪽(그림 12개만 있으면 되고 색을 우리 토큰으로 맞출 수 있다).

---

## 2. 지원 탭 `/…/supports/`

### 2.1 DOM

```html
<div class="tabContainer">
  <table class="supportTable">
    <thead><tr>
      <th class="sr asc" data-sc="0">Character</th>
      <th class="sr" data-sc="1">Supports</th>
    </tr></thead>
    <tbody>
      <tr>
        <th class="supportCh" data-ch="Goliath" style="background-image:url('images/charactersthumb/Goliath.webp?v=25')">
          <a href="/goliath/supports/" data-ch="Goliath">Goliath</a></th>
        <td class="l pl">C <small>(Part 1)</small> B <small>(Part 1)</small> A <small>(Part 3)</small></td>
      </tr>
      … 인물마다 한 줄 …
      <tr><td colspan="2" class="l pl"><small>메모 글</small></td></tr>            <!-- supportNotes가 있을 때 -->
      <tr><td colspan="2" class="l pl">
        <button type="button" class="pairToggle bt" aria-pressed="false">Reveal <span class="pairMark">♥ Paired endings</span></button>
      </td></tr>
    </tbody>
  </table>
  <div id="disclaimer">…</div>
</div>
```

지원 상대가 한 명도 없으면 표 대신 `<p>No support data for this character.</p>`.

### 2.2 열은 딱 두 개

| 열 | 내용 | 1440 폭 |
|---|---|---|
| Character | 얼굴 그림(칸 배경) + 이름 링크 | 136px(`width:8em` + 좌우 8px) |
| Supports | 등급 글자와 조건 글 | 나머지 725px |

표 전체: 518,199 · 861×504, `border-collapse:collapse`, 글 15px.

### 2.3 표 머리

- 칸: `position:relative; isolation:isolate; height:1.5v`(21.6px)`; padding:4px 8px; border:0; font-weight:normal; text-align:center; user-select:none` → 높이 29.6px.
- 금속 명찰 모양은 `::before`가 만든다: `position:absolute; inset:2px; border:2px solid #39484f; background:#192d34; z-index:-1`.
- 정렬 화살표: 고른 열에만 `::after` CSS 삼각형. 오름 `.asc` = ▲(`border-bottom:6px solid currentColor`, 좌우 4px 투명), 내림 `.desc` = ▼(`border-top:6px`). `margin-left:5px; margin-right:-13px`(글이 가운데에서 안 밀리게)`; filter:drop-shadow(0 0 2px black)`.
- `cursor:pointer`.

### 2.4 인물 칸 `.supportCh`

```css
background-size: 5em auto;            /* 75px 폭 */
background-position: -0.625em top;    /* 왼쪽으로 9.4px 밀어 얼굴을 칸 왼쪽 끝에 */
background-repeat: no-repeat;
height: 2.5em;  width: 8em;           /* 37.5px, 120px */
padding: 0.5em 8px 4px;               /* 위 7.5px */
text-align: right(선언) / 실제 left;  vertical-align: top;
text-shadow: var(--thickShadow);      /* 검정 외곽 8겹 */
font-weight: 700(th 기본);
border-bottom: 1px solid #383d38;
```
- 얼굴 그림: `images/charactersthumb/<이름>.webp?v=25`, 원본 120×120. 75px 폭으로 그려져 칸 높이 49px에서 아래가 잘린다(머리~어깨만 보임).
- 이름 링크 `a`: `margin-left:3.5em`(52.5px, 얼굴을 피해 오른쪽으로), 밑줄 없음, 색 `#ffe8c4`. 누르면 **그 인물의 지원 탭**으로 간다(`/goliath/supports/`).
- 줄 높이 49.3px.

### 2.5 지원 칸 — 등급 표시

- 칸: `padding:4px 8px; text-align:left; white-space:normal; border-bottom:1px solid #383d38`, 세로 선 없음.
- **등급은 그냥 글자다.** 동그라미 배지(`.rk`)도 색도 아이콘도 없다. `C (Part 1) B (Part 1) A (Part 3)`처럼 한 줄에 띄어 쓴다.
  - 등급 글자: 15px `#ffe8c4`(화면에서 조금 굵게 보이는 것은 글자 외곽 그림자 때문이고 `<b>`는 아니다).
  - 조건 `<small>`: 13.8px(92%), 색 `#acaab9`(`--mut`), 괄호 포함.
- 만드는 법(`formatSupportLines`): 자료 값 `"Support level 3, Part 1, see after …"`에서 `"Support level N"`을 떼고 **쉼표 뒤 글만** 괄호에 넣는다. 쉼표 뒤가 없으면 등급 글자만(에슈멜의 `A`).
- 순서는 늘 C → B → A. 없는 등급은 건너뛴다.

### 2.6 줄 상태

| 상태 | 모습 |
|---|---|
| 기본 | 바탕 없음, 줄 아래 1px 선 |
| 호버 | **변화 없음**(줄 호버 규칙이 없다). 이름 링크만 누를 수 있다 |
| 3부 내용 인물 | 줄에 `data-spoil`이 붙으면 줄 전체를 `::after`로 덮고 `backdrop-filter: blur(8px) grayscale(0.8)` + "Click to reveal" |
| 짝 엔딩 보기 켬 | 그 상대 칸 끝에 `<span class="pairMark" title="Paired ending">♥ <small>Paired ending</small></span>`. 색 `#f0b9c4`(분홍). `small`은 `display:none`이라 화면엔 ♥만 보인다 |
| 메모 줄 | 두 칸을 합친 한 줄, 13.8px `--mut` |

### 2.7 정렬·거르기

- **거르기(필터)·검색: 없다.**
- 정렬: 머리 칸 누르기 두 가지뿐. 같은 칸을 다시 누르면 뒤집힌다. 누를 때마다 표 전체를 다시 그린다.
  - Character: 이름 가나다(A–Z) / 거꾸로.
  - Supports: 점수 = A 있으면 4 + B 있으면 2 + C 있으면 1 (+ 짝 엔딩 보기 켠 상태에서 짝이면 0.5). 처음 누르면 높은 점수부터(A·B·C 다 있는 사람 먼저), 같은 점수는 이름순.
- 기본 상태: Character 오름(`{c:0, d:1}`).

### 2.8 "짝 엔딩 보기" 단추 `.pairToggle.bt`

- 그 인물에게 `paired:true`인 상대가 하나라도 있을 때만 표 맨 아래 줄에 나온다.
- 모양: `padding:8px 12px; margin:2px 8px 2px 0; border:1px solid #383d38; background:url(tileBg3.png)`(질감)`; color:#ffe8c4`, 15px → 193×38.7px. 앞 삼각형 없음(`::before{display:none}`). 호버·초점: 바탕 `--sel`(`#3d3f3385`).
- 글: `Reveal ♥ Paired endings` ↔ `Hide ♥ Paired endings`. ♥와 뒤 글은 분홍 `#f0b9c4`.
- 처음 켤 때는 스포일러 확인 창(`askSpoilers(3)`, 제목 "Paired endings", 단추 "Reveal paired endings")을 먼저 띄운다.
- 기억: `localStorage['showPairedEndings']` = '1'/'0' + 서버 쿠키(`/api/pref?paired=`).
- 켜면 에슈멜과 짝인 인물은 단추 옆에 `Eshmel paired endings require [하트5 그림]`(13.8px, `images/icons/hearts/5.png` 39×29) 글이 붙는다.

### 2.9 자료 `supports.json`

```json
{
  "characterSupports": {
    "Loretta": {
      "Eshmel":  { "A": "Support level 4", "paired": true },
      "Goliath": { "C": "Support level 2, Part 1", "B": "Support level 3, Part 1", "A": "Support level 4, Part 3", "paired": true },
      "Tobias":  { "C": "Support level 2, Part 1", "B": "Support level 3, Part 1" }
    }
  },
  "supportNotes": { "Cai": ["메모 글"], "Fabio": ["…"] }
}
```
- 한쪽에만 적혀 있어도 된다: `getSupportEntry(a,b) = s[a][b] || s[b][a]`.
- 열쇠 `C`/`B`/`A`의 값은 문장 그대로. `extra` 배열이 있으면 그 글을 뒤에 그대로 붙인다.
- 티알라는 상대 11명(Eshmel, Cai, Peter, Ultand, Theodora, Creek, Bonaventure, Talimun, Seteth, Ludia, Io). 조건 글이 긴 예: `A (See Ultand B support, Part 1)`.

### 2.10 화면 폭별

| | 1440 | 390 |
|---|---|---|
| 표 | 518,199 · 861폭 | 11,189 · 365폭(화면 거의 전체) |
| 글(계산값 → 실제) | 15px | 14px → 약 10.9px |
| 머리 칸 높이 | 29.6 | 19.2 |
| 인물 칸 | 136×49.3, 얼굴 75px | 99.8×36.1, 얼굴 70px(계산값) |
| 지원 칸 | 725폭 | 265폭, 글이 2줄로 접힘 |
| 조건 글 | 13.8px | 12.88px → 약 10px |
| 탭 내용 바탕 | 액자 그림 | 단색 `#05171b`(`.singleColumn .tabContainer`) |
| 내용 여백 | `0 14.4px 10px` | `0 16px 10px` |

- 390에서도 **표 그대로**(2열)다. 카드로 바꾸지 않는다. 열이 둘뿐이라 넘치지 않는다.
- 탭 5개는 2열로 접힌다(각 98.3×17.6px).

### 2.11 우리 사이트로 옮길 때(자문)

- 좋은 점: 얼굴 + 이름 + 등급 한 줄이 한눈에 들어온다. 열이 둘뿐이라 휴대폰에서도 안 깨진다.
- 약한 점: 등급이 그냥 글자라 눈에 안 띈다. 사용자는 "글보다 그림"을 좋아하므로, 등급을 **동그라미 배지 3칸(C·B·A 고정 자리, 없는 등급은 빈 고리)**으로 바꾸고 조건(1부/3부)을 배지 아래 작은 글이나 색 띠로 두는 쪽을 추천한다. 이것도 사양에 없는 결정이라 질문이 필요하다.

---

## 3. 좋아하는 선물 탭 `/…/liked-gifts/` 와 물품 팝업

### 3.1 탭 DOM

```html
<div class="tabContainer">
  <div class="tierLinks tabFixed" role="group" aria-label="Period">
    <a href="#" data-giftpart="I-II" class="pk bt nb on" aria-pressed="true">Part I</a>
    <a href="#" data-giftpart="III"  class="pk bt nb"    aria-pressed="false">Part III</a>
  </div>
  <div class="tabMain">
    <div class="giftContainer">
      <h1><img class="giftHdr" src="images/gifts/giftLoved.png" alt="Loved"></h1>
      <div class="giftList">
        <a href="/?item=history-of-a-master" class="pk bt nb giftBtn hasPts" data-item="History of a Master">
          <img class="si" src="images/items/gift_rare-v2.png" alt="">
          <span class="giftName">History of a Master</span>
          <small class="giftPts" style="--g:97%">+195</small>
        </a> …
      </div>
      <h1><img class="giftHdr" src="images/gifts/giftLiked.png" alt="Really liked"></h1>
      <div class="giftList"> … </div>
      <div class="foodSect"><div class="foodList">
        <a href="/?item=madazins" class="foodItem" data-item="Madazins">
          <img class="foodHdr" src="images/foodHeaders/great.png?v=2" alt="Loved by">
          <img src="images/meals/mazadins-v2.webp" alt="">
          <span>Madazins</span>
        </a> …
      </div></div>
    </div>
    <div id="disclaimer">…</div>
  </div>
</div>
```

### 3.2 구역 순서와 분류

| 순서 | 구역 | 제목 | 내용 |
|---|---|---|---|
| 0 | 시기 단추(고정, 스크롤 안 됨) | — | `Part I` / `Part III`. 시기 자료가 하나뿐이면 단추 없음 |
| 1 | 아주 좋아함 | **그림 제목** `giftLoved.png`(alt "Loved", 화면 글 "Support Raised+ ▲▲") | 선물 단추 격자 |
| 2 | 좋아함 | **그림 제목** `giftLiked.png`(alt "Really liked", 화면 글 "Support Raised ▲") | 선물 단추 격자 |
| 3 | 음식 | 제목 없음 | 음식 타일. 아주 좋아함 → 좋아함 → 싫어함 순으로 한 줄에 이어 붙임 |

- **선물과 음식의 구분은 "모양"으로 한다**: 선물 = 가로로 긴 단추, 음식 = 세로 타일(사진 + 이름).
- 싫어하는 선물·분류, 좋아하는 연극은 자료에는 있지만 화면에는 **안 그린다**(코드가 주석 처리됨).
- 보통(neutral) 음식도 안 그린다.

### 3.3 시기 단추 `.tierLinks > a`

- 상자: `display:flex; flex-wrap:wrap; gap:4px; margin:4px 0 2px; padding-bottom:8px` → 518,199 · 높이 38.8px.
- 단추: `padding:0.4vw 1vw`(5.76px 14.4px), 15px, `border:1px solid #383d38`, 바탕 `tileBg3.png` 질감 → 67.8×30.8 / 78×30.8.
- 고름 `.on`: `background:#60593e5c`(청동 36%) `!important` + `text-shadow: var(--glow)`.
- 누르면 주소는 안 바뀌고 `.giftContainer`만 다시 그린다.

### 3.4 그림 제목 `.giftHdr`

- 원본 247×50 png(게임 화면에서 딴 "Support Raised" 리본). `display:block; height:1.8em`(32.4px)`; width:auto; border:1px solid #383d38` → 161.4×33.7px.
- `h1` 사이 간격: 둘째부터 `margin-top:12px`.

### 3.5 선물 격자 `.giftList`

| 조건 | 열 수 |
|---|---|
| 화면 폭 > 1600px | 4열 `repeat(4, 1fr)` |
| ≤ 1600px | 3열 |
| ≤ 1200px | 2열 (700px 아래도 2열) |

- `display:grid; gap:8px; margin-top:8px; align-items:flex-start`.
- 1440 실측: 3열 × 281.7px. 768: 2열 × 233px. 390: 2열(실제 약 179px씩).

### 3.6 선물 단추 `.giftBtn`

| 항목 | 값 |
|---|---|
| 틀 | `display:flex; align-items:center; padding:4px 6px; border:1px solid #383d38; background:url(tileBg3.png)`; 밑줄 없음 → 281.7×27.3px |
| 물품 아이콘 `.si` | 18×18px(원본 40×40), `margin-right:6px` |
| 이름 `.giftName` | `flex:1; min-width:0`, 15px `#ffe8c4`. 넘치면 `white-space:nowrap; overflow:hidden; text-overflow:ellipsis`(…) |
| 점수 `.giftPts` | `margin-left:auto; padding-left:10px`, 13.8px, 오른쪽 끝 |
| 호버·초점 | 바탕 `--sel`(`#3d3f3385`). 움직임 없음 |
| 누르면 | 물품 팝업(주소에 `?item=<slug>`가 붙음) |

**점수 색 = 점수에 따라 초록이 짙어진다.**
```
--g = round( clamp(0, (점수 − 50) / 150, 1) × 100 ) %      // 50점이면 0%, 200점이면 100%
color: color-mix(in srgb, #5edc7a var(--g), #acaab9);
```
| 점수 | --g | 실제 색(대략) |
|---|---|---|
| +195 | 97% | `#60db7c` 밝은 초록 |
| +130 | 53% | `#83c498` |
| +120 | 47% | `#87c29b` |
| +114 | 43% | `#8abf9e` |
| +98 | 32% | `#93baa5` |
| +82 | 21% | `#9cb4ac` |
| +65 | 10% | `#a4afb3` 거의 회색 |

**물품 아이콘은 희귀도 3단계**: `images/items/gift_common-v2.png`(107개) · `gift_uncommon-v2.png`(11개) · `gift_rare-v2.png`(10개). 선물 상자 그림이고 등급에 따라 상자 색이 다르다. 선물마다 고유 그림은 없다.

정렬: 자료에 적힌 순서 그대로(이미 점수 높은 순).

### 3.7 음식 타일 `.foodItem`

| 항목 | 값 |
|---|---|
| 목록 `.foodList` | `display:flex; flex-wrap:wrap; gap:8px; margin-top:8px`. 구역 `.foodSect { margin-top:16px }` |
| 타일 | `display:flex; flex-direction:column; align-items:center; gap:4px; width:120px; padding:4px; text-align:center; border:1px solid #383d38; background:url(tileBg3.png)` → 129.3×133.3px(이름 한 줄일 때) |
| 리본 `.foodHdr` | 원본 177×71 png. `height:40px; width:auto`(99.7px)`; margin-bottom:-16px`(사진 위에 겹침) |
| 사진 | 원본 225×225 webp. `width:72px; height:72px; object-fit:cover; border-radius:8px`(이 사이트에서 드문 둥근 모서리) |
| 이름 | 15px, `margin-top:-16px`(사진 아래쪽에 겹쳐 올림). 길면 2줄 |
| 호버 | 바탕 `--sel` |

리본 세 종류(`FOOD_HEADERS`): `loved_meals` → `great.png`(금색 "Great ✦✦") · `liked_meals` → `good.png`("Good ✦") · `disliked_meals` → `bad.png`(회보라 "Bad"). 모두 `images/foodHeaders/<이름>.png?v=2`.
`MAP_ITEMS`에 `type:"Meal"`로 없는 음식은 링크 없는 `<span class="foodItem">`에 이름만.

### 3.8 자료 `gifts.json`

```json
{ "characterGifts": { "Tialla": {
  "gifts": [
    { "part": "I-II", "loved": [["History of a Master",195], …20개], "liked": [["Pastry Cookbook",98], …35개] },
    { "part": "III",  "loved": […], "liked": […] }
  ],
  "loved_meals": ["Madazins","Cheese-Coated Crayfish"],
  "liked_meals": ["Pumpkin Soup","Honey-Poached Pear","Coffee-Berry Paste"],
  "neutral_meals": ["Fish-Sauce Soup","Goat Roast","Garlic-Seared Scallops","Charred Fish Grill"],
  "disliked_meals": ["Salt-Crusted Ham","Sand Boar and Beans","Sweet-and-Sour Stick Bugs"],
  "liked_plays": ["Mascarina the Thief","The Rending Ring"],
  "disliked_gifts": ["Rancid Garum"],
  "disliked_categories": ["Alcohol","Teff"]
} } }
```
- 67명분. 시기 표시 이름: `'I-II' → 'Part I'`, `'III' → 'Part III'`.
- 물품 자체 정보는 `locations.json`의 `MAP_ITEMS[<이름>]`:
  `{"type":"Gift","rarity":"Common","icon":"images/items/gift_common-v2.png","cost":300,"d":"설명","gt":"Book"}`
  - 선물 128개, `gt`(선물 종류) 31가지(Book 13, Cooking 14, Fermented drink 16, Sweets 12 …).
  - 음식: `{"type":"Meal","icon":"images/meals/mazadins-v2.webp","img":"…같은 파일…","imgRatio":1,"imgW":225,"d":"설명"}` — 12개.

### 3.9 화면 폭별(선물 탭)

| | 1440 | 768 | 390 |
|---|---|---|---|
| 열 | 3 | 2 | 2 |
| 단추 | 281.7×27.3 | 232.6×27.3 | 179.4×20.4 |
| 단추 글(계산값 → 실제) | 15px | 15px | 14px → 약 10.9px |
| 아이콘 | 18 | 18 | 13.1 |
| 그림 제목 | 161.4×33.7 | 161.4×33.7 | 117.6×24.6 |
| 음식 타일 | 129.3×133.3 | 129.1×133.1 | 100.9×101.9 |
| 시기 단추 자리 | 내용 위 | 내용 위 | 인물 카드 오른쪽 빈칸으로 올라감(`padding-left:30v`) |

### 3.10 물품 팝업 `#idp` — `?item=tales-of-the-arena`

**주소**: 지금 주소 뒤에 `?item=<slug>`(또는 `&item=`)를 붙인다. 예 `/tialla/liked-gifts/?item=tales-of-the-arena`. 닫으면 떼어 낸다. 뒤로 가기 = 닫기.
slug 만드는 법(`itemSlug`): 이름에서 `'`·`’`를 지우고, `+`를 ` plus`로 바꾸고, 악센트를 떼고(Fódlan → fodlan), 소문자로, 글자·숫자 아닌 것은 `-`로, 양끝 `-`는 지움.

**DOM**
```html
<div id="idp"><div class="mb">
  <div class="mh">
    <span class="idHead"><img class="si" src="images/items/gift_common-v2.png" alt="">
      <span><h1>Tales of the Arena</h1><small>Gift</small></span></span>
    <button class="pk" id="idx" aria-label="Close"><span>✕</span></button>
  </div>
  <div id="idw"><div id="idc" data-item-ctx="Tales of the Arena">
    <div class="idStats">
      <span><small>Gift type</small><b>Book</b></span>
      <span><small>Rarity</small><b>Common</b></span>
      <span><small>Cost</small><b>300</b></span>
    </div>
    <p class="idText">A collection of stories …</p>
    <div class="idRatings"><div class="idSec idSec-x">
      <h3><img class="giftHdr" src="images/gifts/giftLiked.png" alt="Really liked by"></h3>
      <a href="/bonaventure/" class="lr" data-ch="Bonaventure" title="Bonaventure: +98"
         style="background-image:url('images/faces/Bonaventure.png?v=2')"><span class="lrPts" style="--g:32%">+98</span></a> …21명…
    </div></div>
    <a href="/map/?q=Tales%20of%20the%20Arena" class="idMapShot" data-map-all="Tales of the Arena" title="Show Tales of the Arena on the map">
      <img src="images/map-items/tales-of-the-arena.webp?h=db1b3513" width="120" height="120" alt="Where to find … on the map of Dagda" onerror="this.parentNode.remove()"></a>
    <div class="idSec idSec-how-to-get" data-sec="acquire">
      <h3>How to get<small class="idMapAll"><a href="/map/?q=Tales%20of%20the%20Arena" class="lmItem arrowLink" data-map-all="…">Show all 2 locations on map</a></small></h3>
      <div class="acqLoc"><a class="loc" href="/map/grand-aragon/" data-loc="Grand Aragon" data-area="All">
        <img class="locIc" src="images/map/pin_settlement_large.png" title="Settlement"><span class="locT">Grand Aragon</span></a>
        <span class="srcK">Market · All paths + Part III, except Cai</span></div>
      <div class="acqLoc">… Kassite … <span class="srcK">Item Shop, Market · …</span></div>
    </div>
    <div class="idSec idSec-from-crates" data-sec="crates"><h3>From crates</h3>
      <span class="idChip"><a href="/?item=gift-box" class="lmItem" data-item="Gift Box"><img class="si" src="images/items/crate.webp">Gift Box</a> <small class="srcK">0.8%</small></span>
    </div>
  </div></div>
</div></div>
```

**덮개 `#idp`**: `position:fixed; inset:0; z-index:18; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); padding:12px 6px`(위는 안전 영역 + 12px).

**틀 `#idp .mb`** — 1440에서 440,234 · 560×431
- `width:min(560px,100%); min-width:min(360px,100%); min-height:min(176px,100%); max-height:min(90vh,100%); height:auto`.
- 배경 그림 9장 + 단색 1겹을 한 요소에 겹친다(`images/popup/`):

| 조각 | 파일(원본 크기) | 자리 / 그리는 크기 |
|---|---|---|
| 네 모서리 | `top-left`·`top-right`·`bottom-left`·`bottom-right`.webp (각 168×88) | 각 모서리 / 168×88 고정 |
| 윗변·아랫변 | `top-center`·`bottom-center`.webp (48×88) | 왼쪽 167px부터 / `calc(100% − 334px)` × 89px |
| 왼변·오른변 | `middle-left`·`middle-right`.webp (168×48) | 위 87px부터 / 169px × `calc(100% − 174px)` |
| 가운데 | `center.webp` (24×24) | 167px,87px부터 / `calc(100% − 334px)` × `calc(100% − 174px)` |
| 맨 밑 단색 | `linear-gradient(#151d1c,#151d1c)` | 8px,8px부터 / `calc(100% − 16px)` 제곱 |

늘리는 조각은 이웃 밑으로 1px씩 더 들어가(167/168, 87/88, 89/88) 틈이 안 보인다. 그림자·둥근 모서리 없음.

**머리 `.mh`**: `min-height:37px; padding:15px 0 6px; margin:0 15px; border-bottom:1px solid #383d38; display:flex; flex-wrap:wrap` → 높이 59.7px.
- `.idHead`: `display:flex; align-items:center; gap:10px; font-size:18px; margin-left:5px; margin-right:40px`.
- 아이콘: 32×32px, `object-fit:contain; filter:drop-shadow(0 0 3px rgba(0,0,0,.3))`.
- 제목 `h1`: 18px 700. 종류 `small`: 13px `#acaab9`, 제목 바로 아래 줄.
- 닫기 `#idx`: 32×32px, `position:absolute; top:17px; right:2px`. 안쪽 상자(`::before`, `inset:0`): 2px `#60593e` 테두리 + 바탕 `#3a1d1d` + 흰 ✕(SVG, 62%). 호버: 90° 회전 + `drop-shadow(0 0 2px #e0c18fed)` + 바탕 `#4d2424`, 0.15s.

**본문 `#idc`**: `overflow:auto; font-size:15px; padding:0 13px 12px 20px; margin:0 7px 8px 0`. 첫 자식 `margin-top:10px`. 본문 폭 520px.

**구역별**

| 구역 | 값 |
|---|---|
| 수치 칩 `.idStats` | `display:flex; flex-wrap:wrap; gap:4px; margin:10px 0 8px`. 칩 `span`: 세로 쌓기, 가운데, `min-width:50px; padding:2px 4px; border:2px solid #39484fc4; background:#192d34c7` → 57.1×39.3px. 윗글 `small` 11px `#acaab9`, 값 `b` 15px 700 |
| 설명 `.idText` | `margin:6px 0`, 15px, 색 `#acaab9` |
| 구역 `.idSec` | `margin:10px 0 0; display:flow-root` |
| 구역 제목 `h3` | 14px 400 `#acaab9`, `margin:0 0 4px; border-bottom:1px solid #313f4180` |
| "누가 좋아하나" 제목 | 선물 탭과 같은 리본 그림. 팝업 안에서는 `height:2em`(28px)`; margin-bottom:-1px` → 139.6×29.3 |
| 얼굴 줄 `a.lr` | `display:inline-block; position:relative; height:2em`(30px)`; aspect-ratio:1.25/1`(37.5px)`; margin:1px 4px 1px 3px; background:<얼굴> center / auto 100% no-repeat; background-color:#27444e59; border:1px solid #3c4d5080`. 얼굴 원본 96×64 png |
| 얼굴 위 점수 `.lrPts` | `position:absolute; right:-6px; top:-2px; padding:0 3px; font-size:10px; line-height:1.35; color:color-mix(in srgb,#5edc7a var(--g),#acaab9); filter:drop-shadow(0 0 1px black) drop-shadow(1px 1px 1px black)` |
| 스포일러 얼굴 | `data-spoil="2|3"` → `::after`가 얼굴을 덮고 `backdrop-filter:blur(10px) grayscale(.8)`. 화면에는 회색 네모로 보인다. `title`은 "Part III content" |
| 얻는 곳 한 줄 `.acqLoc` | 둘째 줄부터 `padding-top:2px`. 장소 링크 `a.loc`: `display:inline-flex; align-items:center; text-decoration:underline dotted; text-underline-offset:2px`, 색 `#ffe8c4`. 핀 그림 `.locIc` 18×18(원본 100×100), `margin-right:2px`. 뒤 설명 `.srcK` 13.8px `#acaab9` |
| 상자에서 `.idChip` | `display:inline-flex; align-items:center; gap:4px; margin:2px 7px 2px 0`. 아이콘 18px + 이름(점선 밑줄) + 확률 `small.srcK` |

**구역 순서(선물일 때)**: 수치 칩 → 설명 → 좋아하는 인물(등급별 리본 + 얼굴들) → [지도 그림, 오른쪽 띄움] → How to get → From crates. 물품 종류에 따라 Upgrades 표, Used for, Requires 같은 구역이 더 붙는다(무기 Bronze Sword에서 확인).

### 3.11 지도 단추와 링크 형식

팝업에 지도로 가는 길이 **세 가지** 있다.

| 무엇 | 모양 | 링크 형식 |
|---|---|---|
| ① 지도 그림 `.idMapShot` | 그 물품이 있는 곳만 잘라 낸 지도 그림 + 빨간 점. `float:right; margin:10px 0 6px 6px`. 그림 120×120(원본 300×300), `padding:4px; border:1px solid #383d38; background:#1c2d30` → 129.3×129.3px. 왼쪽 위에 물품 아이콘이 그림 안에 이미 그려져 있다 | `/map/?q=<encodeURIComponent(물품 이름)>` 예 `/map/?q=Tales%20of%20the%20Arena` |
| ② "Show all N locations on map" | "How to get" 제목 옆 작은 글 링크. 앞에 동그라미 i(`::before`, 1.125em 원, 1px 테두리). 12.88px `#ffe8c4`, `margin-left:10px`. **장소가 2곳 이상일 때만** | ①과 같은 주소 |
| ③ 장소 이름 | 줄마다 핀 그림 + 점선 밑줄 이름 | `/map/<장소 slug>/` 예 `/map/grand-aragon/`, `/map/kassite/` |

- 내부 경로 표기는 `routeUrl('map&q=' + encodeURIComponent(name))`. 깨끗한 주소로는 `/map/?q=…`가 된다(app.js 주석의 옛 꼴은 `?map&q=item`).
- ①②는 지도를 열고 그 물품을 검색한 상태로 만들어, 있는 곳 전부에 "퍼지는 고리"(`lmPing`, 1.2초 × 3번)를 띄운다.
- 지도 그림 주소: `images/map-items/<slug>.webp?h=<해시>`. 해시는 `pictures.json`의 `"map-items/<slug>"` 값(2,450개 항목). 그림이 없으면 `onerror`로 링크째 지운다.
- 얻는 곳 자료: `locations.json` → `LOCATIONS[<장소>].sp[<가게 종류>] = [[물품, 수량|null], …]`. 장소 310곳. 그 밖에 `MAP_ACQUIRE`(특수 입수), `MAP_CONFIG`, `MAP_AREAS`.

### 3.12 팝업의 화면 폭별

| | 1440 | 390 |
|---|---|---|
| 틀 | 560×431, 화면 가운데 | 378×514(= 화면 폭 − 좌우 6px), 가운데 |
| 본문 글 | 15px | **15px 그대로**(팝업은 무대 축소 밖이라 안 줄어든다) |
| 수치 칩 | 57.1×39.3 | 같음 |
| 얼굴 | 37.5×30, 한 줄 12개쯤 | 같음, 한 줄 7개 |
| 지도 그림 | 129×129 오른쪽 띄움 | 같음. 얻는 곳 글이 왼쪽 좁은 칸에서 3줄로 접힘 |
| 닫기 | 32×32 | 32×32 |

팝업은 휴대폰에서도 글이 15px로 읽힌다. **이 사이트에서 휴대폰으로 가장 읽기 좋은 화면이 이 팝업이다.**

### 3.13 우리 사이트로 옮길 때(자문)

- 그대로 옮길 값진 것: 그림 제목(리본) · 점수에 따라 초록이 짙어지는 숫자 · 음식은 사진 타일로 · 팝업의 "수치 칩 → 설명 → 누가 좋아하나(얼굴) → 어디서 얻나(지도 그림)" 순서.
- 사용자 선호(글보다 그림)에 더 맞추려면: 선물 단추에도 물품 사진이 있으면 좋은데 원본에도 선물 고유 그림은 없다(상자 그림 3종뿐). 대신 `gt`(선물 종류 31가지)로 묶어 종류별 작은 그림을 붙이는 방법이 있다 — 사양에 없는 결정이라 질문 필요.
- 우리 자료에는 지도가 없다. 지도 단추를 옮기려면 "지도 화면을 만들지, 얻는 곳을 글로만 적을지"를 먼저 정해야 한다(질문).

---

## 4. 직업 창 — 실제로는 두 가지다

"직업을 누르면 뜨는 창"이 누르는 곳에 따라 다르다.

| 누르는 곳 | 뜨는 것 | 주소 |
|---|---|---|
| 인물 카드의 직업 줄(▾) | **직업 고르기 창** `#md`(전체 화면, 타일 목록) | 안 바뀜. 고르면 `/loretta/light-cavalry/` |
| 직업 목록 표(`/classes/`)의 직업 이름, 또는 어디서든 직업 이름 링크 | **직업 팝업** `#idp`(물품 팝업과 같은 560px 틀) | `?item=light-cavalry` |

### 4.1 직업 고르기 창 `#md`

**DOM**
```html
<div id="md"><div class="mb">
  <div class="mh">
    <b id="mtl">Choose a class</b>
    <span id="mtb" class="mTabList">
      <a role="button" tabindex="0" class="pk cn on" data-f="All">All</a>
      <a role="button" tabindex="0" class="pk cn tabIc" data-f="Sword" title="Sword"><img class="si" src="images/skills/sword-v2.png"><span class="tabT">Sword</span></a>
      … Spear, Axe, Bow, Gauntlet, Black Magic, White Magic …
    </span>
    <input id="mf" type="search" placeholder="Search name, license, skills, abilities…">
    <button id="mx" class="pk" aria-label="Close"><span>✕</span></button>
  </div>
  <div id="mc"><table class="classModal"><tbody>
    <tr><td><span class="rc active" data-v="Commoner">
        <img class="ci" src="images/classicons/female/Commoner.webp">
        <span class="classListMovement"> <img class="si" src="images/skills/infantry-flat.png" title="Infantry"></span>
        <span class="rcCont"><span>Commoner</span></span>
        <span class="classListWeaponTypes"><span class="sw"><img class="si" src="images/skills/sword_bane-v2.png"></span>…</span>
      </span></td><td></td><td></td><td></td><td></td></tr>
    <tr><th colspan="5" data-gname="Beginner License"><small>Beginner license · Lv. 5 · Renown 1</small></th></tr>
    <tr><td><span class="rc" data-v="Gladiator">…</span></td> … 5칸 …</tr>
    …
  </tbody></table></div>
</div></div>
```

**틀**
- 덮개: `position:fixed; inset:0; z-index:9; background:rgba(0,0,0,.55); backdrop-filter:blur(4px); padding:8px; display:flex; align-items:flex-start; justify-content:center`.
- 판 `.mb`: 8,8 · 1424×884, 바탕 `#142324` + 3조각 그림 틀(앞 문서 §5.14).
- 머리 `.mh`: `display:flex; flex-wrap:wrap; gap:4px; min-height:48.5px; padding:6.9px 48.2px 7.8px 14.4px`.
  - 제목 `#mtl`: 15px 700, `padding-right:10px`.
  - 거르기 탭 `#mtb`: `display:flex; flex-wrap:wrap; gap:1px; justify-content:center; flex:1 1 auto`. 탭 글 15.84px, `padding:2.6px 14.9px`, 높이 28.5px. 안 고름 글 `#d2c6af`, 고름 `.on` 글 `#fff4d9` + 3조각 알약 그림(`buttonLeft.png` + `buttonCenter.png`). 아이콘 15.8px.
  - 검색 `#mf`: 250×28.5px, 2px `#484e44` 테두리, 바탕 `#192d34`, `margin-left:auto`. 이름·면허·숙련·능력으로 찾는다.
  - 닫기 `#mx`: 오른쪽 끝 정사각.
- 본문 `#mc`: `overflow:auto; margin:0 1v 1v`.

**목록 `table.classModal`**
- `width:auto; margin:0 auto`(가운데). 1440에서 288,56 · 854폭. `td`·`th` 테두리·여백 0.
- 한 줄에 5칸. 칸 폭 156.4px. 직업을 **세로로 채운다**(같은 열 = 같은 계통: 1열 검·격투 계열, 2열 활, 3열 마법, 4열 창·기병, 5열 비행 — 화면에서 확인).
- 묶음 제목 `th[colspan=5]`: `padding:12px 0 2px; text-align:center`. 글 `small` 13.8px `#acaab9`. 형식 `Beginner license · Lv. 5 · Renown 1`.
  - 묶음: (맨 위 고유 직업) → Beginner(Lv.5·명성 1) → Specialty(Lv.20·명성 4) → Advanced(Lv.35·명성 8) → Elephant(Lv.35·3부) → Master → Divine.
  - 3부 묶음은 제목과 타일 모두 "Click to reveal (Part III)" 흐림 덮개.

**직업 타일 `.classModal .rc`**

| 항목 | 값 |
|---|---|
| 틀 | `display:flex; position:relative; gap:4px; padding:0 8px 0 0; margin:0 8px 4px; line-height:2em`(30px)`; border:2px solid #39484f; background:#192d34; border-radius:0; cursor:pointer` → 140.4×34px |
| 고른 직업 `.active` | 바탕 `#3b453a`, 테두리 `#60593e` |
| 직업 그림 `.ci` | 30×30px(`2em`), `image-rendering:pixelated`, 여백 0. 타일 왼쪽 끝에 붙음 |
| 이름 `.rcCont` | 15px, `white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:1; text-align:left; z-index:1` |
| 이동 아이콘 `.classListMovement` | `position:absolute; left:0; top:0; transform:scale(.55); transform-origin:top left` → 18px 그림이 9.9px로. 직업 그림 왼쪽 위에 겹친다. 세로로 쌓임(기병+중장이면 위·아래 2개) |
| 숙련 아이콘 `.classListWeaponTypes` | `position:absolute; right:0; top:0; transform:scale(.55); transform-origin:top right` → 한 개 9.9px. 타일 오른쪽 위에 작게 줄지음. Commoner·Noble은 숨김 |
| 숙련 아이콘의 강점·약점 | **지금 고른 인물 기준으로 그림이 바뀐다**(티알라로 열면 Sword는 `sword_bane-v2.png`, Black Magic은 `black_magic_boon-v2.png`). 그래서 "이 인물에게 맞는 직업"이 금색 점으로 한눈에 보인다 |

타일을 누르면 창이 닫히고 그 직업이 선택된다. 타일에 수치·능력은 없다(이름과 아이콘뿐).

**거르기·검색**: 탭 8개(All + 무기 7종)로 그 숙련을 쓰는 직업만 남긴다. 검색은 글자 넣는 즉시.

**390 화면**(8,8 · 374×828)
- 머리가 3줄로 접힌다(78.5px): 제목 + 닫기(23.6×23.6) / 탭(글 숨기고 아이콘만, `.tabT{display:none}`, 아이콘 19.6px) / 검색(250×22).
- 목록은 `tr{display:flex; flex-wrap:wrap}` + `td{flex-basis:max(33.3%, min(50%, 200px))}` + 빈 칸 숨김 → **2열**(칸 179px, 타일 163×34).
- 글 15px 그대로(창은 무대 축소 밖). 직업 그림 30px. 누를 곳 높이 34px.
- 5열이 2열로 접히면서 "같은 열 = 같은 계통" 줄맞춤은 사라진다.

### 4.2 직업 팝업 `#idp` — `?item=light-cavalry`

틀·머리·덮개·닫기는 §3.10 물품 팝업과 **완전히 같다**(560px, 9조각). 1440에서 440,206 · 560×487.6.

**DOM(본문)**
```html
<span class="idHead"><img class="ci" src="images/classicons/male/Light_Cavalry.webp">
  <span><h1>Light Cavalry</h1><small>Specialty class</small></span></span>
…
<div class="idStats">
  <span><small>Level</small><b>20</b></span>
  <span><small>Renown</small><b>4</b></span>
  <span><small>License</small><b>Specialty</b></span>
  <span><small>Mov</small><b>6</b></span>
  <div class="idSelect"><button class="pk shBtn" type="button" data-select-cl="Light Cavalry">Select class</button></div>
</div>
<div class="idReq"><small>Requires</small> <span class="sw"><img class="si" src="images/skills/riding-v2.png"></span><span class="rk">D</span></div>
<div class="idReq"><small>And one of</small> <span class="sw"><img …spear-v2.png></span><span class="rk">C</span><span class="sw"><img …sword-v2.png></span><span class="rk">C</span></div>
<div class="idSec idSec-base-stats-growths"><h3>Base stats &amp; growths</h3>
  <div class="idGrowth" style="--n:10">
    <span style="background:rgba(46,160,90,0.28)"><small>HP</small><small>+1</small>10%</span>
    <span style="background:rgba(229,72,77,0.14)"><small>Mag</small><small>0</small>-5%</span> … <span …><small>Total</small><small>+6</small>35%</span>
  </div></div>
<div class="idSec idSec-min-stats"><h3>Min. stats</h3><small>HP <b>28</b>, Str <b>10</b>, Spd <b>10</b>, …</small></div>
<div class="idSec idSec-skills"><h3>Skills</h3>
  <span class="chp"><img class="si" src="images/skills/sword-v2.png"></span>
  <span class="chp"><span class="sw"><img class="si" src="images/skills/spear-v2.png"><i class="bn">+1</i></span></span> …
</div>
<div class="idSec idSec-abilities"><h3>Abilities</h3>
  <div class="idNote"><a href="/?item=bolster-health" class="lmItem" data-item="Bolster Health"><img class="si" src="images/abilities/bolster-health-v2.png">Bolster Health</a>
    <span class="srcK">Mastery</span><br><small>Grants max HP+3.</small></div>
  <div class="idNote">… Mount/Dismount <span class="srcK">Inherent</span><br><small>…</small></div>
</div>
```

**구역별 수치**

| 구역 | 값 |
|---|---|
| 머리 그림 | 직업 점 그림 32×32px(원본 64×64), `image-rendering:pixelated`. 종류 글 `Specialty class` 13px `--mut` |
| 수치 칩 4개 | 물품 팝업과 같은 칩(2px `#39484fc4` 테두리, 바탕 `#192d34c7`, 최소 폭 50px, 윗글 11px·값 15px 700). Level · Renown · License · Mov |
| "Select class" 단추 | 칩 줄의 오른쪽 끝(`.idSelect{margin-left:auto}`). 3조각 알약 그림 단추: `min-height:36px; min-width:120px; padding:0 26px; font-size:16px; letter-spacing:.04em; color:#fff4d9` → 143.8×36px. 호버 `--glow` + `brightness(1.12)` |
| 조건 줄 `.idReq` | `display:flex; align-items:center; gap:4px; flex-wrap:wrap; margin:4px 0`. 앞 글 `small` 13.8px `--mut`("Requires" / "And one of"). 숙련 아이콘 18×18 + 등급 동그라미 |
| 등급 동그라미 `.rk` | 16.9×16.9px 원, `border:1px solid #ffe8c4; border-radius:50%; font-size:.75em`(11.25px), 바탕 없음, 아이콘 바로 뒤(`.idReq .sw{margin-right:-4px}`) |
| 성장 칸 `.idGrowth` | `display:flex; flex-wrap:wrap; width:100%`. 칸 10개(능력 9 + Total), 각 `flex-grow:1; max-width:20%; padding:3px 2px`, 세로 3단 가운데 정렬 → 한 칸 약 52×48.8px |
| 성장 칸 안 3단 | ① 능력 이름 `small` 11px `--mut` ② 기본 수치 덤 `small` 11px(`+1`, `0`) ③ 성장률 14px `#ffe8c4`(`10%`, `-5%`) |
| 성장 칸 바탕 | 값이 양수면 초록 `rgba(46,160,90, α)`, 음수면 빨강 `rgba(229,72,77, α)`. 실측 α: 5% → .14, 10% → .28, −5% → 빨강 .14, Total 35% → .16. 0%는 바탕 없음. 능력 칸은 `min(.55, |값| / 20 × .55)`와 맞아떨어진다(app.js의 `getGrowthCellBackground(val, base, scale)` 꼴, 상한 .55). Total 칸의 나누는 수는 확인하지 못했다(추정: 더 큰 수) |
| 최소 수치 | 한 줄 글. 13.8px `--mut`, 숫자만 `<b>` 굵게(색 `#c3c2ca`) |
| 숙련 `.chp` | `display:inline-flex; margin:4px`. 아이콘 22.5×22.5px(`1.5em`). 덤 숫자 `.bn`: 10px, 폭 16.7px, `right:-6px; top:-5px; transform:scale(.9)`, 검정 67% 원 + 1px `#ffe8c4` 테두리 |
| 능력 `.idNote` | 능력 아이콘 18×18(원본 40×40) + 이름(점선 밑줄, 누르면 능력 팝업) + 종류 `.srcK` 13.8px `--mut`("Mastery" / "Inherent") + 줄바꿈 + 효과 `small` 13.8px `--mut`. 둘째부터 `margin-top:8px` |

**직업 팝업에는 강점·약점 그림을 안 쓴다**(직업 자체 정보라서 보통 그림만).

**구역 순서**: 수치 칩(+고르기 단추) → 조건 2줄 → 기본 수치·성장 → 최소 수치 → 숙련 → 능력.

**자료 `DATA.classes[]`** (Light Cavalry 그대로)
```json
{"name":"Light Cavalry","tier":"Specialty","license":"Specialty","type":["cavalry"],"examples":"Cai, Lysander","mov":6,
 "bases":{"HP":1,"Str":1,"Mag":0,"Spd":1,"Dex":0,"Def":2,"Res":0,"Lck":0,"Cha":1},
 "baseStats":{"Str":10,"Spd":10,"Dex":10,"Def":10},
 "minimums":{"HP":28,"Str":10,"Spd":10,"Dex":10,"Def":10,"Res":3,"Lck":8},
 "growth":{"HP":10,"Str":5,"Mag":-5,"Spd":5,"Dex":0,"Def":5,"Res":0,"Lck":5,"Cha":10},
 "skills":{"Sword":0,"Spear":1,"Axe":0,"Riding":2,"Infantry":0},
 "abilities":[{"n":"Mount/Dismount","ef":"Allows use of Mount and Dismount commands."}],
 "master":{"n":"Bolster Health","ef":"Grants max HP+3."},
 "primary":[["Riding","D"]],"secondary":[["Spear","C"],["Sword","C"]],
 "level":20,"renown":4,"mount":"Horse"}
```
| 필드 | 화면에서 |
|---|---|
| `level`, `renown`, `license`, `mov` | 수치 칩 4개 |
| `tier` | 머리의 "Specialty class" |
| `primary` | "Requires" 줄(모두 필요) |
| `secondary` | "And one of" 줄(하나만 필요) |
| `bases` / `growth` | 성장 칸의 가운데 줄 / 아랫줄 |
| `minimums` | 최소 수치 줄 |
| `skills` | 숙련 아이콘. 값이 0 아니면 `+N` 동그라미 |
| `master` | 능력 줄 "Mastery" |
| `abilities[]` | 능력 줄 "Inherent" |
| `type[]` | 이동 아이콘(infantry·armored·cavalry·flying) |
| `mount` | 인물 카드의 탈것 줄 기본 그림 |
| 그 밖 | `examples`, `tiers`, `restrictions`, `gender`, `licenseItem`, `note`, `dlc` (일부 직업만) |
- 직업 65개. `tier`: Unique·Beginner·Specialty·Advanced·Master·Divine. `license`: N/A·Beginner·Specialty·Advanced·Elephant·Master·Divine.

### 4.3 직업 목록 표 `/classes/` (팝업이 열리는 곳, 참고)

- 창 `#cmp.modalall.modalWc`, 판 1424×884. 머리: 제목 "Classes" + 탭 8개(All·무기 7종, 각각 진짜 주소 `/sword-classes/` 등) + Sort 단추 + 검색.
- 표 16열: Name(215.6폭, 왼쪽 정렬, 직업 그림 29.5px + 굵은 이름 + 이동 아이콘) · License · Skills(아이콘 18px, 2줄) · Mov · HP · Str · Mag · Spd · Dex · Def · Res · Lck · Cha · Total · Requirements(아이콘+등급 동그라미, 아래 `Lv. 5 · Renown 1`) · Abilities(능력 아이콘 + 이름).
- 성장 칸: 폭 46px, 위에 기본 수치 덤(`small` 14.7px `--mut`), 아래 성장률(16px). 바탕은 팝업과 같은 초록/빨강 농도.
- 줄 높이 43.3px, 표 머리 35.7px(달라붙음).
- 직업 59줄(나머지는 3부 가림).

### 4.4 우리 사이트로 옮길 때(자문)

- 고르기 창의 핵심 발상: **타일 오른쪽 위 작은 숙련 아이콘이 "지금 인물의 강점이면 금색"**. 직업 추천을 글 없이 색 점으로 보여 준다. 사용자의 "글보다 그림" 선호와 잘 맞는다.
- 직업 팝업의 핵심 발상: 성장률 10칸을 **칸 바탕의 초록·빨강 농도**로 보여 준다. 숫자를 안 읽어도 "어디가 오르고 어디가 내리는지" 보인다.
- 고칠 것: 타일의 아이콘이 9.9px라 휴대폰에서 못 알아본다. 우리 쪽은 타일을 키우고(높이 44px 이상) 아이콘을 18px 이상으로.
- 우리 `shadcn` 부품으로는 `Dialog`(팝업)·`Sheet`(휴대폰 아래에서 올라오는 창)·`ToggleGroup`(무기 거르기)·`Command`(검색) 조합이 가장 가깝다. 어떤 부품을 쓸지는 코드 담당 판단.

---

## 5. 그림 주소 전부(종류별 규칙)

기준 주소 `https://yuphastemple.com/`. 아래 경로는 모두 그 뒤에 붙는다. 이름 바꾸는 규칙에서 "공백→`_`"는 `Sha Lan` → `Sha_Lan`, slug는 §3.10의 `itemSlug`.

### 5.1 인물

| 종류 | 규칙 | 크기·형식 | 쓰는 곳 | 확인 |
|---|---|---|---|---|
| 큰 초상화 | `images/characters/<이름, 끝 괄호 떼고 공백→_>.webp?v=3` | 500×500 webp | 인물 카드 오른쪽 | 73명 주소 규칙 확인(전부 불러 보진 않음) |
| 작은 상반신 | `images/charactersthumb/<같은 이름>.webp?v=25` | 120×120 webp | 지원 표 인물 칸, 인물 고르기 타일, 영입 목록 | 73명 중 **5명 없음**: Credna, Kalla, Cleobulus, Myson, Gladius |
| 얼굴(가로) | `images/faces/<같은 이름>.png?v=2` | 96×64 png | 팝업의 얼굴 줄 `a.lr`, 표의 얼굴 칸 | 73명 중 **1명 없음**: Gladius |
| 소속 문장 | `images/factions/<파일>.webp` (§1.3 표, 15개 파일) | 320×320 webp | 카드 뒤, 인물 타일 뒤 | linaria-dewdrops 확인 |

인물 73명(`DATA.characters[].name`): Alexandra, Anatolia, Aswan, Benditz, Bertrand, Bonaventure, Buccar, Cai, Catania, Centurio, Creek, Dadao, Dante, Diego, Dietrich, Eshmel, Esmeralda, Fabio, Fianna, Gaitz, Goliath, Guzran, Halvin, Hong Hua, Inyoni, Io, Jasmine, Jester, Kiroc, Klapka, Leda, Lilian, Loretta, Ludia, Lysander, Majide, Mikaela, Mu, Nathan, Nezha, Ninae, Noctula, Nuzzuo, Nydine, Olympia, Orchel, Peppe, Peter, Seteth, Sha Lan, Simon, Sirocco, Sofia, Tahonia, Talimun, Theodora, Tialla, Tobias, Troy, Ultand, Ursula, Yang Jie, Zarcone, Aurora, Smyrnos, Jurah, Mars, Credna, Kalla, Cleobulus, Myson, Anna, Gladius. (고르기 목록에 나오는 것은 앞 63명.)

### 5.2 숙련(무기·이동) 아이콘

| 종류 | 규칙 | 크기 |
|---|---|---|
| 보통 | `images/skills/<skill>-v2.png` | 34×34 (riding은 30×30) |
| 강점 | `images/skills/<skill>_boon-v2.png` | 34×34 (flying은 30×30) |
| 약점 | `images/skills/<skill>_bane-v2.png` — 예외 `images/skills/authority_bane.png`(108×108) | 34×34 (armor·riding은 30×30) |
| 납작(네모 없음) | `images/skills/<infantry|riding|armor|flying>-flat.png` | 직업 줄·직업 타일의 이동 표시 |
| 전체 | `images/skills/all.png` | 직업 목록의 "All" 탭 |

`<skill>` 12개: `sword`, `spear`, `axe`, `bow`, `gauntlet`, `black_magic`, `white_magic`, `authority`, `infantry`, `riding`, `armor`, `flying`. 36개(12×3) 모두 존재 확인.

### 5.3 직업·탈것

| 종류 | 규칙 | 크기 |
|---|---|---|
| 직업 점 그림 | `images/classicons/<female|male>/<직업 이름, /는 지우고 공백→_>.webp` | 64×64 webp. 목록 `window.CLASS_ICONS`에 128개(여·남 각각). 여자만 있는 것: `Celestial_Trooper`, `Wing_Soldier` |
| 탈것 작은 그림 | `images/mountsthumb/<탈것 이름 또는 종, 공백→_>.png` | 30×30 png (예 `Horse.png`) |
| 탈것 큰 그림 | `DATA.mounts[].img` = `images/mounts/<slug>.webp` | (이번 네 화면에는 안 나옴) |

### 5.4 물품·선물·음식

| 종류 | 규칙 | 크기 |
|---|---|---|
| 선물 아이콘 | `images/items/gift_common-v2.png` · `gift_uncommon-v2.png` · `gift_rare-v2.png` | 40×40 |
| 그 밖 물품 아이콘 | `MAP_ITEMS[<이름>].icon`에 경로가 그대로 들어 있다. 종류: `images/items/{vegetable,fish,meat,ore}_{common,uncommon,rare}-v2.png`, `treasure-v2.png`·`treasure_rare-v2.png`·`treasure_very_rare-v2.png`, `ring.webp`, `shield.webp`, `staff.webp`, `mask.webp`, `elixir.webp`, `link.webp`, `crate.webp`, `scroll.webp`, `key.png`, `quest_item.png`, `material_box.png`, `building_materials.png`, `magic_echo_shard.png`, `uai_<slug>-v2.png`(9개), `images/icons/license_{beginner,advanced,other}-v2.png`, `images/cursed/{mask,ring,shield,staff}.webp` | 40×40(확인한 것 기준) |
| 무기 종류 아이콘(물품용) | `images/items/{sword,spear,axe,bow,gauntlets,black_magic,white_magic}.webp`, 저주 무기 `images/cursed/{sword,spear,axe,bow,gauntlets}.webp` | |
| 음식 사진 | `MAP_ITEMS[<이름>].img` = `images/meals/<slug>-v2.webp` (12개: charred-fish-grill, cheese-coated-crayfish, coffee-berry-paste, fish-sauce-soup, garlic-seared-scallops, goat-roast, honey-poached-pear, **mazadins**(이름은 Madazins인데 파일은 철자가 다름), pumpkin-soup, salt-crusted-ham, sand-boar-and-beans, sweet-and-sour-stick-bugs) | 225×225 webp |
| 선물 등급 리본 | `images/gifts/giftLoved.png`, `images/gifts/giftLiked.png` | 247×50 png |
| 음식 등급 리본 | `images/foodHeaders/great.png?v=2`, `good.png?v=2`, `bad.png?v=2` | 177×71 png |
| 물품 지도 그림 | `images/map-items/<itemSlug>.webp?h=<pictures.json의 "map-items/<slug>" 값>` | 300×300 webp |
| 지도 핀 | `images/map/pin_settlement_large.png` 등(`MAP_CONFIG.icons`) | 100×100 png |
| 능력 아이콘 | `images/abilities/<slug>-v2.png`("+"는 `-plus`). 목록 `window.ABILITY_ICONS` 1,038개. 없으면 `images/abilities/_empty…`, 보조 기술은 `images/arts/assist-v2.png` | 40×40 png |
| 하트 | `images/icons/hearts/<1~5>.png`, 탈것용 `mount5` | 39×29 png |

### 5.5 틀·바탕(네 화면에서 쓰는 것)

| 종류 | 주소 | 크기 |
|---|---|---|
| 팝업 9조각 | `images/popup/{top-left,top-center,top-right,middle-left,center,middle-right,bottom-left,bottom-center,bottom-right}.webp` | 모서리 168×88, 위·아래 가운데 48×88, 좌·우 168×48, 가운데 24×24 |
| 단추 질감 | `images/tileBg3.png` | 574×368 |
| 알약 단추 | `images/buttonLeft.png`, `images/buttonCenter.png` | 18(20)×36, 1×36 |
| 전체 창 틀 | `images/listTop.png`, `images/listCenter2.png`, `images/listBottom.png` | 1814×244 / 1814×798 / — |
| 표 머리 바탕 | `images/headerBG.png` | 1770×54 |
| 후원 그림 | `images/kofi_symbol.png` | |

### 5.6 꼭 지킬 것(저작권)

- 초상화·얼굴·직업 점 그림·숙련 아이콘·문장·음식 사진은 **게임에서 딴 그림**이다. 권리는 게임 회사에 있다. 그 사이트도 라이선스 글이 없다.
- 팝업 틀·단추·리본 같은 그림은 그 사이트가 만들었거나 게임에서 딴 것이고, 역시 허락 글이 없다.
- 그러므로 **그 사이트 서버의 주소를 우리 화면에서 직접 불러 쓰면 안 된다**(남의 서버 자원을 쓰는 일이기도 하다). 위 주소 규칙은 "어떤 그림이 몇 벌 필요한지" 목록을 세는 데 쓰고, 실제 그림을 어디서 가져올지는 사용자가 정해야 한다(질문 필요: 게임 화면에서 직접 따기 / 우리 식 그림으로 새로 그리기 / 그 사이트 운영자에게 허락 받기).
- CSS·JS 글도 그대로 복사하지 않는다. 이 문서의 수치와 기법만 참고해 새로 쓴다.

---

## 6. 사용자에게 물어야 할 것(사양에 없는 결정)

| # | 물음 | 선택지 | 추천 |
|---|---|---|---|
| 1 | 그림은 어디서 가져오나 | ㉠ 게임 화면에서 직접 따기 ㉡ 새로 그리기 ㉢ 그 사이트 운영자에게 허락 받기 | ㉠ (그 사이트 주소 직접 쓰기는 안 됨) |
| 2 | 강점·약점 표시 | ㉠ 그림 세 벌(금색/보라) 그대로 ㉡ 그림 한 벌 + CSS 바탕색 + ▲▼ 표식 | ㉡ (색만으로 알리지 않음, 그림 수 1/3) |
| 3 | 지원 등급 표시 | ㉠ 글자 그대로(C B A) ㉡ 동그라미 배지 3칸 고정 자리 | ㉡ (글보다 그림) |
| 4 | 물품 팝업의 지도 단추 | ㉠ 지도 화면까지 만들기 ㉡ 얻는 곳을 글·아이콘으로만 | ㉡ 먼저, 지도는 따로 계획 |
| 5 | 휴대폰에서 인물 카드 크기 | ㉠ 원본처럼 축소(글 9~12px) ㉡ 우리 규칙(글 18px, 누를 곳 44px)으로 다시 배치 | ㉡ |
| 6 | 직업 고르기 창 | ㉠ 전체 화면 타일 창 ㉡ 휴대폰은 아래에서 올라오는 창 + 큰 타일 | ㉡ |
