package com.heng.roomrental.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class GoogleAuthConfig {

    @Value("${google.client-ids:${google.client-id:}}")
    private String configuredClientIds;

    @Bean
    public GoogleIdTokenVerifier googleIdTokenVerifier() {

        List<String> clientIds = Arrays.stream(
                        configuredClientIds.split(",")
                )
                .map(String::trim)
                .filter(clientId -> !clientId.isEmpty())
                .distinct()
                .toList();

        if (clientIds.isEmpty()) {
            throw new IllegalStateException(
                    "Configure google.client-id or google.client-ids "
                            + "with at least one trusted Web OAuth client ID."
            );
        }

        return new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(clientIds)
                .build();
    }
}