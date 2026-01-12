package com.geekflex.app.exception;

public class InValidPasswordException extends RuntimeException {
    public InValidPasswordException(String message) {
        super(message);
    }
}
