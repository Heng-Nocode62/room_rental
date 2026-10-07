package com.heng.roomrental.audit.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "roomrental.audit")
public class AuditProperties {

    private Activity activity = new Activity();
    private Model model = new Model();

    @Getter
    @Setter
    public static class Activity {
        private boolean enabled = true;
        private int maxBodySize = 10_000;
        private List<String> excludePaths = new ArrayList<>(List.of(
                "/actuator/**",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/favicon.ico"
        ));
    }

    @Getter
    @Setter
    public static class Model {
        private boolean enabled = true;
    }
}
