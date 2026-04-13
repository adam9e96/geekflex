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
        String usersResourceLocation = java.nio.file.Paths.get(uploadDir)
                .toUri()
                .toString();

        if (!usersResourceLocation.endsWith("/")) {
            usersResourceLocation += "/";
        }

        registry.addResourceHandler("/uploads/users/**")
                .addResourceLocations(usersResourceLocation);

        java.nio.file.Path userUploadPath = java.nio.file.Paths.get(uploadDir);
        java.nio.file.Path uploadsRoot = userUploadPath.getParent() != null ? userUploadPath.getParent() : userUploadPath;
        String collectionsResourceLocation = uploadsRoot.resolve("collections")
                .toUri()
                .toString();

        if (!collectionsResourceLocation.endsWith("/")) {
            collectionsResourceLocation += "/";
        }

        registry.addResourceHandler("/uploads/collections/**")
                .addResourceLocations(collectionsResourceLocation);
    }
}








