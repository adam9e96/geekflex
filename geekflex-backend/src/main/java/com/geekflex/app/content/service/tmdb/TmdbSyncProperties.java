package com.geekflex.app.content.service.tmdb;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(prefix = "tmdb")
@Getter
@Setter
public class TmdbSyncProperties {
    private Duration syncInterval = Duration.ofHours(24);
}
