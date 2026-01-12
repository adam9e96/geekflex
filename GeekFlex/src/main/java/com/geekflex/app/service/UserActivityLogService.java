package com.geekflex.app.service;

import com.geekflex.app.entity.ActionType;
import com.geekflex.app.entity.UserActivityLog;
import com.geekflex.app.like.entity.TargetType;
import com.geekflex.app.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserActivityLogService {

    private final UserActivityLogRepository userActivityLogRepository;

    /**
     * 활동 기록 생성 (기본 기록)
     */
    @Transactional
    public void log(Long userId, ActionType actionType, Long targetId, TargetType targetType) {

        UserActivityLog logEntry = UserActivityLog.builder()
                .userId(userId)
                .actionType(actionType)
                .targetType(targetType)
                .targetId(targetId)
                .build();

        userActivityLogRepository.save(logEntry);

        log.info("[ACTIVITY] userId={} action={} targetType={} targetId={}",
                userId, actionType, targetType, targetId);
    }

    /**
     * 접속 IP 로그 (targetId는 null)
     */
    @Transactional
    public void logIP(Long userId, String ipAddress) {

        UserActivityLog logEntry = UserActivityLog.builder()
                .userId(userId)
                .actionType(ActionType.VIEW_HISTORY) // or 새로운 ActionType.LOGIN / VISIT 만들어도 됨
                .targetType(null)
                .targetId(null)
                .build();

        userActivityLogRepository.save(logEntry);

        log.info("[IP_LOG] userId={} ip={}", userId, ipAddress);
    }

    @Transactional
    public void deleteActivity(Long userId, ActionType actionType, Long targetId) {

        UserActivityLog log = userActivityLogRepository
                .findByUserIdAndActionTypeAndTargetId(userId, actionType, targetId)
                .orElseThrow(() -> new IllegalArgumentException("활동 기록이 없습니다."));

        userActivityLogRepository.deleteById(log.getId());
    }

    /**
     * 특정 유저의 활동 전체 삭제
     */
    @Transactional
    public void deleteAllByUser(Long userId) {
        var logs = userActivityLogRepository.findByUserId(userId);
        userActivityLogRepository.deleteAll(logs);
    }
}