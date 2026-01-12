package com.geekflex.app.repository;

import com.geekflex.app.dto.movie.QMovieSearchResponse;
import com.geekflex.app.dto.movie.MovieSearchResponse;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.QContent;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MovieSearchRepositoryImpl implements MovieSearchRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<MovieSearchResponse> searchByKeyword(String keyword, Pageable pageable) {
        QContent content = QContent.content;

        // 검색어 소문자 처리
        String kw = keyword.trim().toLowerCase();

        // 우선순위 점수 계산:
        // 정확 일치 (제목) → 5, 정확 일치 (원제목) → 4
        // 시작 (제목) → 3, 시작 (원제목) → 2
        // 포함 (제목) → 1, 포함 (원제목) → 0
        NumberExpression<Integer> matchPriority = new CaseBuilder()
                .when(content.title.equalsIgnoreCase(kw)).then(5)
                .when(content.originalTitle.equalsIgnoreCase(kw)).then(4)
                .when(content.title.startsWithIgnoreCase(kw)).then(3)
                .when(content.originalTitle.startsWithIgnoreCase(kw)).then(2)
                .when(content.title.containsIgnoreCase(kw)).then(1)
                .when(content.originalTitle.containsIgnoreCase(kw)).then(0)
                .otherwise(-1);

        // 검색 조건: 제목 또는 원제목에 검색어 포함하고, 영화 타입만
        var predicate = content.contentType.eq(ContentType.MOVIE)
                .and(
                        content.title.containsIgnoreCase(kw)
                                .or(content.originalTitle.containsIgnoreCase(kw))
                );

        List<MovieSearchResponse> contentList = queryFactory
                .select(new QMovieSearchResponse(
                        content.id,
                        content.tmdbId,
                        content.title,
                        content.originalTitle,
                        content.overview,
                        content.releaseDate,
                        content.posterUrl,
                        content.backdropUrl,
                        content.popularity,
                        content.voteAverage,
                        content.voteCount
                ))
                .from(content)
                .where(predicate)
                .orderBy(
                        matchPriority.desc(),        // 먼저 우선순위 높은 것 (정확 일치 -> 부분 일치)
                        content.popularity.desc()    // 그 다음 인기도 높은 순
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(content.count())
                .from(content)
                .where(predicate)
                .fetchOne();

        return PageableExecutionUtils.getPage(contentList, pageable, () -> total != null ? total : 0);
    }

}

