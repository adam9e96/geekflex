package com.geekflex.app.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TmdbMovieDetailResponse {

    private boolean adult;

    @JsonProperty("backdrop_path")
    private String backdropPath;

    // 포함된 장르
    private List<Genre> genres;

    private Long id; // TMDB_ID

    @JsonProperty("imdb_id")
    private String imdbId; // IMDB_ID

    @JsonProperty("origin_country")
    private List<String> originCountry; // ex: "JP"

    @JsonProperty("original_language")
    private String originalLanguage; // ex: "ja"

    @JsonProperty("original_title")
    private String originalTitle; // 원어 제목

    private String overview;

    private BigDecimal popularity;

    @JsonProperty("poster_path")
    private String posterPath;

    @JsonProperty("production_companies")
    private List<ProductionCompany> productionCompanies;

    @JsonProperty("production_countries")
    private List<ProductionCountry> productionCountries;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate releaseDate;
    
    private Long revenue; // 수익

    private Integer runtime; // 상영 시간

    @JsonProperty("spoken_languages")
    private List<SpokenLanguage> spokenLanguages; // 음성 지원

    private String status; // 개봉 상태 ex) "Released"

    private String tagline; // 한줄 주제

    private String title; // 영화 제목

    @JsonProperty("vote_average")
    private BigDecimal voteAverage;

    @JsonProperty("vote_count")
    private Integer voteCount;


    // ===== 내부 DTO들 =====

    @Data
    public static class Genre {
        private Long id;
        private String name;
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
    public static class SpokenLanguage {

        @JsonProperty("english_name")
        private String englishName;

        @JsonProperty("iso_639_1")
        private String iso639_1;

        private String name;
    }
}
