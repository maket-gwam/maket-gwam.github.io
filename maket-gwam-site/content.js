/* Shared public content. Edit copy, products, contacts and banners here. */
const SITE_CONTENT = {
  "at": "2026-11-10T13:30:00.000Z",
  "products": [
    {
      "id": "char-basic",
      "name": "캐릭터 1종 기본",
      "category": "캐릭터",
      "price": 89000,
      "sale": 49000,
      "desc": "손그림 스케치를 AI로 완성하는 브랜드 캐릭터",
      "includes": "손그림 스케치 → AI 완성\n정면 1컷 (PNG, 배경 없음)\n수정 2회\n작업 기간 3~5일",
      "example": true,
      "featured": false,
      "order": 1,
      "updatedAt": "2026-11-10T05:50:00.000Z",
      "image": "img/bear-multi.webp"
    },
    {
      "id": "char-face",
      "name": "캐릭터 표정 세트",
      "category": "캐릭터",
      "price": 49000,
      "sale": 29000,
      "desc": "만들어 둔 캐릭터에 표정 6종 추가",
      "includes": "표정 6종 (기쁨·놀람·윙크 등)\nPNG, 배경 없음\n수정 1회\n작업 기간 2~3일",
      "example": true,
      "featured": false,
      "order": 2,
      "updatedAt": "2026-11-10T05:50:00.000Z",
      "image": "img/bears-collage.webp"
    },
    {
      "id": "short-15",
      "name": "AI 숏폼 15초",
      "category": "AI 숏폼",
      "price": 199000,
      "sale": 99000,
      "desc": "9:16 숏폼, 기획부터 자막까지",
      "includes": "기획안 + 장면 구성표\nAI 영상 생성 · 편집\n자막 · 배경음악\n수정 2회\n작업 기간 5~7일",
      "example": true,
      "featured": false,
      "order": 3,
      "updatedAt": "2026-11-10T05:50:00.000Z",
      "image": "img/kikaboni.webp"
    },
    {
      "id": "short-30",
      "name": "AI 숏폼 30초",
      "category": "AI 숏폼",
      "price": 299000,
      "sale": 149000,
      "desc": "장면 구성표를 포함한 30초 숏폼",
      "includes": "기획안 + 장면 구성표\nAI 영상 생성 · 편집\n자막 · 배경음악 · 효과음\n수정 2회\n작업 기간 7~10일",
      "example": true,
      "featured": false,
      "order": 4,
      "updatedAt": "2026-11-10T05:50:00.000Z",
      "image": "img/highlight.webp"
    },
    {
      "id": "short-3pack",
      "name": "가게 소개 숏폼 3편",
      "category": "패키지",
      "price": 549000,
      "sale": 269000,
      "desc": "한 달 업로드용 15초 숏폼 3편 묶음",
      "includes": "15초 숏폼 3편\n편마다 다른 주제 기획\n자막 · 배경음악\n편당 수정 1회\n작업 기간 2~3주",
      "example": true,
      "featured": false,
      "order": 5,
      "updatedAt": "2026-11-10T05:50:00.000Z",
      "image": "img/hwaseong-short.webp"
    },
    {
      "id": "plan-set",
      "name": "공모전 기획 세트",
      "category": "기획",
      "price": 69000,
      "sale": 39000,
      "desc": "공모전 출품용 기획안과 장면 구성표",
      "includes": "주제 분석 + 기획안\n장면 구성표 (컷별 자막·음악)\nAI 생성 프롬프트 정리\n수정 1회\n작업 기간 3~4일",
      "example": true,
      "featured": false,
      "order": 6,
      "updatedAt": "2026-11-10T05:50:00.000Z",
      "image": "img/110.webp"
    },
    {
      "id": "starter",
      "name": "캐릭터 + 숏폼 스타터",
      "category": "패키지",
      "price": 259000,
      "sale": 129000,
      "desc": "캐릭터 1종과 그 캐릭터가 나오는 15초 숏폼",
      "includes": "캐릭터 1종 기본 (정면 1컷)\n캐릭터 등장 15초 숏폼 1편\n자막 · 배경음악\n수정 각 2회\n작업 기간 7~10일",
      "example": true,
      "featured": true,
      "order": 0,
      "updatedAt": "2026-11-10T05:50:00.000Z",
      "image": "img/hwaseong-cf.webp"
    }
  ],
  "portfolio": [],
  "brand": {
    "tagline": "좋은 발견을, 끌리는 콘텐츠로.",
    "intro": "안녕하세요, 모형곰입니다.\n캐릭터와 AI 숏폼 영상을 기획부터 완성까지 직접 만드는 1인 크리에이티브 스튜디오입니다. 개인과 소상공인의 이야기를 오래 기억되는 콘텐츠로 만들어 드립니다.",
    "util": "오픈 특가 진행 중 · 상담은 카카오톡 오픈채팅으로 편하게 남겨 주세요",
    "featureTitle": "소상공인 시작 패키지",
    "featureSub": "캐릭터와 숏폼을 한 번에 시작하세요",
    "banners": [
      {
        "id": "b1",
        "eyebrow": "오픈 특가",
        "title": "첫 캐릭터를 특가로 만나 보세요",
        "sub": "후기를 남겨 주시는 분께 오픈 특가로 제작해 드립니다.",
        "action": "cat:캐릭터",
        "image": "img/bears-collage.webp"
      },
      {
        "id": "b2",
        "eyebrow": "손그림부터",
        "title": "우리 가게 캐릭터, 손그림부터 시작합니다",
        "sub": "직접 그린 스케치를 AI로 다듬어 하나뿐인 캐릭터를 만듭니다.",
        "action": "tab:process",
        "image": "img/bear-multi.webp"
      },
      {
        "id": "b3",
        "eyebrow": "AI 숏폼",
        "title": "공모전 출품작으로 다듬은 AI 숏폼",
        "sub": "기획부터 편집까지 한 사람이 끝까지 맡습니다.",
        "action": "tab:works",
        "image": "img/highlight.webp"
      }
    ],
    "logo": "img/logo-icon.webp",
    "fontDisplay": "system",
    "fontBody": "system",
    "catIcons": {
      "전체": "img/icon-square.webp",
      "캐릭터": "img/icon-goggles.webp",
      "AI 숏폼": "img/icon-play.webp",
      "기획": "img/icon-clapper.webp",
      "패키지": "img/icon-camera.webp"
    },
    "storyImage": "img/logo-main.webp",
    "toolOptions": [
      "ChatGPT",
      "Claude",
      "Gemini",
      "Flow",
      "CapCut",
      "Canva",
      "Figma"
    ],
    "contacts": [
      {
        "id": "c1",
        "label": "카카오톡 오픈채팅",
        "url": "https://open.kakao.com/o/sUQmCfUi"
      },
      {
        "id": "c2",
        "label": "인스타그램 DM",
        "url": "https://instagram.com/maket.gwam"
      },
      {
        "id": "c3",
        "label": "숨고",
        "url": "https://soomgo.com/profile/users/18432692"
      },
      {
        "id": "c4",
        "label": "이메일",
        "url": "mailto:maket.gwam@gmail.com"
      },
      {
        "id": "c5",
        "label": "링크 모음",
        "url": "https://litt.ly/maket.gwam"
      }
    ],
    "workflow": [
      {
        "id": "w1",
        "title": "상담",
        "desc": "원하시는 작업과 일정을 카카오톡이나 DM으로 알려 주세요."
      },
      {
        "id": "w2",
        "title": "기획안·견적",
        "desc": "장면 구성과 일정, 금액을 안내드립니다."
      },
      {
        "id": "w3",
        "title": "시안 확인",
        "desc": "캐릭터와 주요 장면 이미지를 먼저 보여 드립니다."
      },
      {
        "id": "w4",
        "title": "제작",
        "desc": "영상 생성, 편집, 자막, 사운드를 작업합니다."
      },
      {
        "id": "w5",
        "title": "수정",
        "desc": "상품별 수정 횟수 안에서 함께 다듬습니다."
      },
      {
        "id": "w6",
        "title": "전달",
        "desc": "최종 파일을 보내 드립니다."
      }
    ],
    "notices": [],
    "reviews": [],
    "footer": {
      "company": "",
      "ceo": "",
      "phone": "maket.gwam@gmail.com",
      "bizno": ""
    }
  }
};
