package com.geekflex.app.aop;

import lombok.extern.log4j.Log4j2;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Log4j2
@Aspect
@Component
public class LoggingAspect {

    // 컨트롤러, 서비스 대상 지정
    @Pointcut("execution(* com.geekflex.app.controller..*(..)) || execution(* com.geekflex.app.service..*(..))")
    public void appLayers() {
    }

    @Around("appLayers()")
    public Object logExecutionDetails(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.info("메서드 {}.{}()가 다음 인자들과 함께 호출되었습니다: {}", className, methodName, args);

        try {
            Object result = joinPoint.proceed(); // 실제 메서드 실행
            log.info("메서드 {}.{}()가 다음 값을 반환했습니다: {}", className, methodName, result);
            return result;
        } catch (Exception e) {
            log.error("메서드 {}.{}()에서 예외 발생: {}", className, methodName, e.getMessage());
            throw e;
        }

    }
}
