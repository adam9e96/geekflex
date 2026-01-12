//package com.geekflex.app.service;
//
//import com.geekflex.app.dto.review.ReviewMyPageResponse;
//import com.geekflex.app.entity.*;
//import com.geekflex.app.repository.*;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.mockito.Mockito.*;
//
//class ReviewServiceTest {
//
//    @Mock
//    private ContentService contentService;
//
//    @Mock
//    private ReviewRepository reviewRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private UserService userService;
//
//    @Mock
//    private ReviewBasicRepository reviewBasicRepository;
//
//    @Mock
//    private UserActivityLogRepository userActivityLogRepository;
//
//    @Mock
//    private ContentRepository contentRepository;
//
//    @InjectMocks
//    private ReviewService reviewService;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//    }
//
//    /**
//     * getMyReviews(username) 단위 테스트
//     */
//    @Test
//    void testGetMyReviews() {
//
//        // ---------- 1. Mock 데이터 준비 ----------
//        String username = "testUser";
//
//        User mockUser = User.builder()
//                .id(1L)
//                .userId("testUser")
//                .nickname("홍길동")
//                .publicId("PUB-1234")
//                .build();
//
//        Review review1 = Review.builder()
//                .id(101L)
//                .userId(1L)
//                .contentId(501L)
//                .reviewType(ReviewType.BASIC)
//                .rating(4.5)
//                .build();
//
//        Review review2 = Review.builder()
//                .id(102L)
//                .userId(1L)
//                .contentId(502L)
//                .reviewType(ReviewType.SHORT)
//                .rating(3.0)
//                .build();
//
//        List<Review> reviewList = List.of(review1, review2);
//
//        Content content1 = Content.builder()
//                .id(501L)
//                .tmdbId(90001L)
//                .title("영화 1")
//                .posterUrl("/poster1.jpg")
//                .genre("액션")
//                .build();
//
//        Content content2 = Content.builder()
//                .id(502L)
//                .tmdbId(90002L)
//                .title("영화 2")
//                .posterUrl("/poster2.jpg")
//                .genre("코미디")
//                .build();
//
//        ReviewBasic basicComment = ReviewBasic.builder()
//                .id(1L)
//                .reviewId(101L)
//                .comment("재밌었음!")
//                .build();
//
//
//        // ---------- 2. Mock 동작 설정 (given) ----------
//        when(userService.findUserEntity(username)).thenReturn(mockUser);
//
//        when(reviewRepository.findByUser(mockUser))
//                .thenReturn(reviewList);
//
//        when(contentRepository.findById(501L))
//                .thenReturn(Optional.of(content1));
//        when(contentRepository.findById(502L))
//                .thenReturn(Optional.of(content2));
//
//        when(reviewBasicRepository.findByReviewId(101L))
//                .thenReturn(Optional.of(basicComment));
//        when(reviewBasicRepository.findByReviewId(102L))
//                .thenReturn(Optional.empty());
//
//
//        // ---------- 3. 실제 메서드 실행 (when) ----------
//        List<ReviewMyPageResponse> result = reviewService.getMyReviews(username);
//
//
//        // ---------- 4. 검증 (then) ----------
//        assertThat(result).hasSize(2);
//
//        ReviewMyPageResponse resp1 = result.get(0);
//        assertThat(resp1.getReviewId()).isEqualTo(101L);
//        assertThat(resp1.getComment()).isEqualTo("재밌었음!");
//        assertThat(resp1.getTitle()).isEqualTo("영화 1");
//
//        ReviewMyPageResponse resp2 = result.get(1);
//        assertThat(resp2.getReviewId()).isEqualTo(102L);
//        assertThat(resp2.getComment()).isNull();   // SHORT 리뷰이므로 comment 없음
//        assertThat(resp2.getTitle()).isEqualTo("영화 2");
//
//        // ---------- Mock 호출 검증 ----------
//        verify(userService, times(1)).findUserEntity(username);
//        verify(reviewRepository, times(1)).findByUser(mockUser);
//        verify(contentRepository, times(2)).findById(anyLong());
//    }
//}
