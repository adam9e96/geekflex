package com.geekflex.app.content.service;
import com.geekflex.app.content.dto.tmdb.TmdbMovieDetailResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MovieDetailWithPkResponse {
    private Long contentId;   // 내부 PK
    private Long tmdbId;      // TMDB ID
    private String title;
    private String posterPath;
    private String overview;
    private Integer runtime;
    private List<TmdbMovieDetailResponse.Genre> genres;
}







