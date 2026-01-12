package com.geekflex.app.service;

import com.geekflex.app.entity.UserIpLog;
import com.geekflex.app.repository.UserIpLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserIpLogService {

    private final UserIpLogRepository userIpLogRepository;

    @Transactional
    public void log(Long userId, HttpServletRequest request) {

        String ip = request.getRemoteAddr();
        String agent = request.getHeader("User-Agent");

        String deviceType = agent != null && agent.toLowerCase().contains("mobile")
                ? "MOBILE"
                : "PC";

        UserIpLog logEntry = UserIpLog.builder()
                .userId(userId)
                .ipAddress(ip)
                .userAgent(agent)
                .deviceType(deviceType)
                .build();

        userIpLogRepository.save(logEntry);

        log.info("[IP_LOG] userId={} ip={} agent={}", userId, ip, agent);
    }


    // 매요청 마다 하고 싶으면
    // userIpLogService.log(authenticatedUser.getId(), request);
}