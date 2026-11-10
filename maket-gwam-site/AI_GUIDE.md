# AI 작업 안내 (ChatGPT · Claude · 다른 AI 공통)

이 폴더는 모형곰(maket.gwam) 고객용 사이트이자 관리 화면이에요. AI가 이 폴더를 수정할 때 아래 규칙을 지켜 주세요.

## 구조

| 파일 | 역할 | 수정해도 되는 것 |
| --- | --- | --- |
| `index.html` | 진입 파일. 거의 고칠 일 없음 | 메타 태그 |
| `content.js` | **공개 데이터** (`SITE_CONTENT`: products, portfolio, brand) | 상품·가격·문구·배너·연락처·샘플 |
| `theme.css` | 브랜드 색·글꼴 변수 | 색, 글꼴 |
| `site.css` / `site.js` | 고객 화면 스타일·동작 | 화면 구성 |
| `admin.css` / `admin.js` | 관리 화면 (편집 권한이 있을 때만 불러옴) | 관리 기능 |
| `local-store.js` | Claude 밖에서 `#admin`으로 열 때 쓰는 브라우저 저장소 | 보통 고치지 않음 |
| `img/` | 사진·로고·아이콘 (WebP 권장) | 파일 추가·교체 |

## 꼭 지킬 것

1. `content.js`는 누구나 볼 수 있는 공개 파일이에요. **프로젝트 마감일, 수정 메모, 체크리스트, 고객 개인정보를 넣지 마세요.** 프로젝트 데이터는 관리 화면의 "프로젝트 백업"(projects-backup.json)으로만 따로 보관해요.
2. `content.js`는 `const SITE_CONTENT = { ... };` 형태를 유지하세요. JSON 문법(쉼표·따옴표)이 깨지면 화면이 비어요. 수정 후 `node --check content.js`로 확인하세요.
3. 이미지 경로는 `img/파일이름.webp`처럼 `img/` 폴더 기준으로 적어요. 다른 사이트 이미지 주소(URL)는 쓰지 않아요.
4. `asset:`으로 시작하는 값은 Claude 앱에서 올린 파일이라 이 폴더에서는 보이지 않아요. `img/` 파일로 바꿔 주세요.
5. 한글 이름은 **모형곰**, 영어 이름은 **maket.gwam**이에요. 다른 회사의 로고·문구·이미지는 넣지 않아요.
6. 고객에게 보이는 문구는 정중한 존댓말로 써요.

## 글꼴

- 사용할 수 있는 글꼴은 `site.js`의 `FONTS`에 등록돼 있어요 (`system`, `gowoon`, `yuntaeng`). 파일은 `fonts/`에 WOFF2로 있어요.
- 선택값은 `content.js`의 `brand.fontDisplay`(제목), `brand.fontBody`(본문)에 키로 저장돼요.
- 새 글꼴을 추가하려면 WOFF2 파일을 `fonts/`에 넣고 `FONTS`에 `{label, family, file}` 한 줄을 추가해요.

## 눌러서 바꾸기

관리 화면의 고객 화면 미리보기에서 "✎ 눌러서 바꾸기"를 켜면 `data-edit` 속성이 붙은 요소(로고, 카테고리 아이콘, 배너, 상품, 샘플, 대표 브랜드 사진)를 눌러 사진을 바꿀 수 있어요. 새 편집 대상을 추가할 때는 `site.js`의 `ed('키')`와 `admin.js`의 `editTarget`을 함께 고쳐요.

## 관리 화면 여는 법

- **Claude 앱 안**: 편집 권한이 있는 계정으로 열면 자동으로 관리 화면이 나와요. 데이터는 Claude 저장소에 저장돼요.
- **Claude 밖** (내 컴퓨터에서 파일 열기, Netlify, 미리보기): 주소 끝에 `#admin`을 붙여 열어요.
  예: `index.html#admin`, `https://maket-gwam.netlify.app/#admin`
  - 바꾼 내용은 그 브라우저(localStorage)에만 저장돼요. 다른 사람에게는 영향이 없어요.
  - 고객 사이트에 반영하려면 관리 화면 위쪽의 **content.js 내보내기** → 받은 파일로 폴더의 `content.js`를 바꾸고 → 다시 업로드해요.
  - 사진은 `img/` 폴더에 파일을 넣고 관리 화면 "사진·영상"에서 파일 이름을 등록하면 목록에서 고를 수 있어요.

## 데이터 형태

고객 화면의 **샘플** 탭은 `portfolio` 데이터를 보여 주고, 출품·납품일(`releasedAt`)이 최근인 것부터 위에, 가장 오래된 것이 맨 아래에 나와요. 날짜가 없는 샘플은 맨 아래로 가요.


- 상품: `{id, name, category(캐릭터|AI 숏폼|기획|패키지), price, sale, desc, includes(줄바꿈 \n), image, example, featured, order}`
- 샘플(작품, `portfolio`): `{id, name, category(브랜드 협업|공모전 출품작|오리지널), collab, format, summary, intro, purpose, roles[], length, ratio, cuts, duration, tools[], process[], result, releasedAt(YYYY-MM-DD), links[{label,url}], thumb, video, order}`
- 브랜드: `tagline, intro, util, featureTitle, featureSub, banners[], logo, fontDisplay, fontBody, catIcons{}, storyImage, toolOptions[], contacts[], workflow[], notices[], reviews[], footer{company,ceo,phone,bizno}`

## 확인 방법

`index.html`을 브라우저로 열어 고객 화면을, `index.html#admin`으로 관리 화면을 확인해요. 별도 설치나 빌드는 필요 없어요.
