package com.geekflex.app.content.controller;

import com.geekflex.app.content.dto.ContentResponse;
import com.geekflex.app.content.service.ContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
@Tag(name = "Content", description = "공통 콘텐츠 API")
public class ContentController {

    private final ContentService contentService;

    @Operation(summary = "랜덤 작품 조회", description = "DB에 저장된 영화/드라마 중 무작위 작품 1개를 반환합니다.")
    @GetMapping("/random")
    public ContentResponse getRandomContent() {
        return contentService.getRandomContent();
    }

    @Operation(summary = "랜덤 검색 제안 조회", description = "DB에 저장된 영화/드라마 중 검색 제안으로 사용할 작품 4개를 반환합니다.")
    @GetMapping("/random-suggestions")
    public List<ContentResponse> getRandomContentSuggestions() {
        return contentService.getRandomContentSuggestions();
    }
}
