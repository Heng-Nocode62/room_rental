package com.heng.roomrental.setting.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.heng.roomrental.setting.dto.*;
import com.heng.roomrental.setting.service.ConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    // PUBLIC

    @GetMapping
    public ResponseEntity<Map<String, Object>> globalSetting() {
        return ResponseEntity.ok(
                        configService.getGlobalSettings()
        );
    }

    @GetMapping("/card-text")
    public ResponseEntity<Map<String, Object>> getCardText() {
        return ResponseEntity.ok(
                        configService.getCardText()
        );
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserConfig() {
        ConfigResponse response =
                configService.getUserConfig();

        return ResponseEntity.ok(
                Map.of(
                        "data",
                        response == null ? Map.of() : response
                )
        );
    }

    // ADMIN / view-config-setting

    @PutMapping("/app-config")
    public ResponseEntity<Map<String, String>> updateApp(
            @Valid @RequestBody AppConfigRequest request
    ) {
        configService.updateApp(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Config updated successfully."
                )
        );
    }

    @PutMapping("/app-datetime")
    public ResponseEntity<Map<String, String>>
    updateDatetimeFormat(
            @Valid @RequestBody DatetimeFormatRequest request
    ) {
        configService.updateDatetimeFormat(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Datetime format updated successfully."
                )
        );
    }

    @PutMapping("/app-font")
    public ResponseEntity<Map<String, String>> updateFont(
            @Valid @RequestBody FontRequest request
    ) {
        configService.updateFont(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Font updated successfully."
                )
        );
    }

    @PutMapping("/edit-approved-report")
    public ResponseEntity<Map<String, String>>
    updateEditApprovedReport(
            @Valid @RequestBody
            EditApprovedReportRequest request
    ) {
        configService.updateEditApprovedReport(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Edit approved report config updated successfully."
                )
        );
    }

    @PutMapping("/code-generate-request-test")
    public ResponseEntity<Map<String, String>>
    updateCodeGenerateRequestTest(
            @Valid @RequestBody
            CodeGenerateRequestTestRequest request
    ) {
        configService.updateCodeGenerateRequestTest(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Request test code config updated successfully."
                )
        );
    }

    @GetMapping("/cms")
    public ResponseEntity<Map<String, JsonNode>>
    getCmsConfig() {
        return ResponseEntity.ok(
                        configService.getCmsConfig()

        );
    }

    @PutMapping("/cms")
    public ResponseEntity<Map<String, String>>
    updateCmsConfig(
            @Valid @RequestBody CmsConfigRequest request
    ) {
        configService.updateCmsConfig(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "CMS integration config updated successfully."
                )
        );
    }

    @GetMapping("/root-user")
    public ResponseEntity<Map<String, JsonNode>>
    getRootUserConfig() {
        return ResponseEntity.ok(
                 configService.getRootUserConfig()
        );
    }

    @PutMapping("/root-user")
    public ResponseEntity<Map<String, String>>
    updateRootUserConfig(
            @Valid @RequestBody RootUserConfigRequest request
    ) {
        configService.updateRootUserConfig(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Root user config updated successfully."
                )
        );
    }
}
