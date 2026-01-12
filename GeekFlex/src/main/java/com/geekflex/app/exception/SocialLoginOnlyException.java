package com.geekflex.app.exception;

public class SocialLoginOnlyException extends RuntimeException {
    public SocialLoginOnlyException(String message) {
        super(message);
    }
}
