package com.heng.roomrental.audit.controller;

import com.heng.roomrental.audit.dto.*;
import com.heng.roomrental.audit.entity.ActivityLog;
import com.heng.roomrental.audit.entity.ModelLog;
import com.heng.roomrental.audit.mapper.ModelLogMapper;
import com.heng.roomrental.audit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditController {

    private final ActivityLogRepository activityLogRepository;
    private final ModelLogRepository modelLogRepository;
    private final ModelLogMapper modelLogMapper;

    @GetMapping("/activity-logs")
    public AuditPageResponse<ActivityLogResponse> activityLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) Integer responseStatus,
            @RequestParam(required = false) String search,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(
                        "asc".equalsIgnoreCase(direction)
                                ? Sort.Direction.ASC
                                : Sort.Direction.DESC,
                        safeActivitySort(sortBy)
                )
        );

        Specification<ActivityLog> spec = Specification.allOf(
                ActivityLogSpecifications.userId(userId),
                ActivityLogSpecifications.method(method),
                ActivityLogSpecifications.responseStatus(responseStatus),
                ActivityLogSpecifications.search(search),
                ActivityLogSpecifications.from(from),
                ActivityLogSpecifications.to(to)
        );

        Page<ActivityLogResponse> result =
                activityLogRepository.findAll(spec, pageable)
                        .map(ActivityLogResponse::from);


        return AuditPageResponse.from(result);
    }

    @GetMapping("/model-logs")
    public AuditPageResponse<ModelLogResponse> modelLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String modelType,
            @RequestParam(required = false) String modelId,
            @RequestParam(required = false) String event,
            @RequestParam(required = false) Boolean different,
            @RequestParam(required = false) String search,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(
                        "asc".equalsIgnoreCase(direction)
                                ? Sort.Direction.ASC
                                : Sort.Direction.DESC,
                        safeModelSort(sortBy)
                )
        );
        Specification<ModelLog> spec = Specification.allOf(
                ModelLogSpecifications.userId(userId),
                ModelLogSpecifications.modelType(modelType),
                ModelLogSpecifications.modelId(modelId),
                ModelLogSpecifications.event(event),
                ModelLogSpecifications.different(different),
                ModelLogSpecifications.search(search),
                ModelLogSpecifications.from(from),
                ModelLogSpecifications.to(to)
        );

        Page<ModelLogResponse> result =
                modelLogRepository.findAll(spec, pageable)
                        .map(modelLogMapper::from);
//        List<ModelLogResponse> modelLogResponses = modelLogMapper.from(result.getContent());

        return AuditPageResponse.from(result);
    }

    private String safeActivitySort(String value) {
        return switch (value) {
            case "id", "userId", "method", "url",
                 "responseStatus", "createdAt" -> value;
            default -> "createdAt";
        };
    }

    private String safeModelSort(String value) {
        return switch (value) {
            case "id", "modelType", "modelId",
                 "event", "userId", "createdAt" -> value;
            default -> "createdAt";
        };
    }
}
