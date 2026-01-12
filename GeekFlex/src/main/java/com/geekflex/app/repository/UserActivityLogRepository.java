package com.geekflex.app.repository;

import com.geekflex.app.entity.ActionType;
import com.geekflex.app.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    List<UserActivityLog> findByUserId(Long userId);

    List<UserActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserActivityLog> findByActionTypeAndUserIdOrderByCreatedAtDesc(String actionType, Long userId);

    // username + actionType + targetId 조합으로 조회
    Optional<UserActivityLog> findByUserIdAndActionTypeAndTargetId(Long userId, ActionType actionType, Long targetId);

}
