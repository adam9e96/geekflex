package com.geekflex.app.exception;

import com.geekflex.app.dto.ApiResponse;
import com.geekflex.app.review.exception.DuplicateReviewException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * 1) Validation 오류 처리 (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage())
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("입력값 검증 실패", errors));
    }

    // 회원가입 - 아이디 중복 커스텀 예외 처리
    @ExceptionHandler(DuplicateUserIdException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateUserId(DuplicateUserIdException ex) {
        return ResponseEntity.status(409)
                .body(ApiResponse.error(ex.getMessage(), Map.of("field", "userId")));
    }

    // 회원가입 - 이메일 중복 커스텀 예외 처리
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateEmail(DuplicateEmailException ex) {
        return ResponseEntity.status(409)
                .body(ApiResponse.error(ex.getMessage(), Map.of("field", "userEmail")));
    }

    // 회원가입 - 닉네임 중복 커스텀 예외 처리
    @ExceptionHandler(DuplicateNicknameException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateNickname(DuplicateNicknameException ex) {
        return ResponseEntity.status(409).body(
                ApiResponse.error(ex.getMessage(), Map.of("field", "nickname"))
        );
    }

    // 소셜 로그인 사용자는 비밀번호 변경 불가
    @ExceptionHandler(CannotChangePasswordException.class)
    public ResponseEntity<ApiResponse<Void>> handleCannotChangePassword(CannotChangePasswordException ex) {
        return ResponseEntity.status(409).body(
                ApiResponse.error(ex.getMessage(), Map.of("field", "password"))
        );
    }

    @ExceptionHandler(CurrentPasswordRequiredException.class)
    public ResponseEntity<ApiResponse<Void>> handleCurrentPasswordRequiredException(CurrentPasswordRequiredException ex) {
        return ResponseEntity.status(409).body(
                ApiResponse.error(ex.getMessage(), Map.of("field", "password"))
        );
    }

    @ExceptionHandler(IncorrectCurrentPasswordException.class)
    public ResponseEntity<ApiResponse<Void>> handleIncorrectCurrentPasswordException(IncorrectCurrentPasswordException ex) {
        return ResponseEntity.status(409).body(
                ApiResponse.error(ex.getMessage(), Map.of("field", "password"))
        );
    }

    @ExceptionHandler(InValidPasswordException.class)
    public ResponseEntity<ApiResponse<Void>> handleInValidPasswordException(InValidPasswordException ex) {
        return ResponseEntity.status(409).body(
                ApiResponse.error(ex.getMessage(), Map.of("field", "password"))
        );
    }

    @ExceptionHandler(DuplicateReviewException.class)
// 리뷰 - 중복 리뷰 커스텀 예외 처리
    public ResponseEntity<ApiResponse<?>> handleDuplicateReview(DuplicateReviewException ex) {
        return ResponseEntity.status(409).body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * 3) 로그인 실패 (401)
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentials(BadCredentialsException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("아이디 또는 비밀번호가 올바르지 않습니다."));
    }

    /**
     * 유저 찾기 실패 404
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    // 회원 수정 - 닉네임 비워서 수정 시도한 경우 400
    @ExceptionHandler(InvalidNicknameException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidNickname(InvalidNicknameException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    // 영화 검색 - 검색어 검증 실패 (400)
    @ExceptionHandler(InvalidSearchKeywordException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidSearchKeyword(InvalidSearchKeywordException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage(), Map.of("field", "keyword")));
    }

    // 일반적인 잘못된 인자 예외 처리 (400)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage() != null ? ex.getMessage() : "잘못된 요청입니다."));
    }

    /**
     * 파일 업로드 크기 초과 예외 처리 (413)
     * application.properties의 spring.servlet.multipart.max-file-size 설정값 초과 시 발생
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<?>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error("파일 크기가 허용된 최대 크기(10MB)를 초과했습니다.", Map.of("field", "file")));
    }

    /**
     * 멀티파트 요청 파싱 실패 예외 처리 (400)
     * 잘못된 멀티파트 요청 형식일 때 발생
     */
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<?>> handleMultipartException(MultipartException ex) {
        // MaxUploadSizeExceededException은 이미 위에서 처리되므로, 다른 MultipartException만 처리
        if (ex.getCause() instanceof MaxUploadSizeExceededException) {
            return handleMaxUploadSizeExceeded((MaxUploadSizeExceededException) ex.getCause());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("파일 업로드 요청을 처리할 수 없습니다. 파일 형식을 확인해주세요.", Map.of("field", "file")));
    }

    /**
     * 파일 입출력 예외 처리 (500)
     * 파일 읽기/쓰기 실패, 디스크 공간 부족 등 파일 시스템 관련 오류
     */
    @ExceptionHandler(IOException.class)
    public ResponseEntity<ApiResponse<?>> handleIOException(IOException ex) {
        // 파일 업로드 관련 IOException인 경우 더 구체적인 메시지 제공
        String message = "파일 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        if (ex.getMessage() != null && ex.getMessage().contains("No space left")) {
            message = "서버 저장 공간이 부족합니다. 관리자에게 문의해주세요.";
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(message, Map.of("field", "file")));
    }

    // TMDB API 호출 실패 (502)
    @ExceptionHandler(TmdbApiException.class)
    public ResponseEntity<ApiResponse<?>> handleTmdbApiException(TmdbApiException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiResponse.error("영화 검색 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.", ex.getMessage()));
    }

    /**
     * 4) 인증 필요 (JWT 실패 포함)
     * // 로그인 예외 처리
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuth(AuthenticationException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("로그인이 필요합니다."));
    }

    /**
     * 5) 권한 없음 (403)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("접근 권한이 없습니다."));
    }

    /**
     * 6) 기타 모든 예외 처리 (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleAll(Exception ex) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 내부 오류가 발생했습니다.", ex.getMessage()));
    }

    @ExceptionHandler(SocialLoginOnlyException.class)
    public ResponseEntity<ApiResponse<Void>> handleSocialLoginOnly(SocialLoginOnlyException ex) {
        return ResponseEntity.status(400).body(
                ApiResponse.error(ex.getMessage(), null)
        );
    }

    // 컬렉션 관련 예외 처리
    // 컬렉션 상세페이지에서 찾지 못했을때
    @ExceptionHandler(CollectionNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleCollectionNotFound(CollectionNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CollectionAccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleCollectionAccessDenied(CollectionAccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateCollectionItemException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateCollectionItem(DuplicateCollectionItemException ex) {
        return ResponseEntity.status(409)
                .body(ApiResponse.error(ex.getMessage(), Map.of("field", "contentId")));
    }

}
