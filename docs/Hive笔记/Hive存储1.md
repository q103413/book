# Hive 实战操作教程：广电用户数据存储与分析

## 教程概述

本教程基于广电行业用户数据场景，通过实际操作带你掌握 Hive 数据仓库的核心技能。我们将处理5个真实的CSV数据集，包括用户信息、收视行为、账单、订单和媒体索引数据。

------

## 第一部分：环境准备

### 1.1 确认 Hadoop 和 Hive 环境

在开始之前，确保你的集群已经安装并启动了 Hadoop 和 Hive。

```bash
# 检查 HDFS 是否正常运行
hdfs dfsadmin -report

# 启动 Hive
hive
```

### 1.2 准备数据文件

将以下5个CSV文件准备好：

- **mediamatch_usermsg.csv**：用户信息（1995年1月-2022年6月）
- **mediamatch_userevent.csv**：用户事件（1995年1月-2022年6月）
- **mmconsume_billevents.csv**：账单事件（2022年1月-2022年7月）
- **order_index.csv**：订单索引（2014年1月-2022年5月）
- **media_index.csv**：媒体索引（2022年5月-2022年7月）

使用 Xftp 或 scp 命令将这些文件上传到 Linux 服务器的 `/opt/data` 目录。

```bash
# 创建数据目录
mkdir -p /opt/data

# 删除CSV文件的表头（第一行）
cd /opt/data
sed -i '1d' mediamatch_usermsg.csv
sed -i '1d' mediamatch_userevent.csv
sed -i '1d' mmconsume_billevents.csv
sed -i '1d' order_index.csv
sed -i '1d' media_index.csv
```

------

## 第二部分：数据库操作实战

### 2.1 创建数据库

启动 Hive 命令行：

```bash
hive
```

创建专门的数据库 `TestDB`：

```sql
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS TestDB
COMMENT '广电用户数据仓库'
LOCATION '/user/hive/warehouse/testdb.db';

-- 查看所有数据库
SHOW DATABASES;

-- 切换到 TestDB
USE TestDB;
```

**验证数据库创建**：

打开浏览器访问 `http://master:9870`，点击 `Utilities` → `Browse the file system`，导航到 `/user/hive/warehouse`，你会看到 `testdb.db` 目录。

### 2.2 查看和管理数据库

```sql
-- 查看数据库详细信息
DESCRIBE DATABASE TestDB;

-- 查看数据库扩展信息
DESCRIBE DATABASE EXTENDED TestDB;

-- 设置数据库属性
ALTER DATABASE TestDB SET DBPROPERTIES ('creator'='admin', 'date'='2024-01-07');
```

------

## 第三部分：创建数据表实战

### 3.1 创建内部表：用户信息表

**表结构设计**：

| 字段名      | 类型   | 说明       |
| ----------- | ------ | ---------- |
| terminal_no | STRING | 终端编号   |
| phone_no    | STRING | 手机号码   |
| sm_name     | STRING | 用户姓名   |
| run_name    | STRING | 运营商名称 |
| sm_code     | STRING | 用户编码   |
| owner_name  | STRING | 所有者名称 |
| owner_code  | STRING | 所有者编码 |
| run_time    | STRING | 运营时间   |
| addressoj   | STRING | 地址       |
| force       | STRING | 强制标识   |
| open_time   | STRING | 开通时间   |

**创建表的 SQL**：

```sql
CREATE TABLE IF NOT EXISTS mediamatch_usermsg (
    terminal_no STRING COMMENT '终端编号',
    phone_no STRING COMMENT '手机号码',
    sm_name STRING COMMENT '用户姓名',
    run_name STRING COMMENT '运营商名称',
    sm_code STRING COMMENT '用户编码',
    owner_name STRING COMMENT '所有者名称',
    owner_code STRING COMMENT '所有者编码',
    run_time STRING COMMENT '运营时间',
    addressoj STRING COMMENT '地址',
    force STRING COMMENT '强制标识',
    open_time STRING COMMENT '开通时间'
)
COMMENT '用户信息表'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

**查看表结构**：

```sql
-- 查看表结构
DESC mediamatch_usermsg;

