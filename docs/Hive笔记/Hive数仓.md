<center>
    <div style="display:inline-block;width:30%">
    	<img src="http://img.an520.com/test/公众号.png"><h3 style="color:red;">公众号 </h3>
    </div>
    <div style="display:inline-block;width:30%;margin-left:10%">
    	<img src="http://img.an520.com/test/微信号.png"> <h3 style="color:blue;">微信号</h3>
    </div>
</center>
<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

# 一. Hive入门

## 1 架构

### 数据处理流程

大数据的处理过程可分为**数据采集、数据预处理、数据存储、数据分析、数据应用**

![image-20260102232852533](http://img.an520.com/test/image-20260102232852533.png)

在大数据架构中，这五个阶段通常是线性流转但又互有重叠的。

1. **数据采集 (Data Ingestion)**
   - **核心工具**：Flume（日志）、Sqoop（RDBMS 导入）、Kafka（实时流）。
   - **关键点**：保证数据的完整性（不丢包）和低延迟。
2. **数据预处理 (Data Preprocessing)**
   - **核心操作**：ETL（抽取、转换、加载）。去除重复项、处理缺失值、将非结构化数据（如 JSON）转为 Hive 可读的结构化格式。
3. **数据存储 (Data Storage)**
   - **技术组合**：**HDFS** 负责物理存放，**Hive** 提供逻辑管理（表结构）。
   - **优化策略**：在此阶段决定使用分区表（Partitioning）还是分桶表（Bucketing）来提升后续查询速度。
4. **数据分析 (Data Analysis)**
   - **业务逻辑**：针对收视行为进行“漏斗分析”，针对账单进行“用户价值分析 (RFM)”。
   - **计算引擎**：Hive 可配合 Spark 或 Presto 来加速这类深度挖掘任务。
5. **数据应用 (Data Application)**
   - **输出形式**：通过 API 提供推荐结果，或者将分析后的“指标”存入 MySQL/Redis 供前端秒级查询。

### 核心组件与存储技术

#### 系统核心组件

- **HDFS (Hadoop Distributed File System)**：解决“存不下”的问题，将文件切块分布式存储。
- **YARN (Yet Another Resource Negotiator)**：资源调度器，负责管理集群的 CPU 和内存。
- **MapReduce / Spark**：计算引擎，负责真正的逻辑运算。

#### 大数据存储技术

当前主流的存储技术分为**商用**与**开源**两大阵营：

1. **商用存储**

- **GBase 系列数据库产品**：国产数据库佼佼者，常用于高性能事务或分析场景。
- **Amazon S3**：亚马逊提供的云端对象存储服务，具有极高的扩展性。
- **EMC 系列产品**：传统硬件大厂提供的企业级存储解决方案。

2. **开源存储**

- **分布式文件系统/存储**：**HDFS**（Hadoop 核心组件）、**Swift**（OpenStack 存储）、**Alluxio**（内存级分布式存储）。
- **NoSQL/列式数据库**：**HBase**（擅长实时读写）、**OceanBase**（阿里巴巴开源的分布式数据库）。
- **数据仓库工具**：**Hive**。虽然 Hive 底层依赖 HDFS，但在逻辑上它负责管理和存储数据的结构化信息。

#### 存储技术选型对比

针对海量数据的存储，文档对比了多种主流存储产品。

| 存储产品      | 核心简介                      | 优点                                        | 缺点                                   |
| ------------- | ----------------------------- | ------------------------------------------- | -------------------------------------- |
| **HDFS**      | 大数据文件系统的事实标准      | 适合海量文件批处理，高容错，支持ZB级存储    | 不支持并发写入和文件随机修改 。        |
| **Hive**      | 基于 Hadoop 的数据仓库工具    | 提供类 SQL (HQL) 接口，可扩展性强，容错性好 | 延迟较高，不支持实时分析及记录级增删改 |
| **HBase**     | 构建在 HDFS 之上的列式存储库  | 适合存储海量稀疏数据，支持实时随机读写      | 不适合复杂查询，仅支持主键检索 。      |
| **OceanBase** | 阿里自主研发的分布式数据库 。 | 高性能，支持自动故障转移和水平扩展 。       | 运维复杂，学习成本高，不适合小规模企业 |
| **Amazon S3** | 公有云对象存储服务 。         | 兼容性好，高可靠，易于扩展和迁移 。         | 非开源，收费较高，不支持随机位置读写   |
| **Alluxio**   | 以内存为中心的虚拟分布式存储  | 提高存储与计算效率，实现架构解耦 。         | 功能有待完善，对研发能力要求较高 。    |

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

## 2认识Hive

### 什么是 Hive？

Hive 是由 **Facebook** 开源的，建立在 Hadoop 之上的**数据仓库工具**。它的核心价值在于：**让不熟悉 Java/MapReduce 的分析师能够使用 SQL（称为 HQL）来处理大规模数据。**

- **2007-2008年**：Facebook 为了解决海量日志处理难题开发了 Hive。
- **2010年**：成为 Apache 顶级项目。
- **现状**：虽然 SparkSQL 和 Flink 崛起，但 Hive 凭借极其稳定的元数据管理（Metastore），依然是企业级“数据湖/数仓”的基石。

### Hive 架构与原理

Hive 的设计初衷是简化 Hadoop 的使用，使不熟悉 MapReduce 的人员能够使用类 SQL 语言处理大数据 。

Hive 的本质是一个 **SQL 解析引擎**。它并不直接处理数据，而是将 SQL 翻译成 MapReduce 任务。

#### 核心组件

1. **用户接口**：CLI (命令行)、JDBC/ODBC (用于连接可视化工具如 Tableau)。
2. **Thrift Server**：跨语言服务，允许不同语言编写的客户端连接 Hive。
3. **Metastore (元数据库)**：存储表名、列名、分区、文件路径等元数据（如MySQL 或 Derby ）。
4. **Driver (驱动程序)**：包含 **Parser**（解析 HQL）、**Compiler**（编译生成执行计划）、**Optimizer**（优化计划）和 **Executor**（执行作业） 。



#### 工作原理步骤

1. 用户提交 HQL 语句。
2. **Driver** 结合 **Metastore** 进行语法校验和语义分析。
3. **Compiler** 生成逻辑执行计划。
4. **Optimizer** 进行优化（如列裁剪、谓词下推）。
5. **Executor** 将计划转化为具体的 MapReduce 任务提交给 Hadoop 集群。

#### Hive的架构

![image-20260102233109996](http://img.an520.com/test/image-20260102233109996.png)







### Hive设计特性

**核心设计特性：Schema on Read**

与传统数据库的“写入时校验（Schema on Write）”不同，Hive 采用 **“读取时校验”**。这意味着你可以直接将海量文本拷贝到 HDFS 目录，只有在查询时，Hive 才会按照定义的结构去解析。

**主要特点**

- **可扩展性**：支持横向扩展，能处理 PB 级数据。
- **容错性**：底层依赖 Hadoop，节点宕机不影响任务最终完成。
- **熟悉的语法**：HQL 与标准 SQL 高度相似。



### Hive与传统数据库的区别

| **特性**     | **Hive (数据仓库)**                           | **关系型数据库 (MySQL/Oracle)**    |
| ------------ | --------------------------------------------- | ---------------------------------- |
| **数据量**   | PB 级                                         | GB/TB 级                           |
| **查询延迟** | 高 (分钟/小时级)                              | 低 (毫秒/秒级)                     |
| **读写模式** | 读多写少 (不建议随机更新/删除)                | 频繁增删改查                       |
| **执行引擎** | MapReduce / Spark / Tez                       | 数据库自带引擎                     |
| **索引**     | 较弱                                          | 非常丰富                           |
| **事务支持** | 部分支持 (ACID 较弱)                          | 完善的事务支持                     |
| **使用场景** | 日志分析、数据仓库、离线报表生成、大规模ETL等 | 事务处理、实时查询、复杂的关联查询 |



### Hive 的优势与局限

#### 优势

- **低成本**：运行在廉价的 PC 机器集群上。
- **易上手**：SQL 背景的开发人员无需学习 Java 即可编写 MapReduce 逻辑。
- **生态丰富**：与 Spark、Flink、HBase 等大数据组件无缝对接。

#### 局限

- **延迟高**：由于 MapReduce 启动开销大，不适合在线实时查询。
- **调优复杂**：在处理“收视行为”这类巨大表关联时，容易出现数据倾斜，需要深入理解底层原理。
- **不适合小文件**：过多的小文件会给元数据压力并降低计算效率。
- **非强事务**：虽然近几年引入了 ACID 特性，但在超大规模并发修改下表现不如传统数据库。



------

### 为什么要学 Hive

Hive 是进入大数据世界的第一个“抓手”。掌握了 Hive，你就掌握了**数仓建模、离线计算和元数据管理**的核心思想。它是你从 SQL 技能跨越到分布式计算领域的桥梁。

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

# 二、部署开发环境

## 2.1 安装部署Hadoop集群

## 2.2 安装部署Hive

### 安装配置MySQL

### 安装配置Hive

## 2.3 使用Hive CLI

### 启动Hive CLI

### 在Hive中执行Bash Shell和Hadoop dfs命令

### 在Shell中执行Hive查询

<p style="position: fixed; 
          top: 800px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

# 三、数据存储

## 一、Hive 简介

### 1.1 什么是 Hive?

Hive 是基于 Hadoop 的数据仓库工具,可以将结构化的数据文件映射为数据库表,并提供类 SQL 查询功能。

**核心特点:**

- **HQL (Hive Query Language)**: 类似 SQL 的查询语言,基于 ANSI SQL 标准
- **底层执行**: Hive 将 HQL 转换为 MapReduce、Tez 或 Spark 任务执行
- **数据存储**: 数据实际存储在 HDFS 上
- **适用场景**: 大规模数据的批处理分析,不适合实时查询

### 1.2 Hive 架构理解

```
用户 → HQL 查询 → Hive → 转换为 MR 任务 → HDFS 数据读写
                    ↓
                 元数据存储(MySQL)
```

**重要概念:**

- **元数据(Metadata)**: 存储在关系型数据库中(如 MySQL),记录表结构、分区信息等
- **数据文件**: 实际存储在 HDFS 的 `/user/hive/warehouse/` 目录下
- **DDL (Data Definition Language)**: 数据定义语言,用于创建、修改数据库和表结构
- **DML (Data Manipulation Language)**: 数据操作语言,用于数据的增删改查

------

## 二、Hive 数据库操作

### 2.1 创建数据库

**基础语法:**

```sql
CREATE (DATABASE|SCHEMA) [IF NOT EXISTS] database_name
  [COMMENT database_comment]
  [LOCATION hdfs_path]
  [WITH DBPROPERTIES (property_name=property_value, ...)];
```

**参数说明:**

| 参数                   | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `DATABASE` 或 `SCHEMA` | 两者等价,推荐使用 DATABASE                                   |
| `IF NOT EXISTS`        | 如果数据库已存在则不报错,建议总是加上                        |
| `COMMENT`              | 数据库注释说明                                               |
| `LOCATION`             | 指定 HDFS 存储路径,默认为 `/user/hive/warehouse/数据库名.db` |
| `WITH DBPROPERTIES`    | 设置数据库属性键值对                                         |

**实战示例:**

```sql
-- 创建基础数据库
CREATE DATABASE IF NOT EXISTS TestDB;

-- 创建带注释的数据库
CREATE DATABASE IF NOT EXISTS TestDB
  COMMENT '这是测试数据库';

-- 创建指定存储位置的数据库
CREATE DATABASE IF NOT EXISTS TestDB
  LOCATION '/custom/path/testdb';

-- 查看所有数据库
SHOW DATABASES;

-- 查看数据库详细信息
DESCRIBE DATABASE TestDB;
```

**存储路径理解:**

当你创建 `TestDB` 数据库后:

- HDFS 上会自动创建目录 `/user/hive/warehouse/testdb.db`
- 该数据库下的所有表都存储在这个目录下
- 可以通过 `http://master:9870` Web UI 查看

### 2.2 使用数据库

```sql
-- 切换到指定数据库
USE TestDB;

-- 切换回默认数据库
USE DEFAULT;

-- 显示当前使用的数据库(需要设置参数)
SET hive.cli.print.current.db=true;
```

### 2.3 修改数据库

```sql
-- 修改数据库属性
ALTER DATABASE TestDB SET DBPROPERTIES ('creator'='admin', 'date'='2024-01-01');

-- 修改数据库所有者
ALTER DATABASE TestDB SET OWNER USER username;

-- 修改数据库存储位置(Hive 2.2.1+)
ALTER DATABASE TestDB SET LOCATION hdfs_path;
```

**注意:** 不能修改数据库名称!

### 2.4 删除数据库

```sql
-- 删除空数据库
DROP DATABASE IF EXISTS TestDB;

-- 删除数据库及其所有表(慎用!)
DROP DATABASE IF EXISTS TestDB CASCADE;

-- 默认为 RESTRICT 模式,数据库不为空时会报错
DROP DATABASE TestDB RESTRICT;
```

**CASCADE vs RESTRICT:**

- `RESTRICT`: 默认模式,数据库内有表时拒绝删除
- `CASCADE`: 强制删除数据库及其所有表

------

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

## 三、Hive 数据类型详解

### 3.1 基本数据类型

#### 3.1.1 数值类型

| 类型                        | 字节数     | 说明       | 示例          |
| --------------------------- | ---------- | ---------- | ------------- |
| `TINYINT`                   | 1 字节     | 微整型     | 20            |
| `SMALLINT`                  | 2 字节     | 短整型     | 20            |
| `INT`                       | 4 字节     | 整型       | 20            |
| `BIGINT`                    | 8 字节     | 长整型     | 20            |
| `FLOAT`                     | 单精度     | 单精度浮点 | 3.14159       |
| `DOUBLE`                    | 双精度     | 双精度浮点 | 3.14159       |
| `DECIMAL(precision, scale)` | 高精度     | 精度为38位 | DECIMAL(12,2) |
| `NUMERIC`                   | 同 DECIMAL | Hive 3.0+  | NUMERIC(20,2) |

#### 3.1.2 布尔类型

```sql
BOOLEAN  -- true 或 false
```

#### 3.1.3 字符串类型

| 类型         | 说明                     | 示例          |
| ------------ | ------------------------ | ------------- |
| `STRING`     | 可变长字符串             | 'hello world' |
| `CHAR(n)`    | 定长字符串               | CHAR(10)      |
| `VARCHAR(n)` | 可变长字符串(有长度限制) | VARCHAR(100)  |

#### 3.1.4 日期时间类型

| 类型        | 格式     | 示例             |
| ----------- | -------- | ---------------- |
| `TIMESTAMP` | 时间戳   | 1327882394       |
| `DATE`      | 日期     | 2023-10-26       |
| `INTERVAL`  | 时间间隔 | INTERVAL '1' DAY |

#### 3.1.5 二进制类型

```sql
BINARY  -- 存储二进制数据
```

### 3.2 复杂数据类型

#### 3.2.1 ARRAY (数组)

**定义和使用:**

```sql
-- 定义: 存储相同类型的元素集合
ARRAY<STRING>

-- 示例数据
['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

-- 访问元素(索引从 0 开始)
array_column[0]  -- 结果: 'Monday'
array_column[2]  -- 结果: 'Wednesday'
```

**实际应用场景:**

- 存储一个用户的多个爱好
- 存储一篇文章的多个标签
- 存储员工的多个下属

#### 3.2.2 MAP (映射)

**定义和使用:**

```sql
-- 定义: Key-Value 键值对集合
MAP<STRING, STRING>

-- 示例数据
{'B':'Banana', 'W':'Watermelon'}

-- 访问元素
map_column['B']  -- 结果: 'Banana'
map_column['W']  -- 结果: 'Watermelon'
```

**实际应用场景:**

- 存储用户的扩展属性(age:30, city:北京)
- 存储商品的规格参数(color:红色, size:XL)

#### 3.2.3 STRUCT (结构体)

**定义和使用:**

```sql
-- 定义: 包含命名字段的结构
STRUCT<fruit: STRING, weight: INT>

-- 示例数据
{'Banana', 10}

-- 访问字段(使用点号)
struct_column.fruit   -- 结果: 'Banana'
struct_column.weight  -- 结果: 10
```

**实际应用场景:**

- 存储地址信息(省、市、区、详细地址)
- 存储联系方式(类型、号码、是否默认)

**类比理解:** STRUCT 类似 Java 的对象,有明确的字段名和类型

#### 3.2.4 UNIONTYPE (联合类型)

```sql
-- 定义: 可以存储多种类型之一
UNIONTYPE<data_type, data_type, ...>
```

**注意:** UNIONTYPE 在 Hive 0.7.0 引入,但使用受限,不支持 JOIN、WHERE、GROUP BY 等操作,实际应用较少。

### 3.3 类型转换

#### 3.3.1 隐式转换

Hive 支持从低精度向高精度自动转换:

```sql
TINYINT → SMALLINT → INT → BIGINT → FLOAT → DOUBLE
```

#### 3.3.2 显式转换

```sql
-- 使用 CAST 函数
CAST(value AS target_type)

-- 示例
CAST('123' AS INT)           -- 字符串转整数
CAST(3.14 AS STRING)         -- 浮点数转字符串
CAST('2023-10-26' AS DATE)  -- 字符串转日期
```

------

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

## 四、Hive 表操作

### 4.1 创建表

**完整语法:**

```sql
CREATE [TEMPORARY] [EXTERNAL] TABLE [IF NOT EXISTS] [db_name.]table_name
  [(col_name data_type [COMMENT col_comment], ...)]
  [COMMENT table_comment]
  [PARTITIONED BY (col_name data_type [COMMENT col_comment], ...)]
  [CLUSTERED BY (col_name, col_name, ...) 
   [SORTED BY (col_name [ASC|DESC], ...)] 
   INTO num_buckets BUCKETS]
  [ROW FORMAT row_format]
  [STORED AS file_format]
  [LOCATION hdfs_path];
```

**参数详解:**

| 参数             | 说明                                             |
| ---------------- | ------------------------------------------------ |
| `TEMPORARY`      | 临时表,会话结束后自动删除                        |
| `EXTERNAL`       | 外部表,删除表时不删除 HDFS 数据                  |
| `IF NOT EXISTS`  | 表已存在时不报错                                 |
| `PARTITIONED BY` | 分区表,按指定字段分区存储                        |
| `CLUSTERED BY`   | 分桶表,将数据分散到固定数量的文件                |
| `ROW FORMAT`     | 指定行格式,默认字段分隔符为 `\001`               |
| `STORED AS`      | 文件格式,如 TEXTFILE、SEQUENCEFILE、ORC、PARQUET |
| `LOCATION`       | 自定义 HDFS 存储路径                             |

### 4.2 表类型详解

#### 4.2.1 管理表(内部表)

**特点:**

- Hive 完全管理表的生命周期
- 数据存储在 warehouse 目录下
- **删除表时,元数据和数据文件都会被删除**

**创建示例:**

```sql
CREATE TABLE employees (
  name STRING COMMENT '员工姓名',
  age INT COMMENT '年龄',
  salary FLOAT COMMENT '薪资',
  department STRING COMMENT '部门',
  subordinates ARRAY<STRING> COMMENT '下属列表',
  deductions MAP<STRING, FLOAT> COMMENT '扣款明细'
)
COMMENT '员工信息表'
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t'
  COLLECTION ITEMS TERMINATED BY ','
  MAP KEYS TERMINATED BY ':'
STORED AS TEXTFILE;
```

**行格式说明:**

- `FIELDS TERMINATED BY '\t'`: 字段之间用 Tab 分隔
- `COLLECTION ITEMS TERMINATED BY ','`: 数组元素用逗号分隔
- `MAP KEYS TERMINATED BY ':'`: Map 的 Key-Value 用冒号分隔

**对应的数据文件格式:**

```
张三    30    8000.5    研发部    李四,王五    社保:500.0,公积金:800.0
```

#### 4.2.2 外部表

**特点:**

- Hive 只管理元数据,不管理数据文件
- 数据可以存储在任意 HDFS 路径
- **删除表时,只删除元数据,数据文件保留**

**使用场景:**

- 数据由其他系统生成和管理
- 多个 Hive 表共享同一份数据
- 需要保护原始数据不被误删

**创建示例:**

```sql
CREATE EXTERNAL TABLE employees_external (
  name STRING,
  age INT,
  salary FLOAT,
  department STRING
)
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION '/ext/employees/';
```

**管理表 vs 外部表对比:**

| 特性     | 管理表          | 外部表         |
| -------- | --------------- | -------------- |
| 数据管理 | Hive 完全管理   | 用户自行管理   |
| 存储位置 | warehouse 目录  | 任意 HDFS 路径 |
| 删除表   | 删除元数据+数据 | 只删除元数据   |
| 使用场景 | Hive 独占数据   | 数据共享/保护  |

### 4.3 分区表

#### 4.3.1 什么是分区?

**核心思想:** 将数据按照某个字段(如日期、地区)分目录存储,查询时只扫描相关分区,提升性能。

**HDFS 目录结构示例:**

```
/user/hive/warehouse/sales/
  ├── country=CN/
  │   ├── state=Beijing/
  │   └── state=Shanghai/
  └── country=US/
      ├── state=CA/
      └── state=NY/
```

#### 4.3.2 静态分区

**手动指定分区值:**

```sql
-- 创建分区表
CREATE TABLE employees_partition (
  name STRING,
  age INT,
  salary FLOAT
)
PARTITIONED BY (country STRING, state STRING)
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t';

-- 插入数据时指定分区
LOAD DATA LOCAL INPATH '/opt/data/cn_beijing.txt'
INTO TABLE employees_partition
PARTITION (country='CN', state='Beijing');

-- 查询特定分区
SELECT * FROM employees_partition
WHERE country='CN' AND state='Beijing';

-- 查看分区列表
SHOW PARTITIONS employees_partition;
```

#### 4.3.3 动态分区

**根据数据自动创建分区:**

```sql
-- 开启动态分区
SET hive.exec.dynamic.partition=true;
SET hive.exec.dynamic.partition.mode=nostrict;

-- 创建动态分区表
CREATE TABLE employees_partition_dynamic (
  name STRING,
  age INT,
  salary FLOAT
)
PARTITIONED BY (country STRING, state STRING);

-- 从其他表插入,自动创建分区
INSERT INTO TABLE employees_partition_dynamic 
PARTITION (country, state)
SELECT name, age, salary, country, state
FROM employees_source;
```

**动态分区参数:**

| 参数                                       | 说明                                                   | 默认值 |
| ------------------------------------------ | ------------------------------------------------------ | ------ |
| `hive.exec.dynamic.partition`              | 是否开启动态分区                                       | false  |
| `hive.exec.dynamic.partition.mode`         | strict 要求至少一个静态分区<br>nostrict 允许全动态分区 | strict |
| `hive.exec.max.dynamic.partitions`         | 最大动态分区数                                         | 1000   |
| `hive.exec.max.dynamic.partitions.pernode` | 每个节点最大动态分区数                                 | 100    |

**分区使用建议:**

- 分区字段选择基数适中的列(如日期、地区),避免过多小文件
- 不要对高基数字段分区(如用户 ID)
- 查询时务必添加分区过滤条件

### 4.4 分桶表

**分桶概念:** 将数据按照某个字段的 Hash 值分散到固定数量的文件(桶)中。

**与分区的区别:**

- 分区是按值划分目录
- 分桶是按 Hash 值分散文件

**使用场景:**

- 提高 JOIN 效率(桶连接)
- 抽样查询更高效
- 数据更均匀分布

**创建示例:**

```sql
CREATE TABLE employees_cluster (
  name STRING,
  age INT,
  salary FLOAT,
  department STRING
)
CLUSTERED BY (department) 
SORTED BY (age DESC)
INTO 3 BUCKETS
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t';
```

**说明:**

- `CLUSTERED BY (department)`: 按部门字段分桶
- `SORTED BY (age DESC)`: 每个桶内按年龄降序排序
- `INTO 3 BUCKETS`: 分成 3 个桶(文件)

**分桶后的文件:**

```
/user/hive/warehouse/employees_cluster/
  ├── 000000_0
  ├── 000001_0
  └── 000002_0
```

### 4.5 临时表

**特点:**

- 只在当前会话有效
- 会话结束自动删除
- 存储在 `/tmp/hive/用户名/` 目录

```sql
-- 创建临时表
CREATE TEMPORARY TABLE course_temp (
  id INT,
  name STRING
);

-- 退出 Hive 后表自动消失
```

### 4.6 查看表信息

```sql
-- 查看所有表
SHOW TABLES;

-- 模糊查询表
SHOW TABLES LIKE 'emp*';

-- 查看表结构(简略)
DESCRIBE employees;
DESC employees;

-- 查看表结构(详细)
DESCRIBE FORMATTED employees;
DESC FORMATTED employees;

-- 查看建表语句
SHOW CREATE TABLE employees;
```

### 4.7 修改表

#### 4.7.1 重命名表

```sql
ALTER TABLE old_table_name RENAME TO new_table_name;
```

**示例:**

```sql
-- 创建表
CREATE TABLE log_message (
  hms INT COMMENT '时分秒',
  severity STRING COMMENT '严重程度',
  server STRING COMMENT '服务器名',
  process_id INT COMMENT '进程ID',
  message STRING COMMENT '日志内容'
)
PARTITIONED BY (year INT, month INT)
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t';

-- 重命名
ALTER TABLE log_message RENAME TO log_message_new;

-- 验证
SHOW TABLES;
```

**注意:** 重命名表不会移动 HDFS 数据,只是修改元数据中的表名和目录名。

#### 4.7.2 添加分区

```sql
-- 添加单个分区
ALTER TABLE log_message_new 
ADD PARTITION (year=2022, month=1) 
LOCATION '/user/hive/warehouse/testdb.db/log_message/2022/01';

-- 添加多个分区
ALTER TABLE log_message_new 
ADD PARTITION (year=2022, month=2)
    PARTITION (year=2022, month=3);
```

#### 4.7.3 删除分区

```sql
ALTER TABLE log_message_new 
DROP IF EXISTS PARTITION (year=2022, month=1);
```

### 4.8 删除表

```sql
-- 删除表(带判断)
DROP TABLE IF EXISTS table_name;

-- 直接删除
DROP TABLE table_name;
```

------

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

## 五、数据加载实战

### 5.1 LOAD 命令

**语法:**

```sql
LOAD DATA [LOCAL] INPATH 'filepath'
[OVERWRITE] INTO TABLE tablename
[PARTITION (partcol1=val1, partcol2=val2 ...)];
```

**参数说明:**

| 参数        | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| `LOCAL`     | 加 LOCAL: 从 Linux 本地文件系统加载<br>不加 LOCAL: 从 HDFS 加载 |
| `INPATH`    | 文件路径(绝对路径)                                           |
| `OVERWRITE` | 加 OVERWRITE: 覆盖表中已有数据<br>不加: 追加数据             |
| `PARTITION` | 加载到指定分区                                               |

**LOAD 的本质:** 移动或复制文件,不做数据转换

- `LOCAL`: 复制文件到 HDFS
- 非 `LOCAL`: 移动 HDFS 文件(原路径文件消失)

### 5.2 实战演练

#### 5.2.1 从本地加载

**准备数据文件 `/opt/course.txt`:**

```
1	数学
2	英语
3	物理
```

**创建表并加载:**

```sql
-- 创建表
CREATE TABLE course (
  id INT,
  name STRING
)
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY '\t';

-- 从本地加载
LOAD DATA LOCAL INPATH '/opt/course.txt' 
INTO TABLE course;

-- 验证数据
SELECT * FROM course;
```

#### 5.2.2 从 HDFS 加载

**先将文件上传到 HDFS:**

```bash
# 在 Linux 终端执行
hdfs dfs -mkdir -p /course
hdfs dfs -put /opt/course.txt /course/
```

**加载数据:**

```sql
-- 从 HDFS 加载(文件会被移动)
LOAD DATA INPATH '/course/course.txt' 
INTO TABLE course;
```

**验证:** 加载后 `/course/course.txt` 文件会消失,数据移动到表目录 `/user/hive/warehouse/testdb.db/course/`

#### 5.2.3 覆盖加载

```sql
-- 覆盖表中所有数据
LOAD DATA LOCAL INPATH '/opt/course_new.txt' 
OVERWRITE INTO TABLE course;
```

### 5.3 其他数据导入方式

#### 5.3.1 INSERT 插入

```sql
-- 从查询结果插入
INSERT INTO TABLE target_table
SELECT * FROM source_table WHERE condition;

-- 多表插入
FROM source_table
INSERT INTO TABLE table1 SELECT col1, col2 WHERE condition1
INSERT INTO TABLE table2 SELECT col3, col4 WHERE condition2;
```

#### 5.3.2 CREATE TABLE AS SELECT (CTAS)

```sql
-- 根据查询结果创建表并插入数据
CREATE TABLE new_table AS
SELECT col1, col2, col3
FROM old_table
WHERE condition;
```

#### 5.3.3 通过 Sqoop 导入

```bash
# 从 MySQL 导入到 Hive
sqoop import \
  --connect jdbc:mysql://localhost:3306/db_name \
  --username root \
  --password 123456 \
  --table mysql_table \
  --hive-import \
  --hive-table hive_table \
  --m 1
```

------

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

## 六、综合案例:广电用户数据分析

### 6.1 案例背景

某广电公司有 5 张核心业务表,需要导入 Hive 进行分析:

1. **用户基本信息表** (mediamatch_usermsg)
2. **用户事件表** (mediamatch_userevent)
3. **用户账单表** (mmconsume_billevents)
4. **订单信息表** (order_index)
5. **媒体索引表** (media_index)

### 6.2 数据准备

#### 6.2.1 数据文件说明

**1. mediamatch_usermsg.csv (用户信息表)**

时间范围: 1995年1月 - 2022年6月

| 字段        | 类型   | 说明       |
| ----------- | ------ | ---------- |
| terminal_no | STRING | 终端编号   |
| phone_no    | STRING | 手机号     |
| sm_name     | STRING | 姓名       |
| run_name    | STRING | 运营商名称 |
| sm_code     | STRING | 编码       |
| owner_name  | STRING | 所有者名称 |
| owner_code  | STRING | 所有者编码 |
| run_time    | STRING | 运营时间   |
| address     | STRING | 地址       |
| force       | STRING | 强制标识   |
| open_time   | STRING | 开通时间   |

**2. mediamatch_userevent.csv (用户事件表)**

| 字段       | 说明       |
| ---------- | ---------- |
| sum_name   | 汇总名称   |
| run_name   | 运营商名称 |
| run_time   | 运营时间   |
| owner_name | 所有者名称 |
| owner_code | 所有者编码 |
| open_time  | 开通时间   |

**3. mmconsume_billevents.csv (账单表)**

| 字段        | 说明                            |
| ----------- | ------------------------------- |
| terminal_no | 终端编号                        |
| phone_no    | 手机号                          |
| fee_code    | 费用编码                        |
| year_month  | 年月                            |
| owner_name  | 所有者名称                      |
| owner_code  | 所有者编码                      |
| sm_name     | 姓名                            |
| should_pay  | 应付金额                        |
| favour_fee  | 优惠金额(正数为优惠,负数为补缴) |

**4. order_index.csv (订单表)**

| 字段          | 说明         |
| ------------- | ------------ |
| phone_no      | 手机号       |
| owner_name    | 所有者名称   |
| optdate       | 操作日期     |
| prodname      | 产品名称     |
| sm_name       | 姓名         |
| offerid       | 优惠ID       |
| offername     | 优惠名称     |
| business_name | 业务名称     |
| owner_code    | 所有者编码   |
| prodprcid     | 产品价格ID   |
| prodprcname   | 产品价格名称 |
| effdate       | 生效日期     |
| expdate       | 失效日期     |
| orderdate     | 订单日期     |
| cost          | 费用         |
| mode_time     | 修改时间     |
| prodstatus    | 产品状态     |
| run_name      | 运营商名称   |
| orderno       | 订单号       |
| offertype     | 优惠类型     |

**5. media_index.csv (媒体索引表)**

| 字段          | 说明                        |
| ------------- | --------------------------- |
| terminal_no   | 终端编号                    |
| phone_no      | 手机号                      |
| duration      | 时长(秒)                    |
| station_name  | 频道名称                    |
| origin_time   | 开始时间                    |
| end_time      | 结束时间                    |
| owner_code    | 所有者编码                  |
| owner_name    | 所有者名称                  |
| vod_cat_tags  | 点播分类标签                |
| resolution    | 分辨率                      |
| audio_lang    | 音频语言                    |
| region        | 地区                        |
| res_name      | 资源名称                    |
| res_type      | 资源类型(0:直播,1:点播回看) |
| vod_title     | 点播标题                    |
| category_name | 分类名称                    |
| program_title | 节目标题                    |
| sm_name       | 姓名                        |

#### 6.2.2 数据上传

**在 Linux 服务器操作:**

```bash
# 1. 创建数据目录
mkdir -p /opt/data

# 2. 使用 Xftp 或 scp 上传 5 个 CSV 文件到 /opt/data

# 3. 删除 CSV 文件头(第一行)
cd /opt/data
sed -i '1d' mediamatch_usermsg.csv
sed -i '1d' mediamatch_userevent.csv
sed -i '1d' mmconsume_billevents.csv
sed -i '1d' order_index.csv
sed -i '1d' media_index.csv
# 4. 验证文件
head -5 mediamatch_usermsg.csv
```

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

### 6.3 建表导入

#### 6.3.1 创建数据库

```sql
-- 创建广电数据库
CREATE DATABASE IF NOT EXISTS broadcast_db
COMMENT '广电用户数据仓库';

-- 切换数据库
USE broadcast_db;
```

#### 6.3.2 创建用户信息表

```sql
CREATE TABLE mediamatch_usermsg (
  terminal_no STRING COMMENT '终端编号',
  phone_no STRING COMMENT '手机号',
  sm_name STRING COMMENT '姓名',
  run_name STRING COMMENT '运营商名称',
  sm_code STRING COMMENT '编码',
  owner_name STRING COMMENT '所有者名称',
  owner_code STRING COMMENT '所有者编码',
  run_time STRING COMMENT '运营时间',
  address STRING COMMENT '地址',
  force STRING COMMENT '强制标识',
  open_time STRING COMMENT '开通时间'
)
COMMENT '用户基本信息表'
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

-- 加载数据
LOAD DATA LOCAL INPATH '/opt/data/mediamatch_usermsg.csv'
INTO TABLE mediamatch_usermsg;

-- 验证数据
SELECT COUNT(*) FROM mediamatch_usermsg;
SELECT * FROM mediamatch_usermsg LIMIT 10;
```

#### 6.3.3 创建用户事件表

```sql
CREATE TABLE mediamatch_userevent (
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

LOAD DATA LOCAL INPATH '/opt/data/mediamatch_userevent.csv'
INTO TABLE mediamatch_userevent;
```

#### 6.3.4 创建账单表

```sql
CREATE TABLE mmconsume_billevents (
  terminal_no STRING COMMENT '终端编号',
  phone_no STRING COMMENT '手机号',
  fee_code STRING COMMENT '费用编码',
  year_month STRING COMMENT '年月',
  owner_name STRING COMMENT '所有者名称',
  owner_code STRING COMMENT '所有者编码',
  sm_name STRING COMMENT '姓名',
  should_pay DOUBLE COMMENT '应付金额',
  favour_fee DOUBLE COMMENT '优惠金额'
)
COMMENT '用户账单表'
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

LOAD DATA LOCAL INPATH '/opt/data/mmconsume_billevents.csv'
INTO TABLE mmconsume_billevents;
```

#### 6.3.5 创建订单表

```sql
CREATE TABLE order_index (
  phone_no STRING COMMENT '手机号',
  owner_name STRING COMMENT '所有者名称',
  optdate STRING COMMENT '操作日期',
  prodname STRING COMMENT '产品名称',
  sm_name STRING COMMENT '姓名',
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
  mode_time STRING COMMENT '修改时间',
  prodstatus STRING COMMENT '产品状态',
  run_name STRING COMMENT '运营商名称',
  orderno STRING COMMENT '订单号',
  offertype STRING COMMENT '优惠类型'
)
COMMENT '订单信息表'
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

LOAD DATA LOCAL INPATH '/opt/data/order_index.csv'
INTO TABLE order_index;
```

#### 6.3.6 创建媒体索引表

```sql
CREATE TABLE media_index (
  terminal_no STRING COMMENT '终端编号',
  phone_no STRING COMMENT '手机号',
  duration INT COMMENT '时长(秒)',
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
  res_type STRING COMMENT '资源类型(0:直播,1:点播)',
  vod_title STRING COMMENT '点播标题',
  category_name STRING COMMENT '分类名称',
  program_title STRING COMMENT '节目标题',
  sm_name STRING COMMENT '姓名'
)
COMMENT '媒体索引表'
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

LOAD DATA LOCAL INPATH '/opt/data/media_index.csv'
INTO TABLE media_index;
```

### 6.4 数据分析示例

#### 6.4.1 基础统计

```sql
-- 查询用户总数
SELECT COUNT(DISTINCT phone_no) AS user_count
FROM mediamatch_usermsg;

-- 查询各运营商用户分布
SELECT run_name, COUNT(*) AS cnt
FROM mediamatch_usermsg
GROUP BY run_name
ORDER BY cnt DESC;

-- 查询 2022 年账单总额
SELECT 
  year_month,
  SUM(should_pay) AS total_should_pay,
  SUM(favour_fee) AS total_favour
FROM mmconsume_billevents
WHERE year_month LIKE '2022%'
GROUP BY year_month
ORDER BY year_month;
```

#### 6.4.2 用户行为分析

```sql
-- 用户观看时长 TOP10
SELECT 
  phone_no,
  SUM(duration) / 3600.0 AS total_hours
FROM media_index
GROUP BY phone_no
ORDER BY total_hours DESC
LIMIT 10;

-- 热门节目 TOP20
SELECT 
  program_title,
  COUNT(*) AS view_count,
  SUM(duration) / 3600.0 AS total_hours
FROM media_index
WHERE program_title IS NOT NULL
GROUP BY program_title
ORDER BY view_count DESC
LIMIT 20;
```

#### 6.4.3 关联查询

```sql
-- 用户消费与观看关联分析
SELECT 
  u.phone_no,
  u.sm_name,
  SUM(b.should_pay) AS total_pay,
  SUM(m.duration) / 3600.0 AS total_watch_hours
FROM mediamatch_usermsg u
LEFT JOIN mmconsume_billevents b ON u.phone_no = b.phone_no
LEFT JOIN media_index m ON u.phone_no = m.phone_no
GROUP BY u.phone_no, u.sm_name
HAVING total_pay > 0
ORDER BY total_pay DESC
LIMIT 100;
```

------

## 七、学习建议

### 7.1 学习路径

1. **熟悉 SQL 基础** → 掌握 SELECT、JOIN、聚合函数
2. **理解 Hive 与 SQL 的差异** → MapReduce 执行模型、分区分桶
3. **动手实践** → 自己创建表、导入数据、写查询
4. **性能优化** → 分区裁剪、列裁剪、谓词下推、JOIN 优化
5. **进阶主题** → UDF 开发、Hive on Tez/Spark、ORC/Parquet 格式

### 7.2 常见问题

**Q1: Hive 查询为什么这么慢?**

A: Hive 是批处理系统,不适合实时查询。底层 MapReduce 任务启动慢,小数据查询也要走完整流程。

**Q2: 什么时候用管理表,什么时候用外部表?**

A:

- 管理表: Hive 独占数据,可随意删除
- 外部表: 数据共享或需保护,如日志原始数据

**Q3: 分区和分桶怎么选择?**

A:

- 分区: 按时间、地区等低基数字段,便于查询过滤
- 分桶: 配合抽样查询和桶连接,提升性能

**Q4: 数据加载失败怎么办?**

A: 检查:

1. 文件分隔符与表定义是否一致
2. 字段数量是否匹配
3. 文件编码是否为 UTF-8
4. HDFS 权限是否足够

### 7.3 实用技巧

#### 7.3.1 查看执行计划

```sql
EXPLAIN 
SELECT * FROM employees WHERE age > 30;
```

#### 7.3.2 设置常用参数

```sql
-- 显示列名
SET hive.cli.print.header=true;

-- 显示当前数据库
SET hive.cli.print.current.db=true;

-- 本地模式(小数据)
SET hive.exec.mode.local.auto=true;

-- 开启动态分区
SET hive.exec.dynamic.partition=true;
SET hive.exec.dynamic.partition.mode=nostrict;
```

#### 7.3.3 导出查询结果

```sql
-- 导出到本地文件
INSERT OVERWRITE LOCAL DIRECTORY '/tmp/output'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
SELECT * FROM employees;

-- 导出到 HDFS
INSERT OVERWRITE DIRECTORY '/output/employees'
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
SELECT * FROM employees;
```

------

## 八、总结

Hive 是大数据生态中的数据仓库核心组件,掌握 Hive 需要:

1. **理解架构**: 元数据与数据分离、MapReduce 执行引擎
2. **熟练 HQL**: 类 SQL 语法,但有特殊语法(分区、分桶、LATERAL VIEW 等)
3. **优化意识**: 合理使用分区分桶、避免小文件、选择合适文件格式
4. **实践为王**: 多动手建表、导数据、写查询

**Happy Querying! 🚀**

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

# 四、简单查询

## 4.1 查询广电用户的用户编号及开户时间





## 4.2 查询指定用户状态的用户基本信息





## 4.3 统计用户基本信息表中品牌名称的种类个数





## 4.4 统计不同客户等级名称的数据记录数





# 五、进阶查询

## 5.1 统计订单的消费类型





## 5.2 统计用户每年消费应付总额





## 5.3 统计用户每月消费应付总额



## 5.4 统计用户每月实际账单金额



## 5.5 查询用户宽带订单的地址数据





## 5.6 抽样统计用户订购产品情况





# 六、查询优化

## 6.1 使用视图统计不同节目的用户观看人数



## 6.2 优化统计直播频道数



## 6.3使用子查询统计节目类型为直播的频道Top10

<p style="position: fixed; 
          top: 300px; 
          left: 100px; 
          transform: rotate(-30deg); 
          font-size: 50px; 
          color: rgba(0, 0, 0, 0.05); 
          z-index: 9999; 
          pointer-events: none;">
    卫哥上课笔记 / 内部资料
</p>

# 七、数据清洗及导出

## 7.1 清洗无效用户数据



## 7.2 清洗无效收视行为数据



## 7.3清洗无效账单和订单数据



## 7.4导出处理结果至Linux本地和HDFS





# 八、Hive远程与程序开发

## 8.1 配置Hive远程服务

## 8.2 搭建Hive远程连接环境

## 8.3 编写程序实现广电数据的存储

## 8.4 编写程序实现广电数据的查询与处理



<div style="
text-align: center;
font-size: 13px;
color: #999;
margin-top: 20px;
">
© 2026 卫の课程教学资料  
<br>
仅限学员学习使用，禁止任何形式传播
</div>



<div style="background-color: #f3f4f6; 
            border-left: 5px solid #3b82f6; 
            padding: 10px; 
            margin-bottom: 20px; 
            font-size: 13px; 
            color: #6b7280;">
    📢 <b>版权声明：</b>本文首发于 [https://zhangwei.gitbook.io]，禁止非法爬取或转载。
    验证指纹 ID：GB-2026-0109
</div>