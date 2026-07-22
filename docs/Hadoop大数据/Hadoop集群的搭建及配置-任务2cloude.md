# Hadoop集群的搭建及配置-任务2：搭建Hadoop完全分布式集群

## 1. 任务概述

### 1.1 学习目标
本任务将指导您在Linux虚拟机环境下搭建Hadoop完全分布式集群，为后续学习HDFS分布式文件系统和MapReduce编程奠定基础。

### 1.2 集群架构
- **主节点（Master）**: 1台，运行NameNode、ResourceManager等服务
- **从节点（Slave）**: 3台，运行DataNode、NodeManager等服务
- **集群模式**: 完全分布式环境（贴近生产环境）

### 1.3 硬件要求
- **内存**: 至少8GB
- **硬盘**: 可用容量至少100GB  
- **CPU**: Intel i5以上多核处理器（建议八核及以上）

## 2. 软件环境

### 2.1 软件版本清单

| 软件 | 版本 | 安装包名称 | 备注 |
|------|------|------------|------|
| Linux OS | CentOS 7.8 | CentOS-7-x86_64-DVD-2003.iso | 64位操作系统 |
| JDK | 1.8+ | jdk-8u281-linux-x64.rpm | 64位Java开发环境 |
| VMware | 15 | VMware-workstation-full-15.5.7-17171714.exe | 虚拟机软件 |
| Hadoop | 3.1.4 | hadoop-3.1.4.tar.gz | 预编译安装包 |
| IDEA | 2018.3.6 | ideaIC-2018.3.6.exe | 开发工具（可选） |
| SSH连接工具 | 5 | Xme5.exe | 远程连接工具 |

### 2.2 网络规划

| 主机名 | IP地址 | 角色 | 服务组件 |
|--------|--------|------|----------|
| master | 192.168.128.130 | 主节点 | NameNode, ResourceManager, JobHistoryServer |
| slave1 | 192.168.128.131 | 从节点 | DataNode, NodeManager |
| slave2 | 192.168.128.132 | 从节点 | DataNode, NodeManager |
| slave3 | 192.168.128.133 | 从节点 | DataNode, NodeManager |

## 3. 环境准备

### 3.1 JDK安装

#### 3.1.1 上传JDK安装包
1. 按`Ctrl+Alt+F`组合键打开文件传输窗口
2. 将`jdk-8u281-linux-x64.rpm`上传至master虚拟机的`/opt`目录

#### 3.1.2 安装JDK
```bash
# 切换到安装包目录
cd /opt

# 安装JDK
rpm -ivh jdk-8u281-linux-x64.rpm
```

#### 3.1.3 验证安装
```bash
# 查看Java版本
java -version
```
出现版本信息即表示安装成功。

### 3.2 Hadoop安装包部署

#### 3.2.1 上传并解压
```bash
# 上传hadoop-3.1.4.tar.gz到/opt目录
cd /opt

# 解压到/usr/local目录
tar -zxf hadoop-3.1.4.tar.gz -C /usr/local

# 进入配置文件目录
cd /usr/local/hadoop-3.1.4/etc/hadoop
```

## 4. 配置文件详解

### 4.1 core-site.xml（核心配置）
```xml
<configuration>
    <!-- HDFS文件系统的NameNode地址 -->
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://master:8020</value>
    </property>
    
    <!-- Hadoop临时文件目录 -->
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/var/log/hadoop/tmp</value>
    </property>
</configuration>
```

### 4.2 hadoop-env.sh（Hadoop环境变量）
```bash
# 设置JDK安装路径
export JAVA_HOME=/usr/java/jdk1.8.0_281-amd64
```

### 4.3 yarn-env.sh（YARN环境变量）
```bash
# 注释原有配置，添加新配置
# export JAVA_HOME=/home/y/libexec/jdk1.6.0/
export JAVA_HOME=/usr/java/jdk1.8.0_281-amd64
```

