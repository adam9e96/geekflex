package com.geekflex.app.service;

import com.geekflex.app.dto.user.UserSearchResponse;
import com.geekflex.app.exception.InvalidSearchKeywordException;
import com.geekflex.app.repository.UserSearchRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSearchServiceImpl implements UserSearchService {

    private final UserSearchRepositoryCustom userSearchRepository;

    @Override
    public List<UserSearchResponse> searchUsers(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new InvalidSearchKeywordException("검색어를 입력해주세요.");
        }
        return userSearchRepository.searchByKeyword(keyword);
    }

}