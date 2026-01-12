package com.geekflex.app.repository;

import com.geekflex.app.entity.UserIpLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// UserIpLog 엔티티 로포지토리
public interface UserIpLogRepository extends JpaRepository<UserIpLog, Long> {

    List<UserIpLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}