package com.geekflex.app.dto.tmdb;

import com.geekflex.app.entity.Content;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@Data
@Builder
public class MovieDetailResponse {

    // 내부 DB PK
    private Long contentId;

    // TMDB 기본 정보
    private Long tmdbId;
    private String title;
    private String originalTitle;
    private String overview;
    private String posterPath;
    private String backdropPath;
    private LocalDate releaseDate;
    private Integer runtime;
    private boolean adult;
    private BigDecimal popularity;
    private BigDecimal voteAverage;
    private Integer voteCount;
    private String originalLanguage;
    private List<String> originCountry;

    // 추가 상세 정보
    private List<TmdbMovieDetailResponse.Genre> genres;
    private List<TmdbMovieDetailResponse.ProductionCompany> productionCompanies;
    private List<TmdbMovieDetailResponse.ProductionCountry> productionCountries;
    private List<TmdbMovieDetailResponse.SpokenLanguage> spokenLanguages;

    private String status;
    private String tagline;
    public static MovieDetailResponse from(Content content, TmdbMovieDetailResponse detail) {

        return MovieDetailResponse.builder()
                // Content 기반 (DB 값 우선)
                .contentId(content.getId())
                .tmdbId(content.getTmdbId())
                .title(content.getTitle())                      // DB 우선
                .originalTitle(content.getOriginalTitle())      // DB 우선
                .overview(content.getOverview())                // DB 우선
                .posterPath(content.getPosterUrl())             // DB 우선
                .backdropPath(content.getBackdropUrl())         // DB 우선
                .releaseDate(content.getReleaseDate())          // DB 우선
                .popularity(content.getPopularity())            // DB 우선
                .voteAverage(content.getVoteAverage())          // DB 우선
                .voteCount(content.getVoteCount())              // DB 우선
                .originalLanguage(content.getOriginalLanguage())// DB 우선
                .originCountry(
                        content.getOriginCountry() != null
                                ? List.of(content.getOriginCountry().split(","))
                                : detail.getOriginCountry()
                )
                .genres(detail.getGenres())                     // 상세 정보는 detail 기반
                .runtime(detail.getRuntime())                   // detail 전용
                .adult(detail.isAdult())                        // detail 전용
                .productionCompanies(detail.getProductionCompanies())
                .productionCountries(detail.getProductionCountries())
                .spokenLanguages(detail.getSpokenLanguages())   // detail 전용
                .status(detail.getStatus())                     // detail 전용
                .tagline(detail.getTagline())                   // detail 전용
                .build();
    }

}
