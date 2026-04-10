package com.geekflex.app.content.service;

import com.geekflex.app.common.exception.InvalidSearchKeywordException;
import com.geekflex.app.common.exception.TmdbApiException;
import com.geekflex.app.content.dto.tmdb.TmdbTvListResponse;
import com.geekflex.app.content.dto.tv.TvSearchResponse;
import com.geekflex.app.content.service.tmdb.TmdbApiService;
import com.geekflex.app.content.service.tmdb.TmdbImageUrlBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientException;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class TvSearchServiceImpl implements TvSearchService {

    private final TmdbApiService tmdbApiService;

    @Override
    public List<TvSearchResponse> searchTv(String keyword) {
        String normalizedKeyword = normalizeKeyword(keyword);
        TmdbTvListResponse response = requestTvSearch(normalizedKeyword);

        if (isEmptyResponse(response)) {
            return List.of();
        }

        return sortByRelevance(response.getResults(), normalizedKeyword).stream()
                .map(this::toTvSearchResponse)
                .toList();
    }

    private List<TmdbTvListResponse.TvSummary> sortByRelevance(
            List<TmdbTvListResponse.TvSummary> tvShows,
            String keyword
    ) {
        return tvShows.stream()
                .sorted(buildSearchComparator(keyword))
                .toList();
    }

    private Comparator<TmdbTvListResponse.TvSummary> buildSearchComparator(String keyword) {
        return Comparator
                .comparing((TmdbTvListResponse.TvSummary tv) -> exactMatchPriority(tv, keyword))
                .thenComparing(tv -> startsWithPriority(tv, keyword))
                .thenComparing(TmdbTvListResponse.TvSummary::getPopularity,
                        Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private int exactMatchPriority(TmdbTvListResponse.TvSummary tv, String keyword) {
        return isExactMatch(tv, keyword) ? 0 : 1;
    }

    private int startsWithPriority(TmdbTvListResponse.TvSummary tv, String keyword) {
        return startsWithMatch(tv, keyword) ? 0 : 1;
    }

    private boolean isExactMatch(TmdbTvListResponse.TvSummary tv, String keyword) {
        String name = normalize(tv.getName());
        String originalName = normalize(tv.getOriginalName());
        return name.equals(keyword) || originalName.equals(keyword);
    }

    private boolean startsWithMatch(TmdbTvListResponse.TvSummary tv, String keyword) {
        String name = normalize(tv.getName());
        String originalName = normalize(tv.getOriginalName());
        return name.startsWith(keyword) || originalName.startsWith(keyword);
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase();
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
                TmdbImageUrlBuilder.poster(tv.getPosterPath()),
                TmdbImageUrlBuilder.backdrop(tv.getBackdropPath()),
                tv.getPopularity(),
                tv.getVoteAverage(),
                tv.getVoteCount()
        );
    }
}
