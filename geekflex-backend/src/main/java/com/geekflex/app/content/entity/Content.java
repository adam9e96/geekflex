package com.geekflex.app.content.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * TMDB 콘텐츠 데이터 (영화, 드라마, 애니메이션 등)
 */
@Table(
        name = "contents",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"tmdb_id", "content_type"}) // 중복 방지
        }
)
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 콘텐츠 ID

    @Column(name = "tmdb_id", nullable = false)
    private Long tmdbId; // TMDB 고유 ID

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 20)
    private ContentType contentType; // 영화, TV, 애니메이션 등 구분

    @Column(nullable = false, length = 200)
    private String title; // 한글 제목

    @Column(name = "original_title", length = 200)
    private String originalTitle; // 원제목

    @Column(name = "original_language", length = 10)
    private String originalLanguage; // 원어 코드 (예: en, ko)

    @Column(columnDefinition = "TEXT")
    private String overview; // 줄거리

    @Column(name = "release_date")
    private LocalDate releaseDate; // 개봉일 또는 방영일

    @Column(name = "end_date")
    private LocalDate endDate; // TV 시리즈 종료일

    @Column(name = "poster_url")
    private String posterUrl; // 포스터 URL 또는 경로

    @Column(name = "backdrop_url")
    private String backdropUrl; // 배경 이미지 URL 또는 경로

    @Column(precision = 8, scale = 3)
    private BigDecimal popularity; // TMDB 인기 지수

    @Column(name = "vote_average", precision = 4, scale = 2)
    private BigDecimal voteAverage; // TMDB 평균 평점

    @Column(name = "vote_count")
    private Integer voteCount; // TMDB 투표 수

    @Column(length = 100)
    private String genre; // 장르명

    @Column(name = "origin_country", length = 50)
    private String originCountry; // 제작 국가

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 생성 시각

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt; // TMDB API 마지막 동기화 시각

    @OneToMany(mappedBy = "content", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ContentListTag> tags;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 마지막 TMDB 동기화 이후 지정된 주기 이내인지 판단
     */
    public boolean isFresh(java.time.Duration syncInterval) {
        if (lastSyncedAt == null) {
            return false;
        }
        return java.time.Duration.between(lastSyncedAt, LocalDateTime.now()).compareTo(syncInterval) < 0;
    }
}