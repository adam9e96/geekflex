package com.geekflex.app.dto;

import com.geekflex.app.entity.Role;
import com.geekflex.app.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserJoinRequest {

    @NotBlank(message = "아이디는 필수 입력 항목입니다.") // 🆗
    @Size(min = 4, max = 50, message = "아이디는 4 ~ 50자 사이여야 합니다.") // 🆗
    private String userId;
    @NotBlank(message = "비밀번호는 필수입니다.") // 🆗
    @Size(min = 8, max = 100, message = "비밀번호는 최소 8자 이상이어야 합니다.") // 🆗
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&+=]).*$",
            message = "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.") // 🆗
    private String password;
    @NotBlank(message = "비밀번호 확인을 입력해주세요.") // 🆗
    private String confirmPassword;
    @NotBlank(message = "닉네임은 필수입니다.") // 🆗
    @Size(max = 20, message = "닉네임은 20자 이내로 입력해주세요.") // 🆗
    private String nickname;
    @NotBlank(message = "이메일은 필수입니다.") // 🆗
    @Email(message = "올바른 이메일 형식이 아닙니다.") // 🆗
    private String userEmail;
    @Size(max = 300, message = "자기소개는 300자 이내로 입력해주세요.") // 🆗
    private String bio;

    @NotNull(message = "생년월일은 필수입니다.")
    @Past(message = "생년월일은 과거 날짜여야 합니다.")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
    // 약관 동의 항목
    @AssertTrue(message = "이용약관에 동의해야 회원가입이 가능합니다.") // 🆗
    private boolean termsAgreement; // 이용약관 동의 여부
    private boolean marketingAgreement; // 마케팅 정보 수신 동의 여부

    public User toEntity(String encodedPassword) {
        return User.builder()
                .userId(userId)
                .password(encodedPassword) // 암호화된 비밀번호
                .nickname(nickname)
                .userEmail(userEmail)
                .bio(bio)
                .birthDate(birthDate)
                .termsAgreement(termsAgreement) // 이용약관 동의 정보 저장
                .marketingAgreement(marketingAgreement) // 마케팅 정보 수신 동의 정보 저장
                .role(Role.USER)
                .build();
    }

    @AssertTrue(message = "비밀번호가 일치하지 않습니다!") // 🆗
    public boolean isPasswordsMatch() {
        if (password == null || confirmPassword == null) {
            return false;
        }
        return password.equals(confirmPassword);
    }
}
