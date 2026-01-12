package com.geekflex.app.dto.collection;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollectionItemRequest {
    @NotNull(message = "콘텐츠 ID는 필수입니다.")
    private Long contentId;
}