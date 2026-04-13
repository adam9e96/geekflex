-- =============================================
-- GeekFlex Database Schema (MariaDB)
-- =============================================

DROP TABLE IF EXISTS review_basic;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS collection_comments;
DROP TABLE IF EXISTS collection_items;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS content_list_tag;
DROP TABLE IF EXISTS contents;
DROP TABLE IF EXISTS user_activity_logs;
DROP TABLE IF EXISTS user_ip_logs;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    public_id           VARCHAR(26)  NOT NULL,
    user_id             VARCHAR(50),
    password            VARCHAR(100),
    nickname            VARCHAR(50)  NOT NULL,
    role                VARCHAR(20)  NOT NULL,
    activity_score      INT          NOT NULL DEFAULT 0,
    user_email          VARCHAR(100) NOT NULL,
    profile_image       VARCHAR(255),
    bio                 VARCHAR(300),
    birth_date          DATE         NOT NULL,
    terms_agreement     BOOLEAN      NOT NULL,
    marketing_agreement BOOLEAN,
    joined_at           DATETIME     NOT NULL,
    updated_at          DATETIME,
    oauth_provider      VARCHAR(30),
    oauth_id            VARCHAR(100),
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_public_id (public_id),
    UNIQUE KEY uq_users_nickname (nickname),
    UNIQUE KEY uq_users_email (user_email),
    UNIQUE KEY uq_users_oauth (oauth_provider, oauth_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens
(
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    username      VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    expiry_date   DATETIME     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_refresh_token (refresh_token)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE contents
(
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    tmdb_id           BIGINT       NOT NULL,
    content_type      VARCHAR(20)  NOT NULL,
    title             VARCHAR(200) NOT NULL,
    original_title    VARCHAR(200),
    original_language VARCHAR(10),
    overview          TEXT,
    release_date      DATE,
    end_date          DATE,
    poster_url        VARCHAR(255),
    backdrop_url      VARCHAR(255),
    popularity        DECIMAL(8, 3),
    vote_average      DECIMAL(4, 2),
    vote_count        INT,
    genre             VARCHAR(100),
    origin_country    VARCHAR(50),
    created_at        DATETIME,
    last_synced_at    DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_contents_tmdb (tmdb_id, content_type)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE content_list_tag
(
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    content_id  BIGINT      NOT NULL,
    tag_type    VARCHAR(50) NOT NULL,
    region      VARCHAR(255),
    snapshot_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_content_tag (content_id, tag_type),
    CONSTRAINT fk_content_list_tag_content
        FOREIGN KEY (content_id) REFERENCES contents (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE collections
(
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    is_public   BOOLEAN      NOT NULL,
    cover_image_path VARCHAR(500),
    cover_content_id BIGINT,
    view_count  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_collections_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE collection_items
(
    id            BIGINT   NOT NULL AUTO_INCREMENT,
    collection_id BIGINT   NOT NULL,
    content_id    BIGINT   NOT NULL,
    added_at      DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_collection_content (collection_id, content_id),
    CONSTRAINT fk_collection_items_collection
        FOREIGN KEY (collection_id) REFERENCES collections (id),
    CONSTRAINT fk_collection_items_content
        FOREIGN KEY (content_id) REFERENCES contents (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE collection_comments
(
    id            BIGINT NOT NULL AUTO_INCREMENT,
    collection_id BIGINT NOT NULL,
    user_id       BIGINT NOT NULL,
    content       TEXT   NOT NULL,
    created_at    DATETIME NOT NULL,
    updated_at    DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_collection_comments_collection
        FOREIGN KEY (collection_id) REFERENCES collections (id),
    CONSTRAINT fk_collection_comments_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE reviews
(
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    content_id  BIGINT      NOT NULL,
    review_type VARCHAR(20) NOT NULL,
    rating      DOUBLE      NOT NULL,
    created_at  DATETIME,
    updated_at  DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_content (user_id, content_id),
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_reviews_content
        FOREIGN KEY (content_id) REFERENCES contents (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE review_basic
(
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    review_id BIGINT       NOT NULL,
    comment   VARCHAR(200) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_review_basic_review
        FOREIGN KEY (review_id) REFERENCES reviews (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE likes
(
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id   BIGINT      NOT NULL,
    created_at  DATETIME    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_target (user_id, target_type, target_id),
    CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE user_activity_logs
(
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_id   BIGINT,
    target_type VARCHAR(50),
    created_at  DATETIME    NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_user_activity_logs_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE user_ip_logs
(
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    ip_address  VARCHAR(50) NOT NULL,
    user_agent  VARCHAR(255),
    device_type VARCHAR(50),
    created_at  DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_user_ip_logs_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
