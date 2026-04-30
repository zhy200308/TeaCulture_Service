/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80408 (8.4.8)
 Source Host           : localhost:3306
 Source Schema         : tea_culture

 Target Server Type    : MySQL
 Target Server Version : 80408 (8.4.8)
 File Encoding         : 65001

 Date: 30/04/2026 22:51:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for device_command_log
-- ----------------------------
DROP TABLE IF EXISTS `device_command_log`;
CREATE TABLE `device_command_log` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint DEFAULT NULL COMMENT '触发用户ID（逻辑关联 sys_user.id，无外键）',
  `device_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备ID（MQTT clientId）',
  `command_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'brew' COMMENT '指令类型',
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MQTT主题',
  `tea_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '茶类',
  `amount` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '投茶量',
  `water_temp` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '水温',
  `brew_time` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '冲泡时长',
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `payload` text COLLATE utf8mb4_unicode_ci COMMENT '完整 JSON 消息体',
  `result` tinyint(1) NOT NULL DEFAULT '0' COMMENT '结果：0发送中 1成功 2失败',
  `error_msg` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '错误信息',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_result` (`result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备指令日志表';

-- ----------------------------
-- Records of device_command_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码（BCrypt加密）',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL',
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '个人简介',
  `tag` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '普通会员' COMMENT '用户标签',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT '角色：user-普通用户，admin-管理员',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1正常 0禁用',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除：0未删 1已删',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `avatar`, `description`, `tag`, `role`, `status`, `last_login_time`, `create_time`, `update_time`, `deleted`) VALUES (1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', NULL, NULL, '管理员', 'admin', 1, '2026-04-30 22:05:00', '2026-04-29 20:27:17', '2026-04-30 22:05:00', 0);
INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `avatar`, `description`, `tag`, `role`, `status`, `last_login_time`, `create_time`, `update_time`, `deleted`) VALUES (2, 'testuser', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '茶友测试', NULL, NULL, '普通会员', 'user', 1, NULL, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
COMMIT;

-- ----------------------------
-- Table structure for tea_brewing_param
-- ----------------------------
DROP TABLE IF EXISTS `tea_brewing_param`;
CREATE TABLE `tea_brewing_param` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `scenario_id` bigint NOT NULL COMMENT '逻辑关联 tea_scenario.id（无外键）',
  `tea_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '茶类（乌龙茶等）',
  `amount` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '投茶量（6g）',
  `water_temp` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '水温（100℃）',
  `brew_time` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '冲泡时长（8-10秒）',
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scenario_id` (`scenario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景冲泡参数表';

-- ----------------------------
-- Records of tea_brewing_param
-- ----------------------------
BEGIN;
INSERT INTO `tea_brewing_param` (`id`, `scenario_id`, `tea_type`, `amount`, `water_temp`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (1, 1, '乌龙茶', '6g', '100℃', '8-10秒', '首泡快速洗茶，后续每泡可增加2秒，以充分释放茶香', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_brewing_param` (`id`, `scenario_id`, `tea_type`, `amount`, `water_temp`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (2, 2, '绿茶/红茶', '4g', '80℃ (绿茶) / 90℃ (红茶)', '2-3分钟', '建议使用马克杯冲泡，注意控制浸泡时间，避免茶汤过浓', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_brewing_param` (`id`, `scenario_id`, `tea_type`, `amount`, `water_temp`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (3, 3, '白茶', '5g', '90℃', '5分钟', '可提前将热水装入保温杯，便于户外冲泡', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_brewing_param` (`id`, `scenario_id`, `tea_type`, `amount`, `water_temp`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (4, 4, '绿茶/乌龙茶', '9g', '常温', '4-6小时', '将密封容器放入冰箱冷藏4-6小时，冷泡口感清爽', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
COMMIT;

-- ----------------------------
-- Table structure for tea_category
-- ----------------------------
DROP TABLE IF EXISTS `tea_category`;
CREATE TABLE `tea_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类编码（tea-type/tea-ware等）',
  `category_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称（茶类风味等）',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图标 class',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`category_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='茶识分类表';

-- ----------------------------
-- Records of tea_category
-- ----------------------------
BEGIN;
INSERT INTO `tea_category` (`id`, `category_code`, `category_name`, `icon`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, 'tea-type', '茶类风味', NULL, 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_category` (`id`, `category_code`, `category_name`, `icon`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, 'tea-ware', '茶器使用', NULL, 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_category` (`id`, `category_code`, `category_name`, `icon`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, 'tea-health', '饮茶养生', NULL, 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_category` (`id`, `category_code`, `category_name`, `icon`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (4, 'tea-history', '茶史文化', NULL, 4, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_category` (`id`, `category_code`, `category_name`, `icon`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (5, 'tea-etiquette', '茶桌礼仪', NULL, 5, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
COMMIT;

-- ----------------------------
-- Table structure for tea_food_match
-- ----------------------------
DROP TABLE IF EXISTS `tea_food_match`;
CREATE TABLE `tea_food_match` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tea_type_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '逻辑关联 tea_type_param.tea_type_code（无外键）',
  `tea_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '茶名',
  `food_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '食物名',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '完整标题（绿茶 + 绿豆糕）',
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '卡片简述',
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图',
  `detail_content` text COLLATE utf8mb4_unicode_ci COMMENT '详情内容（含搭配理由/食用建议/小贴士）',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_tea_type` (`tea_type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='茶食搭配表';

-- ----------------------------
-- Records of tea_food_match
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for tea_knowledge
-- ----------------------------
DROP TABLE IF EXISTS `tea_knowledge`;
CREATE TABLE `tea_knowledge` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '逻辑关联 tea_category.category_code（无外键）',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '摘要描述（卡片desc）',
  `detail_content` text COLLATE utf8mb4_unicode_ci COMMENT '详情内容',
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图URL',
  `view_count` int NOT NULL DEFAULT '0' COMMENT '浏览量',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1已发布 0草稿',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='基础茶识表';

-- ----------------------------
-- Records of tea_knowledge
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for tea_scenario
-- ----------------------------
DROP TABLE IF EXISTS `tea_scenario`;
CREATE TABLE `tea_scenario` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `scenario_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '场景类型：home/office/outdoor',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '教程标题',
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '简述',
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图',
  `detail_content` text COLLATE utf8mb4_unicode_ci COMMENT '详情内容（含工具/步骤/小贴士）',
  `view_count` int NOT NULL DEFAULT '0' COMMENT '浏览量',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1已发布 0草稿',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_scenario_type` (`scenario_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景教程表';

-- ----------------------------
-- Records of tea_scenario
-- ----------------------------
BEGIN;
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, 'home', '居家功夫茶冲泡', '在家用盖碗或紫砂壶冲泡乌龙茶，突出香气与层次。', NULL, '工具：盖碗/紫砂壶、茶海、公道杯、品茗杯。\n步骤：温具→投茶→润茶→正式冲泡→分汤品饮。\n提示：首泡快速出汤，后续每泡增加少许时间。', 0, 1, 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, 'office', '办公室简易冲泡', '办公室用马克杯冲泡绿茶/红茶，简单快速。', NULL, '工具：马克杯/玻璃杯。\n步骤：注水→投茶→等待→饮用。\n提示：绿茶水温不宜过高，控制浸泡时间避免苦涩。', 0, 1, 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, 'outdoor', '户外便携冲泡', '户外用保温杯冲泡白茶，方便携带。', NULL, '工具：保温杯。\n步骤：投茶→注热水→闷泡→饮用。\n提示：可提前准备热水，注意杯内清洁避免异味。', 0, 1, 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (4, 'home', '居家冷泡茶', '冷泡绿茶/乌龙茶，口感清爽，适合夏天。', NULL, '工具：密封冷泡壶。\n步骤：投茶→注常温水→冷藏→过滤饮用。\n提示：冷藏 4-6 小时风味最佳。', 0, 1, 4, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
COMMIT;

-- ----------------------------
-- Table structure for tea_topic
-- ----------------------------
DROP TABLE IF EXISTS `tea_topic`;
CREATE TABLE `tea_topic` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `topic_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '逻辑关联 tea_topic_category.topic_code（无外键）',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '简述',
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图URL',
  `detail_content` text COLLATE utf8mb4_unicode_ci COMMENT '详情内容',
  `audio_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '音频URL（养生类专题有音频）',
  `view_count` int NOT NULL DEFAULT '0' COMMENT '浏览量',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1已发布 0草稿',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_topic_code` (`topic_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进阶专题表';

-- ----------------------------
-- Records of tea_topic
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for tea_topic_category
-- ----------------------------
DROP TABLE IF EXISTS `tea_topic_category`;
CREATE TABLE `tea_topic_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `topic_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '编码（process/region/taste/health/culture）',
  `topic_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '名称（制作工艺/核心产区等）',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_topic_code` (`topic_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进阶专题分类表';

-- ----------------------------
-- Records of tea_topic_category
-- ----------------------------
BEGIN;
INSERT INTO `tea_topic_category` (`id`, `topic_code`, `topic_name`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, 'process', '制作工艺', 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic_category` (`id`, `topic_code`, `topic_name`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, 'region', '核心产区', 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic_category` (`id`, `topic_code`, `topic_name`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, 'taste', '品鉴技巧', 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic_category` (`id`, `topic_code`, `topic_name`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (4, 'health', '养生茶疗', 4, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic_category` (`id`, `topic_code`, `topic_name`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (5, 'culture', '茶器文化', 5, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
COMMIT;

-- ----------------------------
-- Table structure for tea_type_param
-- ----------------------------
DROP TABLE IF EXISTS `tea_type_param`;
CREATE TABLE `tea_type_param` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tea_type_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '茶类编码（green/black/oolong/white）',
  `tea_type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '茶类名称（绿茶/红茶/乌龙茶/白茶）',
  `water_temp` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '水温',
  `amount` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '投茶量',
  `brew_time` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '冲泡时长',
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tea_type_code` (`tea_type_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='茶类设备参数表';

-- ----------------------------
-- Records of tea_type_param
-- ----------------------------
BEGIN;
INSERT INTO `tea_type_param` (`id`, `tea_type_code`, `tea_type_name`, `water_temp`, `amount`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (1, 'green', '绿茶', '80℃', '3g', '2分钟', '建议选用透明玻璃杯，先注水后投茶，便于观赏茶叶舒展，水温不宜过高', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_type_param` (`id`, `tea_type_code`, `tea_type_name`, `water_temp`, `amount`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (2, 'black', '红茶', '90℃', '4g', '3分钟', '推荐使用白瓷杯或马克杯，可适当延长闷泡时间以增强甜醇口感', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_type_param` (`id`, `tea_type_code`, `tea_type_name`, `water_temp`, `amount`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (3, 'oolong', '乌龙茶', '100℃', '7g', '1分钟(首泡洗茶)', '建议使用盖碗或紫砂壶，沸水高冲激发香气，首泡快速洗茶，后续每泡增加10-15秒', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_type_param` (`id`, `tea_type_code`, `tea_type_name`, `water_temp`, `amount`, `brew_time`, `note`, `create_time`, `update_time`, `deleted`) VALUES (4, 'white', '白茶', '90℃', '5g', '5分钟', '可用玻璃杯或保温杯闷泡，新茶水温稍低，老白茶可用沸水冲泡', '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
COMMIT;

-- ----------------------------
-- Table structure for tea_ware
-- ----------------------------
DROP TABLE IF EXISTS `tea_ware`;
CREATE TABLE `tea_ware` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '茶器名称',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图片URL',
  `detail_content` text COLLATE utf8mb4_unicode_ci COMMENT '使用指南内容',
  `suitable_tea` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '适配茶类',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='茶器表';

-- ----------------------------
-- Records of tea_ware
-- ----------------------------
BEGIN;
INSERT INTO `tea_ware` (`id`, `name`, `image`, `detail_content`, `suitable_tea`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, '紫砂壶', './images/2.1.jpg', NULL, '乌龙茶、普洱茶', 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_ware` (`id`, `name`, `image`, `detail_content`, `suitable_tea`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, '白瓷盖碗', './images/2.jpg', NULL, '所有茶类，尤其绿茶、红茶', 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_ware` (`id`, `name`, `image`, `detail_content`, `suitable_tea`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, '玻璃杯', './images/2.3.png', NULL, '绿茶、花茶、白茶', 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
COMMIT;

-- ----------------------------
-- Table structure for user_favorite
-- ----------------------------
DROP TABLE IF EXISTS `user_favorite`;
CREATE TABLE `user_favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '逻辑关联 sys_user.id（无外键）',
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收藏类型：knowledge/topic/scenario/food',
  `target_id` bigint NOT NULL COMMENT '目标ID（对应业务表主键）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`,`target_type`,`target_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- ----------------------------
-- Records of user_favorite
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for user_feedback
-- ----------------------------
DROP TABLE IF EXISTS `user_feedback`;
CREATE TABLE `user_feedback` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '逻辑关联 sys_user.id（无外键）',
  `feedback_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '反馈类型',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '反馈内容',
  `contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系方式',
  `images` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '截图URLs（逗号分隔）',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '处理状态：0未处理 1处理中 2已处理',
  `reply` text COLLATE utf8mb4_unicode_ci COMMENT '管理员回复',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='意见反馈表';

-- ----------------------------
-- Records of user_feedback
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
