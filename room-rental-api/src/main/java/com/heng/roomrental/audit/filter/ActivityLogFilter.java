package com.heng.roomrental.audit.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.audit.config.AuditProperties;
import com.heng.roomrental.audit.service.ActivityLogService;
import com.heng.roomrental.audit.service.AuditUserProvider;
import com.heng.roomrental.security.CurrentUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;

@RequiredArgsConstructor
public class ActivityLogFilter extends OncePerRequestFilter {

    private static final Set<String> SENSITIVE_KEYS = Set.of(
            "password",
            "token",
            "access_token",
            "refresh_token",
            "authorization",
            "client_secret",
            "secret"
    );

    private final ActivityLogService activityLogService;

    private final ObjectMapper objectMapper;
    private final AuditProperties properties;
    private final AuditUserProvider  auditUserProvider;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.getActivity().isEnabled()) {
            return true;
        }

        if ("GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        if (request.getRequestURI().contains("google")){
            return true;
        }

        String path = request.getRequestURI();

        return properties.getActivity().getExcludePaths()
                .stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        ContentCachingRequestWrapper requestWrapper =
                new ContentCachingRequestWrapper(request,1024*1024);

        ContentCachingResponseWrapper responseWrapper =
                new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            try {
                save(requestWrapper, responseWrapper);
            } finally {
                responseWrapper.copyBodyToResponse();
            }
        }
    }

    private void save(
            ContentCachingRequestWrapper request,
            ContentCachingResponseWrapper response
    ) {
        String requestBody = body(
                request.getContentAsByteArray(),
                request.getContentType()
        );

        String responseBody = body(
                response.getContentAsByteArray(),
                response.getContentType()
        );

        activityLogService.save(
                auditUserProvider.getUserId().orElse(null),
                request.getMethod(),
                request.getRequestURI(),
                mask(requestBody),
                mask(responseBody),
                clientIp(request),
                request.getHeader("User-Agent"),
                response.getStatus()
        );
    }

    private String body(byte[] bytes, String contentType) {
        if (bytes == null || bytes.length == 0) {
            return null;
        }

        if (contentType != null &&
                !(contentType.contains(MediaType.APPLICATION_JSON_VALUE)
                        || contentType.contains("+json"))) {
            return "[non-json body omitted]";
        }

        String value = new String(bytes, StandardCharsets.UTF_8);
        int max = properties.getActivity().getMaxBodySize();

        return value.length() <= max
                ? value
                : value.substring(0, max) + "...[truncated]";
    }

    private String mask(String json) {
        if (json == null || json.isBlank()) {
            return json;
        }

        try {
            Object parsed = objectMapper.readValue(json, Object.class);
            Object masked = maskValue(parsed);
            return objectMapper.writeValueAsString(masked);
        } catch (Exception ignored) {
            return json;
        }
    }

    @SuppressWarnings("unchecked")
    private Object maskValue(Object value) {
        if (value instanceof Map<?, ?> map) {
            java.util.LinkedHashMap<String, Object> result =
                    new java.util.LinkedHashMap<>();

            map.forEach((key, child) -> {
                String name = String.valueOf(key);
                result.put(
                        name,
                        SENSITIVE_KEYS.contains(name.toLowerCase())
                                ? "***MASKED***"
                                : maskValue(child)
                );
            });

            return result;
        }

        if (value instanceof java.util.List<?> list) {
            return list.stream().map(this::maskValue).toList();
        }

        return value;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}
