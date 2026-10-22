package com.heng.roomrental.config;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

@Configuration
public class BeanConfig {
//    @Bean
//    public ObjectMapper objectMapper() {
//        ObjectMapper mapper = new ObjectMapper();
//        JavaTimeModule module = new JavaTimeModule();
//
//        module.addDeserializer(OffsetDateTime.class, new JsonDeserializer<OffsetDateTime>() {
//            @Override
//            public OffsetDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
//                String dateStr = p.getText();
//                if (!dateStr.contains("+") && !dateStr.contains("Z")) {
//                    return LocalDateTime.parse(dateStr).atOffset(ZoneOffset.UTC);
//                }
//                return OffsetDateTime.parse(dateStr);
//            }
//        });
//
//        mapper.registerModule(module);
//        return mapper;
//    }
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        SimpleModule offsetModule = new SimpleModule();
        offsetModule.addDeserializer(OffsetDateTime.class,
                new OffsetDateTimeDeserializer(ZoneId.of("Asia/Phnom_Penh")));
        mapper.registerModule(offsetModule);

        return mapper;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://salary-decreased-alternatively-remind.trycloudflare.com"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept"
        ));

        configuration.setAllowCredentials(true);

        configuration.setExposedHeaders(List.of(
                "Set-Cookie"
        ));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public RestClient.Builder  getRestClientBuilder() {
        return RestClient.builder();
    }
}
