package com.geekflex.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploadDir에서 /users 부분을 제거하여 상위 디렉토리 경로 생성
        // 예: C:/dev/pj-geekflex-dev/uploads/users -> C:/dev/pj-geekflex-dev/uploads/
        String baseUploadDir = uploadDir.replace("/users", "");
        if (!baseUploadDir.endsWith("/")) {
            baseUploadDir += "/";
        }

        // /uploads/** 경로로 요청이 오면 uploadDir의 상위 디렉토리에서 파일 제공
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + baseUploadDir);
    }
}
