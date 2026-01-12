package com.geekflex.app.controller;

import com.geekflex.app.dto.ApiResponse;
import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.dto.movie.MovieSearchResponse;
import com.geekflex.app.dto.tmdb.MovieDetailResponse;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;
import com.geekflex.app.service.ContentService;
import com.geekflex.app.service.MovieSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Log4j2
@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
public class MovieController {

    private final ContentService contentService;
    private final MovieSearchService movieSearchService;

    /**
     * NOW_PLAYING (현재 상영작)
     */
    @GetMapping("/now-playing")
    public List<ContentResponse> getNowPlaying() {
        return contentService.getContentsByTagType(TagType.NOW_PLAYING);
    }

    /**
     * POPULAR (인기 영화)
     */
    @GetMapping("/popular")
    public List<ContentResponse> getPopular() {
        return contentService.getContentsByTagType(TagType.POPULAR);
    }

    /**
     * top_rated
     */
    @GetMapping("/top_rated")
    public List<ContentResponse> getTopRated() {
        return contentService.getContentsByTagType(TagType.TOP_RATED);
    }

    /**
     * UPCOMING
     */
    @GetMapping("/upcoming")
    public List<ContentResponse> getUpcoming() {
        return contentService.getContentsByTagType(TagType.UPCOMING);
    }

    /**
     * tmdb id로 조회
     */
    @GetMapping("/{tmdbId}")
    public MovieDetailResponse getMovieDetail(
            @PathVariable Long tmdbId,
            @RequestParam(defaultValue = "ko-KR") String language
    ) {
        return contentService.getMovieDetailWithCaching(tmdbId, language);
    }

    /**
     * 영화 검색
     * 제목을 입력하면 정확 일치 -> 부분 일치 순으로 정렬된 결과 반환
     * 예: GET /api/v1/movies/search?keyword=아바타&page=0&size=10
     *
     * @param keyword  검색어 (영화 제목)
     */
    @GetMapping("/search")
    public List<MovieSearchResponse> searchMovies(
            @RequestParam("keyword") String keyword) {
        log.info("영화 검색 API 호출 - keyword: {}", keyword);
        return movieSearchService.searchMovies(keyword);
    }

    /**
     * 영화 저장
     * 검색 결과에서 선택한 영화를 DB에 저장
     * 예: POST /api/v1/movies/{tmdbId}
     *
     * @param tmdbId  TMDB ID
     */
    @PostMapping("/{tmdbId}")
    public ResponseEntity<ApiResponse<ContentResponse>> saveMovie(
            @PathVariable Long tmdbId) {
        log.info("영화 저장 요청 - tmdbId: {}", tmdbId);
        
        ContentResponse content = contentService.getOrCreateContent(tmdbId, ContentType.MOVIE)
                .toDto();

        ApiResponse<ContentResponse> apiResponse = ApiResponse.<ContentResponse>builder()
                .success(true)
                .message("영화가 저장되었습니다.")
                .data(content)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

}