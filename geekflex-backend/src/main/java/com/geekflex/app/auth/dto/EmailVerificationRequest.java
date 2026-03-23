package com.geekflex.app.auth.dto;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmailVerificationRequest {
    private String email;
    private String code;
}








