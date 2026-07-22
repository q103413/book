在 IntelliJ IDEA 中运行 MapReduce 程序，核心是 **配置 Hadoop 开发环境、设置运行参数、解决依赖和 Windows 兼容问题**，以下是 step-by-step 实操指南（适配你之前的日志统计项目，含 Windows/Linux 双环境适配）：

## 一、前置准备（必做）

### 1. 环境要求

- 已安装 JDK 8（Hadoop 3.x 推荐，与你项目依赖的 Hadoop 3.3.6 兼容）；
- 本地或集群有 Hadoop 环境（本地模式适合测试，集群模式适合生产）；
- IDEA 已安装 **Maven 插件**（项目用 Maven 管理依赖，默认已装）。

### 2. 项目依赖确认（关键！避免 ClassNotFound）

确保 `pom.xml` 中已引入 Hadoop 核心依赖（之前的代码已包含，重点检查）：

```xml
<dependencies>
    <!-- Hadoop MapReduce 核心依赖 -->
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-common</artifactId>
        <version>3.3.6</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-mapreduce-client-core</artifactId>
        <version>3.3.6</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-mapreduce-client-jobclient</artifactId>
        <version>3.3.6</version>
    </dependency>
    <!-- HDFS 依赖（若输入/输出路径是 HDFS 需添加） -->
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-hdfs</artifactId>
        <version>3.3.6</version>
    </dependency>
</dependencies>
```

- 右键项目 → `Maven` → `Reload Project`，确保依赖下载完成（无红色下划线）。

### 3. Windows 额外配置（避坑！）

Hadoop 在 Windows 上运行需补充 **winutils.exe**（模拟 Linux 系统的 shell 命令），否则会报错 `Could not locate executable null\bin\winutils.exe`：

1. 下载对应 Hadoop 版本的 winutils：

   推荐地址：

   winutils-master

   （找到

   ```
   hadoop-3.3.6/bin
   ```

   目录）；

2. 解压 winutils 到本地目录（如 `D:\hadoop-3.3.6\bin`）；

3. 配置环境变量：

   - 新增系统变量 `HADOOP_HOME`，值为 `D:\hadoop-3.3.6`（bin 目录的上一级）；
   - 在 `Path` 变量中添加 `%HADOOP_HOME%\bin`；

4. 重启 IDEA（让环境变量生效）。

## 二、两种运行模式（本地模式 vs 集群模式）

### 模式 1：本地模式（推荐测试用，无需集群）

本地模式下，MapReduce 程序在本地 JVM 中运行，输入 / 输出路径为本地文件系统（如 `D:\input`），无需启动 Hadoop 集群，适合开发调试。

#### 步骤 1：准备输入数据

1. 在本地新建输入目录（如 `D:\hadoop-input`），放入测试日志文件（CSV 格式，如 `test.log`）；

   日志示例（符合你之前的筛选逻辑，日期字段含 2024/1 或 2024/2）：

   ```plaintext
   1,电影A,张三,观看,2024/01/15 10:30,五星
   2,电影B,李四,评论,2024/02/20 14:15,四星
   3,电影C,张三,收藏,2024/01/25 09:45,五星
   ```

   

2. 确保输出目录不存在（如 `D:\hadoop-output`，Hadoop 禁止覆盖已有目录）。

#### 步骤 2：配置 IDEA 运行参数

1. 找到 MapReduce 程序的 **主类**（如你之前的 `race.LogCount`，含 `main` 方法的类）；

2. 右键主类 → `Run 'LogCount.main()'` → 首次运行会失败（无参数），需配置运行参数：

   - 点击 IDEA 右上角的运行配置下拉框 → `Edit Configurations...`；

   - 在弹出的窗口中，找到 `Program arguments`（程序参数）输入框；

   - 输入 **输入路径 和 输出路径**（本地路径格式，用空格分隔）：

     ```plaintext
     D:\hadoop-input D:\hadoop-output
     ```

     

     （若路径含空格，需用引号包裹，如

     

     ```
     "D:\hadoop input"
     ```

     ）；

   - 点击 `Apply` → `OK`。

#### 步骤 3：解决日志冲突（之前的报错问题）

若运行时出现 `SLF4J: Class path contains multiple SLF4J bindings`，按以下方式排除冲突：

1. 右键项目 → `Maven` → `Show Dependencies`；

2. 搜索 `slf4j-log4j12`，右键该依赖 → `Exclude`（排除冲突的日志绑定）；

3. 在 `src/main/resources` 目录下新建 `log4j.properties`（日志配置文件），内容：

   ```properties
   log4j.rootLogger=INFO, CONSOLE
   log4j.appender.CONSOLE=org.apache.log4j.ConsoleAppender
   log4j.appender.CONSOLE.Target=System.out
   log4j.appender.CONSOLE.layout=org.apache.log4j.PatternLayout
   log4j.appender.CONSOLE.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} [%t] %-5p %c - %m%n
   ```

   

#### 步骤 4：运行程序并查看结果

1. 点击 IDEA 右上角的 `Run` 按钮（绿色三角），程序开始运行；
2. 查看运行日志：控制台无报错，且显示 `Job completed successfully` 表示运行成功；
3. 查看输出结果：打开 `D:\hadoop-output` 目录，核心文件：
   - `part-r-00000`：Reducer 0 的输出（1 月数据，对应自定义分区器）；
   - `part-r-00001`：Reducer 1 的输出（2 月数据）；
   - `_SUCCESS`：任务成功标识文件（空文件）。

