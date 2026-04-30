package com.tea.teaculture_service.GEN_CODE;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.config.rules.DateType;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;
import com.baomidou.mybatisplus.generator.fill.Column;

import java.util.Collections;

/**
 * MyBatis-Plus 代码生成器（全自动，无交互）
 * 运行 main 直接按下面的常量生成。
 * tag: 想要的很贵，所以拼！
 */
public class CodeGenerator {

    // ==================== 数据库配置 ====================
    private static final String URL = "jdbc:mysql://localhost:3306/tea_culture?useUnicode=true&useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "123456";

    // ==================== 项目配置 ====================
    private static final String AUTHOR = "YourName";
    private static final String PARENT_PACKAGE = "com.tea.teaculture_service";
    /** 模块名，留空则不分模块；填写后会作为子包，例如 entity 会变成 ${parent}.user.entity */
    private static final String MODULE_NAME = "";

    /** 表前缀，会被自动去掉 */
//    private static final String[] TABLE_PREFIX = {"t_", "tb_", "sys_"};

    /**
     * 要生成的表名。
     * - 留空数组 {} = 生成数据库中全部表
     * - 指定具体表名 = 只生成这些表，例如 {"sys_user", "sys_role"}
     */
    private static final String[] INCLUDE_TABLES = {};

    public static void main(String[] args) {
        String projectPath = System.getProperty("user.dir");

        FastAutoGenerator.create(URL, USERNAME, PASSWORD)
                .globalConfig(b -> b
                        .author(AUTHOR)
                        .outputDir(projectPath + "/src/main/java")
                        .commentDate("yyyy-MM-dd")
                        .dateType(DateType.TIME_PACK)
                        .disableOpenDir()
                        .enableSpringdoc()
                )
                .packageConfig(b -> b
                        .parent(PARENT_PACKAGE)
                        .moduleName(MODULE_NAME)
                        .entity("entity")
                        .service("service")
                        .serviceImpl("service.impl")
                        .mapper("mapper")
                        .xml("mapper.xml")
                        .controller("controller")
                        // mapper.xml 输出到 resources/mapper[/${moduleName}]
                        .pathInfo(Collections.singletonMap(OutputFile.xml,
                                projectPath + "/src/main/resources/mapper"
                                        + (MODULE_NAME.isEmpty() ? "" : "/" + MODULE_NAME)))
                )
                .strategyConfig(b -> {
                    if (INCLUDE_TABLES.length > 0) {
                        b.addInclude(INCLUDE_TABLES);
                    }
                    b.addTablePrefix()
                            // -------- Entity --------
                            .entityBuilder()
                            .enableLombok()
                            .enableChainModel()
                            .enableTableFieldAnnotation()
                            .enableActiveRecord()
                            .idType(IdType.ASSIGN_ID)
                            .naming(NamingStrategy.underline_to_camel)
                            .columnNaming(NamingStrategy.underline_to_camel)
                            .addTableFills(new Column("create_time", FieldFill.INSERT))
                            .addTableFills(new Column("update_time", FieldFill.INSERT_UPDATE))
                            .formatFileName("%s")
                            .javaTemplate("/templates/entity.java")
                            // -------- Mapper --------
                            .mapperBuilder()
                            .mapperAnnotation(org.apache.ibatis.annotations.Mapper.class)
                            .enableBaseResultMap()
                            .enableBaseColumnList()
                            .formatMapperFileName("%sMapper")
                            .formatXmlFileName("%sMapper")
                            .mapperTemplate("/templates/mapper.java")
                            // -------- Service --------
                            .serviceBuilder()
                            .formatServiceFileName("%sService")
                            .formatServiceImplFileName("%sServiceImpl")
                            .serviceTemplate("/templates/service.java")
                            .serviceImplTemplate("/templates/serviceImpl.java")
                            // -------- Controller --------
                            .controllerBuilder()
                            .enableRestStyle()
                            .enableHyphenStyle()
                            .formatFileName("%sController")
                            .template("/templates/controller.java");
                })
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();

        System.out.println("============== 代码生成完成 ==============");
        System.out.println("Java 输出目录：" + projectPath + "/src/main/java/" + PARENT_PACKAGE.replace('.', '/')
                + (MODULE_NAME.isEmpty() ? "" : "/" + MODULE_NAME));
        System.out.println("XML  输出目录：" + projectPath + "/src/main/resources/mapper"
                + (MODULE_NAME.isEmpty() ? "" : "/" + MODULE_NAME));
    }
}