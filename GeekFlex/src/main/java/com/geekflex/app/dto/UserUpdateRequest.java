package com.geekflex.app.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserUpdateRequest {

    @Size(max = 20, message = "닉네임은 20자 이내로 입력해주세요.")
    private String nickname;

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String userEmail;

    @Size(max = 300, message = "자기소개는 300자 이내로 입력해주세요.")
    private String bio;

    // 비밀번호 변경 시 사용
    @Size(min = 8, max = 100, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&+=]).*$",
            message = "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.")
    private String newPassword;

    private Boolean marketingAgreement;

    // 비밀번호 변경 시 현재 비밀번호 확인용 (서비스에서 검증)
    private String currentPassword;
}

