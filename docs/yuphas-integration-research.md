# yuphastemple 연동 조사 보고서 (2026-11-26)

작성: Fable 5.2(자문, 코드 안 씀). 기준 코드: `main` 커밋 `255a7df`.
조사 방법: 내장 브라우저로 yuphastemple.com을 열어 `data/app.js`, `data/loader.js`, `data/map.js`, `data/*.json`을 **읽기만** 했다(디스크에 받지 않음). 우리 저장소는 읽기만 했다. `hive` 명령은 쓰지 않았다.

사용자 새 방향 세 가지:

- A. 물품·재료·선물·좋아하는 음식·지원·지도는 우리가 다시 적지 않고 yuphastemple 쪽으로 새 탭 링크를 건다. 링크마다 한국어 이름과 영어 이름을 함께 보인다.
- B. 어두운 화면만 남긴다.
- C. 근거·기록용 글은 화면에서 빼고 `docs/`로 옮긴다. `archive/`는 건드리지 않는다.

표시 약속: **확인** = 이번에 직접 열어 보거나 코드로 맞춰 본 것. **미확인** = 직접 확인하지 못한 것.

---

## 1. yuphastemple 주소 규칙

### 1.1 한 줄 요약

주소의 **경로 조각**(`/a/b/`)과 **물음표 뒤 값**(`?item=`, `?q=`)을 한 줄로 이어 붙여 읽는 한 쪽짜리 사이트다. 경로 첫 조각이 인물 이름이면 인물 쪽, 목록 이름이면 목록 창, `map`이면 지도다. `?item=`은 **어느 주소에나 붙일 수 있고**, 붙이면 그 물품 팝업이 바로 열린다(확인).

근거 코드(`loader.js`): `routeQs()`가 경로 조각과 검색 문자열을 `&`로 잇고, `routeUrl()`이 `=`가 없는 조각은 `/조각/`으로, `=`가 있는 조각은 `?` 뒤로 보낸다.

### 1.2 쪽 종류

| 종류 | 주소 꼴 | 예 | 확인 |
|---|---|---|---|
| 첫 쪽 | `/` | — | 확인 |
| 인물(기본 탭 = Abilities) | `/<인물>/` | `/tialla/` | 확인 |
| 인물 탭 | `/<인물>/<탭>/` | `/tialla/liked-gifts/`, `/tialla/supports/` | 확인 |
| 인물 + 병종·탈것 | `/<인물>/<병종>/<탈것>/<탭>/` (병종·탈것은 빼도 됨) | `/alexandra/gladiator/` | 코드로만 확인 |
| 목록 창 | `/<목록>/` | `/gifts/`, `/meals/`, `/all-items/` | `/meals/` 확인 |
| 목록 안 종류 | `/<목록>/<종류>/` | `/item-weapons/axe/` | 코드로만 확인 |
| 물품 팝업 | 아무 주소 + `?item=<물품 슬러그>` | `/?item=gift-box`, `/tialla/liked-gifts/?item=tales-of-the-arena`, `/meals/?item=pumpkin-soup` | 확인(팝업이 바로 열리고 제목이 "Tales of the Arena - Gift"로 바뀜) |
| 지도 | `/map/` | — | 확인 |
| 지도 + 검색 | `/map/?q=<영어 이름>` | `/map/?q=Tales%20of%20the%20Arena` | 확인(그 물품이 있는 곳만 표시) |
| 지도 + 장소 | `/map/<장소>/` | `/map/grand-aragon/`, `/map/kothar-lake/` | 확인 |
| 지도 + 루트 + 장소 + 검색 | `/map/<루트>/<장소>/?q=<이름>` | `/map/theodora/grand-aragon/?q=Tales%20of%20the%20Arena`, `/map/part-3/dagsion/` | 확인 |
| 지도 + 종류 | `/map/<루트>/<핀 종류>/` | `/map/cai/horses/` | 코드 주석으로만 확인 |

**인물 탭 이름(전부)**: `recruitment`, `liked-gifts`, `bird-time`, `supports`, `builder`(능력치 계산기), `build`, 그리고 `profile`. 탭 없이 `/<인물>/`이면 Abilities다.

- **선물과 좋아하는 음식은 같은 탭**이다. `gifts.json`의 인물 한 명 안에 `gifts`(좋아함·매우 좋아함), `loved_meals`, `liked_meals`, `neutral_meals`, `disliked_meals`, `liked_plays`, `disliked_gifts`, `disliked_categories`가 함께 있고 모두 `/…/liked-gifts/`에 나온다. 그러므로 "좋아하는 음식" 링크도 `/<인물>/liked-gifts/`로 건다.
- 지원은 `/<인물>/supports/`.

**목록 이름(전부, `MODAL_ROUTE_MAP` + `LISTS_MAP`)**

- 인물: `characters`, `growths`, `personal-abilities`, `base-stats`, `boons`, `ability-finder`, `blaze-abilities`
- 영입: `recruiting`, `cai-recruitment`, `dietrich-recruitment`, `leda-recruitment`, `theodora-recruitment`, `fastest-recruitment`
- 물품: `all-items`, `gifts`, `consumables`, `meals`, `other-items`, `ores`, `manuals`, `crates`, `vegetables`, `fish`, `meat`, `equipment`
- 무기·마법: `weapons`, `item-weapons`, `swords`, `spears`, `axes`, `bows`, `gauntlets`, `magic`, `spells`, `black-magic`, `white-magic`, `assist-magic`, `scrolls`
- 기술·능력: `arts`, `sword-arts`…`armor-arts`, `abilities`, `authority-abilities`…`flying-abilities`
- 병종·탈것·군단: `classes`, `class-minimums`, `sword-classes`…`white-magic-classes`, `mounts`, `items-mounts`, `ornius`, `horse`, `pegasus`, `bau`, `elephant`, `battalions`, `items-battalions`, `physical-battalions`…`magical-battalions`
- 지도 루트 조각: `cai`, `dietrich`, `theodora`, `leda`, `part-3`

### 1.3 슬러그(주소용 이름) 만드는 법

`app.js` 35~41줄 그대로다.

1. **일반 슬러그**(`createSlug`, 인물·장소·병종·탭): 악센트를 벗긴다(`Fódlan` → `Fodlan`, `Aguiño` → `Aguino`) → 소문자 → 영문·숫자가 아닌 것은 모두 `-` 하나로 → 앞뒤 `-` 제거.
   - `Hong Hua` → `hong-hua`, `Yang Jie` → `yang-jie`, `Sha Lan` → `sha-lan`, `Grand Aragon` → `grand-aragon`
2. **물품 슬러그**(`itemSlug`, `?item=` 값): 먼저 `'`와 `’`를 **지우고**, `+`를 ` plus`로 바꾼 다음 일반 슬러그를 만든다.
   - `Lulu's Spear` → `lulus-spear`, `Build+` → `build-plus`, `Blue-Rose Bouquet` → `blue-rose-bouquet`, `Special “Medicine”` → `special-medicine`, `Silver Bow+3` → `silver-bow-plus3`