### 模式 2：集群模式（连接远程 Hadoop 集群）

若需将程序提交到远程 Hadoop 集群运行（输入 / 输出路径为 HDFS），需额外配置集群连接信息。

#### 步骤 1：配置 Hadoop 集群信息

1. 复制集群的 `core-site.xml`、`hdfs-site.xml` 文件（从集群主节点的 `$HADOOP_HOME/etc/hadoop` 目录拷贝）；

2. 将这两个文件粘贴到项目的 `src/main/resources` 目录下（IDEA 会自动加载配置）；

   - `core-site.xml` 关键配置（示例）：

     ```xml
     <configuration>
         <property>
             <name>fs.defaultFS</name>
             <value>hdfs://集群主节点IP:9000</value> <!-- 集群HDFS地址 -->
         </property>
     </configuration>
     ```

     

3. 确保本地能访问集群（关闭集群防火墙，或配置端口映射）。

#### 步骤 2：配置运行参数（HDFS 路径）

1. 打开运行配置（`Edit Configurations...`）；

2. 在 `Program arguments` 中输入 HDFS 路径（格式：`hdfs://集群IP:9000/输入路径` `hdfs://集群IP:9000/输出路径`）：

   ```plaintext
   hdfs://192.168.1.100:9000/user/input hdfs://192.168.1.100:9000/user/output
   ```

   - 注意：HDFS 输出路径必须不存在（可通过 `hdfs dfs -rm -r /user/output` 删除已有路径）。

#### 步骤 3：配置集群用户（避免权限问题）

Windows 下默认用户可能无集群 HDFS 写入权限，需指定集群用户：

1. 打开运行配置 → `VM options`（VM 参数）输入框；

2. 输入：

   ```plaintext
   -DHADOOP_USER_NAME=hadoop  # hadoop 是集群的 HDFS 超级用户（根据实际集群用户修改）
   ```

3. 点击 `Apply` → `OK`。

#### 步骤 4：运行并查看集群结果

1. 点击 `Run` 运行程序，控制台会显示任务提交到集群的日志；

2. 可通过集群 Web UI（`http://集群主节点IP:8088`）查看任务状态；

3. 任务完成后，通过 HDFS 命令查看结果：

   ```bash
   hdfs dfs -cat /user/output/part-r-00000
   ```

   

## 三、常见问题排查（避坑指南）

### 1. 运行时报 `ClassNotFoundException: org.apache.hadoop.conf.Configuration`

- 原因：Maven 依赖未下载完成，或依赖范围错误；
- 解决方案：
  - 右键项目 → `Maven` → `Reload Project`，等待依赖下载；
  - 检查 `pom.xml` 中依赖的 `<scope>` 标签，若为 `provided` 需删除（`provided` 表示集群已提供，本地运行需加载）。

### 2. Windows 下报错 `Could not locate executable null\bin\winutils.exe`

- 原因：未配置 `HADOOP_HOME` 或 winutils 路径错误；
- 解决方案：
  - 重新检查 `HADOOP_HOME` 环境变量（值为 winutils 的上一级目录，如 `D:\hadoop-3.3.6`）；
  - 确保 `Path` 中添加了 `%HADOOP_HOME%\bin`，且 bin 目录下有 `winutils.exe`；
  - 重启 IDEA 生效。

### 3. 输出目录已存在报错 `org.apache.hadoop.mapred.FileAlreadyExistsException`

- 原因：Hadoop 禁止覆盖已有输出目录（避免数据丢失）；
- 解决方案：
  - 删除本地输出目录（如 `D:\hadoop-output`）；
  - 集群模式下执行 `hdfs dfs -rm -r /user/output` 删除 HDFS 输出路径。

### 4. 集群模式下报错 `Permission denied: user=XXX, access=WRITE`

- 原因：本地用户无集群 HDFS 写入权限；
- 解决方案：
  - 在运行配置的 `VM options` 中添加 `-DHADOOP_USER_NAME=集群超级用户`（如 `hadoop`）；
  - 或在集群中给本地用户授权：`hdfs dfs -chmod 777 /user`。

### 5. 程序运行无结果（输出文件为空）

- 原因：输入数据不符合筛选条件（如日期字段不是 2024/1 或 2024/2）；
- 解决方案：
  - 检查输入日志的日期格式（确保 `arr[4]` 是日期字段，且包含 `2024/1` 或 `2024/2`）；
  - 在 Mapper 中添加日志打印（`System.out.println("当前行：" + line)`），查看是否读取到数据。

## 四、总结

IDEA 运行 MapReduce 程序的核心流程：

1. 配置依赖（确保 Hadoop 核心依赖齐全）；
2. 准备输入数据（本地 / 集群路径）；
3. 设置运行参数（输入 / 输出路径、VM 参数）；
4. 解决兼容问题（Windows 需 winutils，日志冲突需排除依赖）。

本地模式适合开发调试（快速验证逻辑），集群模式适合大规模数据处理。按以上步骤操作，即可在 IDEA 中顺利运行你的日志统计 MapReduce 程序！