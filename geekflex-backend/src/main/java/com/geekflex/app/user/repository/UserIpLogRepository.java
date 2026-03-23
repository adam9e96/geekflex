package com.geekflex.app.user.repository;
import com.geekflex.app.user.entity.UserIpLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// UserIpLog 엔티티 로포지토리
public interface UserIpLogRepository extends JpaRepository<UserIpLog, Long> {

    List<UserIpLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}







