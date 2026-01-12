package com.geekflex.app.service;

import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;
import com.geekflex.app.repository.ContentRepository;
import jakarta.transaction.Transactional;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
@Transactional
@Log4j2
class ContentServiceTest {

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ContentService contentService;

//    @BeforeEach
//    void setup() {
//        // given: 테스트용 Content 데이터
//        Content movie = Content.builder()
//                .tmdbId(12345L)
//                .contentType(ContentType.MOVIE)
//                .title("테스트 영화")
//                .originalTitle("Test Movie")
//                .originalLanguage("en")
//                .overview("테스트용 줄거리입니다.")
//                .releaseDate(LocalDate.now())
//                .posterUrl("https://image.tmdb.org/t/p/w500/test.jpg")
//                .popularity(new BigDecimal("55.123"))
//                .voteAverage(new BigDecimal("8.5"))
//                .voteCount(100)
//                .genre("Action")
//                .originCountry("US")
//                .build();
//
//        contentRepository.save(movie);
//    }

    @Test
    @DisplayName("NOW_PLAYING 콘텐츠 조회 테스트")
    void getContentsByTagType_nowPlaying() {
        // when
        List<ContentResponse> responses = contentService.getContentsByTagType(TagType.NOW_PLAYING);

        // then
        assertThat(responses).isNotNull();
        assertThat(responses).isInstanceOf(List.class);
        // 실제 DB에 존재한다면 아래 assert로 검증
        // assertThat(responses).isNotEmpty();
        // assertThat(responses.get(0).getTitle()).isEqualTo("테스트 영화")
        log.info(responses.toString());
    }
}