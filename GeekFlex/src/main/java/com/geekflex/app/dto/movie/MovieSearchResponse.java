package com.geekflex.app.dto.movie;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class MovieSearchResponse {

    /**
     * DB PK (Nullable, TMDB 검색 시 없음)
     */
    private final Long id;

    /**
     * TMDB 고유 ID
     */
    private final Long tmdbId;

    private final String title;
    private final String originalTitle;
    private final String overview;

    private final LocalDate releaseDate;

    private final String posterUrl;     // TMDB: poster_path
    private final String backdropUrl;   // TMDB: backdrop_path

    private final BigDecimal popularity;
    private final BigDecimal voteAverage;
    private final Integer voteCount;

    /**
     * DB 조회(QueryDSL) 전용 생성자
     * - id 있음
     */
    @QueryProjection
    public MovieSearchResponse(
            Long id,
            Long tmdbId,
            String title,
            String originalTitle,
            String overview,
            LocalDate releaseDate,
            String posterUrl,
            String backdropUrl,
            BigDecimal popularity,
            BigDecimal voteAverage,
            Integer voteCount
    ) {
        this.id = id;
        this.tmdbId = tmdbId;
        this.title = title;
        this.originalTitle = originalTitle;
        this.overview = overview;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.popularity = popularity;
        this.voteAverage = voteAverage;
        this.voteCount = voteCount;
    }

    /**
     * TMDB 검색 API 전용 생성자
     * - id = null
     */
    public MovieSearchResponse(
            Long tmdbId,
            String title,
            String originalTitle,
            String overview,
            LocalDate releaseDate,
            String posterUrl,
            String backdropUrl,
            BigDecimal popularity,
            BigDecimal voteAverage,
            Integer voteCount
    ) {
        this.id = null;
        this.tmdbId = tmdbId;
        this.title = title;
        this.originalTitle = originalTitle;
        this.overview = overview;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.popularity = popularity;
        this.voteAverage = voteAverage;
        this.voteCount = voteCount;
    }
}
