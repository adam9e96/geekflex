package com.geekflex.app.exception;

public class CurrentPasswordRequiredException extends RuntimeException {
    public CurrentPasswordRequiredException(String message) {
        super(message);
    }
}
