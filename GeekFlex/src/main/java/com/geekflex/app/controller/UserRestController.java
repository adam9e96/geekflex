package com.geekflex.app.controller;

import com.geekflex.app.dto.*;
import com.geekflex.app.review.service.ReviewQueryService;
import com.geekflex.app.review.dto.UserReviewStatsDto;
import com.geekflex.app.dto.user.UserIdCheckResponse;
import com.geekflex.app.dto.user.UserInfoDetailResponse;
import com.geekflex.app.dto.user.UserPasswordRequest;
import com.geekflex.app.dto.user.UserProfileResponse;
import com.geekflex.app.entity.User;
import com.geekflex.app.repository.UserRepository;
import com.geekflex.app.service.UserService;
import com.geekflex.app.service.collection.CollectionService;
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
    private final ReviewQueryService reviewQueryService;
    private final CollectionService collectionService;
    private final UserRepository userRepository;

    /**
     * 실시간 아이디 중복 검사 API
     * 회원가입 및 회원관리에서 사용
     * 
     * @param userId 검사할 아이디 (Query Parameter)
     * @return 아이디 사용 가능 여부
     * 
     * 보안 고려사항:
     * - 입력값 검증 (길이, 형식)
     * - SQL 인젝션 방지 (JPA 사용)
     * - 네트워크 과부하 방지 (4자 미만일 때 조기 반환, DB 조회 없음)
     */
    @GetMapping("/users/check/user-id")
    public ResponseEntity<ApiResponse<UserIdCheckResponse>> checkUserIdAvailability(
            @RequestParam("userId") String userId
    ) {
        // 4자 미만일 때는 조기 반환 (네트워크 과부하 방지)
        if (userId == null || userId.length() < 4) {
            UserIdCheckResponse earlyResponse = UserIdCheckResponse.builder()
                    .userId(userId)
                    .available(false)
                    .message("아이디는 4자 이상이어야 합니다.")
                    .build();
            
            ApiResponse<UserIdCheckResponse> apiResponse = ApiResponse.<UserIdCheckResponse>builder()
                    .success(true)
                    .message("아이디 검사 완료")
                    .data(earlyResponse)
                    .build();
            
            return ResponseEntity.ok(apiResponse);
        }
        
        // 4자 이상일 때만 Service 호출 (DB 조회)
        UserIdCheckResponse response = userService.checkUserIdAvailability(userId);
        
        ApiResponse<UserIdCheckResponse> apiResponse = ApiResponse.<UserIdCheckResponse>builder()
                .success(true)
                .message("아이디 검사 완료")
                .data(response)
                .build();
        
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserDetailResponse>> handleSignup(
            @RequestPart("data") @Valid UserJoinRequest joinRequest,
            @RequestPart(value = "profile", required = false) MultipartFile file
    ) throws IOException {
        // 1. 유저 저장 (중복 검사 실패 시 GlobalExceptionHandler가 처리)
        User savedUser = userService.registerUser(joinRequest);
        // 2. 프로필 이미지 업로드 처리
        if (file != null && !file.isEmpty()) {
            String imagePath = userService.uploadProfileImage(savedUser, file);
            // 엔티티에 반영 후 다시 저장
            savedUser.setProfileImage(imagePath);
            userService.saveUser(savedUser);
        }

        // 3. 응답 DTO 생성
        UserDetailResponse dto = UserDetailResponse.builder()
                .publicId(savedUser.getPublicId())
                .userId(savedUser.getUserId())
                .nickname(savedUser.getNickname())
                .role(savedUser.getRole())
                .activityScore(savedUser.getActivityScore())
                .userEmail(savedUser.getUserEmail())
                .profileImage(savedUser.getProfileImage())
                .bio(savedUser.getBio())
                .joinedAt(savedUser.getJoinedAt())
                .build();

        // 4. 성공 응답 반환
        ApiResponse<UserDetailResponse> response = ApiResponse.<UserDetailResponse>builder()
                .success(true)
                .message("회원가입이 완료되었습니다.")
                .data(dto)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 현재 로그인된 사용자 정보 조회
    // 로그인된 내 정보 가져오기
    @GetMapping("/users/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build(); // 토큰이 없거나 만료됨
        }

        UserInfoResponse userInfo = userService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(userInfo);
    }

    // 헤더에서 사용할 간단한 사용자 정보 조회
    @GetMapping("/users/me/summary")
    public ResponseEntity<UserSummaryResponse> getUserSummary(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        UserSummaryResponse userSummaryResponse = userService.getUserInfoSummary(userDetails.getUsername());
        return ResponseEntity.ok(userSummaryResponse);
    }

    @PostMapping("/users/me/verify-password")
    public ResponseEntity<ApiResponse<Void>> verifyPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UserPasswordRequest passwordRequest) {

        // 토큰 문제로 유저 정보를 읽어올 수 없어서 null 이 되는 경우
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            userService.verifyPassword(userDetails.getUsername(), passwordRequest.getPassword());

            ApiResponse<Void> response = ApiResponse.<Void>builder()
                    .success(true)
                    .message("비밀번호가 확인되었습니다.")
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> response = ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .errors("Incorrect password")
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (IllegalStateException e) {
            ApiResponse<Void> response = ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .errors("OAuth users cannot verify password")
                    .build();

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }

    @GetMapping("/users/{publicId}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable("publicId") String publicId) {
        UserReviewStatsDto userReviewStatsDto = reviewQueryService.getUserReviewStats(publicId);
        UserProfileResponse userProfileResponse = userService.getUserProfileByPublicId(publicId);
        userProfileResponse.setUserReviewStats(userReviewStatsDto);

        return ResponseEntity.ok().body(
                userProfileResponse
        );
    }

    // 회원 정보 수정
    @PutMapping(value = "/users/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserInfoResponse>> updateUser(
            @RequestPart("data") @Valid UserUpdateRequest request,
            @RequestPart(value = "profile", required = false) MultipartFile profileImage,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        // 토큰 문제로 유저 정보를 읽어올 수 없어서 null 이 되는 경우
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }


        // 회원 정보 수정 // 유저 이름, 업데이트Request, 프로파일 이미지
        UserInfoResponse updatedUser = userService.updateUser(
                userDetails.getUsername(),
                request,
                profileImage
        );

        // 반환
        ApiResponse<UserInfoResponse> response = ApiResponse.<UserInfoResponse>builder()
                .success(true)
                .message("회원 정보가 수정되었습니다.")
                .data(updatedUser)
                .build();

        return ResponseEntity.ok(response);
    }

    // 회원 탈퇴
    @DeleteMapping("/users/me")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @RequestBody @Valid UserDeleteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        userService.deleteUser(userDetails.getUsername(), request);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("회원 탈퇴가 완료되었습니다.")
                .build();

        return ResponseEntity.ok(response);
    }

    // 유저 검색 시 제공할 API
    // 유저 의 최소한의 개인정보를 표시
    // 보여줄 정보
    // 이 사람이 리뷰한거 개수 리뷰 목록  컬렉션 목록
    @GetMapping("/users/{publicId}")
    public ResponseEntity<ApiResponse<UserInfoDetailResponse>> getUserInfo(@PathVariable("publicId") String publicId){
        // 1. 유저 프로필 정보 조회
        UserProfileResponse userProfile = userService.getUserProfileByPublicId(publicId);
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 2. 리뷰 통계 정보 조회
        UserReviewStatsDto reviewStats = reviewQueryService.getUserReviewStats(publicId);
        
        // 3. 리뷰 목록 조회
        var reviews = reviewQueryService.getUserReviewsByPublicId(publicId);
        
        // 4. 컬렉션 목록 조회 (공개 컬렉션만)
        var collections = collectionService.getUserCollections(publicId, null);
        
        // 5. 응답 DTO 생성
        UserInfoDetailResponse response = UserInfoDetailResponse.builder()
                .publicId(userProfile.getPublicId())
                .nickname(userProfile.getNickname())
                .bio(userProfile.getBio())
                .joinedAt(userProfile.getJoinedAt())
                .profileImage(userProfile.getProfileImage())
                .activityScore(user.getActivityScore())
                .reviewStats(reviewStats)
                .reviews(reviews)
                .collections(collections)
                .build();
        
        ApiResponse<UserInfoDetailResponse> apiResponse = ApiResponse.<UserInfoDetailResponse>builder()
                .success(true)
                .message("유저 정보 조회 성공")
                .data(response)
                .build();
        
        return ResponseEntity.ok(apiResponse);
    }
}