# 1. 유저 정보 테이블
CREATE TABLE users
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '내부용 PK',
    public_id      CHAR(26)     NOT NULL UNIQUE COMMENT 'ULID 기반 외부 노출용 ID',
    user_id        VARCHAR(50)  NULL COMMENT '일반회원 로그인ID (소셜은 null)',
    password       VARCHAR(100) NULL COMMENT '비밀번호 (소셜로그인은 null)',
    nickname       VARCHAR(50)  NOT NULL UNIQUE COMMENT '닉네임',
    role           VARCHAR(20)  NOT NULL DEFAULT 'USER' COMMENT '유저 권한',
    activity_score INT                   DEFAULT 0 COMMENT '활동 점수',
    user_email     VARCHAR(100) NOT NULL UNIQUE COMMENT '유저 이메일',
    profile_image  VARCHAR(255) NULL COMMENT '프로필 사진 URL',
    bio            VARCHAR(300) NULL COMMENT '자기소개',
    joined_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입 일자',
    updated_at     DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일자',
    oauth_provider VARCHAR(30)  NULL COMMENT '소셜 로그인 제공자',
    oauth_id       VARCHAR(100) NULL COMMENT '소셜 계정 고유 ID',
    UNIQUE KEY uq_oauth (oauth_provider, oauth_id)
);


# 2. 콘텐츠(영화, 드라마, 애니메이션 등)
create table contents
(
    id             bigint auto_increment primary key,
    tmdb_id        bigint                      not null comment 'TMDB 고유 ID' unique,
    content_type   enum ('movie','tv','anime') not null comment '콘텐츠 유형',
    title          varchar(200)                not null comment '작품 제목',
    original_title varchar(200)                null comment '원제',
    overview       text                        null comment '줄거리',
    release_date   date                        null comment '개봉일 또는 방영 시작일',
    end_date       date                        null comment '방영 종료일 (TV 시리즈용)',
    poster_url     varchar(255)                null comment '포스터 URL',
    backdrop_url   varchar(255)                null comment '배경 이미지 URL',
    popularity     decimal(5, 2) default 0 comment 'TMDB 인기 지수',
    vote_average   decimal(3, 1) default 0 comment 'TMDB 평균 평점',
    vote_count     int           default 0 comment 'TMDB 평점 수',
    genre          varchar(100)                null comment '장르명',
    origin_country varchar(50)                 null comment '제작 국가',
    created_at     datetime      default CURRENT_TIMESTAMP
);

# 3. 댓글
create table comments
(
    id          bigint auto_increment primary key,
    user_id     varchar(21)                  not null comment '댓글 작성자',
    content     text                         not null comment '댓글 내용',
    target_type enum ('review','collection') not null comment '댓글 대상',
    target_id   bigint                       not null comment '대상 테이블의 PK',
    created_at  datetime default CURRENT_TIMESTAMP,
    foreign key (user_id) references users (id)
);

# 4. 좋아요
create table likes
(
    id          bigint auto_increment primary key,
    user_id     varchar(21)                                                                    not null,
    target_type enum ('review', 'comment','collection', 'community_post', 'community_comment') not null,
    target_id   bigint                                                                         not null,
    created_at  datetime default CURRENT_TIMESTAMP,
    foreign key (user_id) references users (id)
);

# 5. 찜목록
create table watchlist
(
    id         bigint auto_increment primary key,
    user_id    varchar(21)                                   not null comment 'user 테이블 PK',
    content_id bigint                                        not null comment 'content 테이블 PK',
    status     enum ('want_to_watch', 'watching', 'watched') not null default 'want_to_watch',
    added_at   datetime                                               default CURRENT_TIMESTAMP,
    platform   varchar(50)                                   null comment '시청 OTT 또는 경로',
    foreign key (user_id) references users (id),
    foreign key (content_id) references contents (id),
    unique (user_id, content_id)
);

# 6. 시청 기록
create table view_history
(
    id         bigint auto_increment primary key,
    user_id    varchar(21) not null comment 'user 테이블 PK',
    content_id bigint      not null,
    watched_at datetime default current_timestamp,
    platform   varchar(50) null comment '시청 OTT 또는 경로',
    foreign key (user_id) references users (id),
    foreign key (content_id) references contents (id)
);

