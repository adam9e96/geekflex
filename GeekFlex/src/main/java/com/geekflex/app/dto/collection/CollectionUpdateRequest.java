package com.geekflex.app.dto.collection;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollectionUpdateRequest {
    @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
    private String title;

    @Size(max = 1000, message = "설명은 1000자 이하여야 합니다.")
    private String description;

    private Boolean isPublic;
}