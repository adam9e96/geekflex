package com.geekflex.app.repository;

import com.geekflex.app.entity.CollectionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollectionItemRepository extends JpaRepository<CollectionItem, Long> {
    // 컬렉션의 작품 목록 조회
    List<CollectionItem> findByCollectionIdOrderByAddedAtDesc(Long collectionId);

    // 중복 체크
    boolean existsByCollectionIdAndContentId(Long collectionId, Long contentId);

    // 컬렉션의 작품 수
    long countByCollectionId(Long collectionId);

    // 특정 작품 삭제
    void deleteByCollectionIdAndContentId(Long collectionId, Long contentId);
}