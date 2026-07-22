#!/bin/bash

# CentOS Hadoop集群快速部署脚本
# 使用方法: ./hadoop_cluster_setup.sh [master|slave]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请勿使用root用户运行此脚本"
        exit 1
    fi
}

# 检查参数
if [[ $# -eq 0 ]]; then
    log_error "请指定部署类型: master 或 slave"
    echo "使用方法: $0 [master|slave]"
    exit 1
fi

DEPLOY_TYPE=$1

# 配置变量
HADOOP_VERSION="3.3.4"
HADOOP_USER="hadoop"
HADOOP_GROUP="hadoop"
HADOOP_HOME="/home/hadoop/hadoop"
JAVA_HOME="/usr/lib/jvm/java-1.8.0-openjdk"

# 主节点配置
MASTER_HOST="hadoop-master"
SLAVE_HOSTS=("hadoop-slave1" "hadoop-slave2" "hadoop-slave3")

# 安装基础软件包
install_basic_packages() {
    log_info "安装基础软件包..."
    sudo yum update -y
    sudo yum install -y wget curl vim net-tools java-1.8.0-openjdk java-1.8.0-openjdk-devel
}

# 创建Hadoop用户
create_hadoop_user() {
    log_info "创建Hadoop用户..."
    sudo groupadd -f $HADOOP_GROUP
    sudo useradd -g $HADOOP_GROUP $HADOOP_USER 2>/dev/null || true
    echo "$HADOOP_USER:123456" | sudo chpasswd
    sudo usermod -aG wheel $HADOOP_USER
}

# 配置SSH
setup_ssh() {
    log_info "配置SSH..."
    if [[ $DEPLOY_TYPE == "master" ]]; then
        # 生成SSH密钥
        sudo -u $HADOOP_USER ssh-keygen -t rsa -P '' -f /home/$HADOOP_USER/.ssh/id_rsa -N ""
        
        # 复制公钥到所有节点
        for host in $MASTER_HOST "${SLAVE_HOSTS[@]}"; do
            sudo -u $HADOOP_USER ssh-copy-id -o StrictHostKeyChecking=no $HADOOP_USER@$host
        done
    fi
}

# 下载和安装Hadoop
install_hadoop() {
    if [[ $DEPLOY_TYPE == "master" ]]; then
        log_info "下载和安装Hadoop..."
        sudo -u $HADOOP_USER mkdir -p /home/$HADOOP_USER/software
        cd /home/$HADOOP_USER/software
        
        # 下载Hadoop
        sudo -u $HADOOP_USER wget -q https://downloads.apache.org/hadoop/common/hadoop-$HADOOP_VERSION/hadoop-$HADOOP_VERSION.tar.gz
        
        # 解压
        sudo -u $HADOOP_USER tar -xzf hadoop-$HADOOP_VERSION.tar.gz -C /home/$HADOOP_USER/
        sudo -u $HADOOP_USER ln -sf /home/$HADOOP_USER/hadoop-$HADOOP_VERSION $HADOOP_HOME
        
        # 创建必要目录
        sudo -u $HADOOP_USER mkdir -p $HADOOP_HOME/data/{namenode,datanode,namesecondary}
        sudo -u $HADOOP_USER mkdir -p $HADOOP_HOME/logs
    fi
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    cat >> /home/$HADOOP_USER/.bashrc << EOF

# Hadoop环境变量
export JAVA_HOME=$JAVA_HOME
export HADOOP_HOME=$HADOOP_HOME
export HADOOP_CONF_DIR=\$HADOOP_HOME/etc/hadoop
export HADOOP_COMMON_HOME=\$HADOOP_HOME
export HADOOP_HDFS_HOME=\$HADOOP_HOME
export HADOOP_MAPRED_HOME=\$HADOOP_HOME
export HADOOP_YARN_HOME=\$HADOOP_HOME
export PATH=\$PATH:\$HADOOP_HOME/bin:\$HADOOP_HOME/sbin
EOF
}

# 配置Hadoop核心文件
configure_hadoop() {
    if [[ $DEPLOY_TYPE == "master" ]]; then
        log_info "配置Hadoop核心文件..."
        
        # 配置core-site.xml
        cat > $HADOOP_HOME/etc/hadoop/core-site.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://$MASTER_HOST:9000</value>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>$HADOOP_HOME/data</value>
    </property>
</configuration>
EOF

        # 配置hdfs-site.xml
        cat > $HADOOP_HOME/etc/hadoop/hdfs-site.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>$HADOOP_HOME/data/namenode</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>$HADOOP_HOME/data/datanode</value>
    </property>
    <property>
        <name>dfs.namenode.checkpoint.dir</name>
        <value>$HADOOP_HOME/data/namesecondary</value>
    </property>
    <property>
        <name>dfs.webhdfs.enabled</name>
        <value>true</value>
    </property>
</configuration>
EOF

        # 配置mapred-site.xml
        cat > $HADOOP_HOME/etc/hadoop/mapred-site.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property>
        <name>mapreduce.jobhistory.address</name>
        <value>$MASTER_HOST:10020</value>
    </property>
    <property>
        <name>mapreduce.jobhistory.webapp.address</name>
        <value>$MASTER_HOST:19888</value>
    </property>
</configuration>
EOF

        # 配置yarn-site.xml
        cat > $HADOOP_HOME/etc/hadoop/yarn-site.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>$MASTER_HOST</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.log-aggregation-enable</name>
        <value>true</value>
    </property>
</configuration>
EOF

        # 配置workers文件
        cat > $HADOOP_HOME/etc/hadoop/workers << EOF
$MASTER_HOST
$(printf '%s\n' "${SLAVE_HOSTS[@]}")
EOF

        # 配置hadoop-env.sh
        cat >> $HADOOP_HOME/etc/hadoop/hadoop-env.sh << EOF

export JAVA_HOME=$JAVA_HOME
export HADOOP_HOME=$HADOOP_HOME
export HADOOP_CONF_DIR=\$HADOOP_HOME/etc/hadoop
EOF
    fi
}

# 复制配置到从节点
copy_to_slaves() {
    if [[ $DEPLOY_TYPE == "master" ]]; then
        log_info "复制配置到从节点..."
        for host in "${SLAVE_HOSTS[@]}"; do
            log_info "复制到 $host..."
            sudo -u $HADOOP_USER scp -r $HADOOP_HOME $HADOOP_USER@$host:/home/$HADOOP_USER/
            sudo -u $HADOOP_USER scp /home/$HADOOP_USER/.bashrc $HADOOP_USER@$host:~/
        done
    fi
}

# 格式化NameNode
format_namenode() {
    if [[ $DEPLOY_TYPE == "master" ]]; then
        log_info "格式化NameNode..."
        sudo -u $HADOOP_USER $HADOOP_HOME/bin/hdfs namenode -format
    fi
}

# 启动集群
start_cluster() {
    if [[ $DEPLOY_TYPE == "master" ]]; then
        log_info "启动Hadoop集群..."
        sudo -u $HADOOP_USER $HADOOP_HOME/sbin/start-dfs.sh
        sudo -u $HADOOP_USER $HADOOP_HOME/sbin/start-yarn.sh
        sudo -u $HADOOP_USER $HADOOP_HOME/sbin/mr-jobhistory-daemon.sh start historyserver
        
        log_info "等待服务启动..."
        sleep 10
        
        # 检查集群状态
        log_info "检查集群状态..."
        sudo -u $HADOOP_USER $HADOOP_HOME/bin/jps
        sudo -u $HADOOP_USER $HADOOP_HOME/bin/hdfs dfsadmin -report
    fi
}

# 测试集群
test_cluster() {
    if [[ $DEPLOY_TYPE == "master" ]]; then
        log_info "测试Hadoop集群..."
        
        # 创建测试目录
        sudo -u $HADOOP_USER $HADOOP_HOME/bin/hdfs dfs -mkdir /test
        
        # 创建测试文件
        echo "Hello Hadoop World" | sudo -u $HADOOP_USER tee /tmp/test.txt
        
        # 上传文件到HDFS
        sudo -u $HADOOP_USER $HADOOP_HOME/bin/hdfs dfs -put /tmp/test.txt /test/
        
        # 运行WordCount示例
        sudo -u $HADOOP_USER $HADOOP_HOME/bin/hadoop jar $HADOOP_HOME/share/hadoop/mapreduce/hadoop-mapreduce-examples-$HADOOP_VERSION.jar wordcount /test/test.txt /test/output
        
        # 查看结果
        sudo -u $HADOOP_USER $HADOOP_HOME/bin/hdfs dfs -cat /test/output/part-r-00000
        
        log_info "集群测试完成！"
    fi
}

# 显示访问信息
show_access_info() {
    if [[ $DEPLOY_TYPE == "master" ]]; then
        log_info "Hadoop集群部署完成！"
        echo ""
        echo "访问信息："
        echo "- HDFS Web UI: http://$MASTER_HOST:9870"
        echo "- YARN Web UI: http://$MASTER_HOST:8088"
        echo "- JobHistory Web UI: http://$MASTER_HOST:19888"
        echo ""
        echo "常用命令："
        echo "- 启动集群: start-all.sh"
        echo "- 停止集群: stop-all.sh"
        echo "- 查看进程: jps"
        echo "- 查看HDFS状态: hdfs dfsadmin -report"
        echo "- 查看YARN状态: yarn node -list"
    fi
}

# 主函数
main() {
    log_info "开始部署Hadoop集群 (类型: $DEPLOY_TYPE)..."
    
    check_root
    install_basic_packages
    create_hadoop_user
    setup_ssh
    install_hadoop
    setup_environment
    configure_hadoop
    copy_to_slaves
    format_namenode
    start_cluster
    test_cluster
    show_access_info
    
    log_info "部署完成！"
}

# 执行主函数
main "$@" 