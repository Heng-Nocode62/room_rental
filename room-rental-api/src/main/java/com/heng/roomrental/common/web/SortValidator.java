package com.heng.roomrental.common.web;

import com.heng.roomrental.common.exception.InvalidSortFieldException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class SortValidator {

    public void validate(
            Pageable pageable,
            Set<String> allowedFields
    ) {

        pageable.getSort()
                .forEach(order -> {

                    String property =
                            order.getProperty();

                    if (!allowedFields.contains(property)) {

                        throw new InvalidSortFieldException(
                                "Sorting by '" +
                                property +
                                "' is not allowed."
                        );
                    }
                });
    }
}