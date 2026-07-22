# Docker 入门：从 Linux 运维视角秒懂容器技术

如果你已经具备了 Linux 基础（熟悉常用命令、理解进程管理、懂点网络配置和文件系统），那么恭喜你，你已经通关了 Docker 最难的一部分。

在传统 Linux 环境中，我们部署服务通常是“直接在操作系统上盖房子”（装依赖、改全局配置、调端口）。而 Docker 的出现，则是把服务连同它的生态环境打包成一个“集装箱”，直接运到 Linux 宿主机上运行。

下面我们直接用 Linux 的思维，快速攻克 Docker 的核心知识。

## 一、 概念对齐：用 Linux 视角理解 Docker

不要把 Docker 想得太神秘，它的核心概念完全可以和 Linux 系统中的成熟概念一一对应：

| **Docker 概念**      | **Linux 对应概念**              | **深度理解**                                                 |
| -------------------- | ------------------------------- | ------------------------------------------------------------ |
| **镜像 (Image)**     | 只读的根文件系统快照 / ISO 镜像 | 包含了应用运行所需的所有代码、库、环境变量和配置文件的**静态模板**。镜像是只读的。 |
| **容器 (Container)** | 隔离的进程 (Process)            | 镜像运行起来后的**动态实例**。本质上是宿主机上的一个特殊进程，通过 Linux 的 `Namespace` 实现资源隔离，`Cgroups` 实现资源限制。 |
| **仓库 (Registry)**  | Yum 源 / Apt 源 / 软件中心      | 集中存放镜像的地方。官方的 Docker Hub 就像是 Linux 的官方 Base 源。 |
| **数据卷 (Volume)**  | 外部硬盘挂载 (`mount`)          | 容器内部是易失的，数据卷将宿主机的目录挂载到容器内，实现数据持久化。 |

## 二、 命令无缝切换

由于你已经熟悉 Linux 命令行，下表可以帮你快速把传统运维习惯迁移到 Docker 统一管理界面中：

| **运维需求**         | **传统 Linux 命令**                        | **对应的 Docker 命令**             |
| -------------------- | ------------------------------------------ | ---------------------------------- |
| **查看运行中的服务** | `ps -ef | grep service` 或 `netstat -ntlp` | `docker ps`                        |
| **查看所有服务状态** | `systemctl list-units`                     | `docker ps -a`                     |
| **启动 / 停止服务**  | `systemctl start/stop nginx`               | `docker start/stop 容器名`         |
| **查看实时日志**     | `tail -f /var/log/nginx/access.log`        | `docker logs -f 容器名`            |
| **进入服务内排查**   | `ssh user@IP`                              | `docker exec -it 容器名 /bin/bash` |
| **下载软件安装包**   | `wget` 或 `yum install`                    | `docker pull 镜像名`               |

## 三、 Docker 核心生命周期命令

作为一个 Linux 熟手，你只需要重点掌握以下 6 个高频基础命令即可玩转 Docker：

### 1. 拉取镜像 (Pull)

从远程仓库把镜像下载到本地。

```bash
docker pull nginx:latest
```

### 2. 查看本地镜像 (Images)

类似查看 `/boot` 下的系统镜像或本地的安装包列表。

```Bash
docker images
```

### 3. 创建并运行容器 (Run) — **最核心**

```bash
docker run -d -p 8080:80 --name my-web nginx
```

- `-d`：**Daemon（后台运行）**。相当于传统命令末尾加的 `&`，让容器在后台当成守护进程运行。
- `-p 8080:80`：**端口映射（宿主机端口 : 容器内部端口）**。由于容器网络是隔离的，此操作相当于在宿主机上做了一道 `iptables` 端口转发，把访问宿主机 8080 端口的流量导向容器的 80 端口。
- `--name my-web`：给这个容器进程起一个唯一的名字，方便后续管理。

### 4. 查看容器状态 (Ps)

```bash
docker ps     # 查看当前正在运行的容器
docker ps -a  # 查看所有容器（包括已停止、崩溃的）
```

### 5. 进入容器内部 (Exec)

当容器内部服务报错，你想进去看一眼配置文件或看下网卡时使用：

```bash
docker exec -it my-web /bin/bash
```

- `-it`：开启一个交互式的终端（Interactive Terminal）。
- 进入后你会发现，里面是一个极简的 Linux 文件系统（甚至连 `vim` 或 `ifconfig` 都没有，需要自己用 `apt/yum` 装）。输入 `exit` 即可退出，且不会导致容器停止。

### 6. 删除资源 (Rm / Rmi)

```bash
docker rm 容器名或ID      # 删除容器（必须先 stop 停止）
docker rmi 镜像名或ID     # 删除本地的静态镜像
```

## 四、 进阶实战：带数据持久化的 Nginx 部署

在实际生产中，容器随时可能因为升级或故障被销毁。如果直接把网页文件写在容器里，容器一删，数据全无。

为了解决这个问题，Linux 老手通常使用 **数据卷挂载 (`-v`)**。我们将**宿主机**的网页目录和容器内部的网页目录“绑定”在一起。

```bash
# 1. 在宿主机创建一个存放网页的目录
mkdir -p /data/www

# 2. 写入一个测试主页
echo "<h1>Hello Docker, Hello Linux!</h1>" > /data/www/index.html

# 3. 启动 Nginx 容器，并挂载目录
docker run -d \
  -p 80:80 \
  --name linux-nginx \
  -v /data/www:/usr/share/nginx/html \
  nginx
```

**💡 挂载原理解析：**

`-v /data/www:/usr/share/nginx/html` 相当于在容器启动时，自动执行了一次 Linux 的挂载操作：

将宿主机的 `/data/www` 挂载到了容器内部的 `/usr/share/nginx/html`。从此，你只需要在宿主机的 `/data/www` 下修改代码，容器内的网页就会实时更新，且**即便容器被彻底删除重构，你的数据也安全地留在宿主机硬盘上**。

## 五、 给 Linux 老手的三条“思维避坑指南”

1. **不要试图在一个容器里装全家桶：**

   传统运维习惯在一台虚拟机里同时装 Nginx + PHP + MySQL。但在 Docker 的哲学里，倡导“一个容器只做一件事（单进程原则）”。Nginx、PHP、MySQL 应该分别是三个独立的容器，通过 Docker 的内部网络进行通信。

2. **不要把容器当虚拟机用：**

   不要习惯性地用 `systemctl` 去管理容器内部的服务。容器的寿命与它运行的主进程绑定。比如 Nginx 容器，当 Nginx 进程结束时，容器就会自动退出（Exited）。

3. **善用日志查询：**

   服务起不来时，不要盲目去宿主机的 `/var/log` 下找。直接运行 `docker logs 容器名`，容器内主进程输出到标准输出（stdout）的所有错误日志都会在这里一览无余。