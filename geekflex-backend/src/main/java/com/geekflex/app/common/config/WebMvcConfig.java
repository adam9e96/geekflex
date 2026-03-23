package com.geekflex.app.common.config;
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
        // Set resource location to parent directory of uploadDir
        // Use Paths API to correctly handle parent extraction across OS (Windows/Linux)
        String resourceLocation = java.nio.file.Paths.get(uploadDir)
                .toUri()
                .toString();

        // Ensure trailing slash for directory resource
        if (!resourceLocation.endsWith("/")) {
            resourceLocation += "/";
        }

        // Serve files from the actual local uploads directory when requests come to
        // /uploads/users/**
        registry.addResourceHandler("/uploads/users/**")
                .addResourceLocations(resourceLocation);
    }
}








