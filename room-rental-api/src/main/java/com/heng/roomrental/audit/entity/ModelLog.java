package com.heng.roomrental.audit.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_logs", indexes = {
        @Index(name = "idx_model_logs_type_id", columnList = "model_type, model_id"),
        @Index(name = "idx_model_logs_user_id", columnList = "user_id"),
        @Index(name = "idx_model_logs_event", columnList = "event"),
        @Index(name = "idx_model_logs_created_at", columnList = "created_at")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ModelLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_type", nullable = false)
    private String modelType;

    @Column(name = "model_id", nullable = false)
    private String modelId;

    @Column(nullable = false, length = 30)
    private String event;

    @Column(name = "is_different", nullable = false)
    private Boolean isDifferent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private JsonNode changes;

    @Column(name = "user_id")
    private Long userId;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