3. **주의(미확인)**: 아포스트로피를 지우는 것은 물품 슬러그뿐이다. 규칙대로면 장소 `Nowah's Cave`는 `nowah-s-cave`가 된다. 지도는 슬러그가 안 맞으면 이름으로 다시 찾는 `findLocation`이 있어 다른 꼴도 열릴 가능성이 높지만, 구현 때 아포스트로피가 든 장소 한 곳을 실제로 열어 확인할 것.
4. 옛 물품 꼴(`lulu-s-spear`, `f-dlan-tea`)도 아직 열린다(옛 링크 보호).
5. 없는 물품이면 팝업에 "There is no item called …"과 비슷한 이름이 뜨고, **서버 응답이 404**다(확인). → 링크 검사 스크립트가 응답 코드만 보고 깨진 링크를 잡을 수 있다.

우리 쪽에 필요한 코드는 이 두 함수(각 1줄)뿐이다. 이름표 파일에 슬러그를 미리 적어 두면 실행 때 계산할 필요도 없다.

### 1.4 물음표 뒤 값

| 값 | 뜻 | 비고 |
|---|---|---|
| `item=<슬러그>` | 물품 팝업을 바로 연다 | 물품·무기·마법·능력·기술·탈것·군단·병종 이름 전부(약 1,577개) |
| `q=<글자>` | 지금 화면의 검색칸 값. 지도에서는 물품·장소 검색 | 영어 이름을 그대로 넣고 주소 인코딩(`%20`) |
| `b=<글자>` | 능력치 계산기·빌드 상태 | 우리와 무관 |
| `t=`, `c=`, `m=` | 옛 꼴의 탭·병종·탈것 | 쓰지 않음 |
| `bugReport=on` | 그 사이트 내부용 | 쓰지 않음 |

지도에서 `?q=`와 장소를 함께 주었는데 그 장소에 그 물품이 없으면, 검색을 버리고 장소만 연다(코드 확인).

### 1.5 자료 파일과 수량

| 파일 | 내용 | 수량 |
|---|---|---|
| `data.json` | 인물·병종·탈것·기술·군단 등 | 인물 63명 |
| `gifts.json` | 인물별 선물·음식·연극 선호 | — |
| `supports.json` | 인물별 지원 단계와 조건 | — |
| `locations.json` | 장소 310곳(가게 재고·채집·루트별 차이), 지도 물품 501개 | 물품 종류: 선물 128, 장비 71, 채소 65, 물고기 28, 퀘스트 24, 상자 22, 광석 19, 교본 19, 음료 14, 전직 14, 음식 12, 고기 12 등 |
| `weapons.json` | 무기·단조·상자 | — |
| `ids.json` | 내부 번호(물품 655, 장소 310, 인물 73, 음식 12 …) | — |
| `strings.en.json` | 화면 글(영어만) | — |

**인물 63명(영어 이름 = 슬러그의 원형)**
Alexandra, Anatolia, Aswan, Benditz, Bertrand, Bonaventure, Buccar, Cai, Catania, Centurio, Creek, Dadao, Dante, Diego, Dietrich, Eshmel, Esmeralda, Fabio, Fianna, Gaitz, Goliath, Guzran, Halvin, Hong Hua(`hong-hua`), Inyoni, Io, Jasmine, Jester, Kiroc, Klapka, Leda, Lilian, Loretta, Ludia, Lysander, Majide, Mikaela, Mu, Nathan, Nezha, Ninae, Noctula, Nuzzuo, Nydine, Olympia, Orchel, Peppe, Peter, Seteth, Sha Lan(`sha-lan`), Simon, Sirocco, Sofia, Tahonia, Talimun, Theodora, Tialla, Tobias, Troy, Ultand, Ursula, Yang Jie(`yang-jie`), Zarcone.

물품 전체 이름(1,577개)은 양이 많아 여기 싣지 않는다. 우리에게 필요한 것은 "우리 글에 나오는 이름"뿐이고, 그 목록과 맞춘 결과는 2장에 있다.

### 1.6 한국어가 있는가

**없다(확인).** 모든 `data/*.json`에 한글이 한 글자도 없다. `loader.js` 주석에 "`strings.<lang>.json`, 지금은 en뿐. 게임 자료(이름·설명)는 아직 번역 대상이 아님"이라고 적혀 있다. 그래서 한국어 이름은 우리가 따로 가져와야 한다.

---

## 2. 한국어 ↔ 영어 이름표

### 2.1 어디서 가져오나

| 출처 | 무엇이 있나 | 믿을 만한가 |
|---|---|---|
| **우리 저장소 `assets/items/manifest.json`** | 한국어 이름을 열쇠로 한 물품 237개. 그중 212개에 `english` 값. 종류: 선물 116, 무기 55, 증서류 14, 재료 15, 마법 11, 물고기 8, 광석 5, 기타 | 이미 화면에 쓰는 이름. 출처 주소가 줄마다 있음 |
| **`content/data/affordable-gifts.json`** | 선물 64개에 `id`(= yuphas 슬러그), `english`, `korean`, `koreanSource`, `url`(yuphas `?item=` 주소). 인물 50명에 yuphas 인물 주소 | **이미 yuphas 슬러그를 쓰고 있다.** 새 이름표의 씨앗 |
| **`content/data/support-pairs-source.json`의 `names`** | 인물 60명 한국어 → 영어 | 60명 전원이 yuphas 인물 이름과 **글자까지 일치**(확인) |
| **`content/data/checklist-display-names.json`** | 영어 → 한국어 675줄. 장소 약 124곳, 무기 30여 개, 화면 낱말 | 원본 공략을 옮길 때 쓴 표 |
| **`content/data/team-korean-name-sources.json`** | 무기·마법 11개, 줄마다 출처·확인 날짜 | 좋음 |
| **한국어 도감 `fire-emblem-fortunes-weave.turam.dev/ko/`** (바깥 사이트) | 물품 557, 장소 302, 인물 69, 병종 60, 마법 45 등 총 1,854쪽. **주소 슬러그가 yuphas와 같은 영어 슬러그**(`/ko/entry/tales-of-the-arena/`)라서 영어↔한국어 다리로 쓸 수 있다. 같은 쪽의 영어판도 있다 | 우리 저장소의 한국어 이름이 원래 여기서 왔다(`koreanSource`). 다만 쪽마다 **"한국어: 임시 표기"** 표시가 붙은 것이 있다(예: `투기장 이야기 사본`). 임시 표기는 게임 화면에서 확인된 이름이 아니다 |
| yuphastemple | 영어 이름·슬러그의 정본 | 한국어 없음 |
| `archive/` | 원본 공략(한국어) | 읽기 전용. 영어 이름은 거의 없음 |

