package com.geekflex.app.user.controller;

import com.geekflex.app.user.dto.UserSearchResponse;
import com.geekflex.app.user.service.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class UserSearchController {

    private final UserSearchService userSearchService;

    /**
     * 유저 검색 API
     * 예: GET /api/v1/users/search?keyword=스타캐스
     */
    @GetMapping("/users/search")
    public List<UserSearchResponse> searchUsers(
            @RequestParam("keyword") String keyword
    ) {
        return userSearchService.searchUsers(keyword);
    }
}







