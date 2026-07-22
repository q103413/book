

# Hive 广电用户数据存储

## 一、 任务背景与目标

在新媒体冲击下，广电公司面临用户流失挑战。通过大数据分析技术把握用户特征和收视行为至关重要 。在数据分析前，必须建立稳固的数据存储基础 。
**本教程目标：** 掌握 Hive 数据库及业务表的创建与管理，并将广电业务 CSV 数据导入 Hive 表中 。

---

## 二、 理论基础

### 1. Hive 数据库概述

在 Hive 中，数据库本质上是表的**目录或命名空间**，用于将表组织成逻辑组，有效避免大集群中的命名冲突 。

* 
**HQL 语言：** Hive 查询语言（HQL）类似于 SQL，但不支持行级插入、更新、删除及事务操作 。


* 
**存储位置：** Hive 为每个数据库在 HDFS 上创建一个目录（通常以 `.db` 结尾），默认存放在 `/user/hive/warehouse` 下 。



2. Hive 数据类型 

| 类型分类      | 常用数据类型                                                 |
| ------------- | ------------------------------------------------------------ |
| **数值型**    | TINYINT, SMALLINT, **INT**, BIGINT, FLOAT, DOUBLE, **DECIMAL** |
| **日期/时间** | **TIMESTAMP**, **DATE**                                      |
| **字符串**    | **STRING**, VARCHAR, CHAR                                    |
| **复杂类型**  | **ARRAY**（数组）, **MAP**（键值对）, **STRUCT**（结构体）   |

---

## 三、 实操步骤

### 步骤 1：Hive 数据库管理

首先，我们需要创建一个专门用于存放广电数据的数据库。

1. **创建数据库：**
```sql
-- 创建名为 TestDB 的数据库，并增加判断以防报错
[cite_start]CREATE DATABASE IF NOT EXISTS TestDB; [cite: 73]

```


2. **查看与切换：**
```sql
SHOW DATABASES; [cite_start]-- 查看所有数据库 [cite: 76]
USE TestDB;      [cite_start]-- 切换到 TestDB 数据库 [cite: 120]

```



### 2. 步骤 2：创建业务数据表

Hive 表分为**内部表**（管理表）和**外部表**（External Table）。删除外部表时，仅删除元数据，HDFS 上的原始数据会被保留 。

**实操案例：创建广电用户信息表 (`mediamatch_usermsg`)**
根据业务需求定义字段结构：

```sql
CREATE TABLE IF NOT EXISTS mediamatch_usermsg (
    terminal_no STRING, -- 终端号
    phone_no STRING,    -- 手机号
    sm_name STRING,     -- 业务名称
    run_name STRING,    -- 运行状态
    sm_code STRING,     -- 业务代码
    owner_name STRING,  -- 客户名称
    owner_code STRING,  -- 客户代码
    run_time TIMESTAMP, -- 运行时间
    address STRING      -- 地址
)
ROW FORMAT DELIMITED 
FIELDS TERMINATED BY ',' -- 指定 CSV 文件的分隔符为逗号
[cite_start]STORED AS TEXTFILE; [cite: 15, 16, 24]

```

### 3. 步骤 3：数据准备（预处理）

在导入 CSV 文件之前，通常需要去掉文件首行的表头信息。

* **操作命令：** 在 Linux 终端执行以下命令（以 `mediamatch_usermsg.csv` 为例）：
```bash
# 删除文件的第一行（表头）
[cite_start]sed -i '1d' /opt/data/mediamatch_usermsg.csv [cite: 29]

```



### 4. 步骤 4：将数据导入 Hive 表

使用 `LOAD DATA` 语句将本地或 HDFS 中的文件导入表中。

* 
**语法：** `LOAD DATA [LOCAL] INPATH '路径' [OVERWRITE] INTO TABLE 表名;` 


* **实操演示：**
```sql
-- 将本地 /opt/data 目录下的数据导入
LOAD DATA LOCAL INPATH '/opt/data/mediamatch_usermsg.csv' 
[cite_start]INTO TABLE mediamatch_usermsg; [cite: 28, 29]

```



注：若使用 `LOCAL` 关键字，则从本地 Linux 文件系统读取；若不加，则从 HDFS 读取 。



---

## 四、 进阶：常用广电业务表结构参考

根据文档内容，广电业务通常涉及以下核心数据表 ：

1. 
**用户事件表 (`mediamatch_userevent`)**：记录用户触发的具体业务事件 。


2. 
**账单事件表 (`mmconsume_billevents`)**：包含用户缴费、欠费等财务信息 。


3. 
**订购索引表 (`order_index`)**：记录产品订购的开始、结束日期及费用 。


4. 
**媒体指数表 (`media_index`)**：记录用户观看节目的时长、频道及节目名称 。



## 五、 总结

通过本章学习，您已完成了从环境构建到数据装载的全流程：

1. 利用 **DDL** 语句定义了逻辑层级的数据库和表结构 。


2. 利用 **DML** (LOAD) 语句实现了原始数据向 Hive 仓库的迁移 。


3. 结合**广电实际业务**（如终端号、客户代码等字段定义）完成了数据存储的初步落地 。