### 2.2 맞춰 본 결과(확인)

우리 저장소의 영어 이름을 yuphas의 이름 색인(`itemSlugIndex`, `LOCATIONS`, `CHARACTERS`)에 넣어 보았다.

| 묶음 | 우리 쪽 수 | yuphas에서 열림 | 비율 | 안 맞은 것 |
|---|---|---|---|---|
| 인물 | 60 | 60 | 100% | 없음. (yuphas에만 있는 인물: Eshmel, Klapka, Tahonia. 타호니아는 우리 지양 10명에 있으므로 이름표에 넣는다) |
| 선물 | 117 | 117 | 100% | 없음 |
| 재료(채소 등) | 15 | 15 | 100% | — |
| 물고기 | 8 | 8 | 100% | — |
| 광석 | 5 | 5 | 100% | — |
| 고기 | 2 | 2 | 100% | — |
| 소모품 | 2 | 2 | 100% | — |
| 무기(영어 이름 있는 것) | 45 | 45 | 100% | — |
| 마법(영어 이름 있는 것) | 2 | 2 | 100% | — |
| 증서류 | 11 | 10 | 91% | `Scales of Judgement` → yuphas는 `Scales of Judgment`(철자 차이. 우리 쪽 오타로 보임) |
| 기타 | 9 | 8 | 89% | `Custom Axle`(차축 부품): yuphas 색인에 없음 → **미확인**, 링크 없이 둔다 |
| 장소 | 124 | 118 | 95% | 아래 6곳 |

장소 118곳 중 13곳은 우리 표에 지방 이름이 덧붙어 있어(`Granada Fort Ruins Amalthea region`) 앞부분만 잘라 맞췄다. 안 맞은 6곳:

| 우리 표의 영어 | 한국어 | 판단 |
|---|---|---|
| `Panja Bay` | 판자만 | 같은 한국어가 `Pasha Bay`에도 있다. 우리 쪽 옛 표기로 보임 → `Pasha Bay`로 통합 후보(구현 때 확인) |
| `Talbos South Road` | (탈보스) | yuphas `Tarvos South Road`. 철자 차이로 보임 |
| `Kosharu Lake` | 코샬루 호수 | yuphas `Kothar Lake`(`/map/kothar-lake/` 열림 확인). 철자 차이로 보임 |
| `Azure Crystal Cave` | 벽정 동굴 | yuphas에 `Green-Crystal Caves`만 있음. 같은 곳인지 **미확인** |
| `Yu Phas's Temple` | 유 파스 신전 | yuphas 신전 목록에 없음(`Solel's Temple` 등 8곳). **미확인** |
| `Kroios Fort` | 콜로이오스 요새 | 맞는 이름 없음. **미확인** |

**영어 이름이 아직 없는 우리 물품 25개**(무기·마법 위주): 요도의 코등이, 삼차의 창, 전생의 연화, 반격의 건틀릿, 큰 곰의 오른 발톱, 킬 소드, 신자의 작살, 언월도, 다 미나의 창, 쇼트 스피어, 다 미나의 활, 배틀 보우, 트론, 셰이버, 데스, 루나, 엑스칼리버, 리브로, 리자이어, 엔젤, 레스큐, 워프, 사일런스, 사검 벨로키네, 정화의 검. → 한국어 도감에서 한 건씩 찾아 영어 슬러그를 얻는다. 못 찾으면 **미확인**(링크 없음).

**정리: 우리 글에 나오는 이름 기준으로**

- 지금 바로 링크 가능: 인물 60/60, 영어 이름이 있는 물품 212개 중 210개(99%), 장소 124곳 중 118곳(95%).
- 한국어 도감에서 더 찾으면 풀릴 것: 물품 25개, 장소 3곳(철자 차이).
- 미확인으로 남길 것: 차축 부품, 벽정 동굴, 유 파스 신전, 콜로이오스 요새.

화면에서 링크로 바뀌는 자리 수(파생 체크리스트 기준): 지도 링크 188개(지금은 모두 game8.co 지도), 재료 단추 74개, 인물 서랍의 싼 선물 칩(인물 50명), 비싼 선물 이름 30종.

### 2.3 제안하는 방법

1. **씨앗**: 위 저장소 파일 다섯 개를 합쳐 이름표 한 파일을 만든다(새로 지어내는 이름 없음).
2. **다리**: 영어 이름 → 슬러그는 1.3의 규칙으로 계산한다. 계산한 슬러그를 yuphas 주소로 한 번 열어 **응답 코드 200인지** 검사한다(없으면 404). 통과한 것만 `linkVerified: true`.
3. **한국어 확인 등급**(P09): `game`(사용자가 게임에서 봄) > `wiki`(한국어 도감 제목이 확정 표기) > `wiki-temp`(도감이 "임시 표기"라 적음) > `none`. `wiki-temp`와 `none`은 "미확인" 취급이다.
4. **빠진 25개**는 한국어 도감의 물품 목록(557개)에서 한국어 제목으로 찾는다. 사람이 한 건씩 확인해 넣는다(자동 추측 금지).
5. yuphas 자료를 우리 저장소에 **복사하지 않는다**. 이름표에는 우리 글에 나오는 이름만 넣는다(이름·슬러그뿐, 설명·수치 없음).

### 2.4 이름표 파일 위치와 모양

위치: `content/data/yuphas-names.json` (정본. 새 파일 `lib/yuphas.ts`가 읽어 링크를 만든다.)
이름표의 근거 기록(출처 주소·확인 등급)은 화면에 안 나오므로 같은 파일에 두어도 된다.

```json
{
  "reviewed": "2026-11-27",
  "site": "https://yuphastemple.com",
  "people": {
    "티아라": { "en": "Tialla", "slug": "tialla", "linkVerified": true }
  },
  "items": {
    "투기장 이야기 사본": {
      "en": "Tales of the Arena",
      "slug": "tales-of-the-arena",
      "kind": "gift",
      "aliases": [],
      "ko": "wiki-temp",
      "koSource": "https://fire-emblem-fortunes-weave.turam.dev/ko/entry/tales-of-the-arena/",
      "linkVerified": true
    },
    "차축 부품": { "en": "Custom Axle", "slug": null, "kind": "other", "ko": "wiki", "linkVerified": false }
  },
  "places": {
    "그랑 아라곤": { "en": "Grand Aragon", "slug": "grand-aragon", "ko": "wiki", "linkVerified": true },
    "벽정 동굴": { "en": null, "slug": null, "ko": "wiki", "linkVerified": false }
  }
}
```

