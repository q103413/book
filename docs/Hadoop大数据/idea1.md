# 在IDEA中运行MapReduce程序的完整教程

## 方法一：本地模式运行（推荐用于开发调试）

### 1. **配置运行参数**

#### 步骤1：创建运行配置

1. 点击 IDEA 右上角的 **"Edit Configurations..."**
2. 点击左上角的 **"+"** 号
3. 选择 **"Application"**

#### 步骤2：填写配置信息

```
Name: LogCount (自定义名称)
Main class: race.LogCount (你的主类)
Program arguments: input/data.txt output
Working directory: $PROJECT_DIR$
Use classpath of module: 你的模块名
```

#### 步骤3：准备测试数据

在项目根目录创建 `input` 文件夹，放入测试数据文件：

```
项目根目录/
├── input/
│   └── data.txt
├── src/
│   └── main/
│       └── java/
│           └── race/
│               └── LogCount.java
└── pom.xml
```

#### 步骤4：运行

点击右上角的绿色运行按钮 ▶️

------

### 2. **修改代码支持本地运行**

在 `main` 方法中添加：

```java
public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    
    // ===== 添加本地模式配置 =====
    // 方式1：强制本地模式（推荐用于开发）
    conf.set("mapreduce.framework.name", "local");
    conf.set("fs.defaultFS", "file:///");
    
    // 方式2：如果没有参数，使用默认的本地路径
    if (args.length == 0) {
        args = new String[]{
            "input/data.txt",    // 输入路径
            "output"             // 输出路径
        };
    }
    // ===========================
    
    String[] otherArgs = new GenericOptionsParser(conf, args)
            .getRemainingArgs();
    
    if (otherArgs.length < 2) {
        System.err.println("必须输入读取文件路径和输出路径");
        System.exit(2);
    }
    
    Job job = Job.getInstance(conf, "Log Count");
    job.setJarByClass(LogCount.class);
    // ... 其他配置
    
    // 删除输出目录（如果存在）- 方便重复运行
    Path outputPath = new Path(otherArgs[otherArgs.length - 1]);
    FileSystem fs = FileSystem.get(conf);
    if (fs.exists(outputPath)) {
        fs.delete(outputPath, true);
        System.out.println("已删除旧的输出目录");
    }
    
    FileInputFormat.addInputPath(job, new Path(otherArgs[0]));
    FileOutputFormat.setOutputPath(job, outputPath);
    
    System.exit(job.waitForCompletion(true) ? 0 : 1);
}
```

------

### 3. **准备测试数据**

创建 `input/data.txt`：

```csv
A,B,user001,D,2024/1/15 10:30:00,F
A,B,user002,D,2024/2/20 14:25:00,F
A,B,user001,D,2024/1/16 09:15:00,F
A,B,user003,D,2024/2/21 16:40:00,F
A,B,user002,D,2024/1/17 11:20:00,F
```

------

### 4. **查看运行结果**

运行成功后，项目根目录会生成 `output` 文件夹：

```
output/
├── part-r-00000    # Reducer 0 的输出（1月数据）
├── part-r-00001    # Reducer 1 的输出（2月数据）
└── _SUCCESS        # 成功标志
```

------

## 方法二：连接远程Hadoop集群运行

### 1. **配置Windows连接Hadoop（如果集群在Linux上）**

#### 步骤1：下载winutils

1. 下载 `winutils.exe` 和 `hadoop.dll`
   - 地址：https://github.com/steveloughran/winutils
   - 选择对应版本（如 hadoop-3.3.6）
2. 创建目录 `D:\hadoop\bin`
3. 将下载的文件放入 `D:\hadoop\bin`

#### 步骤2：设置环境变量

```
HADOOP_HOME = D:\hadoop
Path 添加: %HADOOP_HOME%\bin
```

#### 步骤3：配置Hadoop连接信息

在项目 `resources` 目录创建 `core-site.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- Hadoop集群的NameNode地址 -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://192.168.1.100:9000</value>
    </property>
    
    <!-- 用户名 -->
    <property>
        <name>hadoop.user.name</name>
        <value>hadoop</value>
    </property>
</configuration>
```

创建 `mapred-site.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 指定MapReduce运行在YARN上 -->
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    
    <!-- YARN ResourceManager地址 -->
    <property>
        <name>yarn.resourcemanager.address</name>
        <value>192.168.1.100:8032</value>
    </property>
</configuration>
```

------

### 2. **修改代码连接远程集群**

