package com.geekflex.app.user.service;
import com.geekflex.app.user.dto.UserSearchResponse;

import java.util.List;

public interface UserSearchService {

    /**
     * 닉네임 키워드로 유저 검색
     *
     * @param keyword 검색어
     * @return 검색된 유저 List
     */
    List<UserSearchResponse> searchUsers(String keyword);
}








