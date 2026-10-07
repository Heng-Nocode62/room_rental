package com.heng.roomrental.common.web;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.lang.annotation.*;

@Target({
        ElementType.METHOD,
        ElementType.TYPE
})
@Retention(RetentionPolicy.RUNTIME)
@ApiResponses({
        @ApiResponse(
                responseCode = "400",
                description = "Bad request"
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Authentication required"
        ),
        @ApiResponse(
                responseCode = "403",
                description = "Forbidden"
        ),
        @ApiResponse(
                responseCode = "404",
                description = "Resource not found"
        ),
        @ApiResponse(
                responseCode = "409",
                description = "Resource conflict"
        ),
        @ApiResponse(
                responseCode = "422",
                description = "Invalid business operation"
        ),
        @ApiResponse(
                responseCode = "500",
                description = "Internal server error"
        )
})
public @interface ApiErrorResponses {
}