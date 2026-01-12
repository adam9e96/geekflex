package com.geekflex.app.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * TMDB 공통 리스트 응답 DTO
 * - now_playing, upcoming: dates 포함
 * - popular, top_rated: dates 없음
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TmdbMovieListResponse {

    private Dates dates; // now_playing, upcoming 에만 존재 (nullable)
    private int page;

    private List<MovieSummary> results;

    @JsonProperty("total_pages")
    private int totalPages;

    @JsonProperty("total_results")
    private int totalResults;

    @Data
    public static class Dates {
        private String maximum;
        private String minimum;
    }

    @Data
    public static class MovieSummary {
        private boolean adult;

        @JsonProperty("backdrop_path")
        private String backdropPath;

        @JsonProperty("genre_ids")
        private List<Integer> genreIds;

        private long id; // TMDB_id

        @JsonProperty("original_language")
        private String originalLanguage; // en

        @JsonProperty("original_title")
        private String originalTitle;

        private String overview;

        @JsonProperty("popularity")
        private BigDecimal popularity;

        @JsonProperty("poster_path")
        private String posterPath;

        @JsonProperty("release_date")
        private LocalDate releaseDate;

        private String title;

        @JsonProperty("vote_average")
        private BigDecimal voteAverage;

        @JsonProperty("vote_count")
        private Integer voteCount;
    }
}
