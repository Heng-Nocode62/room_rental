package com.heng.roomrental.audit.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a JPA entity for model audit logging.
 *
 * If fields is empty, all simple Hibernate properties are considered.
 * If fields contains values, only those properties are audited.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    String[] fields() default {};
}