### 4.4 mapred-site.xml（MapReduce配置）
```xml
<configuration>
    <!-- 指定MapReduce使用YARN框架 -->
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    
    <!-- JobHistoryServer配置 -->
    <property>
        <name>mapreduce.jobhistory.address</name>
        <value>master:10020</value>
    </property>
    
    <property>
        <name>mapreduce.jobhistory.webapp.address</name>
        <value>master:19888</value>
    </property>
    
    <!-- MapReduce环境变量配置 -->
    <property>
        <name>yarn.app.mapreduce.am.env</name>
        <value>HADOOP_MAPRED_HOME=${HADOOP_HOME}</value>
    </property>
    
    <property>
        <name>mapreduce.map.env</name>
        <value>HADOOP_MAPRED_HOME=${HADOOP_HOME}</value>
    </property>
    
    <property>
        <name>mapreduce.reduce.env</name>
        <value>HADOOP_MAPRED_HOME=${HADOOP_HOME}</value>
    </property>
</configuration>
```

### 4.5 yarn-site.xml（YARN配置）
```xml
<configuration>
    <!-- ResourceManager主机名 -->
    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>master</value>
    </property>
    
    <!-- ResourceManager各服务地址 -->
    <property>
        <name>yarn.resourcemanager.address</name>
        <value>${yarn.resourcemanager.hostname}:8032</value>
    </property>
    
    <property>
        <name>yarn.resourcemanager.scheduler.address</name>
        <value>${yarn.resourcemanager.hostname}:8030</value>
    </property>
    
    <property>
        <name>yarn.resourcemanager.webapp.address</name>
        <value>${yarn.resourcemanager.hostname}:8088</value>
    </property>
    
    <property>
        <name>yarn.resourcemanager.webapp.https.address</name>
        <value>${yarn.resourcemanager.hostname}:8090</value>
    </property>
    
    <property>
        <name>yarn.resourcemanager.resource-tracker.address</name>
        <value>${yarn.resourcemanager.hostname}:8031</value>
    </property>
    
    <property>
        <name>yarn.resourcemanager.admin.address</name>
        <value>${yarn.resourcemanager.hostname}:8033</value>
    </property>
    
    <!-- NodeManager配置 -->
    <property>
        <name>yarn.nodemanager.local-dirs</name>
        <value>/data/hadoop/yarn/local</value>
    </property>
    
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    
    <property>
        <name>yarn.nodemanager.aux-services.mapreduce.shuffle.class</name>
        <value>org.apache.hadoop.mapred.ShuffleHandler</value>
    </property>
    
    <!-- 日志聚合配置 -->
    <property>
        <name>yarn.log-aggregation-enable</name>
        <value>true</value>
    </property>
    
    <property>
        <name>yarn.nodemanager.remote-app-log-dir</name>
        <value>/data/tmp/logs</value>
    </property>
    
    <property>
        <name>yarn.log.server.url</name>
        <value>http://master:19888/jobhistory/logs/</value>
    </property>
    
    <!-- 资源配置 -->
    <property>
        <name>yarn.nodemanager.resource.memory-mb</name>
        <value>2048</value>
    </property>
    
    <property>
        <name>yarn.scheduler.minimum-allocation-mb</name>
        <value>512</value>
    </property>
    
    <property>
        <name>yarn.scheduler.maximum-allocation-mb</name>
        <value>4096</value>
    </property>
    
    <property>
        <name>mapreduce.map.memory.mb</name>
        <value>2048</value>
    </property>
    
    <property>
        <name>mapreduce.reduce.memory.mb</name>
        <value>2048</value>
    </property>
    
    <property>
        <name>yarn.nodemanager.resource.cpu-vcores</name>
        <value>1</value>
    </property>
    
    <property>
        <name>yarn.nodemanager.vmem-check-enabled</name>
        <value>false</value>
    </property>
</configuration>
```

### 4.6 workers（从节点配置）
```text
slave1
slave2
slave3
```

### 4.7 hdfs-site.xml（HDFS配置）
```xml
<configuration>
    <!-- NameNode元数据存储目录 -->
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///data/hadoop/hdfs/name</value>
    </property>
    
    <!-- DataNode数据存储目录 -->
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///data/hadoop/hdfs/data</value>
    </property>
    
    <!-- SecondaryNameNode地址 -->
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>master:50090</value>
    </property>
    
    <!-- 文件副本数 -->
    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>
</configuration>
```

### 4.8 修改启动脚本
需要修改以下启动脚本文件（位于`/usr/local/hadoop-3.1.4/sbin/`目录）：
- `start-dfs.sh`
- `stop-dfs.sh`  
- `start-yarn.sh`
- `stop-yarn.sh`

