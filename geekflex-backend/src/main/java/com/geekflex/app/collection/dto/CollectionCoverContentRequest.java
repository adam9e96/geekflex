package com.geekflex.app.collection.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollectionCoverContentRequest {

    @NotNull(message = "표지로 사용할 콘텐츠를 선택해주세요.")
    private Long contentId;
}
