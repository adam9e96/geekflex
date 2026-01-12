package com.geekflex.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class LoginRequest {
    @NotBlank(message = "아이디 또는 이메일을 입력해주세요.")
    private String username; // userId or userEmail
    
    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}