package com.activiti6.navigation.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * <pre>
 *     author : shenbiao
 *     e-mail : 1105125966@qq.com
 *     time   : 2019/09/27
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@Controller
public class NavigationController {

    @RequestMapping("home")
    public String editor(){
        return "home";
    }

}
