package com.heng.roomrental.permission.controller;

import com.heng.roomrental.permission.dto.CreateModuleRequest;
import com.heng.roomrental.permission.dto.ModuleResponse;
import com.heng.roomrental.permission.dto.UpdateModuleRequest;
import com.heng.roomrental.permission.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping
    public ModuleResponse create(@RequestBody CreateModuleRequest request) {
        return moduleService.create(request);
    }

    @GetMapping("/{id}")
    public ModuleResponse getById(@PathVariable Long id) {
        return moduleService.getById(id);
    }

    @GetMapping
    public List<ModuleResponse> getAll() {
        return moduleService.getAll();
    }

    @PutMapping("/{id}")
    public ModuleResponse update(
            @PathVariable Long id,
            @RequestBody UpdateModuleRequest request
    ) {
        return moduleService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public ModuleResponse deactivate(@PathVariable Long id) {
        return moduleService.deactivate(id);
    }

    @PatchMapping("/{id}/activate")
    public ModuleResponse activate(@PathVariable Long id) {
        return moduleService.activate(id);
    }
}
