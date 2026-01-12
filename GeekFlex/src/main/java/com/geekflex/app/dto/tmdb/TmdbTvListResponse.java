package com.geekflex.app.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * TMDB TV 검색 API 응답 DTO
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TmdbTvListResponse {

    private int page;
    private List<TvSummary> results;

    @JsonProperty("total_pages")
    private int totalPages;

    @JsonProperty("total_results")
    private int totalResults;

    @Data
    public static class TvSummary {
        private boolean adult;

        @JsonProperty("backdrop_path")
        private String backdropPath;

        @JsonProperty("genre_ids")
        private List<Integer> genreIds;

        private long id; // TMDB_id

        @JsonProperty("original_language")
        private String originalLanguage;

        @JsonProperty("original_name")
        private String originalName;

        private String overview;

        @JsonProperty("popularity")
        private BigDecimal popularity;

        @JsonProperty("poster_path")
        private String posterPath;

        @JsonProperty("first_air_date")
        private LocalDate firstAirDate;

        private String name;

        @JsonProperty("vote_average")
        private BigDecimal voteAverage;

        @JsonProperty("vote_count")
        private Integer voteCount;
    }
}