- 열쇠는 **한국어 이름**(우리 글에서 찾는 말). `aliases`로 다른 표기를 묶는다(U49 "선물 이름은 한 이름").
- `slug: null`이면 링크를 만들지 않고 이름만 보인다.
- `kind`는 지금 `assets/items/manifest.json`의 값을 그대로 쓴다(배지 색 U15 유지).
- 주소는 저장하지 않고 만든다: 물품 `site + "/?item=" + slug`, 인물 `site + "/" + slug + "/" + 탭 + "/"`, 지도 `site + "/map/" + 루트 + "/" + 장소 슬러그 + "/?q=" + 영어 이름`.

검사(새로 필요): `scripts/yuphas-links-check.mjs`. ① 화면에 나오는 물품·장소 이름이 모두 이름표에 있는지 ② `slug`가 1.3 규칙으로 만든 값과 같은지 ③(배포 관문에서만, 네트워크) 주소가 200인지.

---

## 3. 링크로 바뀌는 우리 부품

### 3.1 바뀌는 자리

| 지금 | 파일 | 바꾼 뒤 |
|---|---|---|
| **재료 상세 서랍**(`MapSheet`: 지도 그림 + 단계 설명 + 기록 표) | `components/detail-sheets.tsx:13`, 여는 곳 `components/guide.tsx` | 없앤다. 재료 이름 칩이 곧 yuphas 링크 2개(물품 팝업, 지도) |
| **지도 미리보기**(`MapThumbnail`: 사진 + "지도 보기" 단추) | `components/detail-sheets.tsx:12` | 없앤다. "지도 ↗" 링크 한 개로 |
| **오른쪽 칸 "이 장의 재료"** | `components/context-rail.tsx:22` | 재료 이름 칩 목록(한국어/영어) + 지도 링크. 사진 없음 |
| **재료와 구매 화면의 재료 카드**(이름 + 미리보기 + `Records` 표) | `components/secondary.tsx:24`, 자료 `content/data/recruit-materials.json`(19종: 장소·방법·단계·그림) | 카드 한 줄: 이름(한/영) · 수량 · 누구 영입용 · [물품 ↗] [지도 ↗]. 입수 장소·단계 설명은 yuphas 팝업의 "How to get"이 대신한다. 우리만의 주의(예: "식사에 쓰지 말고 남긴다")는 할 일 문장에 이미 있으면 지우고, 없으면 한 줄만 남긴다 |
| **할 일 본문의 재료 단추**(`data-recruit-material`, 74곳) | `components/source-markup.tsx:53` | 서랍을 여는 단추 → yuphas 물품 링크 |
| **할 일 본문의 지도 링크**(`data-map-link`, 188곳, 전부 game8.co 지도) | `components/source-markup.tsx:55`, `assets/recruitment/map-links.json` | yuphas 지도 링크로 바꾼다(`/map/<루트>/<장소>/?q=<물품>`). 장소를 이름표에서 못 찾으면 링크 없이 장소 이름만 |
| **본문 속 물품 이름 배지**(`GameText`가 `assets/items/manifest.json` 이름을 찾아 배지로) | `components/game-text.tsx:75~` | 같은 배지를 링크로 감싼다. 한 곳만 고치면 할 일·인물·준비 글 전체에 적용된다 |
| **인물 서랍 "선물" 줄**: 싸게 살 수 있는 선물 칩, 비싼 선물 칩 | `components/people.tsx:66`, 자료 `lib/content.ts:41~45`, `content/data/affordable-gifts.json`, `content/data/people-display.json`의 `gifts` | 칩마다 yuphas 물품 링크. 줄 끝에 "선호 선물·음식 전체 ↗"(`/<인물>/liked-gifts/`) 한 개. 비싼 선물 줄은 6장 질문 1 참고 |
| **인물 서랍·카드**: 지원 | `components/people.tsx`(`PersonTags` 등) | "지원 조건 ↗"(`/<인물>/supports/`) 링크 한 개 추가 |
| **팀 인물 서랍** | `components/team.tsx:126~129` | 같은 두 링크(선호 선물, 지원) |
| **백마술 탭의 "공개 자료 ↗"(20개), "로컬 효과 근거 ↗"** | `components/team.tsx:101` | 마법 이름 자체를 yuphas `?item=` 링크로. 따로 선 출처 링크는 없앤다 |
| **기록 표의 `지도 표기` 줄**(`mapKey`) | `components/records.tsx:10` | 재료 카드가 한 줄이 되면서 사라진다 |

**그대로 두는 것**

- **"루트별 지원 대화" 문서**(190쌍을 네 루트에 나눈 우리 계획): yuphas에 없는 개인 계획이라 남긴다. 쌍 이름 옆에 yuphas `/<인물>/supports/` 링크를 달 수 있다. (6장 질문 4)
- 구매 계획·장별 골드: 개인 계획이므로 남긴다. 물품 이름만 링크가 된다.
- 병종·기능: 사용자가 말한 범위(물품·재료·선물·음식·지원·지도)에 없다. (6장 질문 6)

**함께 없어지는 파일(코드 작성자가 확인 후 정리)**: `assets/recruitment/*.jpg`(지도 사진), `assets/recruitment/map-links.json`, `recruit-materials.json`의 `images`·`steps`·`place`·`method`·`search`·`mapKey` 칸. 지우기 전에 `scripts/verify-image-parity.mjs`·`browser-check.mjs`의 그림 수 검사를 먼저 고쳐야 한다(4.3).

### 3.2 "한국어 이름 / 영어 이름"을 보이는 모양(제안값)

yuphas 화면 말씨(분해 보고서 2~3장: 본문 양피지색 `#ffe8c4`, 보조 글 `#acaab9`, 명조 글꼴, 모서리 0)를 따른다. 값은 **제안**이며 견본 승인 뒤 확정한다.

**(가) 이름 칩 — 기본 꼴(할 일 본문, 선물 줄, 재료 줄)**

```
[그림] 투기장 이야기 사본  Tales of the Arena ↗
```

- 한 덩어리 `<a target="_blank" rel="noreferrer">`. 지금의 `.game-badge`(종류별 바탕색 U15)를 그대로 쓴다.
- 한국어: 본문 크기(견본 기준 16px), 색 `--text`.
- 영어: 한 단계 작게(14px), 색 `--mut #acaab9`(판 바탕 대비 7.1:1), 기울임 없음, `lang="en"`. 한국어와 사이 6px.
- 끝에 12px 바깥 링크 표시(↗). 색은 영어와 같다.
- 수량·값(`×3`, `300G`)은 지금처럼 배지 끝 굵은 글.
- 줄바꿈: 한국어와 영어 **사이에서만** 바뀐다(U56). 좁으면 영어가 아래 줄로 내려간다.
- 호버·초점: yuphas의 선택 바탕 `#3b453a` + 청동 테두리 `#60593e`.
- 읽어 주는 이름: `aria-label="투기장 이야기 사본, Tales of the Arena, yuphastemple 새 탭"`.

