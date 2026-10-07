package com.heng.roomrental.setting.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.setting.dto.*;
import com.heng.roomrental.setting.entity.AppConfig;
import com.heng.roomrental.setting.exception.*;
import com.heng.roomrental.setting.repository.ConfigRepository;
import com.heng.roomrental.setting.service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ConfigServiceImpl implements ConfigService {

    private static final String APP_CONFIG = "app_config";
    private static final String DATETIME_FORMAT = "datetime_format";
    private static final String FONT = "font";
    private static final String ALLOW_EDIT_APPROVED_REPORT =
            "allow_edit_approved_report";
    private static final String CODE_GENERATE_REQUEST_TEST =
            "code_generate_request_test";
    private static final String CMS_INTEGRATION = "cms_integration";
    private static final String ROOT_USER = "root_user";
    private static final String REGISTER_CARD_TEXT =
            "register_card_text";
    private static final String LICENSE_CARD_TEXT =
            "license_card_text";
    private static final String USER_FIELD_CONFIG =
            "user_field_config";

    private final ConfigRepository configRepository;
    private final ObjectMapper objectMapper;


    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getGlobalSettings() {

        List<String> keys = List.of(
                APP_CONFIG,
                DATETIME_FORMAT,
                FONT,
                ALLOW_EDIT_APPROVED_REPORT,
                CMS_INTEGRATION,
                ROOT_USER
        );

        Map<String, Object> result = new LinkedHashMap<>();

        for (AppConfig config : configRepository.findByKeyIn(keys)) {
            result.put(
                    config.getKey(),
                    objectMapper.convertValue(
                            config.getValue(),
                            Object.class
                    )
            );
        }

        return result;
    }


    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getCardText() {

        Map<String, Object> result = new LinkedHashMap<>();

        configRepository.findByKey(REGISTER_CARD_TEXT)
                .ifPresent(config ->
                        result.put(
                                REGISTER_CARD_TEXT,
                                objectMapper.convertValue(
                                        config.getValue(),
                                        Object.class
                                )
                        )
                );

        configRepository.findByKey(LICENSE_CARD_TEXT)
                .ifPresent(config ->
                        result.put(
                                LICENSE_CARD_TEXT,
                                objectMapper.convertValue(
                                        config.getValue(),
                                        Object.class
                                )
                        )
                );

        return result;
    }


    @Override
    @Transactional(readOnly = true)
    public ConfigResponse getUserConfig() {

        AppConfig config =
                configRepository.findByKey(USER_FIELD_CONFIG)
                        .orElse(null);

        return config == null
                ? null
                : ConfigResponse.from(config);
    }

    @Override
    public void updateApp(AppConfigRequest request) {

        upsert(
                APP_CONFIG,
                objectMapper.valueToTree(
                        Map.of(
                                "app_name", request.appName(),
                                "layout", request.layout(),
                                "skin", request.skin()
                        )
                ),
                "General configuration for the application"
        );
    }

    // ============================================================
    // DATETIME FORMAT
    // ============================================================

    @Override
    public void updateDatetimeFormat(
            DatetimeFormatRequest request
    ) {

        List<Map<String, Object>> formats = List.of(
                Map.of(
                        "id", 1,
                        "format", "dd-mm-yyyy HH:MM"
                ),
                Map.of(
                        "id", 2,
                        "format", "dd/mm/yyyy HH:MM"
                ),
                Map.of(
                        "id", 3,
                        "format", "yyyy-mm-dd HH:MM"
                )
        );

        if (request.active() < 1 || request.active() > 3) {
            throw new ConfigValidationException(
                    "active must be one of: 1, 2, 3."
            );
        }

        upsert(
                DATETIME_FORMAT,
                objectMapper.valueToTree(
                        Map.of(
                                "formats", formats,
                                "active", request.active()
                        )
                ),
                "Supported datetime formats and active selection"
        );
    }



    @Override
    public void updateFont(FontRequest request) {

        List<Map<String, Object>> fonts = List.of(
                Map.of(
                        "id", 1,
                        "name", "Siemreap"
                ),
                Map.of(
                        "id", 2,
                        "name", "Noto Sans Khmer"
                ),
                Map.of(
                        "id", 3,
                        "name", "Hanuman"
                ),
                Map.of(
                        "id", 4,
                        "name", "Suwannaphum"
                ),
                Map.of(
                        "id", 5,
                        "name", "Nokora"
                ),
                Map.of(
                        "id", 6,
                        "name", "Kantumruy Pro"
                )
        );

        if (request.active() < 1 || request.active() > 6) {
            throw new ConfigValidationException(
                    "active must be between 1 and 5."
            );
        }

        upsert(
                FONT,
                objectMapper.valueToTree(
                        Map.of(
                                "fonts", fonts,
                                "active", request.active()
                        )
                ),
                "Supported fonts and active selection"
        );
    }



    @Override
    public void updateEditApprovedReport(
            EditApprovedReportRequest request
    ) {

        upsert(
                ALLOW_EDIT_APPROVED_REPORT,
                objectMapper.valueToTree(
                        Map.of(
                                "enabled", request.enabled(),
                                "window_minutes",
                                request.windowMinutes()
                        )
                ),
                "Time window in minutes allowed to edit an approved report. "
                        + "Requires special permission after the window expires."
        );
    }


    @Override
    public void updateCodeGenerateRequestTest(
            CodeGenerateRequestTestRequest request
    ) {

        upsert(
                CODE_GENERATE_REQUEST_TEST,
                objectMapper.valueToTree(
                        Map.of(
                                "prefix",
                                request.prefix() == null
                                        ? ""
                                        : request.prefix(),

                                "reset_by",
                                request.resetBy(),

                                "sequence_length",
                                request.sequenceLength()
                        )
                ),
                "Auto-generate code config for request_test. "
                        + "prefix+reset_date+sequence. "
                        + "reset_by: Y=yearly, M=monthly, D=daily, N=never."
        );
    }


    @Override
    @Transactional(readOnly = true)
    public Map<String, JsonNode> getCmsConfig() {

        return configRepository.findByKey(CMS_INTEGRATION)
                .map(config -> asMap(config.getValue()))
                .orElseGet(() -> {

                    Map<String, JsonNode> defaults =
                            new LinkedHashMap<>();

                    defaults.put(
                            "base_url",
                            objectMapper.getNodeFactory()
                                    .textNode("")
                    );

                    defaults.put(
                            "client_key",
                            objectMapper.getNodeFactory()
                                    .textNode("")
                    );

                    defaults.put(
                            "secret_key",
                            objectMapper.getNodeFactory()
                                    .textNode("")
                    );

                    defaults.put(
                            "token",
                            objectMapper.getNodeFactory()
                                    .textNode("")
                    );

                    return defaults;
                });
    }

    @Override
    public void updateCmsConfig(
            CmsConfigRequest request
    ) {

        try {
            URI.create(request.baseUrl());
        } catch (Exception e) {
            throw new ConfigValidationException(
                    "baseUrl must be a valid URL."
            );
        }

        upsert(
                CMS_INTEGRATION,
                objectMapper.valueToTree(
                        Map.of(
                                "base_url",
                                request.baseUrl(),

                                "client_key",
                                request.clientKey(),

                                "secret_key",
                                request.secretKey(),

                                "token",
                                request.token() == null
                                        ? ""
                                        : request.token()
                        )
                ),
                "CMS integration credentials and base URL for LIS-CMS communication."
        );
    }


    @Override
    @Transactional(readOnly = true)
    public Map<String, JsonNode> getRootUserConfig() {

        return configRepository.findByKey(ROOT_USER)
                .map(config -> asMap(config.getValue()))
                .orElseGet(() ->
                        Map.of(
                                "username",
                                objectMapper.getNodeFactory()
                                        .textNode("")
                        )
                );
    }

    @Override
    public void updateRootUserConfig(
            RootUserConfigRequest request
    ) {

        upsert(
                ROOT_USER,
                objectMapper.valueToTree(
                        Map.of(
                                "username",
                                request.username() == null
                                        ? ""
                                        : request.username()
                        )
                ),
                "Root user configuration for system access."
        );
    }


    private AppConfig upsert(
            String key,
            JsonNode value,
            String description
    ) {

        AppConfig config =
                configRepository.findByKey(key)
                        .orElseGet(() ->
                                AppConfig.builder()
                                        .key(key)
                                        .build()
                        );

        config.setValue(value);
        config.setDescription(description);

        return configRepository.save(config);
    }



    private Map<String, JsonNode> asMap(JsonNode node) {

        if (node == null || !node.isObject()) {
            return new LinkedHashMap<>();
        }

        Map<String, JsonNode> result =
                new LinkedHashMap<>();

        node.fields().forEachRemaining(
                entry ->
                        result.put(
                                entry.getKey(),
                                entry.getValue()
                        )
        );

        return result;
    }
}