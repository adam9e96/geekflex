package com.geekflex.app.user.service;

import com.geekflex.app.auth.service.RefreshTokenService;
import com.geekflex.app.collection.service.CollectionService;
import com.geekflex.app.common.exception.CannotChangePasswordException;
import com.geekflex.app.common.exception.CurrentPasswordRequiredException;
import com.geekflex.app.common.exception.DuplicateEmailException;
import com.geekflex.app.common.exception.DuplicateNicknameException;
import com.geekflex.app.common.exception.DuplicateUserIdException;
import com.geekflex.app.common.exception.IncorrectCurrentPasswordException;
import com.geekflex.app.common.exception.UserNotFoundException;
import com.geekflex.app.review.dto.UserReviewStatsDto;
import com.geekflex.app.review.service.ReviewQueryService;
import com.geekflex.app.user.dto.*;
import com.geekflex.app.user.entity.User;
import com.geekflex.app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserServiceImpl implements UserService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final ReviewQueryService reviewQueryService;
    private final CollectionService collectionService;

    @Override
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User registerUser(UserJoinRequest joinRequest) {
        validateRegistrationRequest(joinRequest);

        User user = joinRequest.toEntity(passwordEncoder.encode(joinRequest.getPassword()));
        User saved = userRepository.save(user);

        log.info("회원가입 성공: userId={}, nickname={}", saved.getUserId(), saved.getNickname());
        return saved;
    }

    @Override
    public User findUserEntity(String username) {
        return userRepository.findByUserIdOrUserEmail(username, username)
                .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다: " + username));
    }

    @Override
    public Long findUserIdByUsername(String username) {
        return findUserEntity(username).getId();
    }

    @Override
    public UserInfoResponse getUserProfile(String username) {
        User user = userRepository.findByUserIdOrUserEmail(username, username)
                .orElseThrow(() -> {
                    log.warn("사용자를 찾을 수 없습니다: {}", username);
                    return new UsernameNotFoundException("아이디(이메일) 또는 비밀번호가 올바르지 않습니다.");
                });

        return UserInfoResponse.from(user);
    }

    @Override
    public UserSummaryResponse getUserInfoSummary(String username) {
        User user = userRepository.findByUserIdOrUserEmail(username, username)
                .orElseThrow(() -> {
                    log.warn("사용자를 찾을 수 없습니다: {}", username);
                    return new UsernameNotFoundException("아이디(이메일) 또는 비밀번호가 올바르지 않습니다.");
                });

        return new UserSummaryResponse(user.getNickname(), user.getProfileImage(), user.getUserId());
    }

    @Override
    public String uploadProfileImage(User user, MultipartFile file) throws IOException {
        deleteOldProfileImage(user);
        String relativePath = uploadProfileImageOnly(user, file);

        user.setProfileImage(relativePath);
        userRepository.save(user);

        return relativePath;
    }

    private String uploadProfileImageOnly(User user, MultipartFile file) throws IOException {
        Path userFolder = createUserUploadDirectory(user.getPublicId());
        String extension = extractFileExtension(file.getOriginalFilename());
        validateImageExtension(extension);

        String fileName = UUID.randomUUID() + extension;
        Path filePath = userFolder.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/users/" + user.getPublicId() + "/" + fileName;
    }

    private Path createUserUploadDirectory(String publicId) throws IOException {
        Path userFolder = Paths.get(uploadDir, publicId);
        if (!Files.exists(userFolder)) {
            Files.createDirectories(userFolder);
        }
        return userFolder;
    }

    private String extractFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex == -1 ? "" : filename.substring(dotIndex);
    }

    private void validateImageExtension(String extension) {
        if (!List.of(".jpg", ".jpeg", ".png", ".webp").contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다.");
        }
    }

    private void deleteOldProfileImage(User user) throws IOException {
        if (user.getProfileImage() == null) {
            return;
        }

        String imagePath = user.getProfileImage();
        if (!imagePath.startsWith("/uploads/users/")) {
            log.warn("예상하지 못한 프로필 이미지 경로 형식: {}", imagePath);
            return;
        }

        String relativePath = imagePath.substring("/uploads/users/".length());
        Path oldFile = Paths.get(uploadDir, relativePath);
        Files.deleteIfExists(oldFile);
        log.debug("기존 프로필 이미지 삭제 시도: {}", oldFile);
    }

    @Override
    @Transactional
    public UserDetailResponse signup(UserJoinRequest joinRequest, MultipartFile profileImage) throws IOException {
        User savedUser = registerUser(joinRequest);

        if (profileImage != null && !profileImage.isEmpty()) {
            String imagePath = uploadProfileImage(savedUser, profileImage);
            savedUser.setProfileImage(imagePath);
            userRepository.save(savedUser);
        }

        return UserDetailResponse.from(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfileWithStats(String publicId) {
        User user = findUserByPublicId(publicId);
        UserProfileResponse response = UserProfileResponse.from(user);
        response.setUserReviewStats(reviewQueryService.getUserReviewStats(publicId));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public UserInfoDetailResponse getUserInfoDetail(String publicId) {
        User user = findUserByPublicId(publicId);
        UserReviewStatsDto reviewStats = reviewQueryService.getUserReviewStats(publicId);
        var reviews = reviewQueryService.getUserReviewsByPublicId(publicId);
        var collections = collectionService.getUserCollections(publicId, null);
        return UserInfoDetailResponse.from(user, reviewStats, reviews, collections);
    }

    private User findUserByPublicId(String publicId) {
        return userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));
    }

    @Override
    @Transactional
    public UserInfoResponse updateUser(String username, UserUpdateRequest request, MultipartFile profileImage) throws IOException {
        User user = findUserEntity(username);

        applyNicknameUpdate(user, request.getNickname());
        applyBioUpdate(user, request.getBio());
        applyMarketingAgreementUpdate(user, request.getMarketingAgreement());
        applyPasswordUpdate(user, request);
        applyProfileImageUpdate(user, profileImage);

        User savedUser = userRepository.save(user);
        log.info("회원 정보 수정 완료: userId={}, nickname={}", savedUser.getUserId(), savedUser.getNickname());
        return UserInfoResponse.from(savedUser);
    }

    private void applyNicknameUpdate(User user, String newNickname) {
        if (newNickname == null || newNickname.isBlank() || user.getNickname().equals(newNickname)) {
            return;
        }
        if (userRepository.existsByNickname(newNickname)) {
            throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");
        }
        user.setNickname(newNickname);
    }

    private void applyBioUpdate(User user, String newBio) {
        if (newBio == null) {
            return;
        }
        user.setBio(newBio.isBlank() ? "" : newBio);
    }

    private void applyMarketingAgreementUpdate(User user, Boolean marketingAgreement) {
        if (marketingAgreement != null) {
            user.setMarketingAgreement(marketingAgreement);
        }
    }

    private void applyPasswordUpdate(User user, UserUpdateRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return;
        }

        validatePasswordChangePolicy(user, request.getCurrentPassword());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    private void validatePasswordChangePolicy(User user, String currentPassword) {
        if (user.getOauthProvider() != null) {
            throw new CannotChangePasswordException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
        }
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new CurrentPasswordRequiredException("현재 비밀번호를 입력해주세요.");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IncorrectCurrentPasswordException("현재 비밀번호가 일치하지 않습니다.");
        }
    }

    private void applyProfileImageUpdate(User user, MultipartFile profileImage) throws IOException {
        if (profileImage == null || profileImage.isEmpty()) {
            return;
        }

        if (user.getProfileImage() != null) {
            deleteOldProfileImage(user);
        }

        String imagePath = uploadProfileImageOnly(user, profileImage);
        user.setProfileImage(imagePath);
        log.info("새 프로필 이미지 업로드 완료: userId={}, newImage={}", user.getUserId(), imagePath);
    }

    @Override
    @Transactional
    public void deleteUser(String username, UserDeleteRequest request) throws IOException {
        User user = findUserEntity(username);

        validateUserDeletionRequest(user, request);
        refreshTokenService.deleteByUsername(username);
        deleteProfileImageSafely(user);

        userRepository.delete(user);
        log.info("회원 탈퇴 완료: userId={}, nickname={}", user.getUserId(), user.getNickname());
    }

    private void validateUserDeletionRequest(User user, UserDeleteRequest request) {
        if (user.getOauthProvider() != null) {
            return;
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    private void deleteProfileImageSafely(User user) {
        if (user.getProfileImage() == null) {
            return;
        }

        try {
            deleteOldProfileImage(user);
            log.info("프로필 이미지 파일 삭제 완료: {}", user.getProfileImage());
        } catch (IOException e) {
            log.warn("프로필 이미지 파일 삭제 실패: {}", user.getProfileImage(), e);
        }
    }

    @Override
    public void verifyPassword(String username, String password) {
        User user = findUserEntity(username);

        if (user.getOauthProvider() != null) {
            throw new IllegalStateException("소셜 로그인 사용자는 비밀번호를 확인할 수 없습니다.");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    @Override
    public UserIdCheckResponse checkUserIdAvailability(String userId) {
        String validationMessage = validateUserIdForAvailability(userId);
        if (validationMessage != null) {
            return unavailableUserIdResponse(userId, validationMessage);
        }

        if (userRepository.existsByUserId(userId)) {
            log.debug("아이디 중복 검사: {} - 중복됨", userId);
            return unavailableUserIdResponse(userId, "이미 사용 중인 아이디입니다.");
        }

        log.debug("아이디 중복 검사: {} - 사용 가능", userId);
        return availableUserIdResponse(userId);
    }

    private String validateUserIdForAvailability(String userId) {
        if (userId == null || userId.isBlank()) {
            return "아이디를 입력해주세요.";
        }
        if (userId.length() < 4) {
            return "아이디는 4자 이상이어야 합니다.";
        }
        if (userId.length() > 50) {
            return "아이디는 50자 이하여야 합니다.";
        }
        if (!userId.matches("^[a-zA-Z0-9_]+$")) {
            return "아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.";
        }
        return null;
    }

    private UserIdCheckResponse unavailableUserIdResponse(String userId, String message) {
        return UserIdCheckResponse.of(userId, false, message);
    }

    private UserIdCheckResponse availableUserIdResponse(String userId) {
        return UserIdCheckResponse.of(userId, true, "사용 가능한 아이디입니다.");
    }

    private void validateRegistrationRequest(UserJoinRequest joinRequest) {
        if (userRepository.existsByUserId(joinRequest.getUserId())) {
            throw new DuplicateUserIdException("이미 사용중인 아이디입니다.");
        }
        if (userRepository.existsByUserEmail(joinRequest.getUserEmail())) {
            throw new DuplicateEmailException("이미 등록된 이메일입니다.");
        }
        if (userRepository.existsByNickname(joinRequest.getNickname())) {
            throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");
        }
    }
}
