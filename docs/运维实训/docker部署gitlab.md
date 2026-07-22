# 使用Docker快速部署Gitlab

## 一、gitlab是什么?

gitlab是一个开源的git仓库管理软件，并提供web界面，方便管理git仓库。和github很相似，不过github暂时没有开源版本，项目必须托管到github官方网站，不能本地部署。很多公司考虑到安全费用等因素，搭建自己的gitlab服务器。下面我将一步一步教大家搭建自己的gitlab服务器。我使用的linux版本是centos7。

## 二、环境

- 操作系统：centos7
- docker 版本：latest
- gitlab版本：latest（2023/10/25最新版）

## 三、部署

### 1、创建目录

```shell
# 创建3个空白目录
mkdir -p /docker/gitlab/etc
mkdir -p /docker/gitlab/log
mkdir -p /docker/gitlab/data
```

### 2、拉取镜像

```shell
# 拉取最新版gitlab
docker pull gitlab/gitlab-ce
```

### 3、通过docker运行gitlab

```shell
# 可选参数1 
docker run -d -p 10008:80 -p 10009:443 -p 10010:22 --restart always --name gitlab -v /docker/gitlab/etc/gitlab:/etc/gitlab -v /docker/gitlab/var/log/gitlab:/var/log/gitlab -v /docker/gitlab/var/opt/gitlab:/var/opt/gitlab --privileged=true gitlab/gitlab-ce
```

```shell
# 可选参数2
docker run -detach --hostname localhost -p 7002:80 -p 7001:443 -p 7003:22 --name gitlab --restart unless-stopped -v /docker/gitlab/etc:/etc/gitlab -v /docker/gitlab/log:/var/log/gitlab -v /docker/gitlab/data:/var/data/gitlab gitlab/gitlab-ce:latest
```

**命令参数解释：**

- -detach：让启动的容器在后台运行
- --hostname：主机名
- -p：将容器端口映射到容器外部，其中前面是外部端口，后面是容器端口
- --name：容器名称
- --restart：指定容器重启的策略，有三种模式，这里配置的是 unless-stopped ，意思就是容器退出时总是重启
- -v：将容器内路径映射到容器外，其中前面是外部路径，后面是容器中路径
- gitlab/gitlab-ce:latest：使用的镜像

### 4、查看容器运行状态

```shell
docker ps
```

![image-20231026030527521](https://img.aa520.cn/test/image-20231026030527521.png)

## 四、访问gitlab

### 1、查看gitlab密码

- gitlab默认管理员账号是root
- gitlab默认密码是放置在 /etc/gitlab/initial_root_password 中的，可进入终端查看后复制即可登陆，注意，这个密码有效期只有24小时，所以第一次登录一定要更改root密码

![image-20231026025929071](https://img.aa520.cn/test/image-20231026025929071.png)

### 2、访问gitlab

![image-20231026031745174](https://img.aa520.cn/test/image-20231026031745174.png)

![image-20231026030135926](https://img.aa520.cn/test/image-20231026030135926.png)

此时，我们就可以正常使用gitlab了！