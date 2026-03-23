package com.geekflex.app.content.service;

import com.geekflex.app.common.exception.InvalidSearchKeywordException;
import com.geekflex.app.common.exception.TmdbApiException;
import com.geekflex.app.content.dto.tmdb.TmdbTvListResponse;
import com.geekflex.app.content.dto.tv.TvSearchResponse;
import com.geekflex.app.content.service.tmdb.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class TvSearchServiceImpl implements TvSearchService {

    private static final String TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
    private static final String TMDB_POSTER_SIZE = "w500";
    private static final String TMDB_BACKDROP_SIZE = "w1280";

    private final TmdbApiService tmdbApiService;

    @Override
    public List<TvSearchResponse> searchTv(String keyword) {
        String normalizedKeyword = normalizeKeyword(keyword);
        TmdbTvListResponse response = requestTvSearch(normalizedKeyword);

        if (isEmptyResponse(response)) {
            return List.of();
        }

        return response.getResults().stream()
                .map(this::toTvSearchResponse)
                .toList();
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new InvalidSearchKeywordException("검색어를 입력해주세요.");
        }

        String normalized = keyword.trim().toLowerCase();
        log.info("드라마 검색 시작 - keyword: {}", normalized);
        return normalized;
    }

    private TmdbTvListResponse requestTvSearch(String keyword) {
        try {
            return tmdbApiService.searchTv(keyword);
        } catch (WebClientException e) {
            log.error("TMDB API 호출 실패 - keyword: {}, error: {}", keyword, e.getMessage(), e);
            throw new TmdbApiException("드라마 검색 API 호출에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("TMDB API 호출 중 예상치 못한 오류 발생 - keyword: {}, error: {}", keyword, e.getMessage(), e);
            throw new TmdbApiException("드라마 검색 중 오류가 발생했습니다.", e);
        }
    }

    private boolean isEmptyResponse(TmdbTvListResponse response) {
        return response == null || response.getResults() == null || response.getResults().isEmpty();
    }

    private TvSearchResponse toTvSearchResponse(TmdbTvListResponse.TvSummary tv) {
        return new TvSearchResponse(
                tv.getId(),
                tv.getName(),
                tv.getOriginalName(),
                tv.getOverview(),
                tv.getFirstAirDate(),
                toFullImageUrl(tv.getPosterPath(), true),
                toFullImageUrl(tv.getBackdropPath(), false),
                tv.getPopularity(),
                tv.getVoteAverage(),
                tv.getVoteCount()
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
