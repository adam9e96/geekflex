/**
 * 컬렉션 관련 상수 데이터
 */

// 기본 예시 컬렉션 데이터 (목록용)
export const EXAMPLE_COLLECTIONS_LIST = [
  {
    id: "example-1",
    name: "인기 액션 영화",
    description:
      "심장이 뛰는 액션 영화들을 모았습니다. 스릴 넘치는 장면과 박진감 넘치는 전개를 즐길 수 있습니다.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/1X7vyt1s1xG2ohlynxMKdWBPqyN.jpg",
    contentCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "example-2",
    name: "감동적인 드라마",
    description:
      "눈물과 웃음이 함께하는 감동적인 드라마 작품들입니다. 깊은 여운을 남기는 이야기를 만나보세요.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    contentCount: 8,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "example-3",
    name: "최고의 SF 영화",
    description:
      "상상력을 자극하는 최고의 과학 소설 영화 컬렉션입니다. 미래를 그려낸 작품들을 만나보세요.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    contentCount: 15,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "example-4",
    name: "로맨스 코미디",
    description:
      "달콤하고 유쾌한 로맨스 코미디 작품들입니다. 하루 종일 즐거운 마음으로 감상할 수 있습니다.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/5q4z6OC9Vf4pEFKkjPM3t9hq3L8.jpg",
    contentCount: 10,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 예시 컬렉션 데이터 (상세용 - 객체 형태)
export const EXAMPLE_COLLECTIONS = {
  "example-1": {
    id: "example-1",
    name: "인기 액션 영화",
    description:
      "심장이 뛰는 액션 영화들을 모았습니다. 스릴 넘치는 장면과 박진감 넘치는 전개를 즐길 수 있습니다.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/1X7vyt1s1xG2ohlynxMKdWBPqyN.jpg",
    createdAt: new Date().toISOString(),
  },
  "example-2": {
    id: "example-2",
    name: "감동적인 드라마",
    description:
      "눈물과 웃음이 함께하는 감동적인 드라마 작품들입니다. 깊은 여운을 남기는 이야기를 만나보세요.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  "example-3": {
    id: "example-3",
    name: "최고의 SF 영화",
    description:
      "상상력을 자극하는 최고의 과학 소설 영화 컬렉션입니다. 미래를 그려낸 작품들을 만나보세요.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  "example-4": {
    id: "example-4",
    name: "로맨스 코미디",
    description:
      "달콤하고 유쾌한 로맨스 코미디 작품들입니다. 하루 종일 즐거운 마음으로 감상할 수 있습니다.",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/5q4z6OC9Vf4pEFKkjPM3t9hq3L8.jpg",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
};
