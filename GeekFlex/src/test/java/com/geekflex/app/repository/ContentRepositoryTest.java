package com.geekflex.app.repository;

import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@Log4j2
class ContentRepositoryTest {

    @Autowired
    private ContentRepository contentRepository;

    @Test
    void testFindByTmdbIdAndContentType() {

        // 주술회전 극장판 TMDBID
        long tmdbId = 1539104;
        ContentType contentType = ContentType.MOVIE;

        Optional<Content> content = contentRepository.findByTmdbIdAndContentType(tmdbId, contentType);

        if (content.isPresent()) {
            log.info(content.get().getId());
            log.info(content.get().getTitle());
        }else {
            log.info("없다 게이야");
        }
    }


    @Test
    void testFindByContentType() {

        TagType tagType = TagType.POPULAR;

        List<Content> content = contentRepository.findByTagType( tagType);

        log.info(content.size());
    }
}