package com.activiti6.kg.mapper;

import com.activiti6.kg.model.TargetSubtype1;
import com.activiti6.kg.model.TargetType1;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <pre>
 *     author : shenbiao
 *     e-mail : 1105125966@qq.com
 *     time   : 2018/09/11
 *     desc   :
 *     version: 1.0
 * </pre>
 */
@Mapper
@Repository
public interface TargetMapper {
    @Select("SELECT * FROM targtype1")
    List<TargetType1> getTargetType1List();

    @Select("SELECT * FROM targ1 WHERE targ1.targtype1 = #{targtype1} ")
    List<TargetSubtype1> getTargetSubType1ListByTargtype1(@Param("targtype1") int targtype1);
}
