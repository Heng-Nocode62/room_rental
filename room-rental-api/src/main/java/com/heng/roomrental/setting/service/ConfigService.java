package com.heng.roomrental.setting.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.heng.roomrental.setting.dto.*;

import java.util.Map;

public interface ConfigService {

    Map<String, Object> getGlobalSettings();

    Map<String, Object> getCardText();

    ConfigResponse getUserConfig();

    void updateApp(AppConfigRequest request);

    void updateDatetimeFormat(DatetimeFormatRequest request);

    void updateFont(FontRequest request);

    void updateEditApprovedReport(
            EditApprovedReportRequest request
    );

    void updateCodeGenerateRequestTest(
            CodeGenerateRequestTestRequest request
    );

    Map<String, JsonNode> getCmsConfig();

    void updateCmsConfig(CmsConfigRequest request);

    Map<String, JsonNode> getRootUserConfig();

    void updateRootUserConfig(
            RootUserConfigRequest request
    );
}
