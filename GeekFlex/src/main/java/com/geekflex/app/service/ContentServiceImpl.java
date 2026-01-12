package com.geekflex.app.service;

import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.dto.tmdb.MovieDetailResponse;
import com.geekflex.app.dto.tmdb.TmdbMovieDetailResponse;
import com.geekflex.app.dto.tmdb.TmdbTvDetailResponse;
import com.geekflex.app.dto.tmdb.TvDetailResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;
import com.geekflex.app.repository.ContentRepository;
import com.geekflex.app.service.content.ContentCacheManager;
import com.geekflex.app.service.tmdb.TmdbApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ContentServiceImpl implements ContentService {
    private final ContentRepository contentRepository;
    private final ContentCacheManager contentCacheManager;
    private final TmdbApiService tmdbApiService;


    // 4개의 API에 대한 콘텐츠 불러오기
    @Override
    public List<ContentResponse> getContentsByTagType(TagType tagType) {
        return contentRepository.findByTagType(tagType)
                .stream()
                .map(Content::toDto)
                .toList();
    }

    @Override
    public MovieDetailResponse getMovieDetailWithCaching(Long tmdbId, String lang) {

        // 캐싱된 Content 확보
        Content content = contentCacheManager.getOrCreate(tmdbId, ContentType.MOVIE);

        // TMDB 상세 API (항상 최신 정보)
        TmdbMovieDetailResponse detail = tmdbApiService.getMovieDetails(tmdbId);

        return MovieDetailResponse.from(content, detail);
    }

    @Override
    public TvDetailResponse getTvDetailWithCaching(Long tmdbId, String lang) {
        // 캐싱된 Content 확보
        Content content = contentCacheManager.getOrCreate(tmdbId, ContentType.TV);

        // TMDB 상세 API (항상 최신 정보)
        TmdbTvDetailResponse detail = tmdbApiService.getTvDetails(tmdbId);

        return TvDetailResponse.from(content, detail);
    }

    @Override
    public Content getOrCreateContent(Long tmdbId, ContentType contentType) {
        return contentCacheManager.getOrCreate(tmdbId, contentType);

    }
}
