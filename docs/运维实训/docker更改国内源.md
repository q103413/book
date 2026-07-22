

# Docker国内镜像源

# 背景

众所周知，在全球范围内，Docker已经发展成为云计算的核心技术之一，但是，2020年8月13日生效的Docker公司最新服务条款明确指出，Docker公司提供的服务，禁止美国`“实体清单”`上的实体使用。自此，Docker Hub全靠国内各大厂商的镜像源，可是24年端午节6月6号后，因为神秘原因，好多镜像源都失效了，拉取时提示：

> error pulling image configuration: download failed after attempts=6: dial tcp 103.39.76.66:443: connect: connection timed out

![image-20260708020630641](https://img.aa520.cn/test/image-20260708020630641.png)

2024年6月6日，国内的各大厂商关闭了docker的镜像源，导致部分同学无法使用docker服务，让人真是一言难尽。



# 镜像源

首先找一个能够访问的镜像源。

*此处提供的镜像来自互联网，可用性和安全性无法得到保障，请自行验证*

加速地址：

1. docker.m.daocloud.io

2. dockerpull.com

3. docker.1ms.run



## 使用方法①

**假如拉取原始镜像命令如下**

```
docker pull whyour/qinglong:latest
```

**仅需在原命令前缀加入加速镜像地址 例如：**

```
docker pull dockerpull.com/whyour/qinglong:latest
```



## 使用方法②

**一键设置镜像加速：**修改文件 /etc/docker/daemon.json（如果不存在则创建）

```
/etc/docker/daemon.json
```

**修改JSON文件 更改为以下内容 然后保存**

```
{"registry-mirrors": ["https://dockerpull.com"]}
```

**保存好之后 执行以下两条命令**

```
sudo systemctl daemon-reload #重载systemd管理守护进程配置文件
```

```
sudo systemctl restart docker #重启 Docker 服务
```



**用爱发电 低调使用**
