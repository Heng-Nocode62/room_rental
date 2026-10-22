package com.heng.roomrental.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final RestClient.Builder restClientBuilder;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    public String upload(
            String path,
            MultipartFile file
    ) {
        try {
            String contentType = file.getContentType();

            if (contentType == null ||
                    !isAllowedImageType(contentType)) {
                throw new IllegalArgumentException(
                        "Only JPEG, PNG, and WebP images are allowed."
                );
            }

            RestClient client = restClientBuilder
                    .baseUrl(supabaseUrl)
                    .build();

            client.post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path("/storage/v1/object/{bucket}/{path}")
                                    .build(bucket, path)
                    )
                    .header("apikey", supabaseKey)
                    .header(
                            "Cache-Control",
                            "public,max-age=31536000,immutable"
                    )
                    .contentType(
                            MediaType.parseMediaType(contentType)
                    )
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();

            return getPublicUrl(path);

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to read uploaded image.",
                    e
            );
        }
    }

    public void delete(String path) {

        RestClient client = restClientBuilder
                .baseUrl(supabaseUrl)
                .build();

        client.delete()
                .uri(uriBuilder ->
                        uriBuilder
                                .path("/storage/v1/object/{bucket}/{path}")
                                .build(bucket, path)
                )
                .header("apikey", supabaseKey)
                .retrieve()
                .toBodilessEntity();
    }

    public String getPublicUrl(String path) {

        return supabaseUrl
                + "/storage/v1/object/public/"
                + bucket
                + "/"
                + path;
    }

    private boolean isAllowedImageType(
            String contentType
    ) {
        return switch (contentType.toLowerCase()) {
            case "image/jpeg",
                 "image/png",
                 "image/webp" -> true;

            default -> false;
        };
    }
}