package com.geekflex.app.service;

import com.geekflex.app.dto.movie.MovieSearchResponse;
import com.geekflex.app.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.exception.InvalidSearchKeywordException;
import com.geekflex.app.exception.TmdbApiException;
import com.geekflex.app.service.tmdb.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientException;

import java.util.List;
@Service
@RequiredArgsConstructor
@Log4j2
public class MovieSearchServiceImpl implements MovieSearchService {

    private final TmdbApiService tmdbApiService;
    private static final String TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
    private static final String TMDB_POSTER_SIZE = "w500";
    private static final String TMDB_BACKDROP_SIZE = "w1280";

    /**
     * TMDB 이미지 경로를 전체 URL로 변환
     */
    private String convertToFullImageUrl(String path, boolean isPoster) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        if (path.startsWith("http")) {
            return path;
        }
        String size = isPoster ? TMDB_POSTER_SIZE : TMDB_BACKDROP_SIZE;
        return TMDB_IMAGE_BASE_URL + "/" + size + path;
    }

    @Override
    public List<MovieSearchResponse> searchMovies(String keyword) {

        if (keyword == null || keyword.isBlank()) {
            throw new InvalidSearchKeywordException("검색어를 입력해주세요.");
        }

        String trimmed = keyword.trim().toLowerCase();
        log.info("영화 검색 시작 - keyword: {}", trimmed);

        // 1. TMDB API 호출
        TmdbMovieListResponse response;
        try {
            response = tmdbApiService.searchMovies(trimmed);
        } catch (WebClientException e) {
            log.error("TMDB API 호출 실패 - keyword: {}, error: {}", trimmed, e.getMessage(), e);
            throw new TmdbApiException("영화 검색 API 호출에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("TMDB API 호출 중 예상치 못한 오류 발생 - keyword: {}, error: {}", trimmed, e.getMessage(), e);
            throw new TmdbApiException("영화 검색 중 오류가 발생했습니다.", e);
        }

        if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
            log.warn("TMDB 검색 결과가 NULL 또는 빈 목록");
            return List.of();
        }

        // 2. 정렬 수행
        response.getResults().sort((a, b) -> {
            String q = trimmed;

            String tA = a.getTitle() != null ? a.getTitle().toLowerCase() : "";
            String tB = b.getTitle() != null ? b.getTitle().toLowerCase() : "";
            String oA = a.getOriginalTitle() != null ? a.getOriginalTitle().toLowerCase() : "";
            String oB = b.getOriginalTitle() != null ? b.getOriginalTitle().toLowerCase() : "";

            // 정확 일치
            boolean exactA = tA.equals(q) || oA.equals(q);
            boolean exactB = tB.equals(q) || oB.equals(q);

            if (exactA && !exactB) return -1;
            if (!exactA && exactB) return 1;

            // 시작 일치
            boolean startA = tA.startsWith(q) || oA.startsWith(q);
            boolean startB = tB.startsWith(q) || oB.startsWith(q);

            if (startA && !startB) return -1;
            if (!startA && startB) return 1;

            // 인기(popularity) 내림차순 (BigDecimal)
            if (a.getPopularity() == null && b.getPopularity() == null) return 0;
            if (a.getPopularity() == null) return 1;
            if (b.getPopularity() == null) return -1;

            return b.getPopularity().compareTo(a.getPopularity());
        });

        // 3. DTO 변환 (이미지 URL을 전체 URL로 변환)
        return response.getResults().stream()
                .map(movie -> new MovieSearchResponse(
                        movie.getId(),
                        movie.getTitle(),
                        movie.getOriginalTitle(),
                        movie.getOverview(),
                        movie.getReleaseDate(),  // LocalDate
                        convertToFullImageUrl(movie.getPosterPath(), true),
                        convertToFullImageUrl(movie.getBackdropPath(), false),
                        movie.getPopularity(),   // BigDecimal
                        movie.getVoteAverage(),  // BigDecimal
                        movie.getVoteCount()
                ))
                .toList();
    }
}