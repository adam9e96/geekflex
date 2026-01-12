package com.geekflex.app.repository;

import com.geekflex.app.dto.user.UserSearchResponse;
import org.springframework.data.domain.Page;

import java.util.List;

// 유저 검색 관련 인터페이스
public interface UserSearchRepositoryCustom {

    /**
     * 닉네임에서 키워드 포함 검색
     * @param keyword 검색키워드
     * @return {@link List<UserSearchResponse>}
     */
    List<UserSearchResponse> searchByKeyword(String keyword);
}
