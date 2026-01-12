package com.geekflex.app.dto.tv;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class TvSearchResponse {

    /**
     * DB PK (Nullable, TMDB 검색 시 없음)
     */
    private final Long id;

    /**
     * TMDB 고유 ID
     */
    private final Long tmdbId;

    private final String name;
    private final String originalName;
    private final String overview;

    private final LocalDate firstAirDate;

    private final String posterUrl;     // TMDB: poster_path
    private final String backdropUrl;   // TMDB: backdrop_path

    private final BigDecimal popularity;
    private final BigDecimal voteAverage;
    private final Integer voteCount;

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
        this.id = null;
        this.tmdbId = tmdbId;
        this.name = name;
        this.originalName = originalName;
        this.overview = overview;
        this.firstAirDate = firstAirDate;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.popularity = popularity;
        this.voteAverage = voteAverage;
        this.voteCount = voteCount;
    }
}

