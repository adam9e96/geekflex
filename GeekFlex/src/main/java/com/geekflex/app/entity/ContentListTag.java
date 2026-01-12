package com.geekflex.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "content_list_tag",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_content_tag",
                        columnNames = {"content_id", "tag_type"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentListTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag_type", nullable = false)
    private TagType tagType;

    private String region;
    private LocalDateTime snapshotAt;

    @PrePersist
    public void onCreate() {
        this.snapshotAt = LocalDateTime.now();
    }
}
