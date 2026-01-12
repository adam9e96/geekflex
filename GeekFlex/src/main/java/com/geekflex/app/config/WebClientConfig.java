package com.geekflex.app.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@Log4j2
public class WebClientConfig {
    // application.yml 에서 불러오기 (보안상 하드코딩 X)
    @Value("${tmdb.accessToken}")
    private String tmdbToken;

    @Bean
    public WebClient tmdbWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.themoviedb.org/3")
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Authorization", "Bearer " + tmdbToken)
                .build();
    }
}
