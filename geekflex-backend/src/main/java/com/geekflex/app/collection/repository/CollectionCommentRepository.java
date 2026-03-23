package com.geekflex.app.collection.repository;
import com.geekflex.app.collection.entity.CollectionComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollectionCommentRepository extends JpaRepository<CollectionComment, Long> {
    // 컬렉션의 댓글 목록 조회
    List<CollectionComment> findByCollectionIdOrderByCreatedAtAsc(Long collectionId);

    // 사용자 ID와 댓글 ID로 소유권 확인
    boolean existsByIdAndUserId(Long id, Long userId);
}







