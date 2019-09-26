package com.activiti6.kg.service.impl;

import com.activiti6.kg.mapper.TargetMapper;
import com.activiti6.kg.model.TargetSubtype1;
import com.activiti6.kg.model.TargetType1;
import com.activiti6.kg.service.TargetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by 11051 on 2018/8/13.
 */
@Service
public class TargetServiceImpl implements TargetService {
    @Autowired
    private TargetMapper targetMapper;

    @Override
    public List<TargetType1> getTargetType1List() {
        return targetMapper.getTargetType1List();
    }

    @Override
    public List<TargetSubtype1> getTargetSubType1ListByTargtype1(int targtype1) {
        return targetMapper.getTargetSubType1ListByTargtype1(targtype1);
    }
}