# 7. 유저 활동 로그
create table user_activity_logs
(
    id          bigint auto_increment primary key,
    user_id     varchar(21)                                                              not null comment 'user 테이블 PK',
    action_type enum ('review','comment','like','watchlist','collection','view_history') not null,
    target_id   bigint                                                                   null,
    target_type varchar(50)                                                              null,
    created_at  datetime default current_timestamp,
    foreign key (user_id) references users (id)
);

# 8. 알림
create table notifications
(
    id          bigint auto_increment primary key,
    user_id     varchar(21)                               not null comment '알림 받는 유저',
    sender_id   varchar(21)                               null comment '알림 발생시킨 유저',
    type        enum ('like','comment','follow','system') not null comment '알림타입',
    target_type varchar(50)                               null,
    target_id   bigint                                    null,
    message     varchar(255)                              not null,
    is_read     boolean  default false,
    created_at  datetime default current_timestamp,
    foreign key (user_id) references users (id),
    foreign key (sender_id) references users (id)
);

# 9. 컬렉션
create table collections
(
    id          bigint auto_increment primary key,
    user_id     varchar(21)  not null comment 'user 테이블 PK',
    title       varchar(200) not null,
    description text         null,
    is_public   boolean  default true comment 'true 공개,false 비공개',
    cover_image_path varchar(500) null comment '업로드한 컬렉션 표지 경로',
    cover_content_id bigint null comment '표지로 선택한 콘텐츠 PK',
    view_count  int      default 0 comment '컬렉션 조회수',
    created_at  datetime default current_timestamp,
    foreign key (user_id) references users (id)
);

# 10. 컬렉션 요소
create table collection_items
(
    id            bigint auto_increment primary key,
    collection_id bigint not null comment 'collections 테이블 PK',
    content_id    bigint not null comment 'contents 테이블 PK',
    added_at      datetime default current_timestamp,
    foreign key (collection_id) references collections (id),
    foreign key (content_id) references contents (id),
    unique (collection_id, content_id)
);

# 11. 리뷰
create table reviews
(
    id          bigint auto_increment primary key,
    user_id     varchar(21)                          not null comment 'user 테이블 PK',
    content_id  bigint                               not null comment 'content 테이블 PK',
    review_type enum ('simple', 'short', 'detailed') not null comment '리뷰 타입',
    rating      decimal(2, 1)                        not null check (rating between 0 and 5),
    created_at  datetime default current_timestamp,
    updated_at  datetime default current_timestamp on update current_timestamp,
    foreign key (user_id) references users (id),
    foreign key (content_id) references contents (id),
    unique (user_id, content_id)
);

# 12. short 리뷰
create table review_basic
(
    id        bigint auto_increment primary key,
    review_id bigint       not null,
    comment   varchar(200) not null comment '한줄 코멘트',
    foreign key (review_id) references reviews (id)
);

# 13. detailed 리뷰
create table review_detailed
(
    id        bigint auto_increment primary key,
    review_id bigint not null,
    content   text   not null comment '최대 2000자 리뷰 본문',
    foreign key (review_id) references reviews (id)
);

# 14. 리뷰 포인트
create table review_points
(
    id         bigint auto_increment primary key,
    review_id  bigint                                                 not null,
    point_type enum ('스토리','액션','ost','시각효과','싸움씬','영화력','배우연기','엔딩') not null,
    foreign key (review_id) references reviews (id) on delete cascade
);

# 15. 리뷰 사진
create table review_photos
(
    id          bigint auto_increment primary key,
    review_id   bigint       not null,
    photo_url   varchar(255) not null comment '첨부 이미지 URL',
    uploaded_at datetime default current_timestamp,
    foreign key (review_id) references reviews (id) on delete cascade
);

# 16. 커뮤니티 글
create table community_posts
(
    id         bigint auto_increment primary key,
    user_id    varchar(21)  not null,
    title      varchar(200) not null,
    content    text         not null,
    category   enum ('토론','리뷰토론','잡담','공지','자유게시판') default '자유게시판',
    view_count int                                  default 0 comment '게시글 조회수',
    created_at datetime                             default current_timestamp,
    updated_at datetime                             default current_timestamp on update current_timestamp,
    foreign key (user_id) references users (id)
);

# 17. 커뮤니티 댓글
create table community_comments
(
    id         bigint auto_increment primary key,
    post_id    bigint      not null,
    user_id    varchar(21) not null,
    content    text        not null,
    created_at datetime default current_timestamp,
    foreign key (post_id) references community_posts (id),
    foreign key (user_id) references users (id)
);