```java
public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    
    // 加载配置文件（会自动读取resources目录下的配置）
    conf.addResource("core-site.xml");
    conf.addResource("mapred-site.xml");
    
    // 或者直接在代码中配置
    // conf.set("fs.defaultFS", "hdfs://192.168.1.100:9000");
    // conf.set("mapreduce.framework.name", "yarn");
    // conf.set("yarn.resourcemanager.address", "192.168.1.100:8032");
    
    // 设置跨平台提交（Windows提交到Linux集群）
    conf.set("mapreduce.app-submission.cross-platform", "true");
    
    String[] otherArgs = new GenericOptionsParser(conf, args)
            .getRemainingArgs();
    
    if (otherArgs.length < 2) {
        System.err.println("必须输入读取文件路径和输出路径");
        System.exit(2);
    }
    
    Job job = Job.getInstance(conf, "Log Count");
    job.setJarByClass(LogCount.class);
    
    // 设置JAR包（重要！）
    // job.setJar("target/LogCount.jar");
    
    // ... 其他配置
    
    // HDFS路径
    FileInputFormat.addInputPath(job, 
        new Path("hdfs://192.168.1.100:9000/input/data.txt"));
    FileOutputFormat.setOutputPath(job, 
        new Path("hdfs://192.168.1.100:9000/output"));
    
    System.exit(job.waitForCompletion(true) ? 0 : 1);
}
```

------

### 3. **配置运行参数（远程模式）**

```
Name: LogCount-Remote
Main class: race.LogCount
Program arguments: /input/data.txt /output
VM options: -DHADOOP_USER_NAME=hadoop
```

------

## 方法三：打包后提交到集群（生产环境）

### 1. **配置Maven打包插件**

在 `pom.xml` 中添加：

```xml
<build>
    <plugins>
        <!-- Maven编译插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
        
        <!-- Maven打包插件：包含所有依赖 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-assembly-plugin</artifactId>
            <version>3.3.0</version>
            <configuration>
                <archive>
                    <manifest>
                        <!-- 指定主类 -->
                        <mainClass>race.LogCount</mainClass>
                    </manifest>
                </archive>
                <descriptorRefs>
                    <!-- 打包所有依赖 -->
                    <descriptorRef>jar-with-dependencies</descriptorRef>
                </descriptorRefs>
            </configuration>
            <executions>
                <execution>
                    <id>make-assembly</id>
                    <phase>package</phase>
                    <goals>
                        <goal>single</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

### 2. **打包**

在IDEA右侧 Maven 面板：

```
项目名
└── Lifecycle
    └── package (双击)
```

或者在IDEA底部Terminal执行：

```bash
mvn clean package
```

生成的JAR包位置：

```
target/
└── LogCount-jar-with-dependencies.jar
```

### 3. **上传并运行**

```bash
# 1. 上传JAR包到服务器
scp target/LogCount-jar-with-dependencies.jar hadoop@192.168.1.100:/opt/jars/

# 2. 上传测试数据到HDFS
hadoop fs -put input/data.txt /input/

# 3. 提交任务
hadoop jar /opt/jars/LogCount-jar-with-dependencies.jar \
race.LogCount \
/input/data.txt \
/output

# 4. 查看结果
hadoop fs -cat /output/part-r-00000
hadoop fs -cat /output/part-r-00001
```

------

## 常见问题解决

### 1. **找不到主类**

```
Error: Could not find or load main class race.LogCount
```

**解决：**

- 检查 `pom.xml` 中主类配置是否正确
- 重新打包：`mvn clean package`

### 2. **输出目录已存在**

```
Output directory already exists
```

**解决：**

```bash
# 删除输出目录
hadoop fs -rm -r /output
# 或在代码中自动删除（见上面代码示例）
```

### 3. **权限问题**

```
Permission denied
```

**解决：**

```bash
# 方式1：设置VM参数
-DHADOOP_USER_NAME=hadoop

# 方式2：代码中设置
System.setProperty("HADOOP_USER_NAME", "hadoop");
```

### 4. **连接超时**

```
Connection refused
```

**解决：**

- 检查防火墙是否开放端口（9000, 8032等）
- 检查Hadoop服务是否启动
- 检查网络连接

------

## 推荐的开发流程

```
1. 本地模式开发调试
   ↓
2. 小数据集测试
   ↓
3. 连接远程集群测试
   ↓
4. 打包提交生产环境
```

这样可以快速定位问题，提高开发效率！