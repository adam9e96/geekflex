package com.geekflex.app.repository;

import com.geekflex.app.entity.TagType;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Log4j2
class ContentListTagRepositoryTest {

    @Autowired
    private ContentListTagRepository contentListTagRepository;

    // 카테고리 삭제
    @Test
    @Transactional
    void testDeleteByTagType() {
        TagType tagType = TagType.NOW_PLAYING;

        int result = contentListTagRepository.deleteByTagType(tagType);
        // 지운 횟수
        log.info("삭제된 횟수: {}", result);
    }


}