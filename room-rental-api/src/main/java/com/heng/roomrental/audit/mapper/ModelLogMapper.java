package com.heng.roomrental.audit.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.audit.dto.ModelLogResponse;
import com.heng.roomrental.audit.entity.ModelLog;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.repository.UserRepository;
import com.heng.roomrental.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ModelLogMapper {
    private final ObjectMapper objectMapper;
    private final UserService userService;
    private final UserRepository userRepository;
    public ModelLogResponse from(ModelLog log) {
        if (log.getUserId() == null) {
            return new ModelLogResponse(log.getId(), log.getModelType(), log.getModelId(),
                    log.getEvent(), log.getIsDifferent(), toPlain(log.getChanges()),
                    log.getUserId(),null, log.getCreatedAt());
        }
        User user = userService.getEntityById(log.getUserId());
        return new ModelLogResponse(log.getId(), log.getModelType(), log.getModelId(),
                log.getEvent(), log.getIsDifferent(), toPlain(log.getChanges()),
                log.getUserId(),user.getFirstName()+ " "+ user.getLastName(), log.getCreatedAt());
    }

    private Object toPlain(JsonNode node) {
        return (node == null || node.isNull()) ? null : objectMapper.convertValue(node, Object.class);
    }
    public List<ModelLogResponse> from(List<ModelLog> logs) {
        List<ModelLogResponse> result = new ArrayList<>();
        Set<Long> userIds = logs.stream().map(ModelLog::getUserId)
                .collect(Collectors.toSet());
        List<User> users = userRepository.findAllById(userIds);
        Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, Function.identity()));
        for (ModelLog log : logs) {
            User user = userMap.get(log.getUserId());
            ModelLogResponse modelLogResponse = from(log,user);
            result.add(modelLogResponse);
        }
        return result;

    }

    private ModelLogResponse from(ModelLog log, User user) {
        if( user == null ) {
            return new ModelLogResponse(log.getId(), log.getModelType(), log.getModelId(),
                    log.getEvent(), log.getIsDifferent(), toPlain(log.getChanges()),
                    log.getUserId(),null, log.getCreatedAt());
        }
        return new ModelLogResponse(log.getId(), log.getModelType(), log.getModelId(),
                log.getEvent(), log.getIsDifferent(), toPlain(log.getChanges()),
                log.getUserId(),user.getUsername(), log.getCreatedAt());
    }
}
