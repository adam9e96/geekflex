package com.geekflex.app.service;

import com.geekflex.app.dto.movie.MovieSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MovieSearchService {

    /**
     * 제목으로 영화 검색
     *
     * @param keyword  검색어 (영화 제목)
     * @return 검색된 영화 List
     */
    List<MovieSearchResponse> searchMovies(String keyword);
}

