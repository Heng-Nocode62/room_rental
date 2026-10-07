package com.heng.roomrental.translation.config;

import org.springframework.context.annotation.Configuration;

/**
 * Security is intentionally not defined here because the host application already owns the SecurityFilterChain.
 *
 * Recommended rules:
 *   GET  /api/translate/**     -> authenticated (or permitAll if the UI must load translations before login)
 *   GET  /api/language/active  -> permitAll/authenticated depending on your UI
 *   /api/language/**           -> staff/admin permission
 *   /api/translation/**        -> staff/admin permission
 *
 * If your application uses a permission such as "view-setting", apply that existing authority to the
 * management endpoints. Do not create a second SecurityFilterChain just for this module.
 */
@Configuration
public class TranslationSecurityIntegration {
}
