package com.geekflex.app.service.collection;

import com.geekflex.app.dto.collection.CollectionCreateRequest;
import com.geekflex.app.dto.collection.CollectionDetailResponse;
import com.geekflex.app.dto.collection.CollectionResponse;
import com.geekflex.app.dto.collection.CollectionUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CollectionService {
    /**
     * 컬렉션 생성
     */
    CollectionResponse createCollection(String username, CollectionCreateRequest request);

    /**
     * 컬렉션 수정
     */
    CollectionResponse updateCollection(Long collectionId, String username, CollectionUpdateRequest request);

    /**
     * 컬렉션 삭제
     */
    void deleteCollection(Long collectionId, String username);

    /**
     * 컬렉션 상세 조회
     */
    CollectionDetailResponse getCollection(Long collectionId, String username);

    /**
     * 컬렉션 조회수 증가
     */
    void incrementViewCount(Long collectionId, String username);

    /**
     * 내 컬렉션 목록 조회
     */
    List<CollectionResponse> getMyCollections(String username);

    /**
     * 공개 컬렉션 목록 조회
     * @param pageable 페이징 정보
     * @param sortBy 정렬 기준 (latest, popular, views)
     */
    Page<CollectionResponse> getPublicCollections(Pageable pageable, String sortBy);

    /**
     * 특정 사용자의 컬렉션 목록 조회
     * @param userId 사용자 ID (publicId 또는 userId)
     * @param currentUsername 현재 로그인한 사용자 (null 가능)
     */
    List<CollectionResponse> getUserCollections(String userId, String currentUsername);
}
