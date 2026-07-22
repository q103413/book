# HBase 完全教程

## 1. HBase 简介

HBase 是一个开源的、分布式的、面向列的 NoSQL 数据库,构建在 Hadoop 之上。它模仿了 Google 的 Bigtable 设计,适合存储大规模稀疏数据集。

**核心特点:**

- 线性可扩展,支持 PB 级数据存储
- 强一致性的读写操作
- 自动分片和负载均衡
- 支持数十亿行、百万列的表
- 适合实时随机读写访问

**典型应用场景:**

- 时序数据存储(如日志、监控数据)
- 消息系统
- 推荐系统的特征存储
- 内容管理系统

## 2. HBase 数据模型

HBase 的数据模型与传统关系型数据库有很大不同,理解它是使用 HBase 的关键。

### 2.1 基本概念

**表(Table):** 数据的集合,由行和列族组成。

**行键(Row Key):** 表中每一行的唯一标识,类似主键。数据按照行键的字典序排序存储。行键的设计对查询性能至关重要。

**列族(Column Family):** 列的集合,必须在建表时定义。所有列族成员有相同的前缀,如 info:name、info:age 都属于 info 列族。

**列限定符(Column Qualifier):** 列族中的具体列,可以动态添加。

**时间戳(Timestamp):** 每个单元格可以保存同一数据的多个版本,通过时间戳区分。

**单元格(Cell):** 由 {行键, 列族, 列限定符, 时间戳} 唯一确定,存储具体的值。

### 2.2 数据模型示例

```
Row Key: user001
  Column Family: info
    info:name -> "张三" (timestamp: 1234567890)
    info:age -> "28" (timestamp: 1234567890)
  Column Family: contact
    contact:email -> "zhangsan@example.com"
    contact:phone -> "13800138000"
```

## 3. HBase 架构

### 3.1 核心组件

**HMaster:** 管理节点,负责表的创建、删除、Region 分配等元数据操作。

**RegionServer:** 数据节点,负责服务和管理 Region,处理客户端的读写请求。

**Region:** 表的水平切片,按行键范围分割。当 Region 过大时会自动分裂。

**ZooKeeper:** 提供分布式协调服务,存储集群状态、HMaster 选举等。

**HDFS:** 底层存储系统,存储 HBase 的实际数据文件(HFile)。

### 3.2 数据写入流程

1. 客户端从 ZooKeeper 获取 Meta 表位置
2. 从 Meta 表获取目标 Region 所在的 RegionServer
3. 数据先写入 WAL(预写日志)保证持久性
4. 数据写入 MemStore(内存缓存)
5. 当 MemStore 达到阈值时,刷写到 HDFS 形成 HFile
6. 定期进行 Compaction 合并小文件

## 4. 安装与配置

### 4.1 单机模式安装

```bash
# 下载 HBase
wget https://downloads.apache.org/hbase/2.5.5/hbase-2.5.5-bin.tar.gz
tar -zxvf hbase-2.5.5-bin.tar.gz
cd hbase-2.5.5

# 配置 hbase-site.xml
cat > conf/hbase-site.xml << EOF
<configuration>
  <property>
    <name>hbase.rootdir</name>
    <value>file:///home/user/hbase</value>
  </property>
  <property>
    <name>hbase.zookeeper.property.dataDir</name>
    <value>/home/user/zookeeper</value>
  </property>
</configuration>
EOF

# 启动 HBase
bin/start-hbase.sh
```

### 4.2 伪分布式配置

```xml
<!-- hbase-site.xml -->
<configuration>
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value>
  </property>
  <property>
    <name>hbase.rootdir</name>
    <value>hdfs://localhost:9000/hbase</value>
  </property>
</configuration>
```

## 5. Shell 操作

### 5.1 表操作

```bash
# 启动 HBase Shell
hbase shell

# 创建表
create 'user', 'info', 'contact'

# 查看所有表
list

# 查看表结构
describe 'user'

# 禁用表
disable 'user'

# 启用表
enable 'user'

# 删除表(需先禁用)
disable 'user'
drop 'user'

# 修改表(添加列族)
alter 'user', 'address'

# 删除列族
alter 'user', {NAME => 'address', METHOD => 'delete'}
```

### 5.2 数据操作

