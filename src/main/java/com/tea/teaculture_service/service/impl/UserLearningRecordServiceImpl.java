package com.tea.teaculture_service.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.tea.teaculture_service.entity.UserLearningRecord;
import com.tea.teaculture_service.mapper.UserLearningRecordMapper;
import com.tea.teaculture_service.service.UserLearningRecordService;
import org.springframework.stereotype.Service;

@Service
public class UserLearningRecordServiceImpl extends ServiceImpl<UserLearningRecordMapper, UserLearningRecord> implements UserLearningRecordService {
}

