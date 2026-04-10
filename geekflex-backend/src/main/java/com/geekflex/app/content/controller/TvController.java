package com.geekflex.app.content.controller;

import com.geekflex.app.common.dto.ApiResponse;
import com.geekflex.app.content.dto.ContentResponse;
import com.geekflex.app.content.dto.tv.TvSearchResponse;
import com.geekflex.app.content.dto.tmdb.TvDetailResponse;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.entity.TagType;
import com.geekflex.app.content.service.ContentService;
import com.geekflex.app.content.service.TvSearchService;
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
@RequestMapping("/api/v1/tv")
@RequiredArgsConstructor
@Tag(name = "TV", description = "드라마 조회 및 검색 API")
public class TvController {

    private final TvSearchService tvSearchService;
    private final ContentService contentService;

    @Operation(summary = "오늘 방영 드라마 조회", description = "TMDB 기준 오늘 방영하는 드라마 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })
    @GetMapping("/airing-today")
    public List<ContentResponse> getAiringToday() {
        return contentService.getContentsByTagType(TagType.TV_AIRING_TODAY);
    }

    @Operation(summary = "인기 드라마 조회", description = "TMDB 기준 인기 드라마 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })
    @GetMapping("/popular")
    public List<ContentResponse> getPopular() {
        return contentService.getContentsByTagType(TagType.TV_POPULAR);
    }

    @Operation(summary = "높은 평점 드라마 조회", description = "TMDB 기준 평점이 높은 드라마 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })
    @GetMapping("/top-rated")
    public List<ContentResponse> getTopRated() {
        return contentService.getContentsByTagType(TagType.TV_TOP_RATED);
    }

    @Operation(summary = "방영 중 드라마 조회", description = "TMDB 기준 현재 방영 중인 드라마 목록을 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ContentResponse.class)))
            )
    })
    @GetMapping("/on-the-air")
    public List<ContentResponse> getOnTheAir() {
        return contentService.getContentsByTagType(TagType.TV_ON_THE_AIR);
    }

    @Operation(summary = "드라마 상세 조회", description = "TMDB ID로 드라마 상세 정보를 조회합니다. DB 정보와 TMDB API 정보를 결합하여 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = TvDetailResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "드라마를 찾을 수 없음"
            )
    })
    @GetMapping("/{tmdbId}")
    public TvDetailResponse getTvDetail(
            @Parameter(description = "TMDB 드라마 ID", example = "94605", required = true)
            @PathVariable Long tmdbId,
            @Parameter(description = "응답 언어 코드", example = "ko-KR")
            @RequestParam(defaultValue = "ko-KR") String language) {
        log.info("드라마 상세 조회 - tmdbId: {}", tmdbId);
        return contentService.getTvDetailWithCaching(tmdbId, language);
    }

    @Operation(summary = "드라마 검색", description = "제목으로 드라마를 검색합니다. 정확 일치 → 부분 일치 순으로 정렬된 결과를 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "검색 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TvSearchResponse.class)))
            )
    })
    @GetMapping("/search")
    public List<TvSearchResponse> searchTv(
            @Parameter(description = "검색어 (드라마 제목)", example = "오징어게임", required = true)
            @RequestParam("keyword") String keyword) {
        log.info("드라마 검색 API 호출 - keyword: {}", keyword);
        return tvSearchService.searchTv(keyword);
    }

    @Operation(summary = "드라마 저장", description = "TMDB ID로 드라마를 조회하여 DB에 저장합니다. 이미 저장된 경우 기존 데이터를 반환합니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "저장 성공",
                    content = @Content(schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "TMDB에서 드라마를 찾을 수 없음"
            )
    })
    @PostMapping("/{tmdbId}")
    public ResponseEntity<ApiResponse<ContentResponse>> saveTv(
            @Parameter(description = "TMDB 드라마 ID", example = "94605", required = true)
            @PathVariable Long tmdbId) {
        log.info("드라마 저장 요청 - tmdbId: {}", tmdbId);

        ContentResponse content = ContentResponse.from(
                contentService.getOrCreateContent(tmdbId, ContentType.TV));

        ApiResponse<ContentResponse> apiResponse = ApiResponse.<ContentResponse>builder()
                .success(true)
                .message("드라마가 저장되었습니다.")
                .data(content)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
}









