package com.heng.roomrental.setting.dto;

import jakarta.validation.constraints.*;

public record CodeGenerateRequestTestRequest(
        @Size(max = 10) String prefix,

        @NotBlank
        @Pattern(regexp = "Y|M|D|N")
        String resetBy,

        @NotNull
        @Min(1)
        @Max(10)
        Integer sequenceLength
) {}
