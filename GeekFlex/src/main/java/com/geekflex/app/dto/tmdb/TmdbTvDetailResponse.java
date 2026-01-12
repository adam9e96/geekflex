package com.geekflex.app.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TmdbTvDetailResponse {

    private boolean adult;

    @JsonProperty("backdrop_path")
    private String backdropPath;

    // 포함된 장르
    private List<Genre> genres;

    private Long id; // TMDB_ID

    @JsonProperty("origin_country")
    private List<String> originCountry; // ex: "JP"

    @JsonProperty("original_language")
    private String originalLanguage; // ex: "ja"

    @JsonProperty("original_name")
    private String originalName; // 원어 제목

    private String overview;

    private BigDecimal popularity;

    @JsonProperty("poster_path")
    private String posterPath;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonProperty("first_air_date")
    private LocalDate firstAirDate; // 첫 방영일

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonProperty("last_air_date")
    private LocalDate lastAirDate; // 마지막 방영일

    private String name; // TV 제목

    @JsonProperty("vote_average")
    private BigDecimal voteAverage;

    @JsonProperty("vote_count")
    private Integer voteCount;

    private String status; // 방영 상태 ex) "Returning Series", "Ended"

    private String tagline; // 한줄 주제

    @JsonProperty("number_of_episodes")
    private Integer numberOfEpisodes; // 에피소드 수

    @JsonProperty("number_of_seasons")
    private Integer numberOfSeasons; // 시즌 수

    @JsonProperty("episode_run_time")
    private List<Integer> episodeRunTime; // 에피소드 런타임 (분)

    @JsonProperty("networks")
    private List<Network> networks; // 방송사 정보

    @JsonProperty("production_companies")
    private List<ProductionCompany> productionCompanies; // 제작사 정보

    @JsonProperty("production_countries")
    private List<ProductionCountry> productionCountries; // 제작 국가 정보

    @JsonProperty("seasons")
    private List<Season> seasons; // 시즌 정보

    @JsonProperty("spoken_languages")
    private List<SpokenLanguage> spokenLanguages; // 음성 언어 정보

    // ===== 내부 DTO들 =====

    @Data
    public static class Genre {
        private Long id;
        private String name;
    }

    @Data
    public static class Network {
        private Long id;
        @JsonProperty("logo_path")
        private String logoPath;
        private String name;
        @JsonProperty("origin_country")
        private String originCountry;
    }

    @Data
    public static class ProductionCompany {
        private Long id;
        @JsonProperty("logo_path")
        private String logoPath;
        private String name;
        @JsonProperty("origin_country")
        private String originCountry;
    }

    @Data
    public static class ProductionCountry {
        @JsonProperty("iso_3166_1")
        private String iso3166_1; // "JP"
        private String name; // "Japan"
    }

    @Data
    public static class Season {
        @JsonProperty("air_date")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate airDate;
        @JsonProperty("episode_count")
        private Integer episodeCount;
        private Long id;
        private String name;
        private String overview;
        @JsonProperty("poster_path")
        private String posterPath;
        @JsonProperty("season_number")
        private Integer seasonNumber;
        @JsonProperty("vote_average")
        private BigDecimal voteAverage;
    }

    @Data
    public static class SpokenLanguage {
        @JsonProperty("english_name")
        private String englishName;
        @JsonProperty("iso_639_1")
        private String iso639_1;
        private String name;
    }
}

