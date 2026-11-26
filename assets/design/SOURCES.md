# 공식 디자인 자산

`route-emblems-source.webp`는 색 참고용으로만 보관한다. 이 파일에서 잘라 만든 emblem-*.webp 네 개와 화면 참조를 삭제했다.

## 클랜 문장

출처: https://www.nintendo.com/kr/games/switch2/aacsa/character/index.html

공식 페이지가 클랜 표지로 사용하는 원본이며 글자가 포함된 원본도 그대로 보존한다. 자르기·편집·생성·합성하지 않았다. © Nintendo / INTELLIGENT SYSTEMS.

- emblems/cai.webp: https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_1_pc.webp
- emblems/dietrich.webp: https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_2_pc.webp
- emblems/theodora.webp: https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_3_pc.webp
- emblems/leda.webp: https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/character/clan_4_pc.webp

## 공식 배너

- 페이지: https://www.nintendo.com/kr/games/switch2/aacsa/index.html
- official-banner.webp: https://www.nintendo.com/kr/games/switch2/aacsa/assets/data/webp/top/main/kv.webp

## yuphastemple.com UI 그림·글꼴 (사용자 결정 2026-11-26)

- 출처 사이트: https://yuphastemple.com/ (그림 `https://yuphastemple.com/images/…`, 스타일 `https://yuphastemple.com/data/style.css`)
- 사용자 판단: 게임 화면 UI에서 나온 그림으로 보고 자유롭게 쓴다(2026-11-26). 사이트에 라이선스 글은 없다(docs/yuphas-design-teardown.md §0).
- 받은 사람: 조정 담당 에이전트(2026-11-26). 바꾸지 않고 그대로 `public/yuphas/`에 둔다. 다른 파일은 받지 않는다.
- 상태: yuphas 디자인 견본(커밋 전, 브랜치 claude/yuphas-design-sample)에서만 쓴다.

| 파일(public/yuphas/) | 크기 | 원본 주소 |
|---|---|---|
| popup/top-left.webp · top-center.webp · top-right.webp · middle-left.webp · center.webp · middle-right.webp · bottom-left.webp · bottom-center.webp · bottom-right.webp | 모서리 168×88, 변 48×88·168×48, 가운데 24×24 | https://yuphastemple.com/images/popup/(같은 이름) |
| buttonLeft.png · buttonCenter.png | 18×36 · 1×36 | https://yuphastemple.com/images/(같은 이름) |
| buttonInactiveBG5.png | 272×61 | 〃 |
| listTop.png · listCenter2.png · listBottom.png | 1814×244 · 1814×798 · 1814×244 | 〃 |
| dividerT.png | 1743×6 | 〃 |
| headerBG.png | 1770×54 | 〃 |
| tileBg2.png · tileBg3.png | 574×368 | 〃 |
| bgLineCover4.webp · background14.webp | 1800×970 | 〃 |
| background-4-3-6-top.png · -center.png · -bottom.png | 1800×658 · 1800×272 · 1800×440 | 〃 |
| searchboxRepeat.png · searchboxRight.png | 121×60 · 62×60 | 〃 |
| basicStats.webp · combatStats.webp · combatStatsMys.webp | 1800×970 | 〃 |
| NocturneSerif-Regular.woff2 (글꼴, 52,704바이트) | — | https://yuphastemple.com/images/NocturneSerif-Regular.woff2 |

## yuphastemple.com 인물·물품 그림 (사용자 결정 2026-11-27)

- 사용자 지시: "인물 쪽·탭·팝업을 모두 훑어 그림을 받는다. 화질이 훨씬 좋다"(2026-11-27). 받은 날: 2026-11-27. 받은 사람: 자료 담당 에이전트(Opus 5.5). 그림만 받았고 바꾸지 않았다(파일 이름만 우리 슬러그로).
- 어느 그림을 쓰는지는 yuphastemple 쪽을 내장 브라우저로 열어(`/loretta/`, `/loretta/liked-gifts/`, `/loretta/supports/`, `/loretta/recruitment/`, `?item=tales-of-the-arena`, `?item=gladiator`, `?item=bronze-sword`) 실제로 불러오는 그림 주소를 모아 정했고, 같은 꼴을 우리 인물·물품 전체에 적용했다. 목록 근거: 사이트의 `data/data.json`(인물·병종·탈것), `data/locations.json`(MAP_ITEMS 아이콘·음식 그림), `data/pictures.json`(물품 그림 목록), `index.html`의 `CLASS_ICONS`.
- 우리 그림 → 바꿀 그림 대응표: `content/data/yuphas-images.json`. 화면 교체는 아직 안 했다.
- 상태: yuphas 디자인 견본(커밋 전, 브랜치 claude/yuphas-design-sample)에서만 쓴다. 게임 그림 © Nintendo / INTELLIGENT SYSTEMS.

| 폴더(public/yuphas/) | 수 | 크기 | 원본 주소 꼴(https://yuphastemple.com/…) |
|---|---|---|---|
| portraits/<인물 슬러그>.webp | 62 | 500×500 등, 약 3.1MB | images/characters/<Name>.webp (공백은 `_`, 예 Hong_Hua) |
| thumbs/<인물 슬러그>.webp | 62 | 120×120, 약 0.5MB | images/charactersthumb/<Name>.webp |
| faces/<인물 슬러그>.png | 62 | 96×64, 약 0.8MB | images/faces/<Name>.png |
| emblems/<소속>.webp | 15 | 320×320, 약 0.5MB | images/factions/<소속>.webp (app.js `FACTION_SYMBOLS`) |
| icons/skills/<기능>[_boon\|_bane].png, <기능>-flat.png | 40 | 34×34 | images/skills/<기능>[_boon\|_bane]-v2.png (authority_bane만 -v2 없음), images/skills/<기능>-flat.png(보병·기마·중갑·비행만 있음) |
| icons/arts/<무기>.png | 6 | — | images/arts/<무기>-v2.png |
| icons/items/* | 47 | — | images/items/(같은 이름) — 물품 종류·등급 아이콘, 무기 종류 아이콘 |
| icons/ui/* | 5 | — | images/gifts/giftLoved.png·giftLiked.png, images/foodHeaders/great·good·bad.png |
| classes/female·male/<병종 슬러그>.webp | 60·58 | 64×64 | images/classicons/<female\|male>/<Class_Name>.webp |
| mounts/<탈것>.webp, mounts/species-<종>.png | 25 | 약 1.9MB | data.json `mounts[].img`, images/mountsthumb/<종>.png |
| items/<물품 슬러그>.webp | 205 | 300×300 등, 약 4.4MB | images/map-items/<물품 슬러그>.webp (이름표에 있는 물품 중 사이트에 그림이 있는 것) |
| meals/<음식 슬러그>.webp | 12 | 225×225 등 | locations.json MAP_ITEMS의 `img`(예 images/meals/mazadins-v2.webp) |

- 받지 못한 것: `images/skills/<무기·마법·권위>-flat.png` 8개는 사이트에도 없다(404). 사이트가 그 꼴을 보병·기마·중갑·비행에만 쓴다.
