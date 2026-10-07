package com.heng.roomrental.security.authentication.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NavigationResponse {

    private String key;

    private String path;

    private String icon;

    private String group;

    private String permission;

    private List<NavigationResponse> children;
}