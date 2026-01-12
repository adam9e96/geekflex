package com.geekflex.app.repository;

import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface ContentRepository extends JpaRepository<Content, Long> {
    // tmdb_id 조회
    Optional<Content> findByTmdbId(Long tmdbId);

    // 중복 콘텐츠를 방지하기 위함
    // 이미 DB에 저장된 TMDB ID + 콘텐츠 타입이 있다면 기존 데이터 재활용
    //없으면 새로운 Content 저장
    //이 로직이 바로 중복 INSERT 방지 역할을 합니다
    // 해당 콘텐츠가 DB에 이미 존재하는지 판단 (중복 저장 방지)
    Optional<Content> findByTmdbIdAndContentType(Long tmdbId, ContentType contentType);

    // SELECT c.*
    // FROM contents c
    //                JOIN content_list_tag t ON c.id = t.content_id
    // WHERE  t.tag_type = 'TOP_RATED'
    // ORDER BY c.release_date DESC
    // tagType로 필터링된 콘첸츠 목록 조회
    @Query("""
            SELECT c
            FROM Content c
            JOIN ContentListTag t ON c.id = t.content.id
            WHERE t.tagType = :tagType
            ORDER BY c.releaseDate DESC
            """)
    List<Content> findByTagType(@Param("tagType") TagType tagType);
}
