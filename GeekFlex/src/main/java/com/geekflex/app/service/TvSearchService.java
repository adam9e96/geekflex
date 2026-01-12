package com.geekflex.app.service;

import com.geekflex.app.dto.tv.TvSearchResponse;

import java.util.List;

public interface TvSearchService {

    /**
     * 제목으로 드라마 검색
     *
     * @param keyword  검색어 (드라마 제목)
     * @return 검색된 드라마 List
     */
    List<TvSearchResponse> searchTv(String keyword);
}

