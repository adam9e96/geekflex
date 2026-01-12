package com.geekflex.app.service.tmdb;

import com.geekflex.app.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.dto.tmdb.TmdbTvDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Log4j2
public class TmdbApiService {

    private final WebClient tmdbWebClient;
    private static final String DEFAULT_LANGUAGE = "ko-KR";

    /**
     * TMDB 영화 상세 페이지 조회
     * baseUri/3/movie/1218925?language=ko-KR
     */
    public TmdbMovieDetailResponse getMovieDetails(Long tmdbId) {
        log.info("영화 상세 요청 - tmdbId : {}", tmdbId);

        TmdbMovieDetailResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + tmdbId)
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .build()
                )
                .retrieve()
                .bodyToMono(TmdbMovieDetailResponse.class)
                .block();

        if (response == null) {
            log.warn("TMDB 상세 응답이 NULL (tmdbId: {})", tmdbId);
        } else {
            log.info("TMDB 상세 응답 완료 → title: {}", response.getTitle());
        }

        return response;
    }

    /**
     * TMDB 영화 검색
     *
     * @param query 검색어 (영화 제목)
     * @return 검색 결과 (정확 일치 -> 부분 일치 순으로 정렬됨)
     */
    public TmdbMovieListResponse searchMovies(String query) {

        TmdbMovieListResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("query", query)
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .queryParam("page", 1)
                        .build()
                )
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class)
                .block();

        if (response == null || response.getResults() == null) {
            log.warn("TMDB 검색 응답이 NULL 또는 빈 목록 (query: {})", query);
            return response;
        }

        // 검색 결과를 정확 일치 -> 부분 일치 순으로 정렬
        response.getResults().sort((a, b) -> {
            String queryLower = query.toLowerCase().trim(); // 소문자, 트림

            String titleA = (a.getTitle() != null) ? a.getTitle().toLowerCase() : "";
            String titleB = (b.getTitle() != null) ? b.getTitle().toLowerCase() : "";
            String originalTitleA = (a.getOriginalTitle() != null) ? a.getOriginalTitle().toLowerCase() : "";
            String originalTitleB = (b.getOriginalTitle() != null) ? b.getOriginalTitle().toLowerCase() : "";

            boolean exactMatchA = titleA.equals(queryLower) || originalTitleA.equals(queryLower);
            boolean exactMatchB = titleB.equals(queryLower) || originalTitleB.equals(queryLower);

            if (exactMatchA && !exactMatchB) return -1;
            if (!exactMatchA && exactMatchB) return 1;

            boolean startsWithA = titleA.startsWith(queryLower) || originalTitleA.startsWith(queryLower);
            boolean startsWithB = titleB.startsWith(queryLower) || originalTitleB.startsWith(queryLower);

            if (startsWithA && !startsWithB) return -1;
            if (!startsWithA && startsWithB) return 1;

            // 인기도(BigDecimal) 내림차순
            if (a.getPopularity() == null && b.getPopularity() == null) return 0;
            if (a.getPopularity() == null) return 1;
            if (b.getPopularity() == null) return -1;

            return b.getPopularity().compareTo(a.getPopularity());
        });

        log.info("TMDB 검색 응답 완료 - query: {}, 결과 수: {}", query, response.getResults().size());
        return response;
    }

    /**
     * TMDB TV(드라마) 검색
     *
     * @param query 검색어 (드라마 제목)
     * @return 검색 결과 (정확 일치 -> 부분 일치 순으로 정렬됨)
     */
    public com.geekflex.app.dto.tmdb.TmdbTvListResponse searchTv(String query) {

        com.geekflex.app.dto.tmdb.TmdbTvListResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/tv")
                        .queryParam("query", query)
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .queryParam("page", 1)
                        .build()
                )
                .retrieve()
                .bodyToMono(com.geekflex.app.dto.tmdb.TmdbTvListResponse.class)
                .block();

        if (response == null || response.getResults() == null) {
            log.warn("TMDB TV 검색 응답이 NULL 또는 빈 목록 (query: {})", query);
            return response;
        }

        // 검색 결과를 정확 일치 -> 부분 일치 순으로 정렬
        response.getResults().sort((a, b) -> {
            String queryLower = query.toLowerCase().trim(); // 소문자, 트림

            String nameA = (a.getName() != null) ? a.getName().toLowerCase() : "";
            String nameB = (b.getName() != null) ? b.getName().toLowerCase() : "";
            String originalNameA = (a.getOriginalName() != null) ? a.getOriginalName().toLowerCase() : "";
            String originalNameB = (b.getOriginalName() != null) ? b.getOriginalName().toLowerCase() : "";

            boolean exactMatchA = nameA.equals(queryLower) || originalNameA.equals(queryLower);
            boolean exactMatchB = nameB.equals(queryLower) || originalNameB.equals(queryLower);

            if (exactMatchA && !exactMatchB) return -1;
            if (!exactMatchA && exactMatchB) return 1;

            boolean startsWithA = nameA.startsWith(queryLower) || originalNameA.startsWith(queryLower);
            boolean startsWithB = nameB.startsWith(queryLower) || originalNameB.startsWith(queryLower);

            if (startsWithA && !startsWithB) return -1;
            if (!startsWithA && startsWithB) return 1;

            // 인기도(BigDecimal) 내림차순
            if (a.getPopularity() == null && b.getPopularity() == null) return 0;
            if (a.getPopularity() == null) return 1;
            if (b.getPopularity() == null) return -1;

            return b.getPopularity().compareTo(a.getPopularity());
        });

        log.info("TMDB TV 검색 응답 완료 - query: {}, 결과 수: {}", query, response.getResults().size());
        return response;
    }

    /**
     * TMDB TV 상세 페이지 조회
     * baseUri/3/tv/{tvId}?language=ko-KR
     */
    public TmdbTvDetailResponse getTvDetails(Long tmdbId) {
        log.info("TV 상세 요청 - tmdbId : {}", tmdbId);

        TmdbTvDetailResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tv/" + tmdbId)
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .build()
                )
                .retrieve()
                .bodyToMono(TmdbTvDetailResponse.class)
                .block();

        if (response == null) {
            log.warn("TMDB TV 상세 응답이 NULL (tmdbId: {})", tmdbId);
        } else {
            log.info("TMDB TV 상세 응답 완료 → name: {}, id: {}, firstAirDate: {}, lastAirDate: {}, genres: {}, originCountry: {}",
                    response.getName(), response.getId(), response.getFirstAirDate(), 
                    response.getLastAirDate(), response.getGenres(), response.getOriginCountry());
        }

        return response;
    }

}