```bash
# 插入数据
put 'user', 'user001', 'info:name', '张三'
put 'user', 'user001', 'info:age', '28'
put 'user', 'user001', 'contact:email', 'zhangsan@example.com'

# 查询单行
get 'user', 'user001'

# 查询指定列族
get 'user', 'user001', 'info'

# 查询指定列
get 'user', 'user001', 'info:name'

# 扫描全表
scan 'user'

# 带条件扫描
scan 'user', {STARTROW => 'user001', ENDROW => 'user999'}

# 限制返回行数
scan 'user', {LIMIT => 10}

# 删除某列
delete 'user', 'user001', 'info:age'

# 删除整行
deleteall 'user', 'user001'

# 计数
count 'user'

# 清空表
truncate 'user'
```

## 6. Java API 编程

### 6.1 Maven 依赖

```xml
<dependency>
    <groupId>org.apache.hbase</groupId>
    <artifactId>hbase-client</artifactId>
    <version>2.5.5</version>
</dependency>
```

### 6.2 基本操作代码

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.*;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.hbase.util.Bytes;

public class HBaseExample {
    
    private static Connection connection;
    
    // 初始化连接
    public static void init() throws Exception {
        Configuration config = HBaseConfiguration.create();
        config.set("hbase.zookeeper.quorum", "localhost");
        config.set("hbase.zookeeper.property.clientPort", "2181");
        connection = ConnectionFactory.createConnection(config);
    }
    
    // 创建表
    public static void createTable(String tableName, String... columnFamilies) 
            throws Exception {
        Admin admin = connection.getAdmin();
        TableName table = TableName.valueOf(tableName);
        
        if (admin.tableExists(table)) {
            System.out.println("表已存在");
            return;
        }
        
        TableDescriptorBuilder builder = TableDescriptorBuilder.newBuilder(table);
        for (String cf : columnFamilies) {
            builder.setColumnFamily(
                ColumnFamilyDescriptorBuilder.of(cf)
            );
        }
        
        admin.createTable(builder.build());
        System.out.println("表创建成功");
        admin.close();
    }
    
    // 插入数据
    public static void putData(String tableName, String rowKey, 
            String family, String qualifier, String value) throws Exception {
        Table table = connection.getTable(TableName.valueOf(tableName));
        
        Put put = new Put(Bytes.toBytes(rowKey));
        put.addColumn(
            Bytes.toBytes(family),
            Bytes.toBytes(qualifier),
            Bytes.toBytes(value)
        );
        
        table.put(put);
        table.close();
    }
    
    // 查询数据
    public static void getData(String tableName, String rowKey) 
            throws Exception {
        Table table = connection.getTable(TableName.valueOf(tableName));
        
        Get get = new Get(Bytes.toBytes(rowKey));
        Result result = table.get(get);
        
        for (Cell cell : result.rawCells()) {
            System.out.println("Row: " + Bytes.toString(CellUtil.cloneRow(cell)));
            System.out.println("Family: " + Bytes.toString(CellUtil.cloneFamily(cell)));
            System.out.println("Qualifier: " + Bytes.toString(CellUtil.cloneQualifier(cell)));
            System.out.println("Value: " + Bytes.toString(CellUtil.cloneValue(cell)));
        }
        
        table.close();
    }
    
    // 扫描数据
    public static void scanData(String tableName) throws Exception {
        Table table = connection.getTable(TableName.valueOf(tableName));
        
        Scan scan = new Scan();
        ResultScanner scanner = table.getScanner(scan);
        
        for (Result result : scanner) {
            for (Cell cell : result.rawCells()) {
                System.out.println("Row: " + Bytes.toString(CellUtil.cloneRow(cell)) +
                    " Value: " + Bytes.toString(CellUtil.cloneValue(cell)));
            }
        }
        
        scanner.close();
        table.close();
    }
    
    // 删除数据
    public static void deleteData(String tableName, String rowKey) 
            throws Exception {
        Table table = connection.getTable(TableName.valueOf(tableName));
        
        Delete delete = new Delete(Bytes.toBytes(rowKey));
        table.delete(delete);
        
        table.close();
    }
    
    // 关闭连接
    public static void close() throws Exception {
        if (connection != null) {
            connection.close();
        }
    }
    
    public static void main(String[] args) throws Exception {
        init();
        
        // 创建表
        createTable("user", "info", "contact");
        
        // 插入数据
        putData("user", "user001", "info", "name", "张三");
        putData("user", "user001", "info", "age", "28");
        
        // 查询数据
        getData("user", "user001");
        
        // 扫描表
        scanData("user");
        
        close();
    }
}
```

## 7. 高级特性

### 7.1 过滤器

HBase 提供了丰富的过滤器用于精确查询:

```java
// 行键前缀过滤
Scan scan = new Scan();
Filter filter = new PrefixFilter(Bytes.toBytes("user"));
scan.setFilter(filter);