-- 查看详细表结构
DESC FORMATTED mediamatch_usermsg;
```

### 3.2 创建用户事件表

```sql
CREATE TABLE IF NOT EXISTS mediamatch_userevent (
    sum_name STRING COMMENT '汇总名称',
    run_name STRING COMMENT '运营商名称',
    run_time STRING COMMENT '运营时间',
    owner_name STRING COMMENT '所有者名称',
    owner_code STRING COMMENT '所有者编码',
    open_time STRING COMMENT '开通时间'
)
COMMENT '用户事件表'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

### 3.3 创建账单事件表

```sql
CREATE TABLE IF NOT EXISTS mmconsume_billevents (
    terminal_no STRING COMMENT '终端编号',
    phone_no STRING COMMENT '手机号码',
    fee_code STRING COMMENT '费用代码',
    year_month STRING COMMENT '年月',
    owner_name STRING COMMENT '所有者名称',
    owner_code STRING COMMENT '所有者编码',
    sm_name STRING COMMENT '用户姓名',
    should_pay DOUBLE COMMENT '应付金额',
    favour_fee DOUBLE COMMENT '优惠金额'
)
COMMENT '账单事件表'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

### 3.4 创建订单索引表

```sql
CREATE TABLE IF NOT EXISTS order_index (
    phone_no STRING COMMENT '手机号码',
    owner_name STRING COMMENT '所有者名称',
    optdate STRING COMMENT '操作日期',
    prodname STRING COMMENT '产品名称',
    sm_name STRING COMMENT '用户姓名',
    offerid STRING COMMENT '优惠ID',
    offername STRING COMMENT '优惠名称',
    business_name STRING COMMENT '业务名称',
    owner_code STRING COMMENT '所有者编码',
    prodprcid STRING COMMENT '产品价格ID',
    prodprcname STRING COMMENT '产品价格名称',
    effdate STRING COMMENT '生效日期',
    expdate STRING COMMENT '失效日期',
    orderdate STRING COMMENT '订单日期',
    cost DOUBLE COMMENT '费用',
    mode_time STRING COMMENT '模式时间',
    prodstatus STRING COMMENT '产品状态',
    run_name STRING COMMENT '运营商名称',
    orderno STRING COMMENT '订单号',
    offertype STRING COMMENT '优惠类型'
)
COMMENT '订单索引表'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

### 3.5 创建媒体索引表

```sql
CREATE TABLE IF NOT EXISTS media_index (
    terminal_no STRING COMMENT '终端编号',
    phone_no STRING COMMENT '手机号码',
    duration INT COMMENT '时长（秒）',
    station_name STRING COMMENT '频道名称',
    origin_time STRING COMMENT '开始时间',
    end_time STRING COMMENT '结束时间',
    owner_code STRING COMMENT '所有者编码',
    owner_name STRING COMMENT '所有者名称',
    vod_cat_tags STRING COMMENT '点播分类标签',
    resolution STRING COMMENT '分辨率',
    audio_lang STRING COMMENT '音频语言',
    region STRING COMMENT '地区',
    res_name STRING COMMENT '资源名称',
    res_type STRING COMMENT '资源类型',
    vod_title STRING COMMENT '点播标题',
    category_name STRING COMMENT '类别名称',
    program_title STRING COMMENT '节目标题',
    sm_name STRING COMMENT '用户姓名'
)
COMMENT '媒体索引表'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

**查看所有表**：

```sql
SHOW TABLES;
```

------

## 第四部分：数据加载实战

### 4.1 使用 LOAD 命令加载本地数据

**加载用户信息数据**：

```sql
LOAD DATA LOCAL INPATH '/opt/data/mediamatch_usermsg.csv'
INTO TABLE mediamatch_usermsg;
```

**加载用户事件数据**：

```sql
LOAD DATA LOCAL INPATH '/opt/data/mediamatch_userevent.csv'
INTO TABLE mediamatch_userevent;
```

**加载账单事件数据**：

```sql
LOAD DATA LOCAL INPATH '/opt/data/mmconsume_billevents.csv'
INTO TABLE mmconsume_billevents;
```

**加载订单索引数据**：

```sql
LOAD DATA LOCAL INPATH '/opt/data/order_index.csv'
INTO TABLE order_index;
```

**加载媒体索引数据**：

```sql
LOAD DATA LOCAL INPATH '/opt/data/media_index.csv'
INTO TABLE media_index;
```

### 4.2 验证数据加载

**查看表中的数据**：

```sql
-- 查看用户信息表前10条记录
SELECT * FROM mediamatch_usermsg LIMIT 10;

