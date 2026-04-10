package com.geekflex.app.content.repository;

import com.geekflex.app.content.entity.Content;
import com.geekflex.app.content.entity.ContentType;
import com.geekflex.app.content.entity.TagType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface ContentRepository extends JpaRepository<Content, Long> {

    Optional<Content> findByTmdbId(Long tmdbId);

    /** TMDB ID + 콘텐츠 타입으로 조회 (중복 저장 방지) */
    Optional<Content> findByTmdbIdAndContentType(Long tmdbId, ContentType contentType);

    /** 저장된 콘텐츠 중 무작위로 1건 조회 */
    @Query(value = "SELECT * FROM contents ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<Content> findRandom();

    /** 저장된 콘텐츠 중 무작위로 4건 조회 */
    @Query(value = "SELECT * FROM contents ORDER BY RAND() LIMIT 4", nativeQuery = true)
    List<Content> findRandomSuggestions();

    /** tagType으로 필터링된 콘텐츠 목록 조회 (최신순 정렬) */
    @Query("""
            SELECT c
            FROM Content c
            JOIN ContentListTag t ON c.id = t.content.id
            WHERE t.tagType = :tagType
            ORDER BY c.releaseDate DESC
            """)
    List<Content> findByTagType(@Param("tagType") TagType tagType);
}