// 单列值过滤
SingleColumnValueFilter valueFilter = new SingleColumnValueFilter(
    Bytes.toBytes("info"),
    Bytes.toBytes("age"),
    CompareOperator.GREATER,
    Bytes.toBytes("25")
);
scan.setFilter(valueFilter);

// 组合过滤器
FilterList filterList = new FilterList(FilterList.Operator.MUST_PASS_ALL);
filterList.addFilter(filter1);
filterList.addFilter(filter2);
scan.setFilter(filterList);
```

### 7.2 协处理器

协处理器类似于数据库的触发器和存储过程,分为 Observer(观察者)和 Endpoint(终点)两种。

```java
// Observer 示例:在数据写入前进行验证
public class ValidationObserver extends BaseRegionObserver {
    @Override
    public void prePut(ObserverContext<RegionCoprocessorEnvironment> e,
                       Put put, WALEdit edit, Durability durability) 
            throws IOException {
        // 自定义验证逻辑
        if (!isValid(put)) {
            throw new IOException("数据验证失败");
        }
    }
}
```

## 8. Row Key 设计最佳实践

Row Key 设计是 HBase 性能的关键,以下是一些建议:

### 8.1 避免热点问题

**问题:** 如果使用递增的序列号或时间戳作为 Row Key 前缀,会导致所有写入集中在一个 Region,造成热点。

**解决方案:**

- 加盐(Salting): 在 Row Key 前添加随机前缀,如 `hash(rowkey)%10 + rowkey`
- 反转时间戳: 使用 `Long.MAX_VALUE - timestamp`
- 哈希散列: 对业务 ID 进行哈希

### 8.2 设计原则

```java
// 不好的设计
rowKey = timestamp + userId  // 会造成热点

// 好的设计
rowKey = hash(userId) % 100 + timestamp + userId  // 加盐分散

// 时序数据反转
rowKey = userId + (Long.MAX_VALUE - timestamp)  // 最新数据在前
```

### 8.3 长度控制

Row Key 会在每个 Cell 中重复存储,应尽量简短,建议不超过 100 字节。

## 9. 性能优化

### 9.1 写入优化

- 批量写入: 使用 `Table.put(List<Put>)` 而非逐条写入
- 禁用 WAL: 对可丢失的数据可以禁用 WAL 提升性能
- 预分区: 建表时预先分配 Region,避免频繁分裂

```java
// 批量写入
List<Put> puts = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    Put put = new Put(Bytes.toBytes("row" + i));
    put.addColumn(Bytes.toBytes("cf"), Bytes.toBytes("col"), Bytes.toBytes("value"));
    puts.add(put);
}
table.put(puts);

// 创建预分区表
byte[][] splits = new byte[9][];
for (int i = 1; i < 10; i++) {
    splits[i-1] = Bytes.toBytes(String.format("%02d", i));
}
admin.createTable(tableDescriptor, splits);
```

### 9.2 读取优化

- 设置合理的缓存大小
- 使用 Bloom Filter 减少磁盘 IO
- 指定需要的列族和列,避免读取全部数据

```java
// 设置扫描缓存
Scan scan = new Scan();
scan.setCaching(100);  // 每次 RPC 获取 100 行
scan.setBatch(10);     // 每行最多返回 10 列

// 指定列族
scan.addFamily(Bytes.toBytes("info"));
```

### 9.3 表设计优化

```bash
# 启用 Bloom Filter
alter 'user', {NAME => 'info', BLOOMFILTER => 'ROW'}

# 设置压缩
alter 'user', {NAME => 'info', COMPRESSION => 'SNAPPY'}

# 设置版本数
alter 'user', {NAME => 'info', VERSIONS => 3}
```

## 10. 监控与运维

### 10.1 常用监控指标

- Region 数量和分布
- MemStore 大小
- HFile 数量和大小
- 读写请求 QPS
- Compaction 队列长度

### 10.2 常见问题排查

```bash
# 查看集群状态
hbase hbck

# 查看 Region 分布
hbase org.apache.hadoop.hbase.master.RegionPlacement

# 手动触发 Compaction
major_compact 'tablename'

# 手动分裂 Region
split 'tablename', 'splitpoint'
```

## 11. 总结

HBase 是处理大规模数据的强大工具,掌握它需要理解分布式存储的原理、熟悉数据模型设计,以及关注性能优化。建议从小规模测试开始,逐步积累经验,根据实际业务场景进行针对性的优化。