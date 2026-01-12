package com.geekflex.app.entity;

import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TMDB 영화 장르 Enum
 * TMDB API에서 제공하는 장르 ID와 한글 이름을 매핑
 */
@Getter
public enum TmdbGenre {
    ACTION(28, "액션"),
    ADVENTURE(12, "모험"),
    ANIMATION(16, "애니메이션"),
    COMEDY(35, "코미디"),
    CRIME(80, "범죄"),
    DOCUMENTARY(99, "다큐멘터리"),
    DRAMA(18, "드라마"),
    FAMILY(10751, "가족"),
    FANTASY(14, "판타지"),
    HISTORY(36, "역사"),
    HORROR(27, "공포"),
    MUSIC(10402, "음악"),
    MYSTERY(9648, "미스터리"),
    ROMANCE(10749, "로맨스"),
    SCIENCE_FICTION(878, "SF"),
    TV_MOVIE(10770, "TV 영화"),
    THRILLER(53, "스릴러"),
    WAR(10752, "전쟁"),
    WESTERN(37, "서부");

    private final int id;
    private final String koreanName;

    TmdbGenre(int id, String koreanName) {
        this.id = id;
        this.koreanName = koreanName;
    }

    /**
     * ID로 장르를 찾는 Map (성능 최적화를 위해 static으로 생성)
     */
    private static final Map<Integer, TmdbGenre> ID_MAP = Arrays.stream(values())
            .collect(Collectors.toMap(TmdbGenre::getId, genre -> genre));

    /**
     * 장르 ID로 한글 이름을 찾습니다.
     * 
     * @param genreId TMDB 장르 ID
     * @return 한글 장르 이름, 없으면 null
     */
    public static String getKoreanNameById(Integer genreId) {
        if (genreId == null) {
            return null;
        }
        TmdbGenre genre = ID_MAP.get(genreId);
        return genre != null ? genre.getKoreanName() : null;
    }

    /**
     * 장르 ID 리스트를 콤마로 구분된 한글 장르명 문자열로 변환합니다.
     * 
     * @param genreIds 장르 ID 리스트
     * @return 콤마로 구분된 한글 장르명 (예: "드라마, 액션, 스릴러")
     */
    public static String convertGenreIdsToString(java.util.List<Integer> genreIds) {
        if (genreIds == null || genreIds.isEmpty()) {
            return null;
        }
        
        return genreIds.stream()
                .map(TmdbGenre::getKoreanNameById)
                .filter(name -> name != null)
                .collect(java.util.stream.Collectors.joining(", "));
    }
}

