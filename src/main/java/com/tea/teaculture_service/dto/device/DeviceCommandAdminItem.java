package com.tea.teaculture_service.dto.device;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Getter
@Setter
@Accessors(chain = true)
public class DeviceCommandAdminItem {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Long userId;

    private String username;
    private String deviceId;
    private String commandType;
    private String topic;
    private String teaType;
    private Integer amount;
    private Integer waterTemp;
    private Integer brewTime;
    private Integer result;
    private String errorMsg;
    private LocalDateTime createTime;
}

