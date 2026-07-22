下面给你一篇**偏实操、适合教学与自学的 HBase 入门教程**，难度控制在**高职 / 初学者友好**，同时也具备一定工程视角，方便你直接拿去当**学习教程、教学讲义或实验指导书**使用。

------

# HBase 实战入门教程

**——从原理到部署，再到基本操作**

## 一、HBase 是什么？

### 1. HBase 简介

HBase 是一个**分布式、面向列的 NoSQL 数据库**，构建在 Hadoop HDFS 之上，适合存储**海量、稀疏、结构灵活的数据**。

它的典型特点是：

- 海量数据（TB / PB 级）
- 高并发读写
- 支持随机实时访问
- 列式存储、数据结构灵活

📌 **一句话理解**：

> HBase = Hadoop 生态中的“超大规模数据库”

------

### 2. HBase 的典型应用场景

| 场景     | 说明               |
| -------- | ------------------ |
| 用户画像 | 行为数据、标签数据 |
| 日志存储 | 访问日志、设备日志 |
| 消息系统 | 时间序列数据       |
| 风控系统 | 交易明细、轨迹数据 |

❌ **不适合**：

- 强事务（如银行核心账务）
- 复杂 SQL 联表查询

------

## 二、HBase 核心概念（重点）

### 1. HBase 数据模型

HBase 表由以下几个核心元素组成：

```
RowKey + Column Family + Column + Timestamp + Value
```

### 2. 逻辑结构示意

```
表（Table）
 ├── 行（Row）
 │    ├── RowKey
 │    ├── 列族 cf1
 │    │     ├── name
 │    │     └── age
 │    └── 列族 cf2
 │          └── address
```

### 3. 关键概念解释

#### （1）RowKey（行键）

- 每一行的**唯一标识**
- 决定数据存储顺序（字典序）
- ⚠️ 设计非常重要，直接影响性能

**示例**：

```
user_000001
```

------

#### （2）Column Family（列族）

- HBase 表创建时必须指定
- 物理存储单位
- 一般 1～3 个即可

```
info
detail
```

------

#### （3）Column（列）

- 动态添加
- 不需要提前定义

```
info:name
info:age
```

------

#### （4）Timestamp（时间戳）

- HBase 自动维护
- 支持数据多版本

------

## 三、HBase 架构原理（理解即可）

### 1. 架构组成

```
Client
   |
HMaster —— 管理 Region、表结构
   |
RegionServer —— 实际存储数据
   |
HDFS
```

### 2. 核心组件说明

| 组件         | 作用                |
| ------------ | ------------------- |
| HMaster      | 表管理、Region 分配 |
| RegionServer | 读写数据            |
| Region       | 表的一个分片        |
| ZooKeeper    | 协调服务            |

📌 **重点理解**：

> HBase 本身不存数据，数据最终存储在 HDFS 中

------

## 四、HBase 单机环境部署（实操）

### 1. 环境准备

- Linux（CentOS / Ubuntu）
- JDK 8
- Hadoop 已部署
- ZooKeeper（可使用 HBase 内置）

------

### 2. 解压 HBase

```bash
tar -zxvf hbase-2.4.17-bin.tar.gz
mv hbase-2.4.17 /usr/local/hbase
```

------

### 3. 配置 `hbase-env.sh`

```bash
vi conf/hbase-env.sh
export JAVA_HOME=/usr/java/jdk1.8.0
```

------

### 4. 配置 `hbase-site.xml`

```xml
<configuration>
  <property>
    <name>hbase.rootdir</name>
    <value>hdfs://localhost:9000/hbase</value>
  </property>

  <property>
    <name>hbase.cluster.distributed</name>
    <value>false</value>
  </property>
</configuration>
```

------

### 5. 启动 HBase

```bash
start-hbase.sh
```

验证：

```bash
jps
```

看到：

```
HMaster
HRegionServer
```

说明启动成功 ✅

------

## 五、HBase Shell 常用命令（重点实操）

### 1. 进入 HBase Shell

```bash
hbase shell
```

------

### 2. 创建表

```bash
create 'student', 'info'
```

------

### 3. 查看表

```bash
list
```

------

### 4. 插入数据

```bash
put 'student', '1001', 'info:name', 'Tom'
put 'student', '1001', 'info:age', '18'
```

------

### 5. 查询数据

#### 查询整行

```bash
get 'student', '1001'
```

#### 查询某一列

```bash
get 'student', '1001', 'info:name'
```

------

### 6. 扫描表

```bash
scan 'student'
```

限制条数：

```bash
scan 'student', {LIMIT => 5}
```

------

### 7. 删除数据

```bash
delete 'student', '1001', 'info:age'
```

删除整行：

```bash
deleteall 'student', '1001'
```

------

### 8. 删除表

```bash
disable 'student'
drop 'student'
```

------

## 六、Java API 操作 HBase（入门）

### 1. Maven 依赖

```xml
<dependency>
  <groupId>org.apache.hbase</groupId>
  <artifactId>hbase-client</artifactId>
  <version>2.4.17</version>
</dependency>
```

------

### 2. 创建连接

```java
Configuration conf = HBaseConfiguration.create();
Connection conn = ConnectionFactory.createConnection(conf);
Table table = conn.getTable(TableName.valueOf("student"));
```

------

### 3. 插入数据

```java
Put put = new Put(Bytes.toBytes("1002"));
put.addColumn(Bytes.toBytes("info"), Bytes.toBytes("name"), Bytes.toBytes("Lucy"));
table.put(put);
```

------

### 4. 查询数据

```java
Get get = new Get(Bytes.toBytes("1002"));
Result result = table.get(get);
byte[] value = result.getValue(Bytes.toBytes("info"), Bytes.toBytes("name"));
System.out.println(Bytes.toString(value));
```

------

## 七、RowKey 设计原则（非常重要）

### 1. 常见问题

❌ RowKey 递增 → 数据热点
❌ 业务字段过长 → 性能差

------

### 2. 常用设计方式

| 方式     | 示例                |
| -------- | ------------------- |
| 加盐     | hash(userId)_userId |
| 反转     | reverse(time)       |
| 前缀分区 | 01_userId           |

📌 **口诀**：

> 均匀、短小、有序但不递增

------

## 八、HBase 学习总结

### 核心记住 5 点：

1️⃣ HBase 是 **列式 NoSQL 数据库**
2️⃣ RowKey 设计 = 性能关键
3️⃣ 列族必须提前建
4️⃣ 适合海量数据，不适合复杂 SQL
5️⃣ 与 Hadoop、Hive 配合使用效果最佳

------

如果你愿意，我可以继续帮你：

- ✅ 出一套 **HBase 实训实验指导书**
- ✅ 写 **HBase + Hive 综合实训案例**
- ✅ 出 **HBase 期末考试题（简单版）**
- ✅ 按 **高职教学标准**改成《HBase 教学讲义》

你可以直接告诉我用途即可 👍