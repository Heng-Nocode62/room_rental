

CREATE TABLE activity_logs (
                               id              BIGSERIAL PRIMARY KEY,

                               user_id         BIGINT,

                               method          VARCHAR(20) NOT NULL,
                               url             TEXT NOT NULL,

                               request_data    JSONB,
                               response_data   JSONB,

                               ip              VARCHAR(45),
                               user_agent      TEXT,

                               response_status SMALLINT,

                               created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Search / filter indexes
CREATE INDEX idx_activity_logs_user_id
    ON activity_logs (user_id);

CREATE INDEX idx_activity_logs_method
    ON activity_logs (method);

CREATE INDEX idx_activity_logs_response_status
    ON activity_logs (response_status);

CREATE INDEX idx_activity_logs_created_at
    ON activity_logs (created_at);

CREATE TABLE model_logs (
                            id              BIGSERIAL PRIMARY KEY,

                            model_type      VARCHAR(255) NOT NULL,
                            model_id        VARCHAR(255) NOT NULL,

                            event           VARCHAR(30) NOT NULL,

                            is_different    BOOLEAN NOT NULL DEFAULT FALSE,

                            changes         JSONB NOT NULL,

                            user_id         BIGINT,

                            created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Search / filter indexes
CREATE INDEX idx_model_logs_model
    ON model_logs (model_type, model_id);

CREATE INDEX idx_model_logs_user_id
    ON model_logs (user_id);

CREATE INDEX idx_model_logs_event
    ON model_logs (event);

CREATE INDEX idx_model_logs_created_at
    ON model_logs (created_at);