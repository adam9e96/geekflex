package com.geekflex.app.content.service;

import com.geekflex.app.content.dto.movie.MovieSearchResponse;

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









