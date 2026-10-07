package com.heng.roomrental.security.authentication.dto;

import java.util.List;
import java.util.Set;

public interface NavigationService {

    List<NavigationResponse> getNavigation(Set<String> permissions);
}