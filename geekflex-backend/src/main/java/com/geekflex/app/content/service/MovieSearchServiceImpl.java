package com.geekflex.app.content.service;

import com.geekflex.app.common.exception.InvalidSearchKeywordException;
import com.geekflex.app.common.exception.TmdbApiException;
import com.geekflex.app.content.dto.movie.MovieSearchResponse;
import com.geekflex.app.content.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.content.service.tmdb.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientException;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class MovieSearchServiceImpl implements MovieSearchService {

    private static final String TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
    private static final String TMDB_POSTER_SIZE = "w500";
    private static final String TMDB_BACKDROP_SIZE = "w1280";

    private final TmdbApiService tmdbApiService;

    @Override
    public List<MovieSearchResponse> searchMovies(String keyword) {
        String normalizedKeyword = normalizeKeyword(keyword);
        TmdbMovieListResponse response = requestMovieSearch(normalizedKeyword);

        if (isEmptyResponse(response)) {
            return List.of();
        }

        return sortByRelevance(response.getResults(), normalizedKeyword).stream()
                .map(this::toMovieSearchResponse)
                .toList();
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new InvalidSearchKeywordException("검색어를 입력해주세요.");
        }

        String normalized = keyword.trim().toLowerCase();
        log.info("영화 검색 시작 - keyword: {}", normalized);
        return normalized;
    }

    private TmdbMovieListResponse requestMovieSearch(String keyword) {
        try {
            return tmdbApiService.searchMovies(keyword);
        } catch (WebClientException e) {
            log.error("TMDB API 호출 실패 - keyword: {}, error: {}", keyword, e.getMessage(), e);
            throw new TmdbApiException("영화 검색 API 호출에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("TMDB API 호출 중 예상치 못한 오류 발생 - keyword: {}, error: {}", keyword, e.getMessage(), e);
            throw new TmdbApiException("영화 검색 중 오류가 발생했습니다.", e);
        }
    }

    private boolean isEmptyResponse(TmdbMovieListResponse response) {
        return response == null || response.getResults() == null || response.getResults().isEmpty();
    }

    private List<TmdbMovieListResponse.MovieSummary> sortByRelevance(
            List<TmdbMovieListResponse.MovieSummary> movies,
            String keyword
    ) {
        return movies.stream()
                .sorted(buildSearchComparator(keyword))
                .toList();
    }

    private Comparator<TmdbMovieListResponse.MovieSummary> buildSearchComparator(String keyword) {
        return Comparator
                .comparing((TmdbMovieListResponse.MovieSummary movie) -> exactMatchPriority(movie, keyword))
                .thenComparing(movie -> startsWithPriority(movie, keyword))
                .thenComparing(TmdbMovieListResponse.MovieSummary::getPopularity,
                        Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private int exactMatchPriority(TmdbMovieListResponse.MovieSummary movie, String keyword) {
        return isExactMatch(movie, keyword) ? 0 : 1;
    }

    private int startsWithPriority(TmdbMovieListResponse.MovieSummary movie, String keyword) {
        return startsWithMatch(movie, keyword) ? 0 : 1;
    }

    private boolean isExactMatch(TmdbMovieListResponse.MovieSummary movie, String keyword) {
        String title = normalize(movie.getTitle());
        String originalTitle = normalize(movie.getOriginalTitle());
        return title.equals(keyword) || originalTitle.equals(keyword);
    }

    private boolean startsWithMatch(TmdbMovieListResponse.MovieSummary movie, String keyword) {
        String title = normalize(movie.getTitle());
        String originalTitle = normalize(movie.getOriginalTitle());
        return title.startsWith(keyword) || originalTitle.startsWith(keyword);
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase();
    }

    private MovieSearchResponse toMovieSearchResponse(TmdbMovieListResponse.MovieSummary movie) {
        return new MovieSearchResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getOriginalTitle(),
                movie.getOverview(),
                movie.getReleaseDate(),
                toFullImageUrl(movie.getPosterPath(), true),
                toFullImageUrl(movie.getBackdropPath(), false),
                movie.getPopularity(),
                movie.getVoteAverage(),
                movie.getVoteCount()
        );
    }

    private String toFullImageUrl(String path, boolean poster) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        if (path.startsWith("http")) {
            return path;
        }

        String size = poster ? TMDB_POSTER_SIZE : TMDB_BACKDROP_SIZE;
        return TMDB_IMAGE_BASE_URL + "/" + size + path;
    }
}
