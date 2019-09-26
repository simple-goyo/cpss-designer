package com.activiti6.kg.model;

import java.util.List;

public class TargetD3 {
    String name;
    List<TargetType1ForD3> children;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<TargetType1ForD3> getChildren() {
        return children;
    }

    public void setChildren(List<TargetType1ForD3> children) {
        this.children = children;
    }
}
