# docker部署ES集群

# Docker 部署 3 节点 ES 集群

# 资源清单

| 主机      | IP              |
| --------- | --------------- |
| es-master | 192.168.200.134 |
| es-node1  | 192.168.200.135 |
| es-node2  | 192.168.200.136 |

| 软件           | 版本    |
| -------------- | ------- |
| docker         | 24.0.6  |
| docker-compose | v2.23.0 |
| elasticsearch  | 7.16.3  |
| kibana         | 7.16.3  |

## 一、`Docker` 安装

省略

## 二、Docker Compose安装

### **1. ❤️Docker Compose项目**

`Docker Compose` 是 Docker 官方编排（Orchestration）项目之一，负责快速在集群中部署分 布式应用。 

本章将介绍 Compose 项目情况以及安装和使用。

#### **1.1 简介**

[Compose 项目](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fgithub.com%2Fdocker%2Fcompose)是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排。

Compose 定位是 「**定义和运行多个 Docker 容器**的应用（Defining and running multicontainer Docker applications）」，其前身是开源项目 Fig。

通过第一部分中的介绍，我们知道使用一个 Dockerfile 模板文件，可以让用户很方便的定义一个单独的应用容器。然而，在日常工作中，经常会碰到需要多个容器相互配合来完成某项任务的情况。

