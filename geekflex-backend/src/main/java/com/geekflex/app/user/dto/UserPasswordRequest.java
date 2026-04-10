package com.geekflex.app.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserPasswordRequest {

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;
}








