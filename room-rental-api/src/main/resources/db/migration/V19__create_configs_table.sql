CREATE TABLE config (
                        id BIGSERIAL PRIMARY KEY,

                        key VARCHAR(255) NOT NULL,

                        value JSONB,

                        description TEXT,

                        created_at TIMESTAMP NOT NULL,

                        updated_at TIMESTAMP NOT NULL,

                        CONSTRAINT uk_config_key UNIQUE (key)
);


-- ============================================================
-- Application configuration
-- ============================================================

INSERT INTO config (
    key,
    value,
    description,
    created_at,
    updated_at
)
VALUES (
           'app_config',
           '{
             "app_name": "Pharmacy",
             "layout": "vertical",
             "skin": "default"
           }'::jsonb,
           'General configuration for the application',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );


-- ============================================================
-- Datetime format configuration
-- ============================================================

INSERT INTO config (
    key,
    value,
    description,
    created_at,
    updated_at
)
VALUES (
           'datetime_format',
           '{
             "formats": [
               {
                 "id": 1,
                 "format": "dd-mm-yyyy HH:MM"
               },
               {
                 "id": 2,
                 "format": "dd/mm/yyyy HH:MM"
               },
               {
                 "id": 3,
                 "format": "yyyy-mm-dd HH:MM"
               }
             ],
             "active": 1
           }'::jsonb,
           'Supported datetime formats and active selection',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );


-- ============================================================
-- Font configuration
-- ============================================================

INSERT INTO config (
    key,
    value,
    description,
    created_at,
    updated_at
)
VALUES (
           'font',
           '{
             "fonts": [
               {
                 "id": 1,
                 "name": "Siemreap"
               },
               {
                 "id": 2,
                 "name": "Noto Sans Khmer"
               },
               {
                 "id": 3,
                 "name": "Hanuman"
               },
               {
                 "id": 4,
                 "name": "Suwannaphum"
               },
               {
                 "id": 5,
                 "name": "Nokora"
               }
             ],
             "active": 1
           }'::jsonb,
           'Supported fonts and active selection',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );


-- ============================================================
-- Allow edit approved report configuration
-- ============================================================

INSERT INTO config (
    key,
    value,
    description,
    created_at,
    updated_at
)
VALUES (
           'allow_edit_approved_report',
           '{
             "enabled": true,
             "window_minutes": 120
           }'::jsonb,
           'Time window (in minutes) allowed to edit an approved report. Requires special permission after window expires.',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );


-- ============================================================
-- CMS integration configuration
-- ============================================================

INSERT INTO config (
    key,
    value,
    description,
    created_at,
    updated_at
)
VALUES (
           'cms_integration',
           '{
             "base_url": "",
             "client_key": "",
             "secret_key": "",
             "token": ""
           }'::jsonb,
           'CMS integration credentials and base URL for LIS-CMS communication.',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );