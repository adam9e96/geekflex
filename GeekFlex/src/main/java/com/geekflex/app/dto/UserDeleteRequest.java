package com.geekflex.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDeleteRequest {

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password; // 탈퇴 확인용 비밀번호
}

