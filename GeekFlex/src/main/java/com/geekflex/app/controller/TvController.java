package com.geekflex.app.controller;

import com.geekflex.app.dto.ApiResponse;
import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.dto.tv.TvSearchResponse;
import com.geekflex.app.dto.tmdb.TvDetailResponse;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.service.ContentService;
import com.geekflex.app.service.TvSearchService;
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
public class TvController {

    private final TvSearchService tvSearchService;
    private final ContentService contentService;

    /**
     * 드라마 검색
     * 제목을 입력하면 정확 일치 -> 부분 일치 순으로 정렬된 결과 반환
     * 예: GET /api/v1/tv/search?keyword=오징어게임
     *
     * @param keyword  검색어 (드라마 제목)
     */
    @GetMapping("/search")
    public List<TvSearchResponse> searchTv(
            @RequestParam("keyword") String keyword) {
        log.info("드라마 검색 API 호출 - keyword: {}", keyword);
        return tvSearchService.searchTv(keyword);
    }

    /**
     * 드라마 저장
     * 검색 결과에서 선택한 드라마를 DB에 저장
     * 예: POST /api/v1/tv/{tmdbId}
     *
     * @param tmdbId  TMDB ID
     */
    @PostMapping("/{tmdbId}")
    public ResponseEntity<ApiResponse<ContentResponse>> saveTv(
            @PathVariable Long tmdbId) {
        log.info("드라마 저장 요청 - tmdbId: {}", tmdbId);
        
        ContentResponse content = contentService.getOrCreateContent(tmdbId, ContentType.TV)
                .toDto();

        ApiResponse<ContentResponse> apiResponse = ApiResponse.<ContentResponse>builder()
                .success(true)
                .message("드라마가 저장되었습니다.")
                .data(content)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    /**
     * tmdb id로 조회
     */
    @GetMapping("/{tmdbId}")
    public TvDetailResponse getTvDetail(
            @PathVariable Long tmdbId,
            @RequestParam(defaultValue = "ko-KR") String language) {
        log.info("드라마 상세 조회 - tmdbId: {}", tmdbId);
        return contentService.getTvDetailWithCaching(tmdbId, language);
    }
}

