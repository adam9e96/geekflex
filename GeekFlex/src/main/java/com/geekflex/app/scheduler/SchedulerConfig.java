package com.geekflex.app.scheduler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5); // 동시에 몇 개까지 돌릴지 (필요에 따라 조정)
        scheduler.setThreadNamePrefix("Geekflex-Scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true); // 종료 시 작업 마무리
        scheduler.setAwaitTerminationSeconds(30);            // 최대 대기 시간
        scheduler.initialize();
        return scheduler;
    }
}
