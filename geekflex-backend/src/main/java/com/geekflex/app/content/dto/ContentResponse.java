package com.geekflex.app.content.dto;
import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.service.tmdb.TmdbImageUrlBuilder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContentResponse {

    private Long id;
    private Long tmdbId;
    private ContentType contentType;
    private String title;
    private String originalTitle;
    private String originalLanguage;
    private String overview;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private String posterUrl;
    private String backdropUrl;
    private BigDecimal popularity;
    private BigDecimal voteAverage;
    private Integer voteCount;
    private String genre;
    private String originCountry;

    public static ContentResponse from(Content content) {
        return ContentResponse.builder()
                .id(content.getId())
                .tmdbId(content.getTmdbId())
                .contentType(content.getContentType())
                .title(content.getTitle())
                .originalTitle(content.getOriginalTitle())
                .originalLanguage(content.getOriginalLanguage())
                .overview(content.getOverview())
                .releaseDate(content.getReleaseDate())
                .endDate(content.getEndDate())
                .posterUrl(TmdbImageUrlBuilder.poster(content.getPosterUrl()))
                .backdropUrl(TmdbImageUrlBuilder.backdrop(content.getBackdropUrl()))
                .popularity(content.getPopularity())
                .voteAverage(content.getVoteAverage())
                .voteCount(content.getVoteCount())
                .genre(content.getGenre())
                .originCountry(content.getOriginCountry())
                .build();
    }

}







