package com.heng.roomrental.permission.mapper;

import com.heng.roomrental.permission.dto.CreateModuleRequest;
import com.heng.roomrental.permission.dto.ModuleResponse;
import com.heng.roomrental.permission.dto.UpdateModuleRequest;
import com.heng.roomrental.permission.entity.Module;
import org.springframework.stereotype.Component;

@Component
public class ModuleMapper {

    public Module toEntity(CreateModuleRequest request) {
        Module module = new Module();
        module.setName(request.name());
        module.setActive(true);
        return module;
    }

    public void updateEntity(UpdateModuleRequest request, Module module) {
        module.setName(request.name());
    }

    public ModuleResponse toResponse(Module module) {
        return new ModuleResponse(
                module.getId(),
                module.getName(),
                module.isActive()
        );
    }
}
