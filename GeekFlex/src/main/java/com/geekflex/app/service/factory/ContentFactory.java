package com.geekflex.app.service.factory;

import com.geekflex.app.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.dto.tmdb.TmdbTvDetailResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@Log4j2
public class ContentFactory {

    public Content fromTmdbDetail(TmdbMovieDetailResponse detail, ContentType type) {

        return Content.builder()
                .tmdbId(detail.getId())
                .contentType(type)
                .title(detail.getTitle())
                .originalTitle(detail.getOriginalTitle())
                .originalLanguage(detail.getOriginalLanguage())
                .overview(detail.getOverview())
                .releaseDate(detail.getReleaseDate())
                .posterUrl(detail.getPosterPath())
                .backdropUrl(detail.getBackdropPath())
                .popularity(detail.getPopularity())
                .voteAverage(detail.getVoteAverage())
                .voteCount(detail.getVoteCount())
                .genre(detail.getGenres() != null
                        ? detail.getGenres().stream()
                        .map(TmdbMovieDetailResponse.Genre::getName)
                        .collect(Collectors.joining(","))
                        : null)
                .originCountry(detail.getOriginCountry() != null
                        ? String.join(",", detail.getOriginCountry())
                        : null)
                .build();
    }

    public Content fromTmdbTvDetail(TmdbTvDetailResponse detail, ContentType type) {
        // 장르 처리
        String genreStr = null;
        if (detail.getGenres() != null && !detail.getGenres().isEmpty()) {
            genreStr = detail.getGenres().stream()
                    .map(TmdbTvDetailResponse.Genre::getName)
                    .filter(name -> name != null && !name.isEmpty())
                    .collect(Collectors.joining(","));
        }

        // 제작 국가 처리
        String originCountryStr = null;
        if (detail.getOriginCountry() != null && !detail.getOriginCountry().isEmpty()) {
            originCountryStr = String.join(",", detail.getOriginCountry());
        }

        Content content = Content.builder()
                .tmdbId(detail.getId())
                .contentType(type)
                .title(detail.getName())
                .originalTitle(detail.getOriginalName())
                .originalLanguage(detail.getOriginalLanguage())
                .overview(detail.getOverview())
                .releaseDate(detail.getFirstAirDate())
                .endDate(detail.getLastAirDate())
                .posterUrl(detail.getPosterPath())
                .backdropUrl(detail.getBackdropPath())
                .popularity(detail.getPopularity())
                .voteAverage(detail.getVoteAverage())
                .voteCount(detail.getVoteCount())
                .genre(genreStr)
                .originCountry(originCountryStr)
                .build();

        // 로깅으로 실제 매핑된 값 확인
        log.info("TV Content 생성 완료 - tmdbId: {}, title: {}, originalTitle: {}, releaseDate: {}, endDate: {}, genre: {}, originCountry: {}",
                content.getTmdbId(), content.getTitle(), content.getOriginalTitle(), 
                content.getReleaseDate(), content.getEndDate(), content.getGenre(), content.getOriginCountry());

        return content;
    }
}
