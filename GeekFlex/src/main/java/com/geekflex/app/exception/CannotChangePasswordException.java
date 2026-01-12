package com.geekflex.app.exception;

public class CannotChangePasswordException extends RuntimeException {
    public CannotChangePasswordException(String message) {
        super(message);
    }
}
