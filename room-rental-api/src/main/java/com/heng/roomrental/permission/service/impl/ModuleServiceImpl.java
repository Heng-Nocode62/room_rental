package com.heng.roomrental.permission.service.impl;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.permission.dto.CreateModuleRequest;
import com.heng.roomrental.permission.dto.ModuleResponse;
import com.heng.roomrental.permission.dto.UpdateModuleRequest;
import com.heng.roomrental.permission.entity.Module;
import com.heng.roomrental.permission.mapper.ModuleMapper;
import com.heng.roomrental.permission.repository.ModuleRepository;
import com.heng.roomrental.permission.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    @Override
//    @PreAuthorize("hasAuthority('MODULE_CREATE')")
    @Transactional
    public ModuleResponse create(CreateModuleRequest request) {
        if (moduleRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Module already exists: " + request.name());
        }

        Module module = moduleMapper.toEntity(request);
        return moduleMapper.toResponse(moduleRepository.save(module));
    }

    @Override
//    @PreAuthorize("hasAuthority('MODULE_VIEW')")
    @Transactional(readOnly = true)
    public ModuleResponse getById(Long id) {
        return moduleMapper.toResponse(findById(id));
    }

    @Override
//    @PreAuthorize("hasAuthority('MODULE_VIEW')")
    @Transactional(readOnly = true)
    public List<ModuleResponse> getAll() {
        return moduleRepository.findAllByOrderByIdAsc()
                .stream()
                .map(moduleMapper::toResponse)
                .toList();
    }

    @Override
//    @PreAuthorize("hasAuthority('MODULE_UPDATE')")
    @Transactional
    public ModuleResponse update(Long id, UpdateModuleRequest request) {
        Module module = findById(id);
        moduleMapper.updateEntity(request, module);
        return moduleMapper.toResponse(moduleRepository.save(module));
    }

    @Override
//    @PreAuthorize("hasAuthority('MODULE_UPDATE')")
    @Transactional
    public ModuleResponse deactivate(Long id) {
        Module module = findById(id);
        module.setActive(false);
        return moduleMapper.toResponse(moduleRepository.save(module));
    }

    @Override
//    @PreAuthorize("hasAuthority('MODULE_UPDATE')")
    @Transactional
    public ModuleResponse activate(Long id) {
        Module module = findById(id);
        module.setActive(true);
        return moduleMapper.toResponse(moduleRepository.save(module));
    }

    private Module findById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + id));
    }
}
