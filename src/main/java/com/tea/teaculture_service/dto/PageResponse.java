package com.tea.teaculture_service.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.List;

@Getter
@Setter
@Accessors(chain = true)
public class PageResponse<T> {

    private List<T> records;
    private Long total;
    private Long pageNum;
    private Long pageSize;
}

