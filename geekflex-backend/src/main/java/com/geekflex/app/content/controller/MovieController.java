package com.geekflex.app.content.controller;

import com.geekflex.app.common.dto.ApiResponse;
import com.geekflex.app.content.dto.ContentResponse;
import com.geekflex.app.content.dto.movie.MovieSearchResponse;
import com.geekflex.app.content.dto.tmdb.MovieDetailResponse;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.service.ContentService;
import com.geekflex.app.content.service.MovieSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Movie", description = "영화 조회 및 검색 API")
public class MovieController {

    private final ContentService contentService; // 공용 콘텐츠 CRUD 서비스
    private final MovieSearchService movieSearchService; // 영화 검색 서비스

    @Operation(summary = "현재 상영작 조회", description = "TMDB 기준 현재 상영 중인 영화 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })
    @GetMapping("/now-playing")
    public List<ContentResponse> getNowPlaying() {
        return contentService.getContentsByTagType(TagType.NOW_PLAYING);
    }

    @Operation(summary = "인기 영화 조회", description = "TMDB 기준 인기 영화 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })

    @GetMapping("/popular")
    public List<ContentResponse> getPopular() {
        return contentService.getContentsByTagType(TagType.POPULAR);
    }

    @Operation(summary = "높은 평점 영화 조회", description = "TMDB 기준 평점이 높은 영화 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })
    @GetMapping("/top_rated")
    public List<ContentResponse> getTopRated() {
        return contentService.getContentsByTagType(TagType.TOP_RATED);
    }

    @Operation(summary = "개봉 예정 영화 조회", description = "TMDB 기준 개봉 예정 영화 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })
    @GetMapping("/upcoming")
    public List<ContentResponse> getUpcoming() {
        return contentService.getContentsByTagType(TagType.UPCOMING);
    }

    @Operation(summary = "영화 상세 조회", description = "TMDB ID로 영화 상세 정보를 조회합니다. DB 정보와 TMDB API 정보를 결합하여 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = MovieDetailResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "영화를 찾을 수 없음"
            )
    })
    @GetMapping("/{tmdbId}")
    public MovieDetailResponse getMovieDetail(
            @Parameter(description = "TMDB 영화 ID", example = "550", required = true)
            @PathVariable Long tmdbId,
            @Parameter(description = "응답 언어 코드", example = "ko-KR")
            @RequestParam(defaultValue = "ko-KR") String language) {
        log.info("영화 상세 조회 - tmdbId: {}", tmdbId);
        return contentService.getMovieDetailWithCaching(tmdbId, language);
    }

    @Operation(summary = "영화 검색", description = "제목으로 영화를 검색합니다. 정확 일치 → 부분 일치 순으로 정렬된 결과를 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "검색 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MovieSearchResponse.class)))
            )
    })
    @GetMapping("/search")
    public List<MovieSearchResponse> searchMovies(
            @Parameter(description = "검색어 (영화 제목)", example = "아바타", required = true)
            @RequestParam("keyword") String keyword) {
        log.info("영화 검색 API 호출 - keyword: {}", keyword);
        return movieSearchService.searchMovies(keyword);
    }

    @Operation(summary = "영화 저장", description = "TMDB ID로 영화를 조회하여 DB에 저장합니다. 이미 저장된 경우 기존 데이터를 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "저장 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "TMDB에서 영화를 찾을 수 없음"
            )
    })
    @PostMapping("/{tmdbId}")
    public ResponseEntity<ApiResponse<ContentResponse>> saveMovie(
            @Parameter(description = "TMDB 영화 ID", example = "550", required = true)
            @PathVariable Long tmdbId) {
        log.info("영화 저장 요청 - tmdbId: {}", tmdbId);

        ContentResponse content = ContentResponse.from(
                contentService.getOrCreateContent(tmdbId, ContentType.MOVIE));

        ApiResponse<ContentResponse> apiResponse = ApiResponse.<ContentResponse>builder()
                .success(true)
                .message("영화가 저장되었습니다.")
                .data(content)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
}







