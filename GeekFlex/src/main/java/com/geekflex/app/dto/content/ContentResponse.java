package com.geekflex.app.dto.content;

import com.geekflex.app.entity.ContentType;
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

}