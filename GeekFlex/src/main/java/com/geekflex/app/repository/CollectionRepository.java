package com.geekflex.app.repository;

import com.geekflex.app.entity.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CollectionRepository extends JpaRepository<Collection, Long> {
    // 사용자의 컬렉션 목록 조회
    List<Collection> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 공개 컬렉션 목록 조회 (페이징)
    Page<Collection> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);

    // 공개 컬렉션 목록 조회 (인기순 - 좋아요 수 기준)
    Page<Collection> findByIsPublicTrueOrderByViewCountDesc(Pageable pageable);

    // 사용자 ID와 컬렉션 ID로 소유권 확인
    boolean existsByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("UPDATE Collection c SET c.viewCount = c.viewCount + 1 WHERE c.id = :id AND c.isPublic = true AND (:userId IS NULL OR c.userId <> :userId)")
    void incrementViewCountIfPublicAndNotOwner(@Param("id") Long id, @Param("userId") Long userId);
}