**(나) 좁은 자리 — 두 줄 꼴(오른쪽 칸, 휴대폰 표 칸)**

```
[그림] 투기장 이야기 사본 ↗
       Tales of the Arena
```

**(다) 본문에 같은 물품이 되풀이될 때**: 한 묶음(할 일 한 덩어리) 안에서 **처음 한 번만** 영어를 붙이고, 뒤에는 한국어 링크만. (지금 인물 이름 배지가 같은 방식으로 한 번만 그린다 — `GameText`의 `shown`.) 사용자 말 "링크마다 둘 다"와 다르므로 6장 질문 2로 올린다.

**(라) 인물 링크**: `선호 선물·음식 ↗`, `지원 조건 ↗` 같은 낱말 링크 2개. 인물 영어 이름은 서랍 제목 옆에 한 번(`티아라  Tialla`).

**(마) 지도 링크**: `[핀] 그랑 아라곤  Grand Aragon ↗`. 물품이 정해진 자리면 `?q=`를 붙여 그 물품만 표시되게 한다.

**(바) 미확인**: `slug`가 없는 이름은 링크·영어 없이 한국어만. 따로 "미확인" 글자를 붙이지 않는다(글 부풀림 방지). 목록은 `docs/`에 둔다.

사양 문서에 없는 새 시각 결정이므로 `docs/design-spec.md`에 "바깥 링크 이름 칩" 절을 새로 써야 한다.

---

## 4. 글 부풀림(근거·기록용 글) 목록

소스 전체를 훑었다(하위 조사 포함). 소스가 한 줄에 길게 붙어 있어 줄 번호 하나가 부품 전체를 가리키는 곳이 많다. 구현 전에 줄 번호를 다시 확인할 것.

**큰 그림**: 근거 글의 대부분은 TSX에 직접 적힌 것이 아니라, 원본 공략에서 만든 **파생 자료 나무**(`content/derived/presentation.json`, `content/derived/checklist.json`, `content/derived/documents.json`)를 `SourceMarkup`·`Semantic`이 그대로 그리면서 나온다.

### 4.1 화면에서 뺄 것

옮길 곳 제안: `docs/reference/` 아래에 묶음별 파일. (새 폴더. `archive/`는 건드리지 않는다.)

| # | 어디(파일:줄 / 화면) | 무엇 | 양 | 처리 | 옮길 곳 |
|---|---|---|---|---|---|
| 1 | `components/people.tsx:71` / 인물 카드·인물 서랍 | 접이 **"원문 기록"**: 인물의 원본 공략 조각 전체(`선정 이유`, `병과 교체 이유`, `기능 목표·근거` 단추 포함) | 59명 | 뺌 | `docs/reference/people-original.md` |
| 2 | `components/team.tsx:30, 104~107` / 팀 | **"비교 근거" 탭 전체**: 선택한 편성 설명, "근거와 판단의 한계", "확인한 원문", "3회 이상 영입·육성 점검", "후보별로 얻는 것과 준비할 것" 등 10여 구역, "전체 참고 문서" 단추 | 탭 1개 | 뺌(탭 3개로) | `docs/reference/team-comparison.md` |
| 3 | `components/shell.tsx:10~11`, `components/guide.tsx:23`, `components/documents.tsx:43` / 루트 탐색 탭 | **"참고 문서" 화면**: 문서 약 304건 + 특기 문서 33건 검색 목록. 그중 약 136~143건이 검토·계획·지식·제안·백업 기록 | 화면 1개 | 화면을 뺌. 플레이어용 문서(지원 대화, 병종, 시험 안내)만 단추에서 열리게 남김 | 원문은 이미 `content/notes/*.md`에 있다(6장 질문 5) |
| 4 | `components/tasks.tsx:118` → `source-markup.tsx:52~55` / 할 일 묶음 아래 설명 | **"그림 출처"** 링크(game8·gamewith) | 158개(884묶음 중 148묶음) | 뺌 | `docs/reference/image-sources.md`(그림 파일 ↔ 출처 표. `assets/*/manifest.json`에 이미 있음) |
| 5 | 같은 곳 | **"입수 원문"** 링크(game8) | 55개 | 뺌 → yuphas 물품 링크가 대신함 | — |
| 6 | 같은 곳(`data-reference-url` 단추) | 근거 문서 단추: `훈련 순서·시설Lv·스승 근거`(81), `전원 영입 검토`(52), `평준화·증서 근거`(24), `첫 완료 보존·재등록 근거`(4), `실전 분담·릴리안 추가판 검토`(1), `기준판·300파편 확인`(1) | 163개 | 뺌 | 가리키던 글은 `content/notes/*-review.md`에 이미 있음 |
| 7 | 할 일 문장 안 | 출처 꼬리말: `원래 공략 한 곳에서만 확인됐다`, `(출처 한 곳)`, `(단일 출처)`, `Anna's Notebook 초안, 미검증`, `원문 설명입니다`, `원문은…`, `원문 검증과 사용자 저장 미실측 구별` | 12문장 | 문장에서 꼬리말을 떼고 짧은 표시만(6장 질문 3) | `docs/reference/unverified.md` |
| 8 | 할 일 설명 | `확인되지 않았다`(16), `미확인`(9) — 예: "열리는 장은 미확인" | 25곳 | 플레이어가 알아야 하는 것(값을 모름)만 한 낱말로 남기고 설명은 뺌 | 같은 파일 |
| 9 | `components/secondary.tsx:24` / 재료와 구매 | 접이 **"재료 조건 원문"**, 접이 "구매 판단 기준", 안내 "고정 진입 조건이나 실제 잔액이 아닙니다" | 3곳 | 원문 접이는 뺌. 구매 판단 기준은 플레이어용이면 남김(짧게) | `docs/reference/materials-original.md` |
| 10 | `components/secondary.tsx:21` / 준비 | 접이 "축복·보존·시험의 공통 기준", "이 구간의 준비와 운영 안내" 안의 근거 단추: `경유·마스터 상세 근거`, `구매 기준·무기 비교`(6), `놓침·연속 조건 확인`, `편성 비교·근거`(4), 표 머리 `실제 확인`·`시작 확인`·`확인할 때`(48), 시험 안내의 `근거·미확인` 절과 검토 링크 5개 | 다수 | 안내 본문은 남기고 근거 단추·근거 절만 뺌 | `docs/reference/prep-evidence.md` |
| 11 | `components/team.tsx:101` / 백마술 탭 | `공개 자료 ↗`(20), `로컬 효과 근거 ↗` | 21개 | 뺌(마법 이름이 yuphas 링크가 됨) | — |
| 12 | `components/team.tsx:129`, `components/documents.tsx:94` / 팀 인물 서랍 | 단추 **"특기 검토 문서"**, 그 안의 `편성 비교 후보`, `전체 비교·육성 근거 읽기`. (열면 본문이 비어 있는 흠도 있음: `reference-documents`의 `body`가 빈 값) | 33건 | 뺌 | `docs/reference/team-specialty/` |
| 13 | `components/records.tsx:10~11, 22` / 모든 기록 표 | 줄 이름 `이유`·`역할 이유`·`시작 확인`·`이월 확인`·`경로의 뜻`, 모르는 열쇠가 `추가 안내`로 새는 줄(`acquisitionKind` 19건, `questRules`, `questName`, `sequence`) | — | 재료 카드가 링크 한 줄이 되면 대부분 사라짐. 남는 표는 보일 열쇠를 **허용 목록**으로 바꿈(지금은 숨길 열쇠 목록) | — |
| 14 | `lib/character-summary.ts:10, 37`, `components/people.tsx:86` | 조심 문구: `기록 당시 Lv…`, `실제 합류 여부는 게임에서 확인합니다`, `{n}명 · 실제 합류와 출격 자리는 게임 화면을 먼저 확인하세요.` | 4~5문장 | 뺌 또는 한 낱말로 | — |
| 15 | `components/documents.tsx:87, 89, 92` | 죽은 링크 안내 `공개하지 않는 작업 자료`, `참고 보관의 원본 공략`, `문서 확인` | 3곳 | 참고 문서 화면을 빼면 함께 사라짐 | — |
| 16 | `components/team-routes.tsx:22` / 루트 편성 탭 | 머리말 메모(`current.note`, `route-notes`) | 루트마다 | 플레이어용 한 줄만 남김 | `docs/reference/team-comparison.md` |
| 17 | `components/detail-sheets.tsx:13` / 재료 서랍 그림 설명 | "Game8 세오도라 지도에서 … 검색 후 이동한 화면" 같은 긴 그림 설명 | 재료 19종 | 서랍째 없어짐(3장) | — |