-- 统计用户信息表总记录数
SELECT COUNT(*) FROM mediamatch_usermsg;

-- 查看账单表前5条记录
SELECT * FROM mmconsume_billevents LIMIT 5;

-- 统计各表的记录数
SELECT COUNT(*) AS user_count FROM mediamatch_usermsg;
SELECT COUNT(*) AS event_count FROM mediamatch_userevent;
SELECT COUNT(*) AS bill_count FROM mmconsume_billevents;
SELECT COUNT(*) AS order_count FROM order_index;
SELECT COUNT(*) AS media_count FROM media_index;
```

### 4.3 在 HDFS 上验证数据

```bash
# 查看 HDFS 上的数据文件
hdfs dfs -ls /user/hive/warehouse/testdb.db/mediamatch_usermsg/
hdfs dfs -ls /user/hive/warehouse/testdb.db/mmconsume_billevents/

# 查看文件内容（前20行）
hdfs dfs -cat /user/hive/warehouse/testdb.db/mediamatch_usermsg/* | head -20
```

或访问 Web UI：`http://master:9870` → `Utilities` → `Browse the file system` → 导航到 `/user/hive/warehouse/testdb.db`

------

## 第五部分：外部表实战

### 5.1 创建外部表

外部表的数据存储在指定的 HDFS 路径，删除表时不会删除数据文件。

**先将数据上传到 HDFS**：

```bash
# 创建 HDFS 目录
hdfs dfs -mkdir -p /ext/employees

# 准备测试数据文件
cat > /opt/employees.txt << EOF
John,30,5000.0,IT,Alice|Bob,tax:100.0|insurance:200.0
Jane,28,4500.0,HR,Tom|Jerry,tax:80.0|insurance:150.0
Mike,35,6000.0,Finance,David,tax:120.0|insurance:250.0
EOF

# 上传到 HDFS
hdfs dfs -put /opt/employees.txt /ext/employees/
```

**创建外部表**：

```sql
CREATE EXTERNAL TABLE IF NOT EXISTS employees_external (
    name STRING COMMENT '姓名',
    age INT COMMENT '年龄',
    salary FLOAT COMMENT '薪资',
    department STRING COMMENT '部门',
    subordinates ARRAY<STRING> COMMENT '下属列表',
    deductions MAP<STRING, FLOAT> COMMENT '扣款项目'
)
COMMENT '员工信息外部表'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
COLLECTION ITEMS TERMINATED BY '|'
MAP KEYS TERMINATED BY ':'
STORED AS TEXTFILE
LOCATION '/ext/employees';
```

**查询外部表数据**：

```sql
-- 查看所有数据
SELECT * FROM employees_external;

-- 访问数组元素
SELECT name, subordinates[0] AS first_subordinate 
FROM employees_external;

-- 访问 MAP 元素
SELECT name, deductions['tax'] AS tax_amount 
FROM employees_external;
```

**删除外部表（数据文件不会被删除）**：

```sql
DROP TABLE IF EXISTS employees_external;

-- 验证 HDFS 上的文件仍然存在
```

在 Shell 中验证：

```bash
hdfs dfs -ls /ext/employees/
# 文件仍然存在
```

------

## 第六部分：分区表实战

分区表可以显著提升查询性能，特别是在处理大规模数据时。

### 6.1 创建静态分区表

**创建按年月分区的账单表**：

```sql
CREATE TABLE IF NOT EXISTS mmconsume_billevents_partition (
    terminal_no STRING COMMENT '终端编号',
    phone_no STRING COMMENT '手机号码',
    fee_code STRING COMMENT '费用代码',
    owner_name STRING COMMENT '所有者名称',
    owner_code STRING COMMENT '所有者编码',
    sm_name STRING COMMENT '用户姓名',
    should_pay DOUBLE COMMENT '应付金额',
    favour_fee DOUBLE COMMENT '优惠金额'
)
COMMENT '按年月分区的账单表'
PARTITIONED BY (year_month STRING COMMENT '年月')
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

**向指定分区加载数据**：

```sql
-- 加载 2022年1月的数据
LOAD DATA LOCAL INPATH '/opt/data/mmconsume_billevents_202201.csv'
INTO TABLE mmconsume_billevents_partition
PARTITION (year_month='202201');

-- 加载 2022年2月的数据
LOAD DATA LOCAL INPATH '/opt/data/mmconsume_billevents_202202.csv'
INTO TABLE mmconsume_billevents_partition
PARTITION (year_month='202202');
```

**查询分区表**：

```sql
-- 查看所有分区
SHOW PARTITIONS mmconsume_billevents_partition;

-- 查询特定分区
SELECT * FROM mmconsume_billevents_partition
WHERE year_month='202201'
LIMIT 10;

-- 统计各分区的记录数
SELECT year_month, COUNT(*) AS record_count
FROM mmconsume_billevents_partition
GROUP BY year_month;
```

### 6.2 创建动态分区表

动态分区允许 Hive 自动根据数据内容创建分区。

**设置动态分区参数**：

```sql
-- 启用动态分区
SET hive.exec.dynamic.partition=true;

-- 设置为非严格模式
SET hive.exec.dynamic.partition.mode=nonstrict;

-- 设置最大动态分区数
SET hive.exec.max.dynamic.partitions=1000;

-- 设置每个节点最大动态分区数
SET hive.exec.max.dynamic.partitions.pernode=100;
```

**创建动态分区表**：

```sql
CREATE TABLE IF NOT EXISTS media_index_partition (
    terminal_no STRING,
    phone_no STRING,
    duration INT,
    station_name STRING,
    origin_time STRING,
    end_time STRING,
    owner_code STRING,
    owner_name STRING,
    sm_name STRING
)
PARTITIONED BY (res_type STRING)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

**使用动态分区插入数据**：

```sql
-- 从原始表插入数据，自动按 res_type 分区
INSERT INTO TABLE media_index_partition PARTITION(res_type)
SELECT 
    terminal_no,
    phone_no,
    duration,
    station_name,
    origin_time,
    end_time,
    owner_code,
    owner_name,
    sm_name,
    res_type
FROM media_index;
```

**查看动态分区结果**：

```sql
-- 查看创建的分区
SHOW PARTITIONS media_index_partition;

-- 查询特定分区
SELECT * FROM media_index_partition
WHERE res_type='0'
LIMIT 5;
```

------

## 第七部分：分桶表实战

分桶表将数据按照 hash 值分散到固定数量的文件中，适合数据采样和优化 JOIN 操作。

### 7.1 创建分桶表

```sql
CREATE TABLE IF NOT EXISTS mediamatch_usermsg_bucket (
    terminal_no STRING,
    phone_no STRING,
    sm_name STRING,
    run_name STRING,
    sm_code STRING,
    owner_name STRING,
    owner_code STRING,
    run_time STRING,
    addressoj STRING,
    force STRING,
    open_time STRING
)
COMMENT '按所有者编码分桶的用户表'
CLUSTERED BY (owner_code) 
SORTED BY (open_time DESC)
INTO 4 BUCKETS
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

**插入数据到分桶表**：

```sql
-- 启用分桶
SET hive.enforce.bucketing=true;

-- 从原始表插入数据
INSERT INTO TABLE mediamatch_usermsg_bucket
SELECT * FROM mediamatch_usermsg;
```

**验证分桶效果**：

```bash
# 查看 HDFS 上的文件，会看到4个桶文件
hdfs dfs -ls /user/hive/warehouse/testdb.db/mediamatch_usermsg_bucket/
```

**使用分桶表进行数据采样**：

```sql
-- 随机采样 25% 的数据（1个桶）
SELECT * FROM mediamatch_usermsg_bucket
TABLESAMPLE(BUCKET 1 OUT OF 4 ON owner_code)
LIMIT 100;
```

------

## 第八部分：临时表实战

临时表只在当前会话中存在，会话结束后自动删除。

### 8.1 创建临时表

```sql
CREATE TEMPORARY TABLE IF NOT EXISTS temp_user_summary (
    owner_code STRING,
    user_count BIGINT,
    avg_duration DOUBLE
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;
```

**向临时表插入统计数据**：

```sql
INSERT INTO TABLE temp_user_summary
SELECT 
    owner_code,
    COUNT(DISTINCT phone_no) AS user_count,
    AVG(duration) AS avg_duration
FROM media_index
GROUP BY owner_code;
```

**查询临时表**：

```sql
SELECT * FROM temp_user_summary
ORDER BY user_count DESC
LIMIT 10;
```

**验证临时表特性**：

```sql
-- 退出 Hive
exit;

-- 重新进入 Hive
hive
USE TestDB;

-- 尝试查询临时表（会报错，因为临时表已消失）
SHOW TABLES;
-- temp_user_summary 不会出现在列表中
```

------

## 第九部分：表管理操作实战

### 9.1 重命名表

```sql
-- 创建测试表
CREATE TABLE log_message (
    hms INT COMMENT '时间戳',
    severity STRING COMMENT '严重程度',
    server STRING COMMENT '服务器',
    process_id INT COMMENT '进程ID',
    message STRING COMMENT '日志消息'
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

-- 重命名表
ALTER TABLE log_message RENAME TO log_message_new;

-- 验证
SHOW TABLES;
DESC log_message_new;
```

### 9.2 修改表属性

```sql
-- 添加表注释
ALTER TABLE log_message_new SET TBLPROPERTIES ('comment'='系统日志表');

-- 查看表属性
DESC FORMATTED log_message_new;
```

### 9.3 删除表

```sql
-- 删除内部表（数据和元数据都会删除）
DROP TABLE IF EXISTS log_message_new;

-- 验证表已删除
SHOW TABLES;
```

------

## 第十部分：基础查询实战

### 10.1 简单查询

```sql
-- 查询用户总数
SELECT COUNT(*) AS total_users FROM mediamatch_usermsg;

-- 查询不同运营商的用户数
SELECT run_name, COUNT(*) AS user_count
FROM mediamatch_usermsg
GROUP BY run_name
ORDER BY user_count DESC;

-- 查询特定用户的账单信息
SELECT phone_no, year_month, should_pay, favour_fee
FROM mmconsume_billevents
WHERE phone_no = '13800138000'
ORDER BY year_month;
```

### 10.2 聚合分析

```sql
-- 计算每月总账单金额
SELECT 
    year_month,
    COUNT(*) AS bill_count,
    SUM(should_pay) AS total_should_pay,
    SUM(favour_fee) AS total_favour_fee,
    SUM(should_pay - favour_fee) AS actual_pay
FROM mmconsume_billevents
GROUP BY year_month
ORDER BY year_month;

-- 查找高消费用户（TOP 10）
SELECT 
    phone_no,
    sm_name,
    SUM(should_pay) AS total_consumption
FROM mmconsume_billevents
GROUP BY phone_no, sm_name
ORDER BY total_consumption DESC
LIMIT 10;
```

### 10.3 收视行为分析

```sql
-- 统计用户观看时长
SELECT 
    phone_no,
    sm_name,
    COUNT(*) AS watch_count,
    SUM(duration) AS total_duration_seconds,
    ROUND(SUM(duration)/3600, 2) AS total_duration_hours
FROM media_index
GROUP BY phone_no, sm_name
ORDER BY total_duration_seconds DESC
LIMIT 20;

-- 分析热门频道
SELECT 
    station_name,
    COUNT(*) AS view_count,
    SUM(duration) AS total_duration
FROM media_index
GROUP BY station_name
ORDER BY view_count DESC
LIMIT 15;

-- 分析资源类型分布
SELECT 
    res_type,
    CASE 
        WHEN res_type = '0' THEN '直播'
        WHEN res_type = '1' THEN '点播'
        ELSE '未知'
    END AS res_type_name,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM media_index
GROUP BY res_type;
```

### 10.4 JOIN 查询

```sql
-- 用户消费与收视行为关联分析
SELECT 
    m.phone_no,
    m.sm_name,
    COUNT(DISTINCT b.year_month) AS bill_months,
    SUM(b.should_pay) AS total_bill,
    COUNT(DISTINCT md.terminal_no) AS device_count,
    SUM(md.duration)/3600 AS watch_hours
FROM mediamatch_usermsg m
LEFT JOIN mmconsume_billevents b ON m.phone_no = b.phone_no
LEFT JOIN media_index md ON m.phone_no = md.phone_no
GROUP BY m.phone_no, m.sm_name
HAVING total_bill > 0
ORDER BY total_bill DESC
LIMIT 20;
```

------

## 第十一部分：性能优化实战

### 11.1 使用分区裁剪

```sql
-- 不使用分区（全表扫描）
SELECT COUNT(*) 
FROM mmconsume_billevents
WHERE year_month = '202201';

-- 使用分区（只扫描特定分区）
SELECT COUNT(*) 
FROM mmconsume_billevents_partition
WHERE year_month = '202201';
```

### 11.2 使用列式存储格式（ORC）

```sql
-- 创建 ORC 格式的表
CREATE TABLE mmconsume_billevents_orc (
    terminal_no STRING,
    phone_no STRING,
    fee_code STRING,
    year_month STRING,
    owner_name STRING,
    owner_code STRING,
    sm_name STRING,
    should_pay DOUBLE,
    favour_fee DOUBLE
)
STORED AS ORC
TBLPROPERTIES ("orc.compress"="SNAPPY");

-- 从文本表导入数据
INSERT INTO TABLE mmconsume_billevents_orc
SELECT * FROM mmconsume_billevents;

-- 比较存储大小
```

在 Shell 中查看文件大小：

```bash
# 文本格式表大小
hdfs dfs -du -h /user/hive/warehouse/testdb.db/mmconsume_billevents/

# ORC 格式表大小
hdfs dfs -du -h /user/hive/warehouse/testdb.db/mmconsume_billevents_orc/
```

### 11.3 启用执行引擎优化

```sql
-- 使用 Tez 引擎（比 MapReduce 更快）
SET hive.execution.engine=tez;

-- 启用向量化执行
SET hive.vectorized.execution.enabled=true;

-- 启用 CBO（基于成本的优化器）
SET hive.cbo.enable=true;
SET hive.compute.query.using.stats=true;

-- 收集表统计信息
ANALYZE TABLE mmconsume_billevents COMPUTE STATISTICS;
ANALYZE TABLE mmconsume_billevents COMPUTE STATISTICS FOR COLUMNS;
```

------

## 第十二部分：综合实战案例

### 案例：广电用户价值分析报表

**需求**：生成一份用户价值分析报表，包括用户的消费金额、观看时长、活跃度等指标。
