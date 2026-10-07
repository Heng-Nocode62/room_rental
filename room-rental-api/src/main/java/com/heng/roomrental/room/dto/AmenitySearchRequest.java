package com.heng.roomrental.room.dto;

import com.heng.roomrental.room.entity.AmenityStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AmenitySearchRequest {

    private String name;

    private AmenityStatus status;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;

    private Integer minStock;

    private Integer maxStock;
}