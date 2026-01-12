package com.geekflex.app.service;

import com.geekflex.app.dto.tmdb.TmdbMovieListResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentListTag;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;
import com.geekflex.app.repository.ContentListTagRepository;
import com.geekflex.app.repository.ContentRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * TmdbCachingService 실제 DB 연동 통합 테스트
 */
@SpringBootTest
@Transactional
@Log4j2
class TmdbCachingServiceTest {
    @Autowired
    private WebClient tmdbWebClient;
    @Autowired
    private ContentRepository contentRepository;
    @Autowired
    private ContentListTagRepository contentListTagRepository;

    private static final String DEFAULT_LANGUAGE = "ko-KR";
    private static final String DEFAULT_REGION = "KR";
    private static final int DEFAULT_PAGE = 1;

    @Autowired
    private TmdbCachingService tmdbCachingService;

    @Test
    @DisplayName("TMDB 카테고리 캐싱 성공 - NOW_PLAYING")
    void cacheCategoryNowPlayingTest() {
        // given: 초기 DB 상태는 비어 있음
        TagType tagType = TagType.NOW_PLAYING;
        String apiPath = "/movie/now_playing";
        String language = "ko-KR";
        int page = 1;

        // when: TMDB에서 해당 카테고리 데이터를 캐싱 요청
        tmdbCachingService.cacheCategory(tagType, apiPath);

        // then: contents + content_list_tag에 데이터가 저장되었는지 확인
        List<ContentListTag> tags = contentListTagRepository.findByTagType(tagType);
        assertThat(tags).isNotEmpty();

        Content sample = tags.get(0).getContent();
        assertThat(sample).isNotNull();
        assertThat(sample.getContentType()).isEqualTo(ContentType.MOVIE);
        assertThat(sample.getTitle()).isNotBlank();
        assertThat(sample.getReleaseDate()).isNotNull();
    }

    @Test
    @DisplayName("TMDB 캐싱 후 태그 중복 없이 재갱신 확인")
    void cacheCategoryShouldReplaceTags() {
        // given: 초기 한 번 캐싱
        tmdbCachingService.cacheCategory(TagType.POPULAR, "/movie/popular");
        List<ContentListTag> first = contentListTagRepository.findByTagType(TagType.POPULAR);
        int originalCount = first.size();

        // when: 동일한 카테고리를 다시 캐싱
        tmdbCachingService.cacheCategory(TagType.POPULAR, "/movie/popular");
        List<ContentListTag> second = contentListTagRepository.findByTagType(TagType.POPULAR);

        // then: 중복 없이 동일 또는 갱신된 데이터가 들어있어야 함
        assertThat(second).isNotEmpty();
        assertThat(second.size()).isEqualTo(originalCount);
    }


//    @Test
//    @DisplayName("요청")
//    void testGet() {
//        String apiPath = "/movie/now_playing";
//        TmdbMovieListResponse response = tmdbWebClient.get()
//                .uri(uriBuilder -> uriBuilder
//                        .path(apiPath)
//                        .queryParam("language", DEFAULT_LANGUAGE)
//                        .queryParam("page", DEFAULT_PAGE)
//                        .queryParam("region", DEFAULT_REGION)
//                        .build())
//                .retrieve()
//                .bodyToMono(TmdbMovieListResponse.class)
//                .block();
//        // notnull 테스트
//        assertThat(response).isNotNull();
//        // 2. 캐시용 태그 준비
//        Map<Long, ContentListTag> tagMap = new LinkedHashMap<>(); // <id, 엔티티>
//        int a = 0;
//        for (TmdbMovieListResponse.MovieSummary movie : response.getResults()) {
//            log.info("문재인 {} : ,{}", ++a, movie.toString());
//            if (tagMap.containsKey(movie.getId())) {
//                log.info("같다 {}", movie.getId());
//                continue;
//            }
//            // 같지 않으면
//            Content content = contentRepository.findByTmdbIdAndContentType(
//                            movie.getId(),
//                            ContentType.MOVIE
//                    )
//                    .map(existing -> updateContent(existing, movie))
//                    .orElseGet(() -> createContent(movie));
//
//
//            ContentListTag tag = ContentListTag.builder()
//                    .content(content)
//                    .tagType(tagType)
//                    .region(DEFAULT_REGION)
//                    .build();
//
//
//            tagMap.put(movie.getId(), tag);
//        }
//    }
}
