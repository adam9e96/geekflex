package com.geekflex.app.like.repository;
import com.geekflex.app.like.entity.Like;
import com.geekflex.app.like.entity.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {

    // Optional<Like> findByUserIdAndTargetTypeAndTargetId(Long userId, TargetType
    // targetType, Long targetId);

    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, TargetType targetType, Long targetId);

    void deleteByUserIdAndTargetTypeAndTargetId(Long userId, TargetType targetType, Long targetId);

    long countByTargetTypeAndTargetId(TargetType targetType, Long targetId);

    // 일괄 조회를 위한 메서드
    java.util.List<Like> findByUserIdAndTargetTypeAndTargetIdIn(Long userId, TargetType targetType,
            java.util.List<Long> targetIds);

}








