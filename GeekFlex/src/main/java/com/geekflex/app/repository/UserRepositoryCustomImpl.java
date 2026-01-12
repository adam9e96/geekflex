package com.geekflex.app.repository;

import com.geekflex.app.entity.User;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.geekflex.app.entity.QUser.user;

@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final JPAQueryFactory jpaQueryFactory;

    @Override
    public List<User> searchUser(String userId, String nickname) {

        BooleanExpression sql = null;

        if (userId != null && nickname != null) {
            sql = user.userId.eq(userId).or(user.nickname.eq(nickname));
        } else if (userId != null) {
            sql = user.userId.eq(userId);
        } else if (nickname != null) {
            sql = user.nickname.eq(nickname);
        }

        return jpaQueryFactory.selectFrom(user).where(sql).fetch();
    }
}
