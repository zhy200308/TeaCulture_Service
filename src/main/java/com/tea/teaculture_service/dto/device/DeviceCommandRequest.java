package com.tea.teaculture_service.dto.device;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(chain = true)
public class DeviceCommandRequest {

    private String deviceId;
    private String commandType;
    private String topic;
    private String teaType;
    private String amount;
    private String waterTemp;
    private String brewTime;
    private String note;
    private String payload;
    private Integer result;
    private String errorMsg;
}

