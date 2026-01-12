package com.geekflex.app.service;

import com.geekflex.app.dto.tv.TvSearchResponse;
import com.geekflex.app.dto.tmdb.TmdbTvListResponse;
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
public class TvSearchServiceImpl implements TvSearchService {

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
    public List<TvSearchResponse> searchTv(String keyword) {

        if (keyword == null || keyword.isBlank()) {
            throw new InvalidSearchKeywordException("검색어를 입력해주세요.");
        }

        String trimmed = keyword.trim().toLowerCase();
        log.info("드라마 검색 시작 - keyword: {}", trimmed);

        // 1. TMDB API 호출
        TmdbTvListResponse response;
        try {
            response = tmdbApiService.searchTv(trimmed);
        } catch (WebClientException e) {
            log.error("TMDB API 호출 실패 - keyword: {}, error: {}", trimmed, e.getMessage(), e);
            throw new TmdbApiException("드라마 검색 API 호출에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("TMDB API 호출 중 예상치 못한 오류 발생 - keyword: {}, error: {}", trimmed, e.getMessage(), e);
            throw new TmdbApiException("드라마 검색 중 오류가 발생했습니다.", e);
        }

        if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
            log.warn("TMDB 검색 결과가 NULL 또는 빈 목록");
            return List.of();
        }

        // 2. 정렬 수행 (TmdbApiService에서 이미 정렬됨)
        // 추가 정렬이 필요하면 여기서 수행

        // 3. DTO 변환 (이미지 URL을 전체 URL로 변환)
        return response.getResults().stream()
                .map(tv -> new TvSearchResponse(
                        tv.getId(),
                        tv.getName(),
                        tv.getOriginalName(),
                        tv.getOverview(),
                        tv.getFirstAirDate(),
                        convertToFullImageUrl(tv.getPosterPath(), true),
                        convertToFullImageUrl(tv.getBackdropPath(), false),
                        tv.getPopularity(),
                        tv.getVoteAverage(),
                        tv.getVoteCount()
                ))
                .toList();
    }
}

