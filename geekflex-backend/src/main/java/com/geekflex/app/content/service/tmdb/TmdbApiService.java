package com.geekflex.app.content.service.tmdb;
import com.geekflex.app.content.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.content.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.content.dto.tmdb.TmdbTvDetailResponse;
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
                        .path("/movie/{id}")
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .build(tmdbId)
                )
                .retrieve()
                .bodyToMono(TmdbMovieDetailResponse.class)
                .block();

        if (response == null) {
            throw new IllegalArgumentException("TMDB 영화 상세 응답이 NULL (tmdbId: " + tmdbId + ")");
        }

        log.info("TMDB 상세 응답 완료 → title: {}", response.getTitle());
        return response;
    }

    /**
     * TMDB 영화 검색
     *
     * @param query 검색어 (영화 제목)
     * @return 검색 결과 (정렬은 서비스 계층에서 수행)
     */
    public TmdbMovieListResponse searchMovies(String query) {

        TmdbMovieListResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("query", "{query}")
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .queryParam("page", 1)
                        .build(query)
                )
                .retrieve()
                .bodyToMono(TmdbMovieListResponse.class)
                .block();

        if (response == null || response.getResults() == null) {
            log.warn("TMDB 검색 응답이 NULL 또는 빈 목록 (query: {})", query);
            return response;
        }

        log.info("TMDB 검색 응답 완료 - query: {}, 결과 수: {}", query, response.getResults().size());
        return response;
    }

    /**
     * TMDB TV(드라마) 검색
     *
     * @param query 검색어 (드라마 제목)
     * @return 검색 결과 (정렬은 서비스 계층에서 수행)
     */
    public com.geekflex.app.content.dto.tmdb.TmdbTvListResponse searchTv(String query) {

        com.geekflex.app.content.dto.tmdb.TmdbTvListResponse response = tmdbWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/tv")
                        .queryParam("query", "{query}")
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .queryParam("page", 1)
                        .build(query)
                )
                .retrieve()
                .bodyToMono(com.geekflex.app.content.dto.tmdb.TmdbTvListResponse.class)
                .block();

        if (response == null || response.getResults() == null) {
            log.warn("TMDB TV 검색 응답이 NULL 또는 빈 목록 (query: {})", query);
            return response;
        }

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
                        .path("/tv/{id}")
                        .queryParam("language", DEFAULT_LANGUAGE)
                        .build(tmdbId)
                )
                .retrieve()
                .bodyToMono(TmdbTvDetailResponse.class)
                .block();

        if (response == null) {
            throw new IllegalArgumentException("TMDB TV 상세 응답이 NULL (tmdbId: " + tmdbId + ")");
        }

        log.info("TMDB TV 상세 응답 완료 → name: {}, id: {}, firstAirDate: {}, lastAirDate: {}, genres: {}, originCountry: {}",
                response.getName(), response.getId(), response.getFirstAirDate(),
                response.getLastAirDate(), response.getGenres(), response.getOriginCountry());
        return response;
    }

}









