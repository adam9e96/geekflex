package com.geekflex.app.user.controller;

import com.geekflex.app.common.dto.ApiResponse;
import com.geekflex.app.user.dto.*;
import com.geekflex.app.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@Log4j2
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserRestController {
    private final UserService userService;

    /**
     * 실시간 아이디 중복 검사 API
     */
    @GetMapping("/users/check/user-id")
    public ResponseEntity<ApiResponse<UserIdCheckResponse>> checkUserIdAvailability(
            @RequestParam("userId") String userId
    ) {
        // 4자 미만일 때는 조기 반환 (네트워크 과부하 방지)
        if (userId == null || userId.length() < 4) {
            UserIdCheckResponse earlyResponse = UserIdCheckResponse.of(userId, false, "아이디는 4자 이상이어야 합니다.");
            return ResponseEntity.ok(ApiResponse.success(earlyResponse, "아이디 검사 완료"));
        }

        UserIdCheckResponse response = userService.checkUserIdAvailability(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "아이디 검사 완료"));
    }

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserDetailResponse> handleSignup(
            @RequestPart("data") @Valid UserJoinRequest joinRequest,
            @RequestPart(value = "profile", required = false) MultipartFile file
    ) throws IOException {
        UserDetailResponse dto = userService.signup(joinRequest, file);
        return ApiResponse.success(dto, "회원가입이 완료되었습니다.");
    }

    @GetMapping("/users/me")
    public UserInfoResponse getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.getUserProfile(userDetails.getUsername());
    }

    @GetMapping("/users/me/summary")
    public UserSummaryResponse getUserSummary(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.getUserInfoSummary(userDetails.getUsername());
    }

    @PostMapping("/users/me/verify-password")
    public ApiResponse<Void> verifyPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UserPasswordRequest passwordRequest) {
        userService.verifyPassword(userDetails.getUsername(), passwordRequest.getPassword());
        return ApiResponse.successMessage("비밀번호가 확인되었습니다.");
    }

    @GetMapping("/users/{publicId}/profile")
    public UserProfileResponse getUserProfile(@PathVariable("publicId") String publicId) {
        return userService.getUserProfileWithStats(publicId);
    }

    @PutMapping(value = "/users/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserInfoResponse> updateUser(
            @RequestPart("data") @Valid UserUpdateRequest request,
            @RequestPart(value = "profile", required = false) MultipartFile profileImage,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        UserInfoResponse updatedUser = userService.updateUser(
                userDetails.getUsername(), request, profileImage);
        return ApiResponse.success(updatedUser, "회원 정보가 수정되었습니다.");
    }

    @DeleteMapping("/users/me")
    public ApiResponse<Void> deleteUser(
            @RequestBody @Valid UserDeleteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        userService.deleteUser(userDetails.getUsername(), request);
        return ApiResponse.successMessage("회원 탈퇴가 완료되었습니다.");
    }

    @GetMapping("/users/{publicId}")
    public ApiResponse<UserInfoDetailResponse> getUserInfo(@PathVariable("publicId") String publicId) {
        UserInfoDetailResponse response = userService.getUserInfoDetail(publicId);
        return ApiResponse.success(response, "유저 정보 조회 성공");
    }
}
