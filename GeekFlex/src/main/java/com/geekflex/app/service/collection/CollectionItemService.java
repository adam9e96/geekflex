package com.geekflex.app.service.collection;

import com.geekflex.app.dto.collection.CollectionItemCountResponse;
import com.geekflex.app.dto.collection.CollectionItemRequest;
import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.review.dto.ReviewCountResponse;
import com.geekflex.app.entity.Collection;
import com.geekflex.app.entity.CollectionItem;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.User;
import com.geekflex.app.exception.CollectionAccessDeniedException;
import com.geekflex.app.exception.CollectionNotFoundException;
import com.geekflex.app.exception.DuplicateCollectionItemException;
import com.geekflex.app.repository.CollectionItemRepository;
import com.geekflex.app.repository.CollectionRepository;
import com.geekflex.app.repository.ContentRepository;
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
public class CollectionItemService {

    private final CollectionRepository collectionRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final ContentRepository contentRepository;
    private final UserService userService;

    /**
     * 컬렉션에 작품 추가
     *
     * @param collectionId 컬렉션 ID
     * @param request      작품 추가 요청 (contentId 포함)
     * @param username     현재 사용자 username
     * @throws CollectionNotFoundException      컬렉션을 찾을 수 없을 때
     * @throws CollectionAccessDeniedException  소유자가 아닐 때
     * @throws DuplicateCollectionItemException 이미 추가된 작품일 때
     */
    @Transactional
    public void addItem(Long collectionId, CollectionItemRequest request, String username) {
        log.info("작품 추가 요청: collectionId={}, contentId={}, username={}",
                collectionId, request.getContentId(), username);

        // 1. 컬렉션 조회 및 소유권 확인
        Collection collection = findCollectionById(collectionId);
        Long userId = userService.findUserIdByUsername(username);
        validateOwnership(collection, userId);

        // 2. Content 존재 여부 확인
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> {
                    log.warn("Content를 찾을 수 없습니다: contentId={}", request.getContentId());
                    return new IllegalArgumentException("작품을 찾을 수 없습니다.");
                });

        // 3. 중복 체크
        if (collectionItemRepository.existsByCollectionIdAndContentId(collectionId, request.getContentId())) {
            log.warn("이미 추가된 작품입니다: collectionId={}, contentId={}", collectionId, request.getContentId());
            throw new DuplicateCollectionItemException("이미 컬렉션에 추가된 작품입니다.");
        }

        // 4. 작품 추가
        CollectionItem item = CollectionItem.builder()
                .collection(collection)
                .content(content)
                .build();

        collectionItemRepository.save(item);
        log.info("작품 추가 완료: collectionId={}, contentId={}", collectionId, request.getContentId());
    }

    /**
     * 컬렉션에서 작품 제거
     *
     * @param collectionId 컬렉션 ID
     * @param contentId    작품 ID
     * @param username     현재 사용자 username
     * @throws CollectionNotFoundException     컬렉션을 찾을 수 없을 때
     * @throws CollectionAccessDeniedException 소유자가 아닐 때
     */
    @Transactional
    public void removeItem(Long collectionId, Long contentId, String username) {
        log.info("작품 제거 요청: collectionId={}, contentId={}, username={}",
                collectionId, contentId, username);

        // 1. 컬렉션 조회 및 소유권 확인
        Collection collection = findCollectionById(collectionId);

        Long userId = userService.findUserIdByUsername(username);
        validateOwnership(collection, userId);

        // 2. 작품 제거
        collectionItemRepository.deleteByCollectionIdAndContentId(collectionId, contentId);
        log.info("작품 제거 완료: collectionId={}, contentId={}", collectionId, contentId);
    }

    /**
     * 컬렉션의 작품 목록 조회
     *
     * @param collectionId 컬렉션 ID
     * @param username     현재 사용자 username (null 가능)
     * @return 작품 목록
     * @throws CollectionNotFoundException     컬렉션을 찾을 수 없을 때
     * @throws CollectionAccessDeniedException 비공개 컬렉션이고 소유자가 아닐 때
     */
    @Transactional(readOnly = true)
    public List<ContentResponse> getCollectionItems(Long collectionId, String username) {
        log.info("작품 목록 조회: collectionId={}, username={}", collectionId, username);

        // 1. 컬렉션 조회 및 접근 권한 확인
        Collection collection = findCollectionById(collectionId);
        Long currentUserId = username != null ? userService.findUserIdByUsername(username) : null;
        validateAccess(collection, currentUserId);

        // 2. 작품 목록 조회
        List<CollectionItem> items = collectionItemRepository.findByCollectionIdOrderByAddedAtDesc(collectionId);

        return items.stream()
                .map(item -> item.getContent().toDto())
                .collect(Collectors.toList());
    }
//    @Transactional
//    public Long getMyCollectionItemCounts(String username) {
//        User user = userService.findUserEntity(username);
//        return CollectionItemCountResponse.builder()
//                .CollectionItemCount(collectionItemRepository.countByCollectionId())
//                .build();
//    }

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
            throw new CollectionAccessDeniedException("컬렉션을 수정할 권한이 없습니다.");
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
}
