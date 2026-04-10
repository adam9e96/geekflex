package com.geekflex.app.common.scheduler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Value("${app.scheduler.pool-size:2}")
    private int poolSize;

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(poolSize);
        scheduler.setThreadNamePrefix("Geekflex-Scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true); // 종료 시 작업 마무리
        scheduler.setAwaitTerminationSeconds(30);            // 최대 대기 시간
        scheduler.initialize();
        return scheduler;
    }
}








