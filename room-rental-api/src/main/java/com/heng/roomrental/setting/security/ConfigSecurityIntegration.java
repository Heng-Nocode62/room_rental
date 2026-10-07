package com.heng.roomrental.setting.security;

import org.springframework.context.annotation.Configuration;

/*
 * Do not create a second SecurityFilterChain here.
 *
 * Add the authorization to your existing application's security config.
 *
 * Public:
 *   GET /api/config
 *   GET /api/config/card-text
 *   GET /api/config/user
 *   GET /api/config/cms
 *   GET /api/config/root-user
 *
 * Protected with `view-config-setting`:
 *   PUT /api/config/app-config
 *   PUT /api/config/app-datetime
 *   PUT /api/config/app-font
 *   PUT /api/config/edit-approved-report
 *   PUT /api/config/code-generate-request-test
 *   PUT /api/config/cms
 *   PUT /api/config/root-user
 */
@Configuration
public class ConfigSecurityIntegration {
}