在每个文件开头添加：
```bash
HDFS_DATANODE_USER=root
HADOOP_SECURE_DN_USER=hdfs
HDFS_NAMENODE_USER=root
HDFS_SECONDARYNAMENODE_USER=root
YARN_RESOURCEMANAGER_USER=root
YARN_NODEMANAGER_USER=root
```

### 4.9 配置hosts文件
编辑`/etc/hosts`文件，添加主机名与IP映射：
```text
192.168.128.130 master
192.168.128.131 slave1
192.168.128.132 slave2
192.168.128.133 slave3
```

## 5. 虚拟机克隆与配置

### 5.1 克隆虚拟机步骤
1. 右键点击master虚拟机 → 管理 → 克隆
2. 选择"虚拟机中的当前状态"
3. 选择"创建完整克隆"
4. 设置虚拟机名称和存储位置
5. 重复操作创建slave1、slave2、slave3

### 5.2 修改克隆虚拟机配置

#### 5.2.1 修改网络配置
编辑`/etc/sysconfig/network-scripts/ifcfg-ens33`文件：
```bash
# slave1
IPADDR=192.168.128.131

# slave2  
IPADDR=192.168.128.132

# slave3
IPADDR=192.168.128.133
```

#### 5.2.2 重启网络服务
```bash
systemctl restart network
```

#### 5.2.3 修改主机名
```bash
# 分别在各从节点执行
hostnamectl set-hostname slave1  # slave1节点
hostnamectl set-hostname slave2  # slave2节点
hostnamectl set-hostname slave3  # slave3节点
```

#### 5.2.4 重启虚拟机
```bash
reboot
```

## 6. SSH免密码登录配置

### 6.1 生成密钥对
在master节点执行：
```bash
# 生成RSA密钥对
ssh-keygen -t rsa
# 连续按3次Enter键
```

### 6.2 复制公钥到各节点
```bash
# 复制到各从节点
ssh-copy-id slave1
ssh-copy-id slave2
ssh-copy-id slave3

# 复制到本机（master）
ssh-copy-id master
```

### 6.3 验证免密登录
```bash
# 测试登录各节点
ssh slave1
ssh slave2
ssh slave3
ssh master
```

## 7. 时间同步服务配置

### 7.1 安装NTP服务
在所有节点执行：
```bash
yum install -y ntp
```

### 7.2 配置主节点（master）
编辑`/etc/ntp.conf`文件：
```bash
# 注释掉默认server行
# server 0.centos.pool.ntp.org iburst
# server 1.centos.pool.ntp.org iburst
# server 2.centos.pool.ntp.org iburst
# server 3.centos.pool.ntp.org iburst

# 添加本地时钟源
server 127.127.1.0
fudge 127.127.1.0 stratum 10
```

### 7.3 配置从节点
在slave1、slave2、slave3节点编辑`/etc/ntp.conf`：
```bash
# 注释掉默认server行
# 添加master作为时间服务器
server master
```

### 7.4 关闭防火墙
在所有节点执行：
```bash
systemctl stop firewalld
systemctl disable firewalld
```

### 7.5 启动NTP服务

#### 主节点启动
```bash
systemctl start ntpd
systemctl enable ntpd
systemctl status ntpd
```

#### 从节点时间同步
```bash
# 先同步时间
ntpdate master

# 再启动服务
systemctl start ntpd
systemctl enable ntpd
systemctl status ntpd
```

## 8. 集群启动与管理

### 8.1 配置环境变量
在所有节点编辑`/etc/profile`文件：
```bash
# Hadoop环境变量
export HADOOP_HOME=/usr/local/hadoop-3.1.4
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

使配置生效：
```bash
source /etc/profile
```

### 8.2 创建必要目录
在所有节点执行：
```bash
# 创建数据目录
mkdir -p /data/hadoop/hdfs/name
mkdir -p /data/hadoop/hdfs/data
mkdir -p /data/hadoop/yarn/local
mkdir -p /data/tmp/logs
mkdir -p /var/log/hadoop/tmp

