package com.activiti6.kg.model;

import java.util.List;

public class TargetType1ForD3 {
    String name;
    List<TargetSubtype1> children;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<TargetSubtype1> getChildren() {
        return children;
    }

    public void setChildren(List<TargetSubtype1> children) {
        this.children = children;
    }
}
