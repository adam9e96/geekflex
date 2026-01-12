package com.geekflex.app.service.content;

import com.geekflex.app.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.repository.ContentRepository;
import com.geekflex.app.service.factory.ContentFactory;
import com.geekflex.app.service.tmdb.TmdbApiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


class ContentCacheManagerTest {

    private ContentRepository contentRepository;
    private TmdbApiService tmdbApiService;
    private ContentFactory contentFactory;
    private ContentCacheManager contentCacheManager;

    @BeforeEach
    void setUp() {
        contentRepository = mock(ContentRepository.class);
        tmdbApiService = mock(TmdbApiService.class);
        contentFactory = mock(ContentFactory.class);

        contentCacheManager = new ContentCacheManager(
                contentRepository,
                tmdbApiService,
                contentFactory
        );
    }

    @Test
    void testGetOrCreate_WhenContentExistsInDB() {
        // given
        Long tmdbId = 100L;
        Content existingContent = Content.builder()
                .id(1L)
                .tmdbId(tmdbId)
                .title("Existing Movie")
                .contentType(ContentType.MOVIE)
                .build();

        when(contentRepository.findByTmdbId(tmdbId))
                .thenReturn(Optional.of(existingContent));

        // when
        Content result = contentCacheManager.getOrCreate(tmdbId, ContentType.MOVIE);

        // then
        assertEquals(existingContent, result);

        // TMDB API 호출 ❌ (존재 시 호출하면 안 됨)
        verify(tmdbApiService, never()).getMovieDetails(anyLong());

        // 저장도 ❌
        verify(contentRepository, never()).save(any());
    }

    @Test
    void testGetOrCreate_WhenContentNotInDB() {
        // given
        Long tmdbId = 200L;

        // DB에는 없음
        when(contentRepository.findByTmdbId(tmdbId))
                .thenReturn(Optional.empty());

        // TMDB 응답 Mock
        TmdbMovieDetailResponse tmdbResponse = new TmdbMovieDetailResponse();
        tmdbResponse.setId(tmdbId);
        tmdbResponse.setTitle("New Movie");

        when(tmdbApiService.getMovieDetails(tmdbId))
                .thenReturn(tmdbResponse);

        // Factory 변환 Mock
        Content newContent = Content.builder()
                .tmdbId(tmdbId)
                .title("New Movie")
                .contentType(ContentType.MOVIE)
                .build();

        when(contentFactory.fromTmdbDetail(tmdbResponse, ContentType.MOVIE))
                .thenReturn(newContent);

        // 저장 Mock
        Content savedContent = Content.builder()
                .id(10L)
                .tmdbId(tmdbId)
                .title("New Movie")
                .contentType(ContentType.MOVIE)
                .build();

        when(contentRepository.save(newContent)).thenReturn(savedContent);

        // when
        Content result = contentCacheManager.getOrCreate(tmdbId, ContentType.MOVIE);

        // then
        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("New Movie", result.getTitle());

        // DB → 없음 → TMDB 호출 ⭕
        verify(tmdbApiService, times(1)).getMovieDetails(tmdbId);

        // Factory 호출 ⭕
        verify(contentFactory, times(1)).fromTmdbDetail(tmdbResponse, ContentType.MOVIE);

        // 저장 호출 ⭕
        verify(contentRepository, times(1)).save(newContent);
    }
}