**남길 것(플레이어용)**: 팀 인물 서랍의 `역할 설명`, 인물 표의 `기능 메모`·`전차병으로 키우는 이유`(짧은 이유), 그림 확대의 `원본 크기 보기`(출처가 아니라 기능), 오른쪽 칸 골드 `미확인`(값이 없다는 뜻).

**화면에 안 나오지만 근거뿐인 자료 파일**(이미 어떤 부품도 읽지 않음 → 옮겨도 화면 영향 없음): `content/data/`의 `boon-price-sources`, `optional-growth-review`, `readiness-profile-sources`, `roster-selection-sources`, `team-korean-name-sources`, `team-reference-sections`, `team-specialty-review`, `team-specialty-sources`, `training-sources`, `action-migration`. 검사만 읽는 것: `support-pairs-source`, `multi-route-audit`, `recruitment-build-audit`(`rules-check.mjs`), `modal-scope-plan`(`verify.mjs`). `weapon-buy-sources`는 `components/records.tsx:5, 9`가 이름 찾기에만 쓴다.

### 4.2 어떻게 빼나(두 길)

- **길 1 — 그릴 때 거른다(추천)**: `content/source`·`content/derived`는 그대로 두고, `SourceMarkup`·`Semantic`·`Records`가 근거 조각(`그림 출처`·`입수 원문` 링크, `data-reference-url` 단추, 근거 제목 절)을 그리지 않는다. 문서로는 스크립트 하나가 같은 조각을 `docs/reference/*.md`로 뽑는다. → "원본과 글자가 같아야 한다"는 자료 검사(`verify-readability`, `verify-feature-parity`, `verify-image-parity`)를 **안 고쳐도 된다**.
- **길 2 — 자료에서 지운다**: 파생 자료에서 근거 조각을 잘라 낸다. 내려받는 양이 더 줄지만 위 세 검사와 `verify.mjs`의 묶음 수·해시 검사를 모두 고쳐야 한다.

단, 문장 **안**의 꼬리말(7·8번)은 어느 길이든 `content/display-overrides.json`과 `playbook.json`의 글을 고쳐야 하고, `rules-check.mjs:85~89`(U46)가 걸린다.

### 4.3 고쳐야 하는 검사

| 검사 파일:줄 | 지금 요구하는 것 | 규칙 | 해야 할 일 |
|---|---|---|---|
| `scripts/rules-check.mjs:24~25` | 팀 탭이 정확히 [최종 25인, 백마술, 루트 편성, 비교 근거] | U07 | 탭 3개로 고치고 U07 줄 대체 |
| `scripts/rules-browser-check.mjs:85~92` | "비교 근거" 탭이 있고 제목 들여쓰기가 같음 | U48 | 비교 근거 부분 삭제, 루트 편성만 남김 |
| `scripts/feature-browser-check.mjs:68~70, 73~75` | 비교 근거 탭 화면 찍기, "전체 참고 문서" → 검색 → 문서 열기 | — | 삭제 |
| `scripts/feature-browser-check.mjs:32~34` | 인물 카드의 "원문 기록" 단추를 누르고 안의 병종 링크로 문서 열기 | — | 삭제(병종 문서 열기는 다른 자리에서 검사) |
| `scripts/feature-browser-check.mjs:31, 78` | "시험 안내" 문서 열림, 각 루트 2부에 "참고 문서" 화면 있음 | — | 78은 삭제, 31은 유지 |
| `scripts/browser-check.mjs:20, 173~193, 233~235` | 탐색의 "참고 문서" 화면 방문, 문서 목록 단추, 문서 → 검토 문서 링크 → 되돌아오기 | — | 삭제 또는 지원 대화 문서로 바꿈 |
| `scripts/browser-check.mjs:187` | 재료 서랍(`map-sheet`) 측정 | — | 삭제(서랍이 없어짐) |
| `scripts/browser-check.mjs:145~158, 172, 204`, `scripts/design-lead-browser-check.mjs:11~12, 51~55, 82` | 화면의 원본 그림 수·지도 자리 수(`[data-source-image]`, `[data-source-location]`)가 원본과 같음 | — | 지도 자리(`data-source-location`)는 "yuphas 지도 링크 수"로 바꿔 세거나 뺌. 안내 그림을 남길지에 따라 그림 수도 조정 |
| `scripts/consistency-browser-check.mjs:22, 87` | 탐색에서 "문서"가 들어간 단추를 누름 | U55 | 대상 바꿈 |
| `scripts/corrections-browser-check.mjs:2, 34~35, 70` | U02 표시(원문 기록 쌍), 준비의 `.reference-disclosure` 열기 | U02 | U02 문구에서 "원문 기록" 삭제, 접이 검사 조정 |
| `scripts/rules-check.mjs:60~65` | `support-pairs-by-route.md`의 "순서 잠금" 줄마다 근거 칸과 출처 주소 4개 이상 | U36 | 문서가 화면에 남으면 U36과 방향 C가 부딪친다 → 근거 칸을 `docs/`로 옮기고 U36 대체(6장 질문 4) |
| `scripts/rules-check.mjs:85~89` | 누조 3건에 `한 곳에서만 확인`, 제스터에 `아직 확인되지 않았다` 문구가 있어야 함 | U46 | 짧은 표시로 바꾸면 검사 문구도 바꿈(6장 질문 3) |
| `scripts/rules-check.mjs:117, 129` | 지원 문서를 `## 근거` 제목에서 자름 | U39 | 근거 절을 옮기면 자르는 기준을 바꿈 |
| `scripts/rules-check.mjs:186~192` + `scripts/release.mjs` | 규칙 문서의 줄마다 검사 파일에 `[Uxx]` 표시가 있어야 함, 규칙 문서가 배포 해시에 들어감 | 메타 | 규칙 줄과 검사 표시를 **같은 커밋에서** 함께 고침. Fable 재검토 필요(P01) |
| `scripts/verify-readability.mjs:24~45, 56, 59~65`, `scripts/verify-feature-parity.mjs:13~26, 39~48`, `scripts/verify-image-parity.mjs:11~21`, `scripts/verify.mjs:36~38, 44, 52` | 파생 자료가 원본과 글자·문장 수·그림 수·단추까지 같음, 참고 문서 318건, 묶음 수 | — | 길 1이면 **변경 없음**. 길 2면 전부 고침 |
| (새 검사) | — | 새 U | 화면에 `원문 기록`·`비교 근거`·`그림 출처`·`입수 원문`·`근거`·`검토 문서`·`출처` 낱말이 없음을 브라우저로 확인 |

