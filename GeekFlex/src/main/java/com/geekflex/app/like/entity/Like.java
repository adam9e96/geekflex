package com.geekflex.app.like.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "likes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_user_target",
                        columnNames = {"user_id", "target_type", "target_id"}
                )
        }
)
@ToString
public class Like {

    // like PK
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // fk
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private TargetType targetType;

    // 원본_id
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    // 좋아요 추가한 시간
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