例如要实现一个 Web 项目，除了 Web 服务容器本身，往往还需要再加上后端的[数据库服务](https://cloud.tencent.com/product/dbexpert?from_column=20065&from=20065)容器，甚至还包括[负载均衡](https://cloud.tencent.com/product/clb?from_column=20065&from=20065)容器等。

`Compose`恰好满足了这样的需求。它允许用户**通过一个单独的** `**docker-compose.yml**` **模板文件 （YAML 格式）来定义一组相关联的应用容器为一个项目（project）**。

`Compose`中有两个重要的概念：

1. **服务 ( service )**：一个应用容器，实际上可以包括若干运行相同镜像的容器实例。(没理解)
2. **项目 ( project )**：由一组关联的应用容器组成的一个完整业务单元，在 dockercompose.yml 文件中定义。

`Compose` 的默认管理对象是项目，通过子命令对项目中的一组容器进行便捷地生命周期管理。

### 下载安装

Linux 上我们可以从 Github 上下载它的二进制包来使用，最新发行的版本地址：[https://github.com/docker/compose/releases](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Fgithub.com%2Fdocker%2Fcompose%2Freleases)。

1、运行以下命令以下载 Docker Compose 的当前稳定版本：

```sh
# github.com 可能访问超时，可以使用下面的获取下载下来后上传服务器即可
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

要安装其他版本的 Compose，请替换 v2.23.0。

2、将可执行权限应用于二进制文件：

```sh
sudo chmod +x /usr/local/bin/docker-compose
```

3、创建软链：

```sh
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

4、测试是否安装成功：

```sh
docker-compose --version
```

![image-20231031181618907](http://img.aa520.cn/test/image-20231031181618907.png)

## docker-compose 如何每次都重新build镜像

要求 `docker-compose` 每次重新构建镜像，可以使用 `--build` 标志来强制重新构建镜像。你可以在运行 `docker-compose up` 或 `docker-compose build` 命令时使用该标志。例如：

```css
docker-compose up --build
```

这将使用 `docker-compose.yml` 文件中指定的构建上下文重新构建所有服务的镜像。如果你只想重新构建某个服务的镜像，可以使用以下命令：

```mipsasm
docker-compose build --no-cache <service-name>
```

在这个命令中，`--no-cache` 标志指示构建过程中不使用缓存，以便强制重新构建镜像。`<service-name>` 是要构建镜像的服务名称。

## 三、部署 `ES` 集群

## 1. 部署 `es-master` 节点

> `192.168.200.134` 主机

### a | 编辑 `docker-compose` 文件

```yaml
version: '3'
services:
  es-master:
    image: elasticsearch:7.16.3
    container_name: es-master
    environment:
      - "ES_JAVA_OPTS=-Xms4096m -Xmx4096m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - /data/elasticsearch/config/es.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
      - /data/elasticsearch/data:/usr/share/elasticsearch/data:rw
      - /data/elasticsearch/log:/usr/share/elasticsearch/log:rw
    ports:
      - 9200:9200
      - 9300:9300
    extra_hosts:                        # 设置容器 hosts
      - "es-master:192.168.200.134"
      - "es-node1:192.168.200.135"
      - "es-node2:192.168.200.136"
  kibana:
    image: kibana:7.16.3
    container_name: kibana
    restart: always
    environment:
      - TZ="Asia/Shanghai"
    ports:
      - 5601:5601
    volumes:
      - /data/kibana/config/kibana.yml:/usr/share/kibana/config/kibana.yml:ro
    depends_on:
      - es-master
```

### b | 创建服务挂载目录#

```shell
#  创建es配置数据日志目录
# mkdir /data/elasticsearch/{config,data,log} -pv

## 创建kibana配置目录
# mkdir /data/kibana/config -pv

## 修改es目录权限，否则容器启动报错，es容器使用es用户启动，用户id=1000
# chown 1000:1000 /data/elasticsearch/* -R
```

### c | 编辑 `es.yml` 配置文件#

```shell
# vim /data/elasticsearch/config/es.yml

cluster.name: es-cluster-test
node.name: es-master
node.master: true
node.data: true

#network.host: 0.0.0.0
network.bind_host: 0.0.0.0
network.publish_host: 192.168.200.134
http.port: 9200
transport.tcp.port: 9300
http.cors.enabled: true
http.cors.allow-origin: "*"

discovery.zen.ping.unicast.hosts: ["es-master:9300", "es-node1:9300", "es-node2:9300"]
discovery.zen.minimum_master_nodes: 2
discovery.zen.ping_timeout: 5s

bootstrap.memory_lock: true
action.destructive_requires_name: true
cluster.initial_master_nodes: ["es-master"]

ingest.geoip.downloader.enabled: false
```

### d | 编辑 `kibana.yml` 配置文件#

```shell
# vim /data/kibana/config/kibana.yml

server.name: kibana
server.host: "0.0.0.0"
#此处为es的master地址
elasticsearch.hosts: "http://es-master:9200"
xpack.monitoring.ui.container.elasticsearch.enabled: true
```

### e | 启动服务#

```shell
# docker-compose up -d


## ElasticSearch启动报错，bootstrap checks failed 
## max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]

# cat /etc/sysctl.conf

vm.max_map_count=655360

# sysctl -p

## 参考文档： https://blog.csdn.net/feng12345zi/article/details/80367907
```

## 2. 部署 `es-node1` 节点#

> `192.168.200.135` 主机

### a | 编辑 `docker-compose` 文件#

```yaml
version: '3'
services:
  es-node1:
    image: elasticsearch:7.16.3
    container_name: es-node1
    environment:
      - "ES_JAVA_OPTS=-Xms4096m -Xmx4096m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - /data/elasticsearch/config/es.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
      - /data/elasticsearch/data:/usr/share/elasticsearch/data:rw
      - /data/elasticsearch/log:/usr/share/elasticsearch/log:rw
    ports:
      - 9200:9200
      - 9300:9300
    extra_hosts:                        # 设置容器 hosts
      - "es-master:192.168.200.134"
      - "es-node1:192.168.200.135"
      - "es-node2:192.168.200.136"
```

### b | 创建服务挂载目录#

```shell
#  创建es配置数据日志目录
# mkdir /data/elasticsearch/{config,data,log} -pv

## 修改es目录权限，否则容器启动报错，es容器使用es用户启动，用户id=1000
# chown 1000:1000 /data/elasticsearch/* -R


## ElasticSearch启动报错，bootstrap checks failed 
## max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]

# cat /etc/sysctl.conf

vm.max_map_count=655360

# sysctl -p

## 参考文档： https://blog.csdn.net/feng12345zi/article/details/80367907
```

### c | 编辑 `es.yml` 配置文件#

```shell
# vim /data/elasticsearch/config/es.yml

cluster.name: es-cluster-test
node.name: es-node1
node.master: false
node.data: true

network.bind_host: 0.0.0.0
network.publish_host: 192.168.200.135
http.port: 9200
transport.tcp.port: 9300
http.cors.enabled: true
http.cors.allow-origin: "*"

discovery.zen.ping.unicast.hosts: ["es-master:9300", "es-node1:9300", "es-node2:9300"]
discovery.zen.minimum_master_nodes: 2
discovery.zen.ping_timeout: 5s

bootstrap.memory_lock: true
action.destructive_requires_name: true
cluster.initial_master_nodes: ["es-master"]
```

### d | 启动服务#

```shell
# docker-compose up -d
```

## 3. 部署 `es-node2` 节点#

> `192.168.200.136` 主机

### a | 编辑 `docker-compose` 文件#

```yaml
version: '3'
services:
  es-node1:
    image: elasticsearch:7.16.3
    container_name: es-node2
    environment:
      - "ES_JAVA_OPTS=-Xms4096m -Xmx4096m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - /data/elasticsearch/config/es.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
      - /data/elasticsearch/data:/usr/share/elasticsearch/data:rw
      - /data/elasticsearch/log:/usr/share/elasticsearch/log:rw
    ports:
      - 9200:9200
      - 9300:9300
    extra_hosts:                        # 设置容器 hosts
      - "es-master:192.168.200.134"
      - "es-node1:192.168.200.135"
      - "es-node2:192.168.200.136"
```

### b | 创建服务挂载目录[#](https://www.cnblogs.com/evescn/p/16175547.html#712333686)

```shell
#  创建es配置数据日志目录
# mkdir /data/elasticsearch/{config,data,log} -pv

## 修改es目录权限，否则容器启动报错，es容器使用es用户启动，用户id=1000
# chown 1000:1000 /data/elasticsearch/* -R


## ElasticSearch启动报错，bootstrap checks failed 
## max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]

# cat /etc/sysctl.conf

vm.max_map_count=655360

# sysctl -p

## 参考文档： https://blog.csdn.net/feng12345zi/article/details/80367907
```

### c | 编辑 `es.yml` 配置文件[#](https://www.cnblogs.com/evescn/p/16175547.html#3922879070)

```shell
# vim /data/elasticsearch/config/es.yml

cluster.name: es-cluster-test
node.name: es-node1
node.master: false
node.data: true

network.bind_host: 0.0.0.0
network.publish_host: 192.168.200.136
http.port: 9200
transport.tcp.port: 9300
http.cors.enabled: true
http.cors.allow-origin: "*"

discovery.zen.ping.unicast.hosts: ["es-master:9300", "es-node1:9300", "es-node2:9300"]
discovery.zen.minimum_master_nodes: 2
discovery.zen.ping_timeout: 5s

bootstrap.memory_lock: true
action.destructive_requires_name: true
cluster.initial_master_nodes: ["es-master"]
```

### d | 启动服务[#](https://www.cnblogs.com/evescn/p/16175547.html#3493837300)

```shell
# docker-compose up -d
```

## 4. 启动 `es_xpack` 认证#

> 集群认证需要首先配置秘钥才行，否则在给内置用户创建秘钥的时候将会报错

### a | 生成证书[#](https://www.cnblogs.com/evescn/p/16175547.html#3515148518)

```shell
# 登陆其中一个node节点执行命令，生成完证书传到集群其他节点即可
# docker exec -it es-master bash
# /usr/share/elasticsearch/bin/elasticsearch-certutil ca
# /usr/share/elasticsearch/bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12

## 两条命令均一路回车即可，不需要给秘钥再添加密码。

## 证书创建完成之后，默认在es的数据目录，这里统一cp 到宿主机目录中

# mv elastic-* /usr/share/elasticsearch/data/

## 退出容器
# exit 

## 复制 /data/elasticsearch/data/ 下证书到 config 目录
# cd /data/elasticsearch/config/
# cp /data/elasticsearch/data/elastic-*  ./
# chmod 644 elastic-*
# chown 1000:10000 elastic*

## 复制证书文件到其他节点

# scp /data/elasticsearch/config/elastic-* 192.168.200.135:/data/elasticsearch/config/
# scp /data/elasticsearch/config/elastic-* 192.168.200.135:/data/elasticsearch/config/
```

### b | 新增 `es.yml` 配置[#](https://www.cnblogs.com/evescn/p/16175547.html#3480838786)

```shell
#三台机器新增配置如下：

......
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.transport.ssl.verification_mode: certificate
xpack.security.transport.ssl.keystore.path: /etc/elasticsearch/elastic-certificates.p12
xpack.security.transport.ssl.truststore.path: /etc/elasticsearch/elastic-certificates.p12
```

### c | 修改 `docker-compose.yml` 文件[#](https://www.cnblogs.com/evescn/p/16175547.html#1803603805)

```yaml
Copyversion: '3'
services:
  es-node1:
    image: elasticsearch:7.16.3
    ......
    volumes:
      - /data/elasticsearch/config/es.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
      
      ## 挂载 ssl 证书到容器中
      - /data/elasticsearch/config/elastic-certificates.p12:/usr/share/elasticsearch/config/elastic-certificates.p12:ro
      - /data/elasticsearch/config/elastic-stack-ca.p12:/usr/share/elasticsearch/config/elastic-stack-ca.p12:ro
      
      - /data/elasticsearch/data:/usr/share/elasticsearch/data:rw
      - /data/elasticsearch/log:/usr/share/elasticsearch/log:rw
    ......
```

### d | 创建账户，并为内置账号添加密码[#](https://www.cnblogs.com/evescn/p/16175547.html#1676662006)

> `ES` 中内置了几个管理其他集成组件的账号即：`apm_system`, `beats_system`, `elastic`, `kibana`, `logstash_system`, `remote_monitoring_user`，使用之前，首先需要添加一下密码。

```shell
Copy# docker exec -it es-mater bash
# /usr/share/elasticsearch/bin/elasticsearch-setup-passwords interactive
Initiating the setup of passwords for reserved users elastic,apm_system,kibana,logstash_system,beats_system,remote_monitoring_user.
You will be prompted to enter passwords as the process progresses.
Please confirm that you would like to continue [y/N]y
Enter password for [elastic]:
Reenter password for [elastic]:
Enter password for [apm_system]:
Reenter password for [apm_system]:
Enter password for [kibana]:
Reenter password for [kibana]:
Enter password for [logstash_system]:
Reenter password for [logstash_system]:
Enter password for [beats_system]:
Reenter password for [beats_system]:
Enter password for [remote_monitoring_user]:
Reenter password for [remote_monitoring_user]:
Changed password for user [apm_system]
Changed password for user [kibana]
Changed password for user [logstash_system]
Changed password for user [beats_system]
Changed password for user [remote_monitoring_user]
Changed password for user [elastic]
```

### e | 配置完毕之后，可以通过如下方式访问 `es` 服务：[#](https://www.cnblogs.com/evescn/p/16175547.html#3955862107)

```shell
Copycurl -XGET -u elastic 'localhost:9200/_xpack/security/user?pretty'
```

### f | `kibana` 配置文件中，新增 `es` 账户密码[#](https://www.cnblogs.com/evescn/p/16175547.html#2428199454)

```shell
Copy## kibana.yml 文件

elasticsearch.username: "elastic"
elasticsearch.password: "123456"
```