규칙 문서에서 대체 표시가 필요한 줄: **U02**(원문 기록), **U07**(탭 4개), **U14**(공식 그림 — 유지하되 출처 표시는 docs로), **U26**(싼 선물 — 링크로), **U36**(줄마다 근거·출처 주소), **U46**(확인되지 않음 문구), **U48**(비교 근거).

---

## 5. 밝은 화면 없애기

### 5.1 지금 구조

- `components/theme.tsx:17`: `next-themes`의 `ThemeProvider attribute="class" defaultTheme="system" enableSystem`. 어두울 때 `<html class="dark">`.
- `components/theme.tsx:18~20`: `ThemeSwitch`(해·달 단추, "화면 테마 바꾸기").
- 단추를 놓은 곳 4군데: `components/home.tsx:18`, `components/shell.tsx:14`, `components/tasks.tsx:109`, `components/team.tsx:83`.
- CSS: 기본값이 **밝은 색**이고 `.dark …`가 덮어쓴다. `.dark` 선택자 수: `app/globals.css` 3(14·16줄), `app/redesign.css` 12(13, 23~28, 247, 469줄), `app/route-colors.css` 15 + `:not(.dark)` 5(2~11줄), `app/team.css` 0. `prefers-color-scheme`·`light-dark()`는 쓰지 않는다.
- `app/route-colors.css`는 `scripts/design-tokens.mjs:17`이 만든다(밝게·어둡게 두 벌).

### 5.2 바꿀 것

| 대상 | 할 일 |
|---|---|
| `components/theme.tsx` | `ThemeProvider`를 빼거나 `forcedTheme="dark"`로 고정. `ThemeSwitch` 삭제. `useImageLoaded`·`TooltipProvider`는 남김 |
| `app/layout.tsx` | `<html lang="ko" class="dark">`로 고정하고 `color-scheme: dark`를 선언(브라우저 기본 스크롤 막대·입력칸도 어둡게). 깜빡임 막는 스크립트가 필요 없어진다 |
| `components/home.tsx:6, 18`, `shell.tsx:6, 14`, `tasks.tsx:2, 109`, `team.tsx:14, 83` | `ThemeSwitch` 가져오기와 자리(`.route-theme` 상자 포함) 삭제 |
| `app/globals.css`, `app/redesign.css` | `.dark` 덮어쓰기 값을 기본값으로 올리고 밝은 값 삭제. `.theme-light`/`.theme-dark`/`.theme-system` 규칙 삭제(`globals.css:16`) |
| `scripts/design-tokens.mjs:17`, `app/route-colors.css` | 어두운 벌만 내보냄. `:not(.dark)` 줄 삭제 |
| `package.json:37` | `next-themes` 제거(고정 클래스만 쓰면 필요 없음) |
| `docs/design-spec.md` | 색 표의 "밝게" 칸(9줄 표, 94~103줄 루트 색 중 밝게 줄), 21줄 진행 막대 "밝게·어둡게 모두", 60줄 "두 테마 지원", 69줄 "테마" 단추, 73줄 진행색 밝은 값 → 어두운 값만 남기고 대체 표시 |
| `DESIGN.md:10~12, 30, 74`, `PRODUCT.md:10`, `HANDOFF.md:90, 278~279` | "두 테마" 문구 정리 |
| `docs/yuphas-sample-plan.md`(yuphas-design-sample 작업 폴더) | "밝은 테마: … dividerT만 쓰고" 절 삭제 |

### 5.3 규칙(U)과 검사

| 규칙 | 지금 | 할 일 |
|---|---|---|
| **U28** | 테마 단추는 하나, 위치·부드러운 바뀜 | **폐지**(대체 표시). 검사 `scripts/layout-browser-check.mjs:16, 21`, `scripts/rules-browser-check.mjs`의 U28 부분, `scripts/header-browser-check.mjs:23, 33`(`.route-theme .icon-button`), `scripts/button-gap-check.mjs:51` 삭제·조정 |
| **U05**, **U24** | "색은 밝게·어둡게 모두 밝은 빨강" | 문구에서 "밝게·어둡게 모두" 삭제 |
| **U34** | 모든 진행 막대는 흰 바탕·초록 | 규칙은 유지 가능. 다만 yuphas 말씨와 어울리는지는 따로 판단(이번 범위 밖) |
| **U09, U15** | 색 검사 | 어두운 화면에서만 검사 |

`['light','dark']`로 두 번 도는 검사(모두 `dark` 한 번으로 줄인다):

- `scripts/browser-check.mjs:20, 162~163, 203, 205~206, 219`(104줄의 밝은 바탕색 기대값 `#EFEBE3`·`#F4F3F0`도 삭제)
- `scripts/corrections-browser-check.mjs:23~24`
- `scripts/design-lead-browser-check.mjs:100~102`(`localStorage.setItem('theme', …)` 포함), 168줄 설명
- `scripts/header-browser-check.mjs:14~15`
- `scripts/home-visual-check.mjs:9~10`
- `scripts/rules-browser-check.mjs:14~15`(U34·U15·U24 메시지의 `${theme}`)
- `scripts/status-browser-check.mjs:13~14`
- `scripts/team-fit-check.mjs:13~14`

