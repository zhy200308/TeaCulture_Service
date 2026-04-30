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
INSERT INTO `tea_food_match` (`id`, `tea_type_code`, `tea_name`, `food_name`, `title`, `summary`, `cover_image`, `detail_content`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, 'green', '绿茶', '绿豆糕', '绿茶 + 绿豆糕', '绿茶鲜爽解腻，搭配绿豆糕清甜，是夏季清爽组合。', NULL, '适配茶品：龙井、碧螺春、信阳毛尖\n搭配理由：绿茶性质偏凉，口感鲜爽，能中和绿豆糕的甜腻感；绿豆糕清热解暑，与绿茶的凉性相得益彰，是夏季绝佳搭配。\n食用建议：选用低糖绿豆糕，搭配80℃水温冲泡的绿茶，小口品茶配小块糕点，口感更佳。\n小贴士：避免搭配高糖重油的绿豆糕，会掩盖绿茶的鲜爽口感；建议在上午或下午茶时段食用。', 1, 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_food_match` (`id`, `tea_type_code`, `tea_name`, `food_name`, `title`, `summary`, `cover_image`, `detail_content`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, 'black', '红茶', '黄油司康', '红茶 + 黄油司康', '红茶甜醇温润，搭配司康奶香，醇厚不腻，适合下午茶。', NULL, '适配茶品：祁门红茶、正山小种、滇红\n搭配理由：红茶性质温和，口感甜醇，能中和黄油司康的油腻感；司康的奶香与红茶的蜜香交融，口感醇厚不腻。\n食用建议：司康可搭配少量淡奶油，红茶冲泡水温90℃，焖泡3分钟后饮用，适合早餐或下午茶。\n小贴士：避免搭配过多黄油的司康，易加重肠胃负担；红茶可加少量蜂蜜，口感更协调。', 1, 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_food_match` (`id`, `tea_type_code`, `tea_name`, `food_name`, `title`, `summary`, `cover_image`, `detail_content`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, 'oolong', '乌龙茶', '盐焗坚果', '乌龙茶 + 盐焗坚果', '乌龙茶香气高扬、回甘解腻，搭配坚果咸香，层次更丰富。', NULL, '适配茶品：铁观音、大红袍、凤凰单丛\n搭配理由：乌龙茶香气高扬，回甘明显，能解坚果的咸香和油腻；坚果的油脂能衬托乌龙茶的岩韵/兰香，口感层次丰富。\n食用建议：选用盐焗腰果、巴旦木，搭配95℃水温冲泡的乌龙茶，品茶时吃2-3颗坚果，解腻增香。\n小贴士：避免食用过多坚果，易上火；乌龙茶可冲泡多次，越泡越适合搭配坚果。', 1, 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_food_match` (`id`, `tea_type_code`, `tea_name`, `food_name`, `title`, `summary`, `cover_image`, `detail_content`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (4, 'white', '白茶', '桂花糕', '白茶 + 桂花糕', '白茶清甜淡雅，桂花香气柔和，温润不腻，四季皆宜。', NULL, '适配茶品：白牡丹、寿眉、白毫银针\n搭配理由：白茶清甜淡雅，性质温和，桂花糕的桂花香与白茶的毫香交融，口感温润不腻，适合四季食用。\n食用建议：选用手工桂花糕，白茶冲泡水温85℃，焖泡5分钟后饮用，适合午后休闲时段。\n小贴士：桂花糕含糖量较高，建议少量食用；老白茶搭配桂花糕，口感更醇厚。', 1, 4, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
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
INSERT INTO `tea_knowledge` (`id`, `category_code`, `title`, `summary`, `detail_content`, `cover_image`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, 'tea-type', '六大茶类的特点', '绿茶鲜爽、红茶甜醇、乌龙茶香气高扬、白茶清甜、黄茶温润、黑茶醇厚。', '中国茶叶按发酵程度分为六大类：\n1. 绿茶（不发酵）：龙井、碧螺春，口感鲜爽，清汤绿叶；\n2. 红茶（全发酵）：祁门红茶、正山小种，口感甜醇，红汤红叶；\n3. 乌龙茶（半发酵）：铁观音、大红袍，香气高扬；\n4. 白茶（微发酵）：白毫银针、白牡丹，口感清甜；\n5. 黄茶（轻发酵）：君山银针，口感温润；\n6. 黑茶（后发酵）：普洱茶、安化黑茶，口感醇厚。', NULL, 0, 1, 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_knowledge` (`id`, `category_code`, `title`, `summary`, `detail_content`, `cover_image`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, 'tea-type', '绿茶的冲泡水温', '明前绿茶用70-80℃水温，雨前绿茶用80-85℃水温，避免烫熟茶叶。', '绿茶冲泡的核心是低温，避免烫熟茶叶：\n• 明前绿茶（龙井、碧螺春）：70-80℃；\n• 雨前绿茶（信阳毛尖）：80-85℃；\n冲泡技巧：先注水后投茶，减少茶叶与高温水直接接触。', NULL, 0, 1, 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_knowledge` (`id`, `category_code`, `title`, `summary`, `detail_content`, `cover_image`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, 'tea-ware', '盖碗的使用技巧', '盖碗又称三才碗，持握时拇指按盖沿，食指中指夹碗身，避免烫手。', '盖碗是最通用的饮茶器具，使用要点：\n1. 持握：拇指按盖沿，食指中指夹碗身，无名指托碗底；\n2. 注水：注水量不超过碗身2/3，避免溢出；\n3. 出汤：斜盖碗盖，留出缝隙，快速出汤避免闷茶。', NULL, 0, 1, 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_knowledge` (`id`, `category_code`, `title`, `summary`, `detail_content`, `cover_image`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (4, 'tea-health', '不同茶类的养生功效', '绿茶抗氧化、红茶暖胃、乌龙茶降脂、白茶消炎、黑茶促消化。', '茶叶中的营养成分各有侧重：\n• 绿茶：茶多酚含量高，抗氧化、抗辐射；\n• 红茶：性质温和，暖胃护胃，适合肠胃弱的人；\n• 乌龙茶：有助于降脂减肥，适合体重管理；\n• 白茶：黄酮类物质丰富，有消炎杀菌作用；\n• 黑茶：含益生菌，促进肠道消化。', NULL, 0, 1, 4, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_knowledge` (`id`, `category_code`, `title`, `summary`, `detail_content`, `cover_image`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (5, 'tea-history', '中国茶文化简史', '从神农尝百草到唐代煎茶、宋代点茶、明清瀹饮，茶文化源远流长。', '• 神农时期（约公元前2700年）：传说神农尝百草，日遇七十二毒，得茶而解之，茶始为药用。\n• 唐代（618-907年）：陆羽著《茶经》，系统总结茶事，煎茶法盛行，茶文化远播。\n• 宋代（960-1279年）：点茶法成为主流，斗茶风靡，茶器精美，茶宴盛行。\n• 明清（1368-1912年）：瀹饮法（散茶冲泡）普及，六大茶类逐渐形成，紫砂壶兴起。\n• 现代：茶文化复兴，融合传统与创新，成为健康生活的重要部分。', NULL, 0, 1, 5, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_knowledge` (`id`, `category_code`, `title`, `summary`, `detail_content`, `cover_image`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (6, 'tea-etiquette', '叩指礼的由来', '主人斟茶时，客人以食指中指轻叩桌面，表示谢意，源自乾隆微服私访的典故。', '叩指礼源于清代乾隆皇帝微服私访的故事。相传乾隆为下属斟茶，下属不便跪拜，便以食指和中指弯曲轻叩桌面，象征双膝跪地行礼。\n现代用法：\n• 晚辈向长辈：五指并拢成拳，拳心向下，五个手指同时敲击桌面三下，相当于五体投地跪拜礼。\n• 平辈之间：食指中指并拢，敲击桌面三下，表示双手抱拳作揖。\n• 长辈对晚辈：食指或中指轻敲桌面一下或两下，表示点头认可。', NULL, 0, 1, 6, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_knowledge` (`id`, `category_code`, `title`, `summary`, `detail_content`, `cover_image`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (7, 'tea-ware', '茶道六君子', '茶筒、茶则、茶匙、茶漏、茶夹、茶针，各司其职，辅助泡茶。', '茶道六君子是传统茶艺中六种辅助茶具的统称：\n1. 茶筒：盛放其他五件的筒状器皿。\n2. 茶则：用来量取茶叶，确保投茶量准确。\n3. 茶匙：从茶则或茶罐中拨取茶叶。\n4. 茶漏：放置于壶口，防止茶叶外漏。\n5. 茶夹：用于夹取品茗杯，或夹出茶渣。\n6. 茶针：疏通壶嘴，保持出水顺畅。\n它们不仅是实用工具，也体现了茶道的仪式感。', NULL, 0, 1, 7, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
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
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, 'home', '居家功夫茶（乌龙茶）冲泡教程', '在家用盖碗或紫砂壶冲泡乌龙茶，突出香气与层次，掌握快出汤与分茶技巧。', NULL, '工具：白瓷盖碗（100ml）、公道杯、品茗杯、烧水壶、茶叶：铁观音/大红袍（5-7g）\n步骤：温杯：沸水烫洗盖碗、公道杯、品茗杯，提升器具温度；投茶：将茶叶投入盖碗，占碗身1/2容量；洗茶：注入沸水，快速出汤（5秒内），洗去茶叶浮尘；冲泡：再次注沸水，焖泡8-10秒后出汤；分茶：将茶汤平均分入品茗杯，七分满即可\n小贴士：后续冲泡可逐次增加焖泡时间（每次+2秒）；水温需保持95℃以上，才能激发乌龙茶香气', 0, 1, 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, 'office', '办公室简易泡茶（绿茶/红茶）教程', '在办公室用马克杯快速冲泡绿茶/红茶，控制水温与浸泡时间，避免苦涩。', NULL, '工具：马克杯（300ml）、茶漏（可选）、茶叶：绿茶/红茶（3-5g）\n步骤：温杯：少量热水冲洗马克杯，倒掉水；投茶：将茶叶放入杯中（用茶漏更易清理）；注水：绿茶注80℃温水，红茶注90℃热水，水量占杯身2/3；静置：绿茶焖泡2分钟，红茶焖泡3分钟即可饮用\n小贴士：避免用保温杯泡茶，易闷熟茶叶影响口感；可多次加水，最后将茶叶捞出避免久泡', 0, 1, 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, 'outdoor', '户外便携泡茶（白茶）教程', '户外用旅行茶具或保温杯冲泡白茶，轻便易操作，也可冷泡应急。', NULL, '工具：旅行茶具（一壶两杯）、便携式烧水壶/保温杯（装热水）、茶叶：白牡丹/寿眉（4-6g）\n步骤：温具：用热水烫洗旅行茶具，提升温度；投茶：将茶叶投入旅行壶中；注水：注入90℃热水，焖泡5分钟；分茶：将茶汤倒入便携茶杯，即可饮用\n小贴士：无热水时可用矿泉水冷泡，静置30分钟即可；旅行茶具选陶瓷/玻璃材质，轻便且不吸味', 0, 1, 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_scenario` (`id`, `scenario_type`, `title`, `summary`, `cover_image`, `detail_content`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (4, 'home', '夏季居家冷泡茶（绿茶/乌龙茶）教程', '常温注水冷藏浸泡，获得清爽低涩茶汤，适合夏季与轻食搭配。', NULL, '工具：密封玻璃罐/矿泉水瓶（500ml）、茶叶：绿茶/轻发酵乌龙茶（8-10g）、常温矿泉水（500ml）\n步骤：洗茶：用少量常温水快速冲洗茶叶，倒掉水；投茶：将茶叶放入密封容器；注水：倒入常温矿泉水，密封容器；冷藏：放入冰箱冷藏4-6小时；饮用：取出后过滤掉茶叶，即可饮用\n小贴士：冷藏时间不超过8小时，避免茶汤过涩；可加入柠檬片/薄荷，口感更丰富', 0, 1, 4, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
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
INSERT INTO `tea_topic` (`id`, `topic_code`, `title`, `summary`, `cover_image`, `detail_content`, `audio_url`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (1, 'process', '普洱茶熟茶发酵工艺', '普洱茶熟茶的核心是人工渥堆发酵，将晒青毛茶堆成高1.5-2米的茶堆，通过洒水增湿、控制温度（55-65℃），让茶叶微生物发酵。', NULL, '关键步骤：\n1. 备料：选用云南大叶种晒青毛茶，含水率控制在10%左右；\n2. 渥堆：堆茶洒水，覆盖湿布保温，温度超过65℃时翻堆降温；\n3. 翻堆：每隔7-10天翻堆一次，共翻堆5-8次；\n4. 出堆：发酵40-60天后出堆，摊晾至含水率12%以下；\n5. 陈化：出堆后陈放3-6个月，稳定口感。\n小贴士：发酵温度过高会导致熟茶有“渥堆味”；优质熟茶发酵后需陈化1年以上再饮用，口感更醇厚。', NULL, 0, 1, 1, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic` (`id`, `topic_code`, `title`, `summary`, `cover_image`, `detail_content`, `audio_url`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (2, 'region', '西湖龙井核心产区划分', '狮峰、龙井、云栖、虎跑、梅家坞五大核心产区各具风味：狮峰香高味醇，龙井鲜爽翠绿，云栖清甜回甘，虎跑汤感顺滑，梅家坞香清形美。', NULL, '产区差异原因：不同产区的土壤（酸性红壤）、海拔、光照、降水不同，导致茶叶内含物质比例差异，最终形成不同风味。\n小贴士：狮峰龙井价格最高，梅家坞龙井产量最大；购买时认准“西湖龙井地理标志”，避免买到仿品。', NULL, 0, 1, 2, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic` (`id`, `topic_code`, `title`, `summary`, `cover_image`, `detail_content`, `audio_url`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (3, 'taste', '乌龙茶香气品鉴技巧', '乌龙茶香气品鉴可用三步法：先闻干茶香，再闻湿茶香（盖香最浓），最后品茶汤香与回香。', NULL, '不同香型品鉴重点：\n• 清香型（铁观音）：兰花香、栀子香，清新雅致；\n• 浓香型（大红袍）：岩韵香、焦糖香，醇厚持久；\n• 陈香型（老乌龙）：陈香、药香，沉稳内敛。\n小贴士：品鉴时用白瓷盖碗，更易凸显香气；品鉴前避免吃辛辣/重味食物，防止掩盖茶香。', NULL, 0, 1, 3, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic` (`id`, `topic_code`, `title`, `summary`, `cover_image`, `detail_content`, `audio_url`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (4, 'process', '白茶自然萎凋工艺', '白茶工艺最简单，不炒不揉，核心是“自然萎凋”，通过缓慢失水让茶叶轻微发酵（约5-10%），保留天然营养与清甜口感。', NULL, '关键步骤：\n1. 采摘：采一芽一叶/一芽二叶的鲜叶，带白毫为佳；\n2. 摊晾：将鲜叶均匀摊在竹匾上，厚度2-3cm；\n3. 萎凋：在20-25℃、湿度60-70%的环境下，自然萎凋48-72小时；\n4. 干燥：萎凋后用60℃低温烘干，含水率控制在8%以下。\n小贴士：萎凋湿度太高易发霉，太低易失水过快；优质白茶萎凋时需每天轻翻1-2次，保证受热均匀。', NULL, 0, 1, 4, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic` (`id`, `topic_code`, `title`, `summary`, `cover_image`, `detail_content`, `audio_url`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (5, 'health', '陈皮普洱·茶疗养生', '陈皮性温，理气健脾；普洱熟茶暖胃降脂。二者结合，可缓解消化不良、痰多咳嗽，尤其适合秋冬调理。', NULL, '典籍选读：《本草纲目》“陈皮，苦能泄能燥，辛能散，温能和……同补药则补，同泻药则泻，同升药则升，同降药则降。”\n茶疗要点：\n1. 陈皮普洱兼具药食同源之性，是茶疗典范。\n2. 陈皮理气，普洱暖胃，二者相得益彰。\n3. 每日一杯，可助消化、祛湿气，温和调养。\n4. 冲泡时建议用100℃沸水，焖泡5分钟。\n小贴士：建议使用5年以上的新会陈皮与3年熟普搭配，口感更醇。', NULL, 0, 1, 5, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
INSERT INTO `tea_topic` (`id`, `topic_code`, `title`, `summary`, `cover_image`, `detail_content`, `audio_url`, `view_count`, `status`, `sort_order`, `create_time`, `update_time`, `deleted`) VALUES (6, 'culture', '唐宋茶器形制演变', '唐代盛行煮茶法，茶器以越窑青瓷为代表，陆羽《茶经》推崇“越州上”，青瓷茶瓯“类玉”“类冰”，与茶汤色泽相得益彰。', NULL, '宋代茶器：宋代点茶尚白，推崇“盏色贵青黑”，建窑黑釉盏因此盛行。兔毫、油滴、曜变等釉色变幻莫测，与白色茶沫形成鲜明对比。\n文化意蕴：从唐代青瓷温润到宋代黑釉沉静，折射出饮茶方式从煮茶到点茶的转变，也映射出唐宋两代不同的审美取向。\n小贴士：鉴赏唐宋茶器，可关注釉色、胎体、器型比例三大要素；当代茶器收藏中，宋代建盏残片仍具较高研究价值。', NULL, 0, 1, 6, '2026-04-29 20:27:17', '2026-04-29 20:27:17', 0);
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
-- Table structure for user_learning_record
-- ----------------------------
DROP TABLE IF EXISTS `user_learning_record`;
CREATE TABLE `user_learning_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '逻辑关联 sys_user.id（无外键）',
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学习类型：knowledge/topic/scenario/food',
  `target_id` bigint NOT NULL COMMENT '目标ID（对应业务表主键）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_target` (`target_type`,`target_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户学习记录表';

-- ----------------------------
-- Records of user_learning_record
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
