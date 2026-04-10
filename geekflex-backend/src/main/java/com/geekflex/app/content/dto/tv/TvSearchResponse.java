package com.geekflex.app.content.dto.tv;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * @param id          DB PK (Nullable, TMDB 검색 시 없음)
 * @param tmdbId      TMDB 고유 ID
 * @param posterUrl   TMDB: poster_path
 * @param backdropUrl TMDB: backdrop_path
 */
public record TvSearchResponse(Long id, Long tmdbId, String name, String originalName, String overview,
                                LocalDate firstAirDate, String posterUrl, String backdropUrl, BigDecimal popularity,
                                BigDecimal voteAverage, Integer voteCount) {

    /**
     * TMDB 검색 API 전용 생성자
     * - id = null
     */
    public TvSearchResponse(
            Long tmdbId,
            String name,
            String originalName,
            String overview,
            LocalDate firstAirDate,
            String posterUrl,
            String backdropUrl,
            BigDecimal popularity,
            BigDecimal voteAverage,
            Integer voteCount
    ) {
        this(null, tmdbId, name, originalName, overview, firstAirDate, posterUrl, backdropUrl, popularity, voteAverage, voteCount);
    }
}