새 검사 한 줄(새 U 번호): 운영체제가 밝게여도(`colorScheme: 'light'`) `<html>`에 `dark`가 있고 바탕이 어두운 색이며, "화면 테마 바꾸기" 단추가 0개.

이득: 브라우저 검사 시간이 거의 절반으로 준다.

---

## 6. 사용자에게 물을 것(P04, 추천 표시)

1. **인물 서랍의 선물 줄을 어떻게 할까?**
   - **(추천) 가. 싼 선물 칩만 남기고 링크로 바꾼다 + "선호 선물·음식 전체 ↗" 한 개.** "싸게 살 수 있는 것"은 우리만의 고른 목록이라 yuphas에 없다. 비싼 선물 줄은 없앤다(yuphas 목록이 대신함).
   - 나. 선물 줄 전체를 없애고 "선호 선물·음식 전체 ↗" 링크만.
   - 다. 지금처럼 싼 선물·비싼 선물 둘 다 두고 링크만 단다.

2. **같은 물품이 한 묶음에 여러 번 나올 때 영어 이름은?**
   - **(추천) 가. 처음 한 번만 영어를 붙이고, 뒤에는 한국어 링크만.** 글이 덜 길어진다.
   - 나. 나올 때마다 한국어·영어 둘 다.

3. **"한 곳에서만 확인됐다" 같은 확인 꼬리말(U46)은?**
   - **(추천) 가. 문장에서 떼고 그 자리에 작은 `미확인` 표시 한 낱말만. 설명은 `docs/reference/unverified.md`.** 플레이어가 "틀릴 수 있다"는 것은 알아야 한다.
   - 나. 표시도 없이 모두 뺀다.
   - 다. 지금 문장 그대로 둔다.

4. **"루트별 지원 대화" 문서(190쌍 배정표)는?**
   - **(추천) 가. 쌍 표는 남기고(우리 계획), 표 아래 "근거"·줄마다의 출처 주소(U36)만 `docs/`로 옮긴다. 인물 이름에 yuphas 지원 링크.**
   - 나. 문서째 없애고 yuphas `/<인물>/supports/`만 쓴다(루트 배정 정보가 사라짐).

5. **"참고 문서" 화면과 `content/notes/*.md`(약 300건)는?**
   - **(추천) 가. 화면에서 "참고 문서" 탭을 없애고, 파일은 `content/notes/`에 그대로 둔다(이미 마크다운이고 검사가 해시로 지킨다). `docs/reference/README.md`에 찾아가는 목차만 만든다.** 옮기는 일과 검사 수정이 가장 적다.
   - 나. 검토·계획·지식 기록(약 140건)을 실제로 `docs/reference/notes/`로 옮긴다. `transfer-manifest`·`verify.mjs`·`refresh-manifest.mjs`를 함께 고쳐야 한다.

6. **링크 범위를 무기·마법·병종까지 넓힐까?** (말씀하신 범위는 물품·재료·선물·음식·지원·지도)
   - **(추천) 가. 무기·마법까지 넓힌다.** 같은 `?item=` 주소라 추가 일이 거의 없고, 우리 영어 이름 47개가 모두 맞는다. 병종·기능은 지금처럼 우리 문서.
   - 나. 말씀하신 범위만.
   - 다. 병종까지 전부 yuphas로(우리 병종 문서 60여 건도 뺌).

7. **한국어 도감이 "임시 표기"라고 적은 한국어 이름은?**
   - **(추천) 가. 화면에는 그대로 쓰고, 이름표에 `wiki-temp`로 적어 `docs/`에 목록을 둔다. 게임에서 다른 이름을 보시면 알려 주시는 대로 고친다.**
   - 나. 화면에도 `미확인` 표시를 붙인다(글이 늘어남).

8. **본문 안내 그림(게임 화면 사진, game8 출처)은?**
   - **(추천) 가. 조작 방법을 보여 주는 그림(탐색·포획·시험 화면 등)은 남기고, 그림 아래 "그림 출처" 글만 뺀다. 지도 위치 사진은 yuphas 지도 링크로 바꾸며 없앤다.** 출처는 `docs/reference/image-sources.md`.
   - 나. 안내 그림도 모두 없앤다(원본 그림 수 검사를 크게 고쳐야 함).

---

## 부록 1. 문서와 코드가 다른 점(P07)

- `AGENTS.md`·`HANDOFF.md`는 "최소 글자 18px", "두 테마"를 말하지만, 견본 계획(`docs/yuphas-sample-plan.md`)은 yuphas 값(본문 16px 등)을 따르기로 했다. 이 보고서의 글자 크기 제안은 견본 계획을 따랐다.
- 의뢰 글에는 "Unicorn Overlord 공략 사이트"라고 적혀 있었지만, 저장소는 《파이어 엠블렘 만자천홍》(Fortune's Weave) 공략이다(`HANDOFF.md` 1장). yuphastemple도 같은 게임이다.
- `scripts/button-gap-check.mjs:73`은 `'문서'` 단추를 정확히 찾는데 실제 이름은 `참고 문서`라 지금도 건너뛴다(죽은 검사).
- `components/documents.tsx:94`의 "전체 비교·육성 근거 읽기"는 자료의 `body`가 비어 있어 열어도 내용이 없다.
- `content/data/checklist-display-names.json`에 `Shining Spear Armory = 소렐의 휘창 무기점` 같은 뜻 없는 줄이 무기마다 3개씩(약 100줄) 있다. 이름표 씨앗으로 쓸 때 걸러야 한다.
- 할 일 본문의 지도 링크 188개는 지금 모두 game8.co로 간다(`data-map-link`). 문서에는 "지도 미리보기"만 언급돼 있다.

## 부록 2. 이번 조사가 증명하지 못한 것

- yuphas의 `/<인물>/<병종>/<탈것>/`, `/<목록>/<종류>/`, `/map/<루트>/<핀 종류>/` 주소는 코드로만 읽었고 직접 열지 않았다.
- 아포스트로피가 든 **장소** 슬러그(`Nowah's Cave` 등)가 어느 꼴로 열리는지 직접 열지 않았다.
- 한국어 도감의 "임시 표기"가 몇 건인지 세지 않았다(한 건만 봄).
- 4장의 줄 번호와 개수는 하위 조사 결과이며, 이 보고서에서 다시 연 것은 `people.tsx:66`, `source-markup.tsx:53·55`, `secondary.tsx:24`, `detail-sheets.tsx`, `context-rail.tsx`, `theme.tsx`, `game-text.tsx`뿐이다.
- 조사 환경: Windows 11, Claude 데스크톱 내장 브라우저. 우리 사이트의 빌드·검사 스크립트는 **실행하지 않았다**(읽기만).
- yuphastemple 운영자에게 링크 사용을 알리거나 허락받는 일은 하지 않았다(일반 바깥 링크이며 자료 복사는 없다).
