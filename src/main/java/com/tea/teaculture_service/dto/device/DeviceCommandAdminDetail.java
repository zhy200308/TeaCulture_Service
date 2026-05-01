package com.tea.teaculture_service.dto.device;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class DeviceCommandAdminDetail {

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
    private String note;
    private String payload;
    private Integer result;
    private String errorMsg;
    private LocalDateTime createTime;
}

