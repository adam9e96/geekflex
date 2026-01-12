package com.geekflex.app.service;

import com.geekflex.app.dto.*;
import com.geekflex.app.dto.user.UserIdCheckResponse;
import com.geekflex.app.dto.user.UserProfileResponse;
import com.geekflex.app.entity.User;
import com.geekflex.app.exception.*;
import com.geekflex.app.repository.UserRepository;
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
    // 저장 경로
    @Value("${file.upload-dir}")
    private String uploadDir;
    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // 회원가입 로직
    @Override
    @Transactional
    public User registerUser(UserJoinRequest joinRequest) {

        // 비밀번호를 암호화시키고 request를 Entity로 변환
        User user = joinRequest.toEntity(passwordEncoder.encode(joinRequest.getPassword()));

        // 비즈니스 유효성 검사 (글로벌 핸들러에서 처리)
        // 1. 아이디 중복 검사
        if (userRepository.existsByUserId(joinRequest.getUserId())) {
            throw new DuplicateUserIdException("이미 사용중인 아이디입니다.");
        }
        // 2. 이메일 중복 검사
        if (userRepository.existsByUserEmail(joinRequest.getUserEmail())) {
            throw new DuplicateEmailException("이미 등록된 이메일입니다.");
        }
        // 3. 닉네임 중복 검사
        if (userRepository.existsByNickname(joinRequest.getNickname())) {
            throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");

        }
        // 통과 시
        User saved = userRepository.save(user);
        log.info("회원가입 성공: userId={}, nickname={}", saved.getUserId(), saved.getNickname());

        return saved;

    }

    /**
     * @param username
     * @return {@link User } 엔티티
     * @throws UserNotFoundException 글로벌 핸들러에서 처리
     * @apiNote 2025-11-20 User를 조회하는 서비스 로직, 회원 정보 수정에서 사용. 메서드 로직 최적화 완료 🆗
     */
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

        return new UserSummaryResponse(
                user.getNickname(),
                user.getProfileImage(),
                user.getUserId()
        );
    }


    @Override
    public String uploadProfileImage(User user, MultipartFile file) throws IOException {
        // 기존 프로필 이미지가 있으면 제거
        deleteOldProfileImage(user);
        
        // 새 이미지 업로드
        String relativePath = uploadProfileImageOnly(user, file);
        
        // DB에 저장
        user.setProfileImage(relativePath);
        userRepository.save(user);

        return relativePath;
    }

    /**
     * 프로필 이미지만 업로드하고 경로를 반환 (DB 저장은 하지 않음)
     * updateUser에서 사용하기 위한 메서드
     */
    private String uploadProfileImageOnly(User user, MultipartFile file) throws IOException {
        String publicId = user.getPublicId();

        // 유저별 폴더 생성
        Path userFolder = Paths.get(uploadDir, publicId);
        if (!Files.exists(userFolder)) {
            Files.createDirectories(userFolder);
        }

        // 확장자 추출
        String ext = getExtension(file.getOriginalFilename()); // ex) ".jpg"

        if (!List.of(".jpg", ".jpeg", ".png", ".webp").contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다.");
        }

        // 랜덤 파일명(UUID)
        String uuid = UUID.randomUUID().toString();
        String fileName = uuid + ext;

        // 저장 경로
        Path filePath = userFolder.resolve(fileName);

        // 파일 저장
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // DB에 저장할 상대 URL
        String relativePath = "/uploads/users/" + publicId + "/" + fileName;

        return relativePath;
    }

    private String getExtension(String filename) {
        if (filename == null) {
            return null;
        }
        int dotIndex = filename.lastIndexOf(".");
        return dotIndex == -1 ? "" : filename.substring(dotIndex); // ".jpg"
    }

    private void deleteOldProfileImage(User user) throws IOException {
        if (user.getProfileImage() == null) return;

        // DB에 저장된 경로: "/uploads/users/{publicId}/{fileName}"
        // 실제 파일 경로: uploadDir + "/{publicId}/{fileName}"
        String imagePath = user.getProfileImage();
        if (imagePath.startsWith("/uploads/users/")) {
            // "/uploads/users/" 제거 후 publicId와 fileName만 추출
            String relativePath = imagePath.substring("/uploads/users/".length());
            Path oldFile = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(oldFile);
            log.debug("기존 프로필 이미지 삭제 시도: {}", oldFile);
        } else {
            log.warn("예상하지 못한 프로필 이미지 경로 형식: {}", imagePath);
        }
    }

    @Override
    public UserProfileResponse getUserProfileByPublicId(String publicId) {
        User findUser = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return UserProfileResponse.builder()
                .publicId(publicId)
                .nickname(findUser.getNickname())
                .bio(findUser.getBio())
                .profileImage(findUser.getProfileImage())
                .joinedAt(findUser.getJoinedAt())
                .build();
    }

    /**
     * 회원 정보 수정
     * 
     * @param username 사용자 식별자 (userId 또는 userEmail)
     * @param request 수정할 회원 정보 (닉네임, 자기소개, 마케팅 동의, 비밀번호 등)
     * @param profileImage 새로 업로드할 프로필 이미지 (선택적)
     * @return 수정된 회원 정보 DTO
     * @throws IOException 파일 업로드/삭제 중 발생할 수 있는 예외
     * @throws DuplicateNicknameException 닉네임 중복 시 발생
     * @throws CannotChangePasswordException 소셜 로그인 사용자의 비밀번호 변경 시도 시 발생
     * @throws CurrentPasswordRequiredException 현재 비밀번호 미입력 시 발생
     * @throws IncorrectCurrentPasswordException 현재 비밀번호 불일치 시 발생
     * 
     * @apiNote 
     * - 모든 필드는 선택적이며, 전달된 경우에만 업데이트됩니다.
     * - 프로필 이미지 업데이트 시 기존 이미지는 자동으로 삭제됩니다.
     * - 닉네임 변경 시 중복 검사를 수행합니다.
     * - 비밀번호 변경 시 현재 비밀번호 검증이 필요합니다.
     * - 소셜 로그인 사용자는 비밀번호 변경이 불가능합니다.
     * - @Transactional로 인해 모든 변경사항이 원자적으로 처리됩니다.
     */
    @Override
    @Transactional
    public UserInfoResponse updateUser(String username, UserUpdateRequest request, MultipartFile profileImage) throws IOException {

        // ==========================================
        // 1단계: 현재 사용자 조회
        // ==========================================
        // username(userId 또는 userEmail)으로 사용자 엔티티 조회
        // 사용자가 존재하지 않으면 UserNotFoundException 발생
        User user = findUserEntity(username);

        // ==========================================
        // 2단계: 닉네임 업데이트 (선택적)
        // ==========================================
        // - request에 닉네임이 포함된 경우에만 처리
        // - 기존 닉네임과 동일하면 업데이트 생략 (불필요한 DB 조회 방지)
        // - 다른 사용자가 이미 사용 중인 닉네임인지 중복 검사 수행
        String newNickname = request.getNickname();
        if (newNickname != null && !newNickname.isBlank()) {
            // 기존 닉네임과 다를 때만 중복 체크 및 업데이트
            if (!user.getNickname().equals(newNickname)) {
                // 다른 사용자가 이미 쓰는 닉네임인지 확인
                if (userRepository.existsByNickname(newNickname)) {
                    throw new DuplicateNicknameException("이미 사용 중인 닉네임입니다.");
                }
                user.setNickname(newNickname);
            }
        }

        // ==========================================
        // 3단계: 자기소개(Bio) 업데이트 (선택적)
        // ==========================================
        // - request에 bio가 포함된 경우에만 처리
        // - 빈 문자열도 허용 (자기소개 삭제 가능)
        String newBio = request.getBio();
        if (newBio != null) {
            // 빈 문자열도 허용
            user.setBio(newBio.isBlank() ? "" : newBio);
        }

        // ==========================================
        // 4단계: 마케팅 정보 수신 동의 여부 업데이트 (선택적)
        // ==========================================
        // - request에 marketingAgreement가 포함된 경우에만 처리
        // - null이 아닌 경우에만 업데이트 (명시적으로 false로 변경 가능)
        if (request.getMarketingAgreement() != null) {
            user.setMarketingAgreement(request.getMarketingAgreement());
        }

        // ==========================================
        // 5단계: 비밀번호 변경 처리 (선택적)
        // ==========================================
        // - request에 newPassword가 포함된 경우에만 처리
        // - 소셜 로그인 사용자는 비밀번호 변경 불가
        // - 현재 비밀번호 검증 필수
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            // 소셜 로그인 사용자는 비밀번호 변경 불가
            if (user.getOauthProvider() != null) {
                throw new CannotChangePasswordException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
            }

            // 현재 비밀번호 확인 (필수 입력)
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new CurrentPasswordRequiredException("현재 비밀번호를 입력해주세요.");
            }

            // 현재 비밀번호 검증 (암호화된 비밀번호와 비교)
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new IncorrectCurrentPasswordException("현재 비밀번호가 일치하지 않습니다.");
            }
            
            // 새 비밀번호 암호화 후 저장
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        // ==========================================
        // 6단계: 프로필 이미지 업로드 처리 (선택적)
        // ==========================================
        // - profileImage가 전달된 경우에만 처리
        // - 기존 프로필 이미지가 있으면 먼저 삭제 (불필요한 파일 누적 방지)
        // - 새 이미지 업로드 후 경로를 DB에 저장
        if (profileImage != null && !profileImage.isEmpty()) {
            // 기존 프로필 이미지가 있으면 먼저 삭제
            if (user.getProfileImage() != null) {
                deleteOldProfileImage(user);
                log.info("기존 프로필 이미지 삭제 완료: userId={}, oldImage={}", user.getUserId(), user.getProfileImage());
            }
            
            // 새 프로필 이미지 업로드 (파일만 업로드, DB 저장은 나중에 한 번에)
            String imagePath = uploadProfileImageOnly(user, profileImage);
            user.setProfileImage(imagePath);
            log.info("새 프로필 이미지 업로드 완료: userId={}, newImage={}", user.getUserId(), imagePath);
        }

        // ==========================================
        // 7단계: 변경사항 저장
        // ==========================================
        // - @PreUpdate로 updatedAt 자동 업데이트
        // - 모든 변경사항을 한 번에 저장 (트랜잭션 보장)
        User savedUser = userRepository.save(user);
        log.info("회원 정보 수정 완료: userId={}, nickname={}", savedUser.getUserId(), savedUser.getNickname());

        // ==========================================
        // 8단계: 응답 DTO 생성 및 반환
        // ==========================================
        // - 엔티티를 DTO로 변환하여 반환 (엔티티 노출 방지)
        return UserInfoResponse.from(savedUser);
    }


    @Override
    @Transactional
    public void deleteUser(String username, UserDeleteRequest request) throws IOException {
        // 1. 현재 사용자 조회
        User user = findUserEntity(username);

        // 2. 소셜 로그인 사용자는 비밀번호 확인 불필요
        if (user.getOauthProvider() == null) {
            // 일반 로그인 사용자는 비밀번호 확인
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new IllegalArgumentException("비밀번호를 입력해주세요.");
            }

            // 비밀번호 검증
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
            }
        }

        // 3. RefreshToken 삭제
        refreshTokenService.deleteByUsername(username);
        log.info("RefreshToken 삭제 완료: username={}", username);

        // 4. 프로필 이미지 파일 삭제
        if (user.getProfileImage() != null) {
            try {
                deleteOldProfileImage(user);
                log.info("프로필 이미지 파일 삭제 완료: {}", user.getProfileImage());
            } catch (IOException e) {
                log.warn("프로필 이미지 파일 삭제 실패: {}", user.getProfileImage(), e);
                // 파일 삭제 실패해도 계속 진행
            }
        }

        // 5. 사용자 삭제 (하드 삭제)
        // 참고: 리뷰 등 관련 데이터는 CASCADE 설정에 따라 처리되거나 별도 처리 필요
        userRepository.delete(user);
        log.info("회원 탈퇴 완료: userId={}, nickname={}", user.getUserId(), user.getNickname());
    }

    @Override
    public void verifyPassword(String username, String password) {
        User user = findUserEntity(username);
        // 소셜 로그인 사용자 체크
        if (user.getOauthProvider() != null) {
            throw new IllegalStateException("소셜 로그인 사용자는 비밀번호를 확인할 수 없습니다.");
        }
        // 비밀번호 확인
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    /**
     * 실시간 아이디 중복 검사
     * 
     * @param userId 검사할 아이디
     * @return UserIdCheckResponse 중복 여부 및 사용 가능 여부
     * 
     * 보안 고려사항:
     * - 입력값 검증 (null, 빈 문자열, 최소/최대 길이)
     * - SQL 인젝션 방지 (JPA 사용으로 자동 방지)
     * - 네트워크 과부하 방지 (짧은 문자열은 조기 반환, DB 조회 최소화)
     */
    @Override
    public UserIdCheckResponse checkUserIdAvailability(String userId) {
        // 1. 입력값 검증 (보안 및 성능 최적화)
        if (userId == null || userId.isBlank()) {
            return UserIdCheckResponse.builder()
                    .userId(userId)
                    .available(false)
                    .message("아이디를 입력해주세요.")
                    .build();
        }

        // 2. 최소 길이 검증 (네트워크 과부하 방지 - 짧은 문자열은 조기 반환)
        if (userId.length() < 4) {
            return UserIdCheckResponse.builder()
                    .userId(userId)
                    .available(false)
                    .message("아이디는 4자 이상이어야 합니다.")
                    .build();
        }

        // 3. 최대 길이 검증
        if (userId.length() > 50) {
            return UserIdCheckResponse.builder()
                    .userId(userId)
                    .available(false)
                    .message("아이디는 50자 이하여야 합니다.")
                    .build();
        }

        // 4. 형식 검증 (영문, 숫자, 언더스코어만 허용)
        if (!userId.matches("^[a-zA-Z0-9_]+$")) {
            return UserIdCheckResponse.builder()
                    .userId(userId)
                    .available(false)
                    .message("아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.")
                    .build();
        }

        // 5. DB 중복 검사 (JPA를 사용하여 SQL 인젝션 자동 방지)
        boolean exists = userRepository.existsByUserId(userId);

        if (exists) {
            log.debug("아이디 중복 검사: {} - 중복됨", userId);
            return UserIdCheckResponse.builder()
                    .userId(userId)
                    .available(false)
                    .message("이미 사용 중인 아이디입니다.")
                    .build();
        } else {
            log.debug("아이디 중복 검사: {} - 사용 가능", userId);
            return UserIdCheckResponse.builder()
                    .userId(userId)
                    .available(true)
                    .message("사용 가능한 아이디입니다.")
                    .build();
        }
    }
}
