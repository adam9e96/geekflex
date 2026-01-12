package com.geekflex.app.dto.tmdb;

import com.geekflex.app.entity.Content;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@Data
@Builder
public class TvDetailResponse {

    // 내부 DB PK
    private Long contentId;

    // TMDB 기본 정보
    private Long tmdbId;
    private String name; // TV 제목
    private String originalName; // 원어 제목
    private String overview;
    private String posterPath;
    private String backdropPath;
    private LocalDate firstAirDate; // 첫 방영일
    private LocalDate lastAirDate; // 마지막 방영일
    private Integer numberOfEpisodes; // 에피소드 수
    private Integer numberOfSeasons; // 시즌 수
    private boolean adult;
    private BigDecimal popularity;
    private BigDecimal voteAverage;
    private Integer voteCount;
    private String originalLanguage;
    private List<String> originCountry;

    // 추가 상세 정보
    private List<TmdbTvDetailResponse.Genre> genres;
    private List<Integer> episodeRunTime; // 에피소드 런타임
    private List<TmdbTvDetailResponse.Network> networks; // 방송사
    private List<TmdbTvDetailResponse.ProductionCompany> productionCompanies; // 제작사
    private List<TmdbTvDetailResponse.ProductionCountry> productionCountries; // 제작 국가
    private List<TmdbTvDetailResponse.Season> seasons; // 시즌 정보
    private List<TmdbTvDetailResponse.SpokenLanguage> spokenLanguages; // 음성 언어

    private String status;
    private String tagline;

    public static TvDetailResponse from(Content content, TmdbTvDetailResponse detail) {
        return TvDetailResponse.builder()
                // Content 기반 (DB 값 우선)
                .contentId(content.getId())
                .tmdbId(content.getTmdbId())
                .name(content.getTitle())                      // DB 우선
                .originalName(content.getOriginalTitle())        // DB 우선
                .overview(content.getOverview())                // DB 우선
                .posterPath(content.getPosterUrl())            // DB 우선
                .backdropPath(content.getBackdropUrl())         // DB 우선
                .firstAirDate(content.getReleaseDate())         // DB 우선
                .lastAirDate(content.getEndDate())              // DB 우선
                .popularity(content.getPopularity())            // DB 우선
                .voteAverage(content.getVoteAverage())          // DB 우선
                .voteCount(content.getVoteCount())              // DB 우선
                .originalLanguage(content.getOriginalLanguage())// DB 우선
                .originCountry(
                        content.getOriginCountry() != null
                                ? List.of(content.getOriginCountry().split(","))
                                : detail.getOriginCountry()
                )
                // 상세 정보는 detail 기반
                .genres(detail.getGenres())
                .episodeRunTime(detail.getEpisodeRunTime())
                .networks(detail.getNetworks())
                .productionCompanies(detail.getProductionCompanies())
                .productionCountries(detail.getProductionCountries())
                .seasons(detail.getSeasons())
                .spokenLanguages(detail.getSpokenLanguages())
                .numberOfEpisodes(detail.getNumberOfEpisodes())
                .numberOfSeasons(detail.getNumberOfSeasons())
                .adult(detail.isAdult())
                .status(detail.getStatus())
                .tagline(detail.getTagline())
                .build();
    }
}
