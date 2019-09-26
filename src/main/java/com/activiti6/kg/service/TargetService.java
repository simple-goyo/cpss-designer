package com.activiti6.kg.service;

import com.activiti6.kg.model.TargetSubtype1;
import com.activiti6.kg.model.TargetType1;

import java.util.List;

/**
 * Created by 11051 on 2018/8/13.
 */
public interface TargetService {
    List<TargetType1> getTargetType1List();
    List<TargetSubtype1> getTargetSubType1ListByTargtype1(int targtype1);
}
