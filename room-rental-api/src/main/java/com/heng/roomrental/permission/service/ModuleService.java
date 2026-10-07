package com.heng.roomrental.permission.service;

import com.heng.roomrental.permission.dto.CreateModuleRequest;
import com.heng.roomrental.permission.dto.ModuleResponse;
import com.heng.roomrental.permission.dto.UpdateModuleRequest;

import java.util.List;

public interface ModuleService {

    ModuleResponse create(CreateModuleRequest request);

    ModuleResponse getById(Long id);

    List<ModuleResponse> getAll();

    ModuleResponse update(Long id, UpdateModuleRequest request);

    ModuleResponse deactivate(Long id);

    ModuleResponse activate(Long id);
}
