package com.geekflex.app.repository;

import com.geekflex.app.dto.movie.MovieSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 영화 검색 관련 인터페이스
 */
public interface MovieSearchRepositoryCustom {

    /**
     * 제목으로 영화 검색 (정확 일치 -> 부분 일치 순으로 정렬)
     *
     * @param keyword  검색어 (영화 제목)
     * @param pageable 페이지 정보
     * @return {@link Page<MovieSearchResponse>}
     */
    Page<MovieSearchResponse> searchByKeyword(String keyword, Pageable pageable);
}

