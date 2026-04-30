package com.tea.teaculture_service.dto.common;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.List;

@Getter
@Setter
@Accessors(chain = true)
public class IdListRequest {

    private List<Long> ids;
}

