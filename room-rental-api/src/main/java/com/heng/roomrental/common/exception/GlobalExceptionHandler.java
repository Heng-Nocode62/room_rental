package com.heng.roomrental.common.exception;

import com.heng.roomrental.common.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.NOT_FOUND,
                ex.getCode(),
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(InvalidCredentialException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredential(
            InvalidCredentialException ex,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.UNAUTHORIZED,
                ex.getCode(),
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            ConflictException ex,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.CONFLICT,
                ex.getCode(),
                ex.getMessage(),
                request
        );
    }
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.BAD_REQUEST,
                ex.getCode(),
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOperation(
            InvalidOperationException ex,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.UNPROCESSABLE_ENTITY,
                ex.getCode(),
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error ->
                        error.getField() + ": " +
                        error.getDefaultMessage()
                )
                .orElse("Validation failed");

        return build(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                message,
                request
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {

        return build(
                HttpStatus.BAD_REQUEST,
                "BAD_REQUEST",
                ex.getMessage(),
                request
        );
    }

//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<ErrorResponse> handleUnexpected(
//            Exception ex,
//            HttpServletRequest request
//    ) {
//
//        return build(
//                HttpStatus.INTERNAL_SERVER_ERROR,
//                "INTERNAL_SERVER_ERROR",
//                "An unexpected error occurred.",
//                request
//        );
//    }

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request
    ) {

        String requestId = MDC.get(RequestIdFilter.MDC_KEY);
        ErrorResponse response =
                new ErrorResponse(
                        OffsetDateTime.now(),
                        status.value(),
                        code,
                        message,
                        request.getRequestURI(),
                        requestId
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }
}