# 修改目录权限
chown -R root:root /data
chmod -R 755 /data
```

### 8.3 格式化NameNode
**仅在master节点执行一次：**
```bash
cd /usr/local/hadoop-3.1.4
hdfs namenode -format
```
看到"Storage directory has been successfully formatted"表示格式化成功。

### 8.4 启动集群

#### 8.4.1 启动HDFS
```bash
cd /usr/local/hadoop-3.1.4
sbin/start-dfs.sh
```

#### 8.4.2 启动YARN
```bash
sbin/start-yarn.sh
```

#### 8.4.3 启动JobHistoryServer
```bash
sbin/mr-jobhistory-daemon.sh start historyserver
```

### 8.5 验证集群状态
在各节点使用`jps`命令查看Java进程：

**Master节点应显示：**
- NameNode
- ResourceManager
- JobHistoryServer
- SecondaryNameNode

**Slave节点应显示：**
- DataNode
- NodeManager

### 8.6 关闭集群
```bash
# 关闭JobHistoryServer
sbin/mr-jobhistory-daemon.sh stop historyserver

# 关闭YARN
sbin/stop-yarn.sh

# 关闭HDFS
sbin/stop-dfs.sh
```

## 9. 集群监控

### 9.1 Web监控端口

| 服务 | Web接口 | 默认端口 | 功能 |
|------|---------|----------|------|
| NameNode | http://master:9870 | 9870 | HDFS监控 |
| ResourceManager | http://master:8088 | 8088 | YARN监控 |
| JobHistoryServer | http://master:19888 | 19888 | 作业历史 |

### 9.2 配置本地hosts
在Windows主机的`C:\Windows\System32\drivers\etc\hosts`文件中添加：
```text
192.168.128.130 master
192.168.128.131 slave1
192.168.128.132 slave2
192.168.128.133 slave3
```

### 9.3 访问监控页面

#### 9.3.1 HDFS监控 (http://master:9870)
- **Overview**: NameNode基本信息
- **Summary**: 集群状态和DataNode信息
- **Utilities → Browse the file system**: 浏览HDFS文件系统

#### 9.3.2 YARN监控 (http://master:8088)
- 应用程序状态
- 集群资源使用情况
- NodeManager状态

#### 9.3.3 作业历史监控 (http://master:19888)
- MapReduce作业执行历史
- 作业详细日志

## 10. 常见问题与解决

### 10.1 启动失败问题
1. **检查Java环境**: 确保`JAVA_HOME`正确配置
2. **检查网络连通性**: 使用`ping`命令测试节点间连接
3. **检查SSH免密登录**: 确保master能免密登录所有节点
4. **检查端口占用**: 使用`netstat -tlnp`查看端口状态
5. **查看日志**: 检查`$HADOOP_HOME/logs/`下的日志文件

### 10.2 性能优化建议
1. **调整JVM堆内存**: 根据节点内存大小调整各组件堆内存
2. **优化网络配置**: 确保节点间网络延迟最小
3. **磁盘IO优化**: 使用SSD或配置合理的磁盘阵列
4. **调整副本数**: 根据集群规模和数据重要性调整副本数

### 10.3 安全加固
1. **启用Kerberos认证**: 在生产环境中启用安全认证
2. **配置SSL/TLS**: 为Web界面和RPC通信启用加密
3. **网络隔离**: 使用防火墙规则限制不必要的网络访问
4. **定期更新**: 及时应用安全补丁和版本更新

## 11. 总结

通过本任务，您已经成功搭建了一个包含1个主节点和3个从节点的Hadoop完全分布式集群。主要完成了：

1. ✅ Linux虚拟机环境准备
2. ✅ JDK安装与配置  
3. ✅ Hadoop核心配置文件修改
4. ✅ 虚拟机克隆与网络配置
5. ✅ SSH免密登录配置
6. ✅ NTP时间同步服务
7. ✅ 集群启动与验证
8. ✅ Web监控界面配置

这个集群环境为后续学习HDFS操作、MapReduce编程、YARN资源管理等Hadoop核心功能提供了完整的实践平台。

## 12. 下一步学习建议

1. **HDFS基础操作**: 学习文件上传、下载、目录管理等基本操作
2. **MapReduce编程**: 编写和运行MapReduce程序
3. **YARN资源管理**: 了解作业调度和资源分配机制
4. **集群管理**: 学习集群扩容、故障处理、性能调优等运维技能
5. **生态工具集成**: 学习Hive、HBase、Spark等大数据工具的集成使用

---

> **提示**: 建议将此集群环境保存为虚拟机快照，以便在后续学习中快速恢复到干净的初始状态。