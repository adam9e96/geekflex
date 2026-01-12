package com.geekflex.app.repository;

import com.geekflex.app.dto.user.QUserSearchResponse;
import com.geekflex.app.dto.user.UserSearchResponse;
import com.geekflex.app.entity.QUser;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserSearchRepositoryImpl implements UserSearchRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<UserSearchResponse> searchByKeyword(String keyword) {
        QUser user = QUser.user;

        String kw = keyword.trim().toLowerCase();

        // 우선순위 점수 계산:
        // 완전 일치 → 4, 시작 → 3, 포함 → 2, 끝 → 1, 그 외 → 0
        NumberExpression<Integer> matchPriority = new CaseBuilder()
                .when(user.nickname.eq(kw)).then(4)
                .when(user.nickname.startsWithIgnoreCase(kw)).then(3)
                .when(user.nickname.containsIgnoreCase(kw)).then(2)
                .when(user.nickname.endsWithIgnoreCase(kw)).then(1)
                .otherwise(0);

        return queryFactory
                .select(new QUserSearchResponse(
                        user.publicId,
                        user.nickname,
                        user.profileImage,
                        user.activityScore
                ))
                .from(user)
                .where(
                        user.nickname.containsIgnoreCase(kw)
                                .or(user.bio.containsIgnoreCase(kw))
                )
                .orderBy(
                        matchPriority.desc(),        // 우선순위 정렬
                        user.activityScore.desc()   // 부가 정렬
                )
                .fetch();
    }
}