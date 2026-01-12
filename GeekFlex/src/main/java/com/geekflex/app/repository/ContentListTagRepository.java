package com.geekflex.app.repository;

import com.geekflex.app.entity.ContentListTag;
import com.geekflex.app.entity.TagType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContentListTagRepository extends JpaRepository<ContentListTag, Long> {

    // TagType 기준으로 리스트 가져오기
    List<ContentListTag> findByTagType(TagType tagType);

    // 캐싱 갱신 시 이전 데이터 삭제
    // @Modifying과 @Query를 사용하여 명시적으로 삭제 쿼리 실행
    // clearAutomatically = true: 삭제 후 영속성 컨텍스트를 자동으로 비움
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ContentListTag t WHERE t.tagType = :tagType")
    int deleteByTagType(@Param("tagType") TagType tagType);


}
