package com.activiti6.kg.controller;

import com.activiti6.kg.model.TargetD3;
import com.activiti6.kg.model.TargetSubtype1;
import com.activiti6.kg.model.TargetType1;
import com.activiti6.kg.model.TargetType1ForD3;
import com.activiti6.kg.service.TargetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * <pre>
 *     author : shenbiao
 *     e-mail : 1105125966@qq.com
 *     time   : 2018/09/09
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@RestController
@RequestMapping("/target")
public class TargetController {

    @Autowired
    private TargetService targetService;

    @RequestMapping("/getTarget1")
    public TargetD3 getTarget1() {
        List<TargetType1> targetType1List= targetService.getTargetType1List();
        TargetD3 targetD3 =new TargetD3();
        targetD3.setName("d3");
        List<TargetType1ForD3> targetType1ForD3s=new ArrayList<>();
        for (TargetType1 targetType1:targetType1List){
            TargetType1ForD3  targetType1ForD3=new TargetType1ForD3();
            targetType1ForD3.setName(targetType1.getTargtype1txt());
            List<TargetSubtype1> targetSubtype1List=targetService.getTargetSubType1ListByTargtype1(targetType1.getTargtype1());
            targetType1ForD3.setChildren(targetSubtype1List);
            targetType1ForD3s.add(targetType1ForD3);
        }
        targetD3.setChildren(targetType1ForD3s);
        return targetD3;
    }
}
