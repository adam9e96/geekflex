package com.geekflex.app.repository;

import com.geekflex.app.entity.User;

import java.util.List;

public interface UserRepositoryCustom {
    List<User> searchUser(String userId, String nickname);
}
