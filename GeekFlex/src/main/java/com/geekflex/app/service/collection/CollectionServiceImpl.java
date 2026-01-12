package com.geekflex.app.service.collection;

import com.geekflex.app.dto.UserSummaryResponse;
import com.geekflex.app.dto.collection.*;
import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.entity.*;
import com.geekflex.app.exception.CollectionAccessDeniedException;
import com.geekflex.app.exception.CollectionNotFoundException;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.like.repository.LikeRepository;
import com.geekflex.app.repository.*;
import com.geekflex.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class CollectionServiceImpl implements CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final CollectionCommentRepository collectionCommentRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final UserService userService;

    @Override
    @Transactional
    public CollectionResponse createCollection(String username, CollectionCreateRequest request) {
        log.info("컬렉션 생성 요청: username={}, title={}", username, request.getTitle());

        // 1. 사용자 조회
        Long userId = userService.findUserIdByUsername(username);

        // 2. 컬렉션 생성
        Collection collection = Collection.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .viewCount(0)
                .build();

        Collection saved = collectionRepository.save(collection);
        log.info("컬렉션 생성 완료: collectionId={}, userId={}", saved.getId(), userId);

        // 3. 응답 DTO 생성
        return buildCollectionResponse(saved, userId, userId);
    }

    @Override
    @Transactional
    public CollectionResponse updateCollection(Long collectionId, String username, CollectionUpdateRequest request) {
        log.info("컬렉션 수정 요청: collectionId={}, username={}", collectionId, username);

        // 1. 컬렉션 조회 및 소유권 확인
        Collection collection = findCollectionById(collectionId); // collectionid로 엔티티 가져오기
        Long userId = userService.findUserIdByUsername(username); // userId 조회

        validateOwnership(collection, userId);

        // 2. 수정할 필드 업데이트
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            collection.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            collection.setDescription(request.getDescription());
        }

        if (request.getIsPublic() != null) {
            collection.setIsPublic(request.getIsPublic());
        }

        Collection updated = collectionRepository.save(collection);
        log.info("컬렉션 수정 완료: collectionId={}", updated.getId());

        // 3. 응답 DTO 생성
        return buildCollectionResponse(updated, userId, userId);
    }

    @Override
    @Transactional
    public void deleteCollection(Long collectionId, String username) {
        log.info("컬렉션 삭제 요청: collectionId={}, username={}", collectionId, username);

        // 1. 컬렉션 조회 및 소유권 확인
        Collection collection = findCollectionById(collectionId);
        Long userId = userService.findUserIdByUsername(username);

        validateOwnership(collection, userId);

        // 2. 컬렉션 삭제 (CASCADE로 관련 데이터 자동 삭제)
        collectionRepository.delete(collection);
        log.info("컬렉션 삭제 완료: collectionId={}", collectionId);
    }

    @Override
    @Transactional(readOnly = true)
    public CollectionDetailResponse getCollection(Long collectionId, String username) {
        log.info("컬렉션 상세 조회: collectionId={}, username={}", collectionId, username);

        // 1. 컬렉션 조회
        Collection collection = findCollectionById(collectionId);

        // 2. 접근 권한 확인
        Long currentUserId = username != null ? userService.findUserIdByUsername(username) : null;

        validateAccess(collection, currentUserId);

        // 4. 작품 목록 조회
        List<CollectionItem> items = collectionItemRepository.findByCollectionIdOrderByAddedAtDesc(collectionId);
        List<ContentResponse> contentResponses = items.stream()
                .map(item -> item.getContent().toDto())
                .collect(Collectors.toList());

        // 5. 댓글 목록 조회
        List<CollectionComment> comments = collectionCommentRepository.findByCollectionIdOrderByCreatedAtAsc(collectionId);
        List<com.geekflex.app.dto.collection.CollectionCommentResponse> commentResponses = comments.stream()
                .map(comment -> buildCommentResponse(comment, currentUserId))
                .collect(Collectors.toList());

        // 6. 좋아요 정보 조회
        Long likeCount = likeRepository.countByTargetTypeAndTargetId(TargetType.COLLECTION, collectionId);
        Boolean isLiked = currentUserId != null &&
                likeRepository.existsByUserIdAndTargetTypeAndTargetId(currentUserId, TargetType.COLLECTION, collectionId);

        // 7. 작성자 정보 조회
        User author = userRepository.findById(collection.getUserId())
                .orElseThrow(() -> new RuntimeException("작성자를 찾을 수 없습니다."));
        UserSummaryResponse authorResponse = UserSummaryResponse.builder()
                .nickname(author.getNickname())
                .profileImage(author.getProfileImage())
                .userId(author.getUserId())
                .build();

        // 8. 응답 DTO 생성
        return CollectionDetailResponse.builder()
                .id(collection.getId())
                .title(collection.getTitle())
                .description(collection.getDescription())
                .isPublic(collection.getIsPublic())
                .viewCount(collection.getViewCount())
                .likeCount(likeCount)
                .isLiked(isLiked)
                .isOwner(currentUserId != null && collection.getUserId().equals(currentUserId))
                .author(authorResponse)
                .items(contentResponses)
                .comments(commentResponses)
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void incrementViewCount(Long collectionId, String username) {
        // 현재 userid 뽑아내기 username(user_id or user_email)
        Long currentUserId = username != null ? userService.findUserIdByUsername(username) : null;
        collectionRepository.incrementViewCountIfPublicAndNotOwner(collectionId, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollectionResponse> getMyCollections(String username) {
        log.info("내 컬렉션 목록 조회: username={}", username);

        Long userId = userService.findUserIdByUsername(username);
        List<Collection> collections = collectionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return collections.stream()
                .map(collection -> buildCollectionResponse(collection, userId, userId))
                .collect(Collectors.toList());
    }

    // 공개 페이지 컬렉션 조회
    @Override
    @Transactional(readOnly = true)
    public Page<CollectionResponse> getPublicCollections(Pageable pageable, String sortBy) {
        log.info("공개 컬렉션 목록 조회: sortBy={}", sortBy);

        Page<Collection> collections;
        // 정렬이 조회수 순인 경우
        if ("views".equals(sortBy)) {
            // isPublic가 true 인 것중 조회수 순으로 컬렉션DB를 가져온다
            collections = collectionRepository.findByIsPublicTrueOrderByViewCountDesc(pageable);
        } else {
            // 기본값: 최신순
            collections = collectionRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable);
        }

        // 컬렉션 있는 것만
        return collections.map(collection -> {
            Long userId = collection.getUserId(); // 컬렉션 pk 뽑아내기
            return buildCollectionResponse(collection, userId, null);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollectionResponse> getUserCollections(String userIdOrPublicId, String currentUsername) {
        log.info("사용자 컬렉션 목록 조회: userIdOrPublicId={}, currentUsername={}", userIdOrPublicId, currentUsername);

        // publicId 또는 userId로 사용자 조회
        User user = userRepository.findByPublicId(userIdOrPublicId)
                .orElseGet(() -> userRepository.findByUserId(userIdOrPublicId)
                        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다.")));

        Long targetUserId = user.getId();
        Long currentUserId = currentUsername != null ? userService.findUserIdByUsername(currentUsername) : null;

        List<Collection> collections = collectionRepository.findByUserIdOrderByCreatedAtDesc(targetUserId);

        // 현재 사용자가 본인인 경우 모든 컬렉션, 다른 사용자인 경우 공개 컬렉션만
        return collections.stream()
                .filter(collection -> {
                    if (collection.getUserId().equals(currentUserId)) {
                        return true; // 본인 컬렉션은 모두 조회 가능
                    }
                    return collection.getIsPublic(); // 다른 사용자 컬렉션은 공개만
                })
                // 필터가 true 일경우
                .map(collection -> buildCollectionResponse(collection, targetUserId, currentUserId))
                .collect(Collectors.toList());
    }

    // ==========================================
    // Private Helper Methods
    // ==========================================

    /**
     * 컬렉션 조회 (존재하지 않으면 예외 발생)
     */
    private Collection findCollectionById(Long collectionId) {
        return collectionRepository.findById(collectionId)
                .orElseThrow(() -> {
                    log.warn("컬렉션을 찾을 수 없습니다: collectionId={}", collectionId);
                    return new CollectionNotFoundException("컬렉션을 찾을 수 없습니다.");
                });
    }

    /**
     * 소유권 검증
     */
    private void validateOwnership(Collection collection, Long userId) {
        if (!collection.getUserId().equals(userId)) {
            log.warn("컬렉션 소유권이 없습니다: collectionId={}, userId={}", collection.getId(), userId);
            throw new CollectionAccessDeniedException("컬렉션을 수정하거나 삭제할 권한이 없습니다.");
        }
    }

    /**
     * 접근 권한 검증
     */
    private void validateAccess(Collection collection, Long currentUserId) {
        // 공개 컬렉션이거나 소유자인 경우 접근 가능
        if (collection.getIsPublic()) {
            return;
        }
        if (currentUserId != null && collection.getUserId().equals(currentUserId)) {
            return;
        }
        // 비공개 컬렉션이고 소유자가 아닌 경우 접근 불가
        log.warn("비공개 컬렉션 접근 시도: collectionId={}, currentUserId={}", collection.getId(), currentUserId);
        throw new CollectionAccessDeniedException("비공개 컬렉션입니다.");
    }

    /**
     * CollectionResponse 빌드
     */
    private CollectionResponse buildCollectionResponse(Collection collection, Long authorUserId, Long currentUserId) {
        // 작품 수 조회
        long itemCount = collectionItemRepository.countByCollectionId(collection.getId());

        // 좋아요 수 조회
        Long likeCount = likeRepository.countByTargetTypeAndTargetId(TargetType.COLLECTION, collection.getId());

        // 좋아요 여부 확인
        Boolean isLiked = currentUserId != null &&
                likeRepository.existsByUserIdAndTargetTypeAndTargetId(currentUserId, TargetType.COLLECTION, collection.getId());

        // 작성자 정보 조회
        User author = userRepository.findById(authorUserId)
                .orElseThrow(() -> new RuntimeException("작성자를 찾을 수 없습니다."));
        // 반환용 DTO
        UserSummaryResponse authorResponse = UserSummaryResponse.builder()
                .nickname(author.getNickname())
                .profileImage(author.getProfileImage())
                .userId(author.getUserId())
                .build();

        return CollectionResponse.builder()
                .id(collection.getId())
                .title(collection.getTitle())
                .description(collection.getDescription())
                .isPublic(collection.getIsPublic())
                .viewCount(collection.getViewCount())
                .itemCount((int) itemCount)
                .likeCount(likeCount)
                .isLiked(isLiked)
                .author(authorResponse)
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }

    /**
     * CollectionCommentResponse 빌드
     */
    private CollectionCommentResponse buildCommentResponse(CollectionComment comment, Long currentUserId) {
        User author = userRepository.findById(comment.getUserId())
                .orElseThrow(() -> new RuntimeException("댓글 작성자를 찾을 수 없습니다."));
        UserSummaryResponse authorResponse = UserSummaryResponse.builder()
                .nickname(author.getNickname())
                .profileImage(author.getProfileImage())
                .userId(author.getUserId())
                .build();

        return CollectionCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(authorResponse)
                .isOwner(currentUserId != null && comment.getUserId().equals(currentUserId))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}

