package com.heng.roomrental.translation.dto;

public record ImportResult(
        int imported,
        int skipped,
        int languagesMatched
        , int rowsProcessed
) {}
