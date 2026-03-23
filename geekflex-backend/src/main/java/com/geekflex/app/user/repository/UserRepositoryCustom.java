package com.geekflex.app.user.repository;
import com.geekflex.app.user.entity.User;

import java.util.List;

public interface UserRepositoryCustom {
    List<User> searchUser(String userId, String nickname);
}








