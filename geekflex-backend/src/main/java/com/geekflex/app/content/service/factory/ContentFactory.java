package com.geekflex.app.content.service.factory;
import com.geekflex.app.content.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.content.dto.tmdb.TmdbTvDetailResponse;
import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.entity.ContentType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.Objects;
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

    /**
     * TMDB 영화 상세 데이터로 기존 Content를 업데이트한다.
     * @return 변경된 필드가 있으면 true
     */
    public boolean updateContentFromMovie(Content content, TmdbMovieDetailResponse detail) {
        boolean changed = false;

        String genreStr = detail.getGenres() != null
                ? detail.getGenres().stream()
                .map(TmdbMovieDetailResponse.Genre::getName)
                .collect(Collectors.joining(","))
                : null;
        String originCountryStr = detail.getOriginCountry() != null
                ? String.join(",", detail.getOriginCountry())
                : null;

        if (!Objects.equals(content.getTitle(), detail.getTitle())) {
            content.setTitle(detail.getTitle()); changed = true;
        }
        if (!Objects.equals(content.getOriginalTitle(), detail.getOriginalTitle())) {
            content.setOriginalTitle(detail.getOriginalTitle()); changed = true;
        }
        if (!Objects.equals(content.getOriginalLanguage(), detail.getOriginalLanguage())) {
            content.setOriginalLanguage(detail.getOriginalLanguage()); changed = true;
        }
        if (!Objects.equals(content.getOverview(), detail.getOverview())) {
            content.setOverview(detail.getOverview()); changed = true;
        }
        if (!Objects.equals(content.getReleaseDate(), detail.getReleaseDate())) {
            content.setReleaseDate(detail.getReleaseDate()); changed = true;
        }
        if (!Objects.equals(content.getPosterUrl(), detail.getPosterPath())) {
            content.setPosterUrl(detail.getPosterPath()); changed = true;
        }
        if (!Objects.equals(content.getBackdropUrl(), detail.getBackdropPath())) {
            content.setBackdropUrl(detail.getBackdropPath()); changed = true;
        }
        if (compare(content.getPopularity(), detail.getPopularity()) != 0) {
            content.setPopularity(detail.getPopularity()); changed = true;
        }
        if (compare(content.getVoteAverage(), detail.getVoteAverage()) != 0) {
            content.setVoteAverage(detail.getVoteAverage()); changed = true;
        }
        if (!Objects.equals(content.getVoteCount(), detail.getVoteCount())) {
            content.setVoteCount(detail.getVoteCount()); changed = true;
        }
        if (!Objects.equals(content.getGenre(), genreStr)) {
            content.setGenre(genreStr); changed = true;
        }
        if (!Objects.equals(content.getOriginCountry(), originCountryStr)) {
            content.setOriginCountry(originCountryStr); changed = true;
        }

        if (changed) {
            log.info("Content 업데이트 감지 - tmdbId: {}, title: {}", content.getTmdbId(), content.getTitle());
        }
        return changed;
    }

    /**
     * TMDB TV 상세 데이터로 기존 Content를 업데이트한다.
     * @return 변경된 필드가 있으면 true
     */
    public boolean updateContentFromTv(Content content, TmdbTvDetailResponse detail) {
        boolean changed = false;

        String genreStr = null;
        if (detail.getGenres() != null && !detail.getGenres().isEmpty()) {
            genreStr = detail.getGenres().stream()
                    .map(TmdbTvDetailResponse.Genre::getName)
                    .filter(name -> name != null && !name.isEmpty())
                    .collect(Collectors.joining(","));
        }
        String originCountryStr = null;
        if (detail.getOriginCountry() != null && !detail.getOriginCountry().isEmpty()) {
            originCountryStr = String.join(",", detail.getOriginCountry());
        }

        if (!Objects.equals(content.getTitle(), detail.getName())) {
            content.setTitle(detail.getName()); changed = true;
        }
        if (!Objects.equals(content.getOriginalTitle(), detail.getOriginalName())) {
            content.setOriginalTitle(detail.getOriginalName()); changed = true;
        }
        if (!Objects.equals(content.getOriginalLanguage(), detail.getOriginalLanguage())) {
            content.setOriginalLanguage(detail.getOriginalLanguage()); changed = true;
        }
        if (!Objects.equals(content.getOverview(), detail.getOverview())) {
            content.setOverview(detail.getOverview()); changed = true;
        }
        if (!Objects.equals(content.getReleaseDate(), detail.getFirstAirDate())) {
            content.setReleaseDate(detail.getFirstAirDate()); changed = true;
        }
        if (!Objects.equals(content.getEndDate(), detail.getLastAirDate())) {
            content.setEndDate(detail.getLastAirDate()); changed = true;
        }
        if (!Objects.equals(content.getPosterUrl(), detail.getPosterPath())) {
            content.setPosterUrl(detail.getPosterPath()); changed = true;
        }
        if (!Objects.equals(content.getBackdropUrl(), detail.getBackdropPath())) {
            content.setBackdropUrl(detail.getBackdropPath()); changed = true;
        }
        if (compare(content.getPopularity(), detail.getPopularity()) != 0) {
            content.setPopularity(detail.getPopularity()); changed = true;
        }
        if (compare(content.getVoteAverage(), detail.getVoteAverage()) != 0) {
            content.setVoteAverage(detail.getVoteAverage()); changed = true;
        }
        if (!Objects.equals(content.getVoteCount(), detail.getVoteCount())) {
            content.setVoteCount(detail.getVoteCount()); changed = true;
        }
        if (!Objects.equals(content.getGenre(), genreStr)) {
            content.setGenre(genreStr); changed = true;
        }
        if (!Objects.equals(content.getOriginCountry(), originCountryStr)) {
            content.setOriginCountry(originCountryStr); changed = true;
        }

        if (changed) {
            log.info("TV Content 업데이트 감지 - tmdbId: {}, title: {}", content.getTmdbId(), content.getTitle());
        }
        return changed;
    }

    private static int compare(java.math.BigDecimal a, java.math.BigDecimal b) {
        if (a == null && b == null) return 0;
        if (a == null || b == null) return 1;
        return a.compareTo(b);
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








