create table contents
(
    id                   bigint auto_increment comment '내부 PK'
        primary key,
    tmdb_id              bigint                                    not null comment 'TMDB 고유 ID',
    content_type         enum ('ANIME', 'MOVIE', 'TV')             not null,
    title                varchar(200)                              not null comment '작품 제목 (로컬화된 제목)',
    original_title       varchar(200)                              null comment '원제',
    original_language    varchar(10)                               null comment '원어 코드 (예: en, ko)',
    overview             text                                      null comment '줄거리',
    release_date         date                                      null comment '개봉일 또는 방영 시작일',
    end_date             date                                      null comment '방영 종료일 (TV 시리즈용)',
    poster_url           varchar(255)                              null comment '포스터 이미지 경로',
    backdrop_url         varchar(255)                              null comment '배경 이미지 경로',
    popularity           decimal(8, 3) default 0.000               null comment 'TMDB 인기 지수',
    vote_average         decimal(4, 2) default 0.00                null comment 'TMDB 평균 평점',
    vote_count           int           default 0                   null comment 'TMDB 투표 수',
    genre                varchar(100)                              null comment '장르명 (콤마 구분)',
    origin_country       varchar(50)                               null comment '제작 국가',
    created_at           datetime      default current_timestamp() null comment 'DB 저장(캐싱) 시각',
    episode_run_time     longtext collate utf8mb4_bin              null comment '에피소드 런타임 (분 단위 배열)',
    networks             longtext collate utf8mb4_bin              null comment '방송사 정보 배열',
    production_companies longtext collate utf8mb4_bin              null comment '제작사 정보 배열',
    production_countries longtext collate utf8mb4_bin              null comment '제작 국가 정보 배열',
    seasons              longtext collate utf8mb4_bin              null comment '시즌 정보 배열',
    spoken_languages     longtext collate utf8mb4_bin              null comment '음성 언어 정보 배열',
    number_of_episodes   int                                       null comment '에피소드 수 (TV 전용)',
    number_of_seasons    int                                       null comment '시즌 수 (TV 전용)',
    status               varchar(50)                               null comment '방영 상태 (TV: Returning Series/Ended, Movie: Released)',
    tagline              varchar(500)                              null comment '태그라인 (한줄 주제)',
    constraint uq_tmdb_type
        unique (tmdb_id, content_type)
)
    comment 'TMDB 콘텐츠 정보 (리뷰 서비스 캐싱용)';

create table content_list_tag
(
    id          bigint auto_increment
        primary key,
    content_id  bigint                                                                   not null comment 'contents.id FK',
    tag_type    enum ('NOW_PLAYING', 'TOP_RATED', 'POPULAR', 'UPCOMING', 'CUSTOM_TOP10') not null comment '리스트 태그',
    region      varchar(255)                                                             null,
    snapshot_at datetime default current_timestamp()                                     null comment '캐싱 시각',
    constraint uq_content_tag
        unique (content_id, tag_type),
    constraint content_list_tag_ibfk_1
        foreign key (content_id) references contents (id)
            on delete cascade
);

create table refresh_tokens
(
    id            bigint auto_increment
        primary key,
    username      varchar(255) not null,
    refresh_token varchar(500) not null,
    expiry_date   datetime     not null,
    constraint refresh_token
        unique (refresh_token)
);

create table user_ip_logs
(
    id          bigint auto_increment
        primary key,
    user_id     bigint       not null,
    ip_address  varchar(50)  not null,
    user_agent  varchar(255) null,
    device_type varchar(50)  null,
    created_at  datetime     null
);

create table users
(
    id                  bigint auto_increment comment '내부용 PK'
        primary key,
    public_id           varchar(26)                            not null,
    user_id             varchar(50)                            null comment '일반회원 로그인ID (소셜은 null)',
    password            varchar(100)                           null comment '비밀번호 (소셜로그인은 null)',
    nickname            varchar(50)                            not null comment '닉네임',
    role                tinyint                                not null,
    activity_score      int        default 0                   null comment '활동 점수',
    user_email          varchar(100)                           not null comment '유저 이메일',
    profile_image       varchar(255)                           null comment '프로필 사진 URL',
    bio                 varchar(300)                           null comment '자기소개',
    joined_at           datetime   default current_timestamp() not null comment '가입 일자',
    updated_at          datetime   default current_timestamp() null on update current_timestamp() comment '수정 일자',
    oauth_provider      varchar(30)                            null comment '소셜 로그인 제공자',
    oauth_id            varchar(100)                           null comment '소셜 계정 고유 ID',
    terms_agreement     tinyint(1) default 0                   not null comment '이용약관 및 개인정보처리방침 동의 여부',
    marketing_agreement tinyint(1) default 0                   not null comment '마케팅 정보 수신 동의 여부',
    birth_date          date                                   not null,
    constraint nickname
        unique (nickname),
    constraint public_id
        unique (public_id),
    constraint uq_oauth
        unique (oauth_provider, oauth_id),
    constraint user_email
        unique (user_email)
);

