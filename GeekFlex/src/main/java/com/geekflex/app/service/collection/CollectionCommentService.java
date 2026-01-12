package com.geekflex.app.service.collection;

import com.geekflex.app.dto.UserSummaryResponse;
import com.geekflex.app.dto.collection.CollectionCommentRequest;
import com.geekflex.app.dto.collection.CollectionCommentResponse;
import com.geekflex.app.entity.Collection;
import com.geekflex.app.entity.CollectionComment;
import com.geekflex.app.entity.User;
import com.geekflex.app.exception.CollectionAccessDeniedException;
import com.geekflex.app.exception.CollectionNotFoundException;
import com.geekflex.app.repository.CollectionCommentRepository;
import com.geekflex.app.repository.CollectionRepository;
import com.geekflex.app.repository.UserRepository;
import com.geekflex.app.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class CollectionCommentService {

    private final CollectionRepository collectionRepository;
    private final CollectionCommentRepository collectionCommentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * 댓글 작성
     * 
     * @param collectionId 컬렉션 ID
     * @param request 댓글 작성 요청
     * @param username 현재 사용자 username
     * @return 작성된 댓글 응답
     * @throws CollectionNotFoundException 컬렉션을 찾을 수 없을 때
     * @throws CollectionAccessDeniedException 비공개 컬렉션일 때
     */
    @Transactional
    public CollectionCommentResponse createComment(Long collectionId, CollectionCommentRequest request, String username) {
        log.info("댓글 작성 요청: collectionId={}, username={}", collectionId, username);

        // 1. 컬렉션 조회 및 공개 여부 확인
        Collection collection = findCollectionById(collectionId);
        if (!collection.getIsPublic()) {
            log.warn("비공개 컬렉션에 댓글 작성 시도: collectionId={}", collectionId);
            throw new CollectionAccessDeniedException("공개 컬렉션에만 댓글을 작성할 수 있습니다.");
        }

        // 2. 사용자 조회
        Long userId = userService.findUserIdByUsername(username);

        // 3. 댓글 생성
        CollectionComment comment = CollectionComment.builder()
                .collection(collection)
                .userId(userId)
                .content(request.getContent())
                .build();

        CollectionComment saved = collectionCommentRepository.save(comment);
        log.info("댓글 작성 완료: commentId={}, collectionId={}", saved.getId(), collectionId);

        // 4. 응답 DTO 생성
        return buildCommentResponse(saved, userId);
    }

    /**
     * 댓글 수정
     * 
     * @param commentId 댓글 ID
     * @param request 댓글 수정 요청
     * @param username 현재 사용자 username
     * @return 수정된 댓글 응답
     * @throws CollectionAccessDeniedException 작성자가 아닐 때
     */
    @Transactional
    public CollectionCommentResponse updateComment(Long commentId, CollectionCommentRequest request, String username) {
        log.info("댓글 수정 요청: commentId={}, username={}", commentId, username);

        // 1. 댓글 조회
        CollectionComment comment = collectionCommentRepository.findById(commentId)
                .orElseThrow(() -> {
                    log.warn("댓글을 찾을 수 없습니다: commentId={}", commentId);
                    return new IllegalArgumentException("댓글을 찾을 수 없습니다.");
                });

        // 2. 소유권 확인
        Long userId = userService.findUserIdByUsername(username);
        validateCommentOwnership(comment, userId);

        // 3. 댓글 수정
        comment.setContent(request.getContent());
        CollectionComment updated = collectionCommentRepository.save(comment);
        log.info("댓글 수정 완료: commentId={}", commentId);

        // 4. 응답 DTO 생성
        return buildCommentResponse(updated, userId);
    }

    /**
     * 댓글 삭제
     * 
     * @param commentId 댓글 ID
     * @param username 현재 사용자 username
     * @throws CollectionAccessDeniedException 작성자가 아닐 때
     */
    @Transactional
    public void deleteComment(Long commentId, String username) {
        log.info("댓글 삭제 요청: commentId={}, username={}", commentId, username);

        // 1. 댓글 조회
        CollectionComment comment = collectionCommentRepository.findById(commentId)
                .orElseThrow(() -> {
                    log.warn("댓글을 찾을 수 없습니다: commentId={}", commentId);
                    return new IllegalArgumentException("댓글을 찾을 수 없습니다.");
                });

        // 2. 소유권 확인
        Long userId = userService.findUserIdByUsername(username);
        validateCommentOwnership(comment, userId);

        // 3. 댓글 삭제
        collectionCommentRepository.delete(comment);
        log.info("댓글 삭제 완료: commentId={}", commentId);
    }

    /**
     * 댓글 목록 조회
     * 
     * @param collectionId 컬렉션 ID
     * @param username 현재 사용자 username (null 가능)
     * @return 댓글 목록
     * @throws CollectionNotFoundException 컬렉션을 찾을 수 없을 때
     * @throws CollectionAccessDeniedException 비공개 컬렉션이고 소유자가 아닐 때
     */
    @Transactional(readOnly = true)
    public List<CollectionCommentResponse> getComments(Long collectionId, String username) {
        log.info("댓글 목록 조회: collectionId={}, username={}", collectionId, username);

        // 1. 컬렉션 조회 및 접근 권한 확인
        Collection collection = findCollectionById(collectionId);
        Long currentUserId = username != null ? userService.findUserIdByUsername(username) : null;
        validateAccess(collection, currentUserId);

        // 2. 댓글 목록 조회
        List<CollectionComment> comments = collectionCommentRepository.findByCollectionIdOrderByCreatedAtAsc(collectionId);

        return comments.stream()
                .map(comment -> buildCommentResponse(comment, currentUserId))
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
     * 댓글 소유권 검증
     */
    private void validateCommentOwnership(CollectionComment comment, Long userId) {
        if (!comment.getUserId().equals(userId)) {
            log.warn("댓글 소유권이 없습니다: commentId={}, userId={}", comment.getId(), userId);
            throw new CollectionAccessDeniedException("댓글을 수정하거나 삭제할 권한이 없습니다.");
        }
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
