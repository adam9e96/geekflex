package com.geekflex.app.controller;

import com.geekflex.app.dto.ApiResponse;
import com.geekflex.app.dto.collection.*;
import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.service.collection.CollectionCommentService;
import com.geekflex.app.service.collection.CollectionItemService;
import com.geekflex.app.service.collection.CollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final CollectionItemService collectionItemService;
    private final CollectionCommentService collectionCommentService;

    /**
     * 컬렉션 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CollectionResponse>> createCollection(
            @RequestBody @Valid CollectionCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("컬렉션 생성 요청: title={}", request.getTitle());

        CollectionResponse response = collectionService.createCollection(
                userDetails.getUsername(),
                request
        );

        ApiResponse<CollectionResponse> apiResponse = ApiResponse.<CollectionResponse>builder()
                .success(true)
                .message("컬렉션이 생성되었습니다.")
                .data(response)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    /**
     * 공개 컬렉션 목록 조회
     *
     * @param sortBy 정렬 기준 (latest: 최신순, views: 조회수순)
     *               latest : created 순, views : 조회수
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<CollectionResponse>>> getPublicCollections(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false, defaultValue = "latest") String sortBy,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("공개 컬렉션 목록 조회: sortBy={}, page={}", sortBy, pageable.getPageNumber());

        Page<CollectionResponse> collections = collectionService.getPublicCollections(pageable, sortBy);

        ApiResponse<Page<CollectionResponse>> apiResponse = ApiResponse.<Page<CollectionResponse>>builder()
                .success(true)
                .data(collections)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * 컬렉션 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CollectionDetailResponse>> getCollection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("컬렉션 상세 조회: collectionId={}", id);

//        String username = userDetails.getUsername();

        String username = userDetails != null ? userDetails.getUsername() : null;

        // 조회수 증가 로직을 별도 트랜잭션으로 분리
        collectionService.incrementViewCount(id, username);

        CollectionDetailResponse response = collectionService.getCollection(id, username);

        ApiResponse<CollectionDetailResponse> apiResponse = ApiResponse.<CollectionDetailResponse>builder()
                .success(true)
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * 컬렉션 수정
     * 제목, 설명, 공개 여부 관리
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CollectionResponse>> updateCollection(
            @PathVariable Long id,
            @RequestBody @Valid CollectionUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("컬렉션 수정 요청: collectionId={}", id);

        CollectionResponse response = collectionService.updateCollection(
                id,
                userDetails.getUsername(),
                request
        );

        ApiResponse<CollectionResponse> apiResponse = ApiResponse.<CollectionResponse>builder()
                .success(true)
                .message("컬렉션이 수정되었습니다.")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * 컬렉션 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("컬렉션 삭제 요청: collectionId={}", id);

        collectionService.deleteCollection(id, userDetails.getUsername());

        return ResponseEntity.noContent().build(); // 402 반환
    }

    /**
     * 내 컬렉션 목록 조회
     * 로그인한 유저 본인의 컬렉션만 조회함
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<CollectionResponse>>> getMyCollections(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("내 컬렉션 목록 조회: username={}", userDetails.getUsername());

        List<CollectionResponse> collections = collectionService.getMyCollections(userDetails.getUsername());

        ApiResponse<List<CollectionResponse>> apiResponse = ApiResponse.<List<CollectionResponse>>builder()
                .success(true)
                .data(collections)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * 특정 사용자의 컬렉션 목록 조회
     * userId로 해도 보안에 큰 문제는 없으므로
     *
     * @param userIdOrPublicId 사용자 ID 또는 Public ID
     */
    @GetMapping("/user/{userIdOrPublicId}")
    public ResponseEntity<ApiResponse<List<CollectionResponse>>> getUserCollections(
            @PathVariable String userIdOrPublicId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("사용자 컬렉션 목록 조회: userIdOrPublicId={}", userIdOrPublicId);

        String username = userDetails != null ? userDetails.getUsername() : null;
        List<CollectionResponse> collections = collectionService.getUserCollections(userIdOrPublicId, username);

        ApiResponse<List<CollectionResponse>> apiResponse = ApiResponse.<List<CollectionResponse>>builder()
                .success(true)
                .data(collections)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    // ==========================================
    // 작품 관리 엔드포인트
    // ==========================================

    /**
     * 컬렉션에 작품 추가
     */
    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<Void>> addItem(
            @PathVariable Long id,
            @RequestBody @Valid CollectionItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("작품 추가 요청: collectionId={}, contentId={}", id, request.getContentId());

        collectionItemService.addItem(id, request, userDetails.getUsername());

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("작품이 컬렉션에 추가되었습니다.")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    /**
     * 컬렉션에서 작품 제거
     */
    @DeleteMapping("/{id}/items/{contentId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long id,
            @PathVariable Long contentId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("작품 제거 요청: collectionId={}, contentId={}", id, contentId);

        collectionItemService.removeItem(id, contentId, userDetails.getUsername());

        return ResponseEntity.noContent().build();
    }

    /**
     * 컬렉션의 작품 목록 조회
     */
    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<ContentResponse>>> getCollectionItems(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("작품 목록 조회: collectionId={}", id);

        String username = userDetails != null ? userDetails.getUsername() : null;
        List<ContentResponse> items = collectionItemService.getCollectionItems(id, username);

        ApiResponse<List<ContentResponse>> apiResponse = ApiResponse.<List<ContentResponse>>builder()
                .success(true)
                .data(items)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
    @GetMapping("/{id}/items/count")
    public ResponseEntity<ApiResponse<Long>> getCollectionItemsCount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        log.info("작품 개수 조회");
//        long collectionItemCount = collectionItemService


        return null;
    }


    /**
     * 컬렉션의 작품
     */

    // ==========================================
    // 댓글 관리 엔드포인트
    // ==========================================

    /**
     * 댓글 작성
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CollectionCommentResponse>> createComment(
            @PathVariable Long id,
            @RequestBody @Valid CollectionCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("댓글 작성 요청: collectionId={}", id);

        CollectionCommentResponse response = collectionCommentService.createComment(
                id,
                request,
                userDetails.getUsername()
        );

        ApiResponse<CollectionCommentResponse> apiResponse = ApiResponse.<CollectionCommentResponse>builder()
                .success(true)
                .message("댓글이 작성되었습니다.")
                .data(response)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    /**
     * 댓글 수정
     */
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<CollectionCommentResponse>> updateComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @RequestBody @Valid CollectionCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("댓글 수정 요청: collectionId={}, commentId={}", id, commentId);

        CollectionCommentResponse response = collectionCommentService.updateComment(
                commentId,
                request,
                userDetails.getUsername()
        );

        ApiResponse<CollectionCommentResponse> apiResponse = ApiResponse.<CollectionCommentResponse>builder()
                .success(true)
                .message("댓글이 수정되었습니다.")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("댓글 삭제 요청: collectionId={}, commentId={}", id, commentId);

        collectionCommentService.deleteComment(commentId, userDetails.getUsername());

        return ResponseEntity.noContent().build();
    }

    /**
     * 댓글 목록 조회
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CollectionCommentResponse>>> getComments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("댓글 목록 조회: collectionId={}", id);

        String username = userDetails != null ? userDetails.getUsername() : null;
        List<CollectionCommentResponse> comments = collectionCommentService.getComments(id, username);

        ApiResponse<List<CollectionCommentResponse>> apiResponse = ApiResponse.<List<CollectionCommentResponse>>builder()
                .success(true)
                .data(comments)
                .build();

        return ResponseEntity.ok(apiResponse);
    }
}
