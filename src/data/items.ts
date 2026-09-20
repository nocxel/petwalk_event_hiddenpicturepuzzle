export interface HiddenItem {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  brands: string[];
  hint: string;
  imageUrl: string;
  // Precise target center and hit radius (%)
  target: {
    x: number; // Center X (%)
    y: number; // Center Y (%)
    radius: number; // Tight hitbox radius (%)
    nearRadius: number; // Near-miss feedback radius (%)
  };
  // Alternative precise targets if applicable
  alternativeTargets?: Array<{
    x: number;
    y: number;
    radius: number;
  }>;
}

export const HIDDEN_ITEMS: HiddenItem[] = [
  {
    id: 'leash',
    name: '목줄 한 강아지',
    category: 'Walk & Safety',
    tagline: '댕댕이의 안전하고 편안한 가을 산책 필수템',
    description: '보호자의 손을 잡고 예쁜 목줄과 하네스를 차고 발맞추어 걷는 사랑스러운 산책 댕댕이입니다.',
    brands: ['아이캔더', '분독', '젠틀우프', '더포기도그', '파운드마이애니멀'],
    hint: '중앙 산책 돌길(하단)에서 줄무늬 옷을 입은 사람과 함께 목줄을 하고 걷는 강아지를 찾아보세요!',
    imageUrl: '/images/items/leash_walk.png',
    target: {
      x: 46.7,
      y: 92.6,
      radius: 4.8,
      nearRadius: 9.0,
    },
    alternativeTargets: [
      { x: 46.7, y: 80.4, radius: 4.2 }, // Nearby walker on center path
      { x: 23.5, y: 74.5, radius: 4.0 }, // Walker near left path
    ],
  },
  {
    id: 'car',
    name: '차 탄 강아지',
    category: 'Drive & Comfort',
    tagline: '흔들림 없는 편안함, 안전한 드라이빙 전용 카시트',
    description: '가을 숲길 도로를 달리는 빨간색 자동차 창문 밖으로 시원한 바람을 즐기는 드라이빙 댕댕이입니다.',
    brands: ['스윗테일', '올치'],
    hint: '오른쪽 상단 단풍나무 숲길 도로 위를 달리는 빨간색 승용차의 창문을 살펴보세요!',
    imageUrl: '/images/items/car_ride.png',
    target: {
      x: 81.9,
      y: 17.9,
      radius: 4.8,
      nearRadius: 9.0,
    },
  },
  {
    id: 'carrier',
    name: '이동가방 강아지',
    category: 'Travel & Carrier',
    tagline: '어디서나 감성 가득, 가볍고 포근한 외출용 펫 캐리어',
    description: '가족들의 즐거운 가을 피크닉 돗자리 위, 열린 이동가방 속에서 편안하게 고개를 내민 안락한 댕댕이입니다.',
    brands: ['아이캔더', 'SSFW', '리카리카', '리토가토 등'],
    hint: '화면 왼쪽 잔디밭의 피크닉 돗자리 구역, 열려 있는 하늘색 이동가방 속을 돋보기로 살펴보세요!',
    imageUrl: '/images/items/carrier_picnic.png',
    target: {
      x: 7.5,
      y: 50.5,
      radius: 4.2,
      nearRadius: 8.5,
    },
  },
  {
    id: 'treats',
    name: '간식 당기는 두 댕댕이',
    category: 'Healthy Treats',
    tagline: '믿을 수 있는 원료로 만든 프리미엄 영양 수제 간식',
    description: '맛있는 흰색 뼈다귀 간식 1개를 양쪽에서 사이좋게(장난스럽게!) 앙 물고 줄다리기하는 귀여운 두 마리 강아지입니다.',
    brands: ['스위피', '트러스티푸드', '고위드테일', '알로키친 프리미엄 간식'],
    hint: '화면 왼쪽 아래 잔디밭(어질리티 장애물 근처)에서 하나의 뼈다귀 간식을 함께 물고 있는 두 마리를 찾아보세요!',
    imageUrl: '/images/items/treat_share.png',
    target: {
      x: 19.8,
      y: 84.8,
      radius: 5.0,
      nearRadius: 9.5,
    },
  },
  {
    id: 'frisbee',
    name: '원반 낚아채는 강아지',
    category: 'Play & Fun',
    tagline: '신나는 스트레스 해소와 즐거운 원반 놀이 시간',
    description: '푸른 잔디밭 도그런 원형 펜스 안에서 날아오는 빨간 원반을 향해 공중으로 멋지게 날아오른 날렵한 점핑 댕댕이입니다.',
    brands: ['터그놀이, 노즈워크 장난감부터', '자동으로 움직이는 장난감까지'],
    hint: '화면 오른쪽 아래 둥근 철조망(원형 도그런) 안에서 빨간 원반을 향해 점프하는 강아지를 찾아보세요!',
    imageUrl: '/images/items/frisbee_catch.png',
    target: {
      x: 79.2,
      y: 69.8,
      radius: 5.2,
      nearRadius: 10.0,
    },
  },
];

export const STORE_INFO = {
  name: 'PETWALK',
  subName: '펫워크 애견용품 셀렉트샵',
  domain: 'event.petwalk.kr',
  mainDomain: 'petwalk.kr',
  coupon: {
    title: 'PETWALK 매장 전용 15% 할인 쿠폰',
    discountRate: '15% OFF',
    notice: '※ 매장 할인과 중복으로 적용되지 않습니다.',
    instruction: '매장에서 계산할 때 직원에게 이 화면(또는 캡처본)을 보여주세요.',
    validityText: '발급일로부터 30일간 유효',
  },
};