create table collections
(
    id          bigint auto_increment
        primary key,
    user_id     bigint                                 not null comment 'user 테이블 PK',
    title       varchar(200)                           not null,
    description text                                   null,
    is_public   tinyint(1) default 1                   null comment 'true 공개,false 비공개',
    cover_image_path varchar(500)                      null comment '업로드한 컬렉션 표지 경로',
    cover_content_id bigint                            null comment '표지로 선택한 콘텐츠 PK',
    view_count  int        default 0                   null comment '컬렉션 조회수',
    created_at  datetime   default current_timestamp() null,
    updated_at  datetime   default current_timestamp() null on update current_timestamp(),
    constraint collections_ibfk_1
        foreign key (user_id) references users (id)
);

create table collection_comments
(
    id            bigint auto_increment
        primary key,
    collection_id bigint                               not null comment 'collections 테이블 PK',
    user_id       bigint                               not null comment 'users 테이블 PK',
    content       text                                 not null comment '댓글 내용',
    created_at    datetime default current_timestamp() null,
    updated_at    datetime default current_timestamp() null on update current_timestamp(),
    constraint collection_comments_ibfk_1
        foreign key (collection_id) references collections (id)
            on delete cascade,
    constraint collection_comments_ibfk_2
        foreign key (user_id) references users (id)
            on delete cascade
);

create table collection_items
(
    id            bigint auto_increment
        primary key,
    collection_id bigint                               not null comment 'collections 테이블 PK',
    content_id    bigint                               not null comment 'contents 테이블 PK',
    added_at      datetime default current_timestamp() null,
    constraint collection_id
        unique (collection_id, content_id),
    constraint collection_items_ibfk_1
        foreign key (collection_id) references collections (id)
            on delete cascade,
    constraint collection_items_ibfk_2
        foreign key (content_id) references contents (id)
            on delete cascade
);

create table likes
(
    id          bigint auto_increment
        primary key,
    user_id     bigint                                                                                     not null comment 'user 테이블 PK',
    target_type enum ('REVIEW', 'COMMENT', 'COLLECTION', 'COMMUNITY_POST', 'COMMUNITY_COMMENT', 'CONTENT') not null,
    target_id   bigint                                                                                     not null,
    created_at  datetime default current_timestamp()                                                       null,
    constraint likes_ibfk_1
        foreign key (user_id) references users (id)
);

create table reviews
(
    id          bigint auto_increment
        primary key,
    user_id     bigint                               not null comment 'user 테이블 PK',
    content_id  bigint                               not null comment 'content 테이블 PK',
    review_type enum ('SHORT', 'BASIC', 'DETAILED')  not null,
    rating      decimal(2, 1)                        not null,
    created_at  datetime default current_timestamp() null,
    updated_at  datetime default current_timestamp() null on update current_timestamp(),
    constraint user_id
        unique (user_id, content_id),
    constraint reviews_ibfk_1
        foreign key (user_id) references users (id),
    constraint reviews_ibfk_2
        foreign key (content_id) references contents (id)
);

create table review_basic
(
    id        bigint auto_increment
        primary key,
    review_id bigint       not null,
    comment   varchar(200) not null comment '한줄 코멘트',
    constraint review_basic_ibfk_1
        foreign key (review_id) references reviews (id)
);

create table review_detailed
(
    id        bigint auto_increment
        primary key,
    review_id bigint not null,
    content   text   not null comment '최대 2000자 리뷰 본문',
    constraint review_detailed_ibfk_1
        foreign key (review_id) references reviews (id)
);

create table review_photos
(
    id          bigint auto_increment
        primary key,
    review_id   bigint                               not null,
    photo_url   varchar(255)                         not null comment '첨부 이미지 URL',
    uploaded_at datetime default current_timestamp() null,
    constraint review_photos_ibfk_1
        foreign key (review_id) references reviews (id)
            on delete cascade
);

create table review_points
(
    id         bigint auto_increment
        primary key,
    review_id  bigint                                                        not null,
    point_type enum ('스토리', '액션', 'ost', '시각효과', '싸움씬', '영화력', '배우연기', '엔딩') not null,
    constraint review_points_ibfk_1
        foreign key (review_id) references reviews (id)
            on delete cascade
);

create table user_activity_logs
(
    id          bigint auto_increment
        primary key,
    user_id     bigint                                                                      not null comment 'user 테이블 PK',
    target_id   bigint                                                                      null,
    target_type varchar(50)                                                                 null,
    created_at  datetime default current_timestamp()                                        null,
    action_type enum ('REVIEW', 'COMMENT', 'COLLECTION', 'LIKE', 'CONTENT', 'VIEW_HISTORY') not null,
    constraint user_activity_logs_ibfk_1
        foreign key (user_id) references users (id)
);

