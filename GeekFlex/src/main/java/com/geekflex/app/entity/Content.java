package com.geekflex.app.entity;

import com.geekflex.app.dto.content.ContentResponse;
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
    private String originalTitle; // 원제목 (예: Frankenstein), 한글아닐수있음

    @Column(name = "original_language", length = 10)
    private String originalLanguage; // 원어 코드 (예: en, ko)

    @Column(columnDefinition = "TEXT")
    private String overview; // 줄거리

    @Column(name = "release_date")
    private LocalDate releaseDate; // 개봉일 또는 방영일, MOVIE면 있음

    @Column(name = "end_date")
    private LocalDate endDate; // 방영 종료일 (TV 시리즈용), MOVIE는 없음

    @Column(name = "poster_url")
    private String posterUrl; // 포스터 URL

    @Column(name = "backdrop_url")
    private String backdropUrl; // 배경 이미지 URL

    @Column(precision = 8, scale = 3)
    private BigDecimal popularity; // TMDB 인기 지수 (소수점 많음)

    @Column(name = "vote_average", precision = 4, scale = 2)
    private BigDecimal voteAverage; // TMDB 평균 평점

    @Column(name = "vote_count")
    private Integer voteCount; // TMDB 투표 수

    @Column(length = 100)
    private String genre; // 장르명액션, 애니메이션, 모험, 가족 등

    @Column(name = "origin_country", length = 50)
    private String originCountry; // 제작 국가

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 생성 시각

    @OneToMany(mappedBy = "content", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ContentListTag> tags;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


    private static final String TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
    private static final String TMDB_POSTER_SIZE = "w500";
    private static final String TMDB_BACKDROP_SIZE = "w1280";

    public ContentResponse toDto() {
        // TMDB 이미지 경로를 전체 URL로 변환
        String fullPosterUrl = null;
        if (this.posterUrl != null && !this.posterUrl.isEmpty()) {
            if (this.posterUrl.startsWith("http")) {
                // 이미 전체 URL인 경우 그대로 사용
                fullPosterUrl = this.posterUrl;
            } else {
                // 상대 경로인 경우 TMDB 베이스 URL과 결합
                fullPosterUrl = TMDB_IMAGE_BASE_URL + "/" + TMDB_POSTER_SIZE + this.posterUrl;
            }
        }

        String fullBackdropUrl = null;
        if (this.backdropUrl != null && !this.backdropUrl.isEmpty()) {
            if (this.backdropUrl.startsWith("http")) {
                // 이미 전체 URL인 경우 그대로 사용
                fullBackdropUrl = this.backdropUrl;
            } else {
                // 상대 경로인 경우 TMDB 베이스 URL과 결합
                fullBackdropUrl = TMDB_IMAGE_BASE_URL + "/" + TMDB_BACKDROP_SIZE + this.backdropUrl;
            }
        }

        return ContentResponse.builder()
                .id(this.id)
                .tmdbId(this.tmdbId)
                .contentType(this.contentType)
                .title(this.title)
                .originalTitle(this.originalTitle)
                .originalLanguage(this.originalLanguage)
                .overview(this.overview)
                .releaseDate(this.releaseDate)
                .endDate(this.endDate)
                .posterUrl(fullPosterUrl)
                .backdropUrl(fullBackdropUrl)
                .popularity(this.popularity)
                .voteAverage(this.voteAverage)
                .voteCount(this.voteCount)
                .genre(this.genre)
                .originCountry(this.originCountry)
                .build();
    